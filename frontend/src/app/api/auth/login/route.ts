import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password } = await request.json();
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const secretStr = process.env.AUTH_SECRET || "adyapan-local-secret-2026-change-this";
    const token = await new SignJWT({ adminId: admin.id, email: admin.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(secretStr));

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to login" }, { status: 500 });
  }
}
