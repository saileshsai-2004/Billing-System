import { PriceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const settingsSchema = z.object({
  companyName: z.string().trim().min(2),
  tradeName: z.string().trim().min(2),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  stateCode: z.string().trim().min(1).max(5),
  postalCode: z.string().trim().min(3).max(10),
  gstin: z.string().trim().min(15).max(15),
  pan: z.string().trim().optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  website: z.string().trim().optional(),
  sacCode: z.string().trim().min(2),
  gstRate: z.number().min(0).max(100),
  defaultPriceType: z.nativeEnum(PriceType),
});

export async function GET() {
  try {
    let settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.taxSettings.create({
        data: { id: "default" },
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to fetch tax settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid settings data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const settings = await prisma.taxSettings.upsert({
      where: { id: "default" },
      update: {
        ...data,
        isConfigured: true,
      },
      create: {
        id: "default",
        ...data,
        isConfigured: true,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update settings" }, { status: 500 });
  }
}
