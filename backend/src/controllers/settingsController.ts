import { Request, Response } from "express";
import { PriceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

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

export async function getSettings(req: Request, res: Response) {
  try {
    let settings = await prisma.taxSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.taxSettings.create({
        data: { id: "default" },
      });
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ message: "Unable to fetch tax settings" });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid settings data",
        errors: parsed.error.flatten(),
      });
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

    return res.json({ success: true, settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Unable to update settings" });
  }
}
