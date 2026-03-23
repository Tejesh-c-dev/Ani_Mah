import { Request, Response, NextFunction } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMyProfileImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
