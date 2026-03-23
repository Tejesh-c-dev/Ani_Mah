import { Request, Response, NextFunction } from "express";
export declare const createReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReply: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const voteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
