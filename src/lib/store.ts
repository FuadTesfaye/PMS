import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Medicine, Order } from "@/types";

const defaultImage =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=260&auto=format&fit=crop";

function mapMedicine(med: {
  id: string;
  name: string;
  brand: string;
  supplier: string;
  category: string;
  price: Prisma.Decimal;
  stock: number;
  requiresPrescription: boolean;
  expiryDate: Date;
  batchNumber: string;
}): Medicine {
  return {
    ...med,
    description: `${med.brand} by ${med.supplier}`,
    price: Number(med.price),
    expiryDate: med.expiryDate.toISOString(),
    image: defaultImage,
  };
}

function mapOrder(order: {
  id: string;
  pharmacyId: string;
  userId: string;
  status: Order["status"];
  total: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string };
  items: Array<{ medicineId: string; quantity: number; price: Prisma.Decimal; medicine: { name: string } }>;
  prescription: { imageUrl: string; extractedText: string | null } | null;
}): Order {
  return {
    id: order.id,
    pharmacyId: order.pharmacyId,
    userId: order.userId,
    userName: order.user.name,
    items: order.items.map((item) => ({
      medicineId: item.medicineId,
      name: item.medicine.name,
      quantity: item.quantity,
      priceAtTime: Number(item.price),
    })),
    totalPrice: Number(order.total),
    status: order.status,
    prescriptionImage: order.prescription?.imageUrl,
    rejectionNote: order.prescription?.extractedText ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function getMedicines() {
  const data = await prisma.medicine.findMany({ orderBy: { createdAt: "desc" } });
  return data.map(mapMedicine);
}

export async function getMedicine(id: string) {
  const med = await prisma.medicine.findUnique({ where: { id } });
  return med ? mapMedicine(med) : null;
}

export async function getUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true } },
      items: { include: { medicine: { select: { name: true } } } },
      prescription: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrder);
}

export async function getOrdersByUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      user: { select: { name: true } },
      items: { include: { medicine: { select: { name: true } } } },
      prescription: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrder);
}

export async function getLowStockMedicines(threshold = 10) {
  const meds = await prisma.medicine.findMany({ where: { stock: { lte: threshold } } });
  return meds.map(mapMedicine);
}

export async function getStatistics() {
  const [revenueAgg, pendingOrders, lowStockItems, totalOrders, totalMedicines] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["approved", "ready", "completed"] } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: { in: ["pending", "reviewing"] } } }),
    prisma.medicine.count({ where: { stock: { lte: 10 } } }),
    prisma.order.count(),
    prisma.medicine.count(),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    pendingOrders,
    lowStockItems,
    totalOrders,
    totalMedicines,
  };
}

export async function createOrder(params: {
  pharmacyId: string;
  userId: string;
  items: Array<{ medicineId: string; quantity: number; priceAtTime: number }>;
  totalPrice: number;
  prescriptionImage?: string;
}) {
  const order = await prisma.$transaction(async (tx) => {
    for (const item of params.items) {
      const med = await tx.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med || med.stock < item.quantity) {
        throw new Error(`Insufficient stock for medicine ${item.medicineId}`);
      }
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.stockLog.create({
        data: {
          medicineId: item.medicineId,
          pharmacyId: params.pharmacyId,
          change: -item.quantity,
          reason: "order_placed",
        },
      });
    }

    const created = await tx.order.create({
      data: {
        pharmacyId: params.pharmacyId,
        userId: params.userId,
        status: "pending",
        total: params.totalPrice,
        items: {
          create: params.items.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.priceAtTime,
          })),
        },
      },
      include: {
        user: { select: { name: true } },
        items: { include: { medicine: { select: { name: true } } } },
      },
    });

    if (params.prescriptionImage) {
      await tx.prescription.create({
        data: {
          orderId: created.id,
          imageUrl: params.prescriptionImage,
        },
      });
    }

    return created;
  });

  const withPrescription = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: {
      user: { select: { name: true } },
      items: { include: { medicine: { select: { name: true } } } },
      prescription: true,
    },
  });

  return mapOrder(withPrescription);
}

export async function updateOrderStatus(orderId: string, status: Order["status"], note?: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: { select: { name: true } },
      items: { include: { medicine: { select: { name: true } } } },
      prescription: true,
    },
  });

  if (order.prescription) {
    await prisma.prescription.update({
      where: { orderId: order.id },
      data:
        status === "approved"
          ? { status: "approved", extractedText: note ?? null }
          : status === "rejected"
            ? { status: "rejected", extractedText: note ?? null }
            : {},
    });
  }

  return mapOrder(order);
}

