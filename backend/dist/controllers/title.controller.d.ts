import { Request, Response, NextFunction } from "express";
export declare const createTitle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllTitles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTitleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecommendedTitles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
