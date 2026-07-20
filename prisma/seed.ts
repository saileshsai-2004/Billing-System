import { PrismaClient, PriceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@adyapan.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: {
      name: process.env.ADMIN_NAME || "Sailesh Admin",
      passwordHash,
    },
    create: {
      name: process.env.ADMIN_NAME || "Sailesh Admin",
      email,
      passwordHash,
    },
  });

  console.log(`Admin ready: ${email}`);

  await prisma.taxSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "ADYAPAN EDUTECH PVT. LTD.",
      tradeName: "ADYAPAN",
      address: "Plot No. 12, Tech Park Avenue, Hitech City",
      city: "Hyderabad",
      state: "Telangana",
      stateCode: "36",
      postalCode: "500081",
      gstin: "36AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      email: "billing@adyapan.com",
      phone: "+91 98765 43210",
      website: "www.adyapan.com",
      sacCode: "999293",
      gstRate: 18.00,
      defaultPriceType: PriceType.TAX_INCLUSIVE,
      isConfigured: true,
    },
  });

  console.log("Tax settings initialized");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
