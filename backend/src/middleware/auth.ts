import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const JWT_SECRET = process.env.JWT_SECRET || "diabeguide_jwt_secret_key_2026_secure";

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (error: any) {
    console.error("[Auth Error] JWT verification failed:", error?.message);
    res.status(410).json({ message: "Token is not valid" });
  }
};
