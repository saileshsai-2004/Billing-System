import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "adyapan_admin_session";

export async function createAdminToken(payload: { adminId: string; email: string }) {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured");
  }
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