export async function updateMedicine(id: string, data: Partial<Medicine>) {
  const updated = await prisma.medicine.update({
    where: { id },
    data: {
      name: data.name,
      brand: data.brand,
      supplier: data.supplier,
      category: data.category,
      price: data.price,
      stock: data.stock,
      requiresPrescription: data.requiresPrescription,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      batchNumber: data.batchNumber,
    },
  });
  return mapMedicine(updated);
}

export async function addMedicine(data: Omit<Medicine, "id">) {
  const created = await prisma.medicine.create({
    data: {
      name: data.name,
      brand: data.brand,
      supplier: data.supplier,
      category: data.category,
      price: data.price,
      stock: data.stock,
      requiresPrescription: data.requiresPrescription,
      expiryDate: new Date(data.expiryDate),
      batchNumber: data.batchNumber,
    },
  });
  return mapMedicine(created);
}

export async function deleteMedicine(id: string) {
  await prisma.medicine.delete({ where: { id } });
  return true;
}

export async function getDistributorInsights(options?: { days?: number; supplier?: string }) {
  const days = options?.days ?? 30;
  const supplier = options?.supplier;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const medicineWhere = supplier ? { supplier } : undefined;
  const orderDateWhere = { gte: startDate };

  const [totalPharmacies, totalOrders, topMedicines, lowStockAlerts, pharmacyDemand, prescriptionItems] = await Promise.all([
    prisma.pharmacy.count(),
    prisma.order.count({ where: { createdAt: orderDateWhere } }),
    prisma.orderItem.groupBy({
      by: ["medicineId"],
      where: {
        order: { createdAt: orderDateWhere },
        medicine: medicineWhere,
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.medicine.findMany({
      where: { stock: { lt: 10 }, ...(medicineWhere ?? {}) },
      take: 10,
      orderBy: { stock: "asc" },
    }),
    prisma.order.groupBy({
      by: ["pharmacyId"],
      where: { createdAt: orderDateWhere },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.orderItem.findMany({
      where: {
        order: { prescription: { isNot: null }, createdAt: orderDateWhere },
        medicine: medicineWhere,
      },
      select: { medicineId: true, quantity: true },
    }),
  ]);

  const medicineIds = topMedicines.map((m) => m.medicineId);
  const names = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: { id: true, name: true, supplier: true },
  });
  const medicineMap = new Map(names.map((m) => [m.id, m]));
  const pharmacyIds = pharmacyDemand.map((p) => p.pharmacyId);
  const pharmacyNames = await prisma.pharmacy.findMany({
    where: { id: { in: pharmacyIds } },
    select: { id: true, name: true, location: true },
  });
  const pharmacyMap = new Map(pharmacyNames.map((p) => [p.id, p]));

  const rxQuantities = new Map<string, number>();
  for (const row of prescriptionItems) {
    rxQuantities.set(row.medicineId, (rxQuantities.get(row.medicineId) ?? 0) + row.quantity);
  }
  const rxTop = Array.from(rxQuantities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([medicineId, quantity]) => ({
      medicineId,
      name: medicineMap.get(medicineId)?.name ?? "Unknown",
      quantity,
    }));

  const recommendations = lowStockAlerts.map((m) => ({
    medicineId: m.id,
    name: m.name,
    supplier: m.supplier,
    currentStock: m.stock,
    recommendedRestockQty: Math.max(20, 50 - m.stock),
    urgency: m.stock < 5 ? "critical" : "high",
  }));

  return {
    windowDays: days,
    supplierFilter: supplier ?? "all",
    totalPharmacies,
    totalOrders,
    topMedicines: topMedicines.map((m) => ({
      medicineId: m.medicineId,
      name: medicineMap.get(m.medicineId)?.name ?? "Unknown",
      supplier: medicineMap.get(m.medicineId)?.supplier ?? "Unknown",
      quantity: m._sum.quantity ?? 0,
    })),
    lowStockAlerts: lowStockAlerts.map((m) => ({
      id: m.id,
      name: m.name,
      stock: m.stock,
      supplier: m.supplier,
      predicted: m.stock < 5 ? "high" : "medium",
    })),
    highDemandAreas: pharmacyDemand.map((p) => ({
      pharmacyId: p.pharmacyId,
      pharmacyName: pharmacyMap.get(p.pharmacyId)?.name ?? "Unknown",
      location: pharmacyMap.get(p.pharmacyId)?.location ?? "Unknown",
      orderCount: p._count.id,
      totalValue: Number(p._sum.total ?? 0),
    })),
    prescriptionTrends: rxTop,
    restockRecommendations: recommendations,
  };
}

export async function getPharmacies() {
  return prisma.pharmacy.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createFieldReport(data: {
  salesRepId: string;
  pharmacyId: string;
  notes: string;
  competitorInfo: string;
  stockObservation: string;
}) {
  return prisma.fieldReport.create({ data });
}

export async function getFieldReports(salesRepId?: string) {
  return prisma.fieldReport.findMany({
    where: salesRepId ? { salesRepId } : undefined,
    include: { pharmacy: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getComplianceRecords() {
  return prisma.complianceRecord.findMany({
    include: { medicine: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getOpenAlerts() {
  return prisma.alert.findMany({
    where: { isResolved: false },
    include: {
      pharmacy: { select: { id: true, name: true, location: true } },
      medicine: { select: { id: true, name: true, supplier: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateLowStockAlerts(threshold = 10) {
  const medicines = await prisma.medicine.findMany({ where: { stock: { lt: threshold } } });
  const pharmacies = await prisma.pharmacy.findMany({ select: { id: true } });
  const generated: string[] = [];

  for (const med of medicines) {
    for (const pharmacy of pharmacies) {
      const existing = await prisma.alert.findFirst({
        where: {
          pharmacyId: pharmacy.id,
          medicineId: med.id,
          type: "low_stock",
          isResolved: false,
        },
      });
      if (!existing) {
        const created = await prisma.alert.create({
          data: {
            pharmacyId: pharmacy.id,
            medicineId: med.id,
            type: "low_stock",
            title: "Low stock risk detected",
            message: `${med.name} stock is ${med.stock}. Recommended restock immediately.`,
            severity: med.stock < 5 ? "critical" : "high",
          },
        });
        generated.push(created.id);
      }
    }
  }

  return generated;
}

export async function generateComplianceExpiryAlerts(daysAhead = 30) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  const records = await prisma.complianceRecord.findMany({
    where: { expiryDate: { lte: endDate } },
    include: { medicine: true },
  });
  const pharmacies = await prisma.pharmacy.findMany({ select: { id: true } });
  const generated: string[] = [];

  for (const record of records) {
    for (const pharmacy of pharmacies) {
      const existing = await prisma.alert.findFirst({
        where: {
          pharmacyId: pharmacy.id,
          medicineId: record.medicineId,
          type: "compliance_expiry",
          isResolved: false,
        },
      });
      if (!existing) {
        const created = await prisma.alert.create({
          data: {
            pharmacyId: pharmacy.id,
            medicineId: record.medicineId,
            type: "compliance_expiry",
            title: "Compliance expiry risk",
            message: `${record.medicine.name} registration/expiry requires review before ${record.expiryDate.toISOString().slice(0, 10)}.`,
            severity: "high",
          },
        });
        generated.push(created.id);
      }
    }
  }

  return generated;
}

export async function resolveAlert(id: string) {
  return prisma.alert.update({
    where: { id },
    data: { isResolved: true, resolvedAt: new Date() },
  });
}

export async function logAuditEvent(params: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: string;
}) {
  return prisma.auditTrail.create({ data: params });
}

export async function getAuditTrails(limit = 100) {
  return prisma.auditTrail.findMany({
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  return settings;
}

export async function upsertSystemSetting(params: {
  key: string;
  value: string;
  description: string;
}) {
  return prisma.systemSetting.upsert({
    where: { key: params.key },
    update: { value: params.value, description: params.description },
    create: params,
  });
}

export async function getSystemSettingValue<T = string>(key: string, fallback: T): Promise<T> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  if (!setting) return fallback;
  try {
    return JSON.parse(setting.value) as T;
  } catch {
    return (setting.value as unknown as T) ?? fallback;
  }
}

export async function getApiClientByHash(keyHash: string) {
  return prisma.apiClient.findUnique({ where: { keyHash } });
}

export async function touchApiClientUsage(id: string) {
  return prisma.apiClient.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

export async function updateComplianceRecord(
  id: string,
  data: { status: string; registrationStatus: string; notes: string; expiryDate: string }
) {
  return prisma.complianceRecord.update({
    where: { id },
    data: {
      status: data.status,
      registrationStatus: data.registrationStatus,
      notes: data.notes,
      expiryDate: new Date(data.expiryDate),
    },
    include: { medicine: true },
  });
}

export async function getPharmacyScores() {
  return prisma.pharmacyScore.findMany({
    include: { pharmacy: true },
    orderBy: { lastUpdated: "desc" },
  });
}

export async function upsertPharmacyScore(params: {
  pharmacyId: string;
  score: number;
  riskLevel: "low" | "medium" | "high";
}) {
  const existing = await prisma.pharmacyScore.findFirst({
    where: { pharmacyId: params.pharmacyId },
    orderBy: { lastUpdated: "desc" },
  });
  if (existing) {
    return prisma.pharmacyScore.update({
      where: { id: existing.id },
      data: { score: params.score, riskLevel: params.riskLevel, lastUpdated: new Date() },
      include: { pharmacy: true },
    });
  }
  return prisma.pharmacyScore.create({
    data: {
      pharmacyId: params.pharmacyId,
      score: params.score,
      riskLevel: params.riskLevel,
    },
    include: { pharmacy: true },
  });
}
