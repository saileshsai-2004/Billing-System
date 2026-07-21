import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, COOKIE_NAME } from "../lib/auth";

export interface AuthenticatedRequest extends Request {
  admin?: any;
}

export async function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.query && typeof req.query.token === "string") {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }

  req.admin = payload;
  next();
}
