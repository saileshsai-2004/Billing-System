import { CourseType, PriceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateTax } from "@/lib/taxEngine";

const COURSE_PRICES: Record<CourseType, number> = {
  ONLINE_3500: 3500,
  ONLINE_5000: 5000,
  ONLINE_15000: 15000,
  OFFLINE_45000: 45000,
};

const previewSchema = z.object({
  courseType: z.nativeEnum(CourseType),
  placeOfSupply: z.string().trim().min(2),
  priceType: z.nativeEnum(PriceType).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = previewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid preview inputs", errors: parsed.error.flatten() }, { status: 400 });
    }

    const { courseType, placeOfSupply, priceType } = parsed.data;
    const coursePrice = COURSE_PRICES[courseType];

    const settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.isConfigured) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        message: "TAX CONFIGURATION INCOMPLETE",
      });
    }

    const activePriceType = priceType || settings.defaultPriceType;
    const gstRate = Number(settings.gstRate);

    const calculation = calculateTax({
      coursePrice,
      priceType: activePriceType,
      gstRate,
      supplierState: settings.state,
      placeOfSupply,
    });

    return NextResponse.json({
      success: true,
      isConfigured: true,
      settings: {
        companyName: settings.companyName,
        tradeName: settings.tradeName,
        supplierState: settings.state,
        sacCode: settings.sacCode,
      },
      calculation,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ message: "Unable to calculate invoice preview" }, { status: 500 });
  }
}
