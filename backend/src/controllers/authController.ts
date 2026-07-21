import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { createAdminToken, COOKIE_NAME } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function login(req: Request, res: Response) {
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await createAdminToken({ adminId: admin.id, email: admin.email });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8 * 1000, // 8 hours in ms
      path: "/",
    });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Unable to login" });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.adminId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({ success: true, admin });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ message: "Unable to fetch admin details" });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ success: true });
}
