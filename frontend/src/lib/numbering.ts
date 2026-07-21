import { prisma } from "@/lib/prisma";

export async function getNextInvoiceNumber(tx?: any): Promise<{ invoiceNumber: string; financialYear: string }> {
  const db = tx || prisma;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 0=Jan, 3=Apr

  let startYear = year;
  let endYear = year + 1;
  if (month < 3) {
    startYear = year - 1;
    endYear = year;
  }

  const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

  const sequence = await db.invoiceSequence.upsert({
    where: { financialYear: fy },
    create: { financialYear: fy, nextVal: 2 },
    update: { nextVal: { increment: 1 } },
  });

  const seqNum = sequence.nextVal - 1;
  const formattedSeq = String(seqNum).padStart(6, "0");
  const invoiceNumber = `ADY/${fy}/${formattedSeq}`;

  return { invoiceNumber, financialYear: fy };
}
