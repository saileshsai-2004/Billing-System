import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "adyapan_admin_session";

function getSecret() {
  const secretStr = process.env.AUTH_SECRET || "adyapan-local-secret-2026-change-this";
  return new TextEncoder().encode(secretStr);
}

export async function createAdminToken(payload: { adminId: string; email: string }) {
  const secret = getSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  if (!token) return null;
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
