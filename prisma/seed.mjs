import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [pharmacyA] = await Promise.all([
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
    const medicine = await prisma.medicine.create({ data: med });
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

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
