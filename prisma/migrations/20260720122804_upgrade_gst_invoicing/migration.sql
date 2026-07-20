-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('TAX_INCLUSIVE', 'TAX_EXCLUSIVE');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "baseAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cgstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerCity" TEXT,
ADD COLUMN     "customerGstin" TEXT,
ADD COLUMN     "customerPostalCode" TEXT,
ADD COLUMN     "customerState" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "igstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "igstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'TAX_INCLUSIVE',
ADD COLUMN     "sacCode" TEXT,
ADD COLUMN     "sgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sgstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "TaxSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT 'ADYAPAN EDUTECH PVT. LTD.',
    "tradeName" TEXT NOT NULL DEFAULT 'ADYAPAN',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "stateCode" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "pan" TEXT,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "website" TEXT DEFAULT 'www.adyapan.com',
    "sacCode" TEXT NOT NULL DEFAULT '999293',
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "defaultPriceType" "PriceType" NOT NULL DEFAULT 'TAX_INCLUSIVE',
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "nextVal" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_financialYear_key" ON "InvoiceSequence"("financialYear");
