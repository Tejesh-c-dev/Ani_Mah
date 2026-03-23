// Auth controller — handles HTTP request/response for auth endpoints
import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { successResponse } from "../utils/response";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(successResponse(user));
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await authService.updateUserRole(req.params.id as string, req.body);
    res.status(200).json(successResponse(updated));
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await authService.getMyProfile(req.userId!);
    res.status(200).json(successResponse(profile));
  } catch (err) {
    next(err);
  }
};

export const updateMyProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await authService.updateMyProfileImage(req.userId!, req.file!);
    res.status(200).json(successResponse(profile));
  } catch (err) {
    next(err);
  }
};
