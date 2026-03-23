import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: "USER" | "ADMIN";
        }
    }
}
export declare const authMiddleware: (req: Request, _res: Response, next: NextFunction) => void;
