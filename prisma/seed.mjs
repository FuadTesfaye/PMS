import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const [pharmacyA, pharmacyB] = await Promise.all([
    prisma.pharmacy.upsert({
      where: { id: "pharmacy-hq-1" },
      update: {},
      create: {
        id: "pharmacy-hq-1",
        name: "Zion Central Pharmacy",
        location: "Lusaka",
        contact: "+260 900 000001",
      },
    }),
    prisma.pharmacy.upsert({
      where: { id: "pharmacy-hq-2" },
      update: {},
      create: {
        id: "pharmacy-hq-2",
        name: "Zion East Pharmacy",
        location: "Ndola",
        contact: "+260 900 000002",
      },
    }),
  ]);

  const password = await bcrypt.hash("password123", 10);

  await Promise.all([
    prisma.user.upsert({
      where: { email: "pharmacy@example.com" },
      update: {},
      create: {
        name: "Pharmacy User",
        email: "pharmacy@example.com",
        password,
        role: "pharmacy",
        pharmacyId: pharmacyA.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "pharmacy2@example.com" },
      update: {},
      create: {
        name: "Pharmacy User 2",
        email: "pharmacy2@example.com",
        password,
        role: "pharmacy",
        pharmacyId: pharmacyB.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "pharmacist@example.com" },
      update: {},
      create: {
        name: "Pharmacist User",
        email: "pharmacist@example.com",
        password,
        role: "pharmacist",
        pharmacyId: pharmacyA.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "pharmacist2@example.com" },
      update: {},
      create: {
        name: "Pharmacist User 2",
        email: "pharmacist2@example.com",
        password,
        role: "pharmacist",
        pharmacyId: pharmacyB.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "System Admin",
        email: "admin@example.com",
        password,
        role: "admin",
      },
    }),
    prisma.user.upsert({
      where: { email: "distributor@example.com" },
      update: {},
      create: {
        name: "Tracon Distributor",
        email: "distributor@example.com",
        password,
        role: "distributor",
      },
    }),
    prisma.user.upsert({
      where: { email: "salesrep@example.com" },
      update: {},
      create: {
        name: "Field Sales Rep",
        email: "salesrep@example.com",
        password,
        role: "sales_rep",
      },
    }),
  ]);

  const medicines = [
    {
      name: "Paracetamol 500mg",
      brand: "Panadol",
      supplier: "AstraZeneca",
      category: "Pain Relief",
      price: 12.5,
      stock: 150,
      requiresPrescription: false,
      expiryDate: new Date("2027-12-31"),
      batchNumber: "AZ-PARA-001",
    },
    {
      name: "Amoxicillin 250mg",
      brand: "Amoxil",
      supplier: "Servier",
      category: "Antibiotics",
      price: 45,
      stock: 45,
      requiresPrescription: true,
      expiryDate: new Date("2027-09-30"),
      batchNumber: "SV-AMOX-002",
    },
    {
      name: "Warfarin 5mg",
      brand: "Coumadin",
      supplier: "Denk Pharma",
      category: "Cardiovascular",
      price: 75,
      stock: 20,
      requiresPrescription: true,
      expiryDate: new Date("2027-05-31"),
      batchNumber: "DK-WARF-003",
    },
  ];

  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({
      where: { batchNumber: med.batchNumber },
    });
    const medicine = existing
      ? await prisma.medicine.update({ where: { id: existing.id }, data: med })
      : await prisma.medicine.create({ data: med });

    const complianceExisting = await prisma.complianceRecord.findFirst({
      where: { medicineId: medicine.id },
    });
    if (complianceExisting) {
      await prisma.complianceRecord.update({
        where: { id: complianceExisting.id },
        data: {
          status: "valid",
          expiryDate: medicine.expiryDate,
          registrationStatus: "registered",
          notes: "Seed compliance record",
        },
      });
    } else {
      await prisma.complianceRecord.create({
        data: {
          medicineId: medicine.id,
          status: "valid",
          expiryDate: medicine.expiryDate,
          registrationStatus: "registered",
          notes: "Seed compliance record",
        },
      });
    }
  }

  await prisma.pharmacyScore.upsert({
    where: { id: "score-pharmacy-hq-1" },
    update: { score: 82, riskLevel: "low", pharmacyId: pharmacyA.id },
    create: { id: "score-pharmacy-hq-1", pharmacyId: pharmacyA.id, score: 82, riskLevel: "low" },
  });

  await prisma.pharmacyScore.upsert({
    where: { id: "score-pharmacy-hq-2" },
    update: { score: 61, riskLevel: "medium", pharmacyId: "pharmacy-hq-2" },
    create: { id: "score-pharmacy-hq-2", pharmacyId: "pharmacy-hq-2", score: 61, riskLevel: "medium" },
  });

  await prisma.systemSetting.upsert({
    where: { key: "threshold.low_stock" },
    update: { value: "10", description: "Low stock alert threshold" },
    create: {
      key: "threshold.low_stock",
      value: "10",
      description: "Low stock alert threshold",
    },
  });
  await prisma.systemSetting.upsert({
    where: { key: "threshold.critical_stock" },
    update: { value: "5", description: "Critical stock alert threshold" },
    create: {
      key: "threshold.critical_stock",
      value: "5",
      description: "Critical stock alert threshold",
    },
  });
  await prisma.systemSetting.upsert({
    where: { key: "threshold.compliance_expiry_days" },
    update: { value: "30", description: "Days before expiry to alert" },
    create: {
      key: "threshold.compliance_expiry_days",
      value: "30",
      description: "Days before expiry to alert",
    },
  });

  const partnerKey = process.env.PARTNER_API_KEY || "zpin-partner-demo-key";
  const keyHash = createHash("sha256").update(partnerKey).digest("hex");
  await prisma.apiClient.upsert({
    where: { keyHash },
    update: { name: "ZPIN Partner Demo", scopes: "*", isActive: true },
    create: { name: "ZPIN Partner Demo", keyHash, scopes: "*", isActive: true },
  });

  // Realistic volume seeding for dashboard analytics.
  const existingOrders = await prisma.order.count();
  if (existingOrders < 120) {
    const pharmacyUsers = await prisma.user.findMany({
      where: { role: "pharmacy", pharmacyId: { not: null } },
      select: { id: true, pharmacyId: true },
    });
    const medRows = await prisma.medicine.findMany({
      select: { id: true, price: true, requiresPrescription: true },
    });
    const statuses = ["pending", "reviewing", "approved", "ready", "completed", "rejected"];

    for (let i = 0; i < 140; i += 1) {
      const user = pharmacyUsers[i % pharmacyUsers.length];
      const status = statuses[i % statuses.length];
      const createdAt = new Date(Date.now() - (140 - i) * 24 * 60 * 60 * 1000);

      const selected = [medRows[i % medRows.length], medRows[(i + 1) % medRows.length]];
      const items = selected.map((m, idx) => ({
        medicineId: m.id,
        quantity: (i + idx) % 4 + 1,
        price: m.price,
      }));
      const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      const order = await prisma.order.create({
        data: {
          pharmacyId: user.pharmacyId,
          userId: user.id,
          status,
          total,
          createdAt,
          updatedAt: createdAt,
          items: { create: items },
        },
      });

      if (selected.some((m) => m.requiresPrescription)) {
        await prisma.prescription.create({
          data: {
            orderId: order.id,
            imageUrl:
              "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=800&auto=format&fit=crop",
            status: status === "rejected" ? "rejected" : status === "approved" || status === "completed" ? "approved" : "pending",
            extractedText: status === "rejected" ? "Dose mismatch detected in pharmacist review." : "Prescription reviewed.",
            createdAt,
            updatedAt: createdAt,
          },
        });
      }
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
