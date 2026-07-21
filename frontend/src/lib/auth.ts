import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "adyapan_admin_session";

function getSecret() {
  const secretStr = process.env.AUTH_SECRET || "adyapan-local-secret-2026-change-this";
  return new TextEncoder().encode(secretStr);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
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
