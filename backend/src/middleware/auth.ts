// JWT authentication middleware — verifies token and attaches userId to request
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { JwtPayload } from "../types";

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "USER" | "ADMIN";
    }
  }
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};
