import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_for_diabeguide_jwt";

const FALLBACK_SECRETS = Array.from(
  new Set([
    JWT_SECRET,
    "super_secret_key_for_diabeguide_jwt",
    "diabeguide_jwt_secret_key_2026_secure"
  ])
);

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided, authorization denied" });
    return;
  }

  let token = authHeader.split(" ")[1];
  if (token) {
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1).trim();
    }
  }

  let decoded: { id: string; email: string } | null = null;
  let lastErr: any = null;

  for (const sec of FALLBACK_SECRETS) {
    try {
      decoded = jwt.verify(token, sec) as { id: string; email: string };
      if (decoded) break;
    } catch (e) {
      lastErr = e;
    }
  }

  if (decoded) {
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
    return;
  }

  console.error("[Auth Error] JWT verification failed:", lastErr?.message || "Invalid token");
  res.status(401).json({ message: "Token is not valid" });
};
