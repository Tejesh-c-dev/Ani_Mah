// Admin authorization middleware — allows only ADMIN role users
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }

  next();
};
