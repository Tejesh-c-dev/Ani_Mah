// Review controller — handles HTTP request/response for review endpoints
import { Request, Response, NextFunction } from "express";
import * as reviewService from "../services/review.service";
import { successResponse } from "../utils/response";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await reviewService.createReview(req.userId!, req.body);
    res.status(201).json(successResponse(review));
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await reviewService.updateReview(
      req.userId!,
      req.params.id as string,
      req.body
    );
    res.status(200).json(successResponse(review));
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await reviewService.deleteReview(
      req.userId!,
      req.params.id as string,
      req.userRole || "USER"
    );
    res.status(200).json(successResponse({ message: "Review deleted" }));
  } catch (err) {
    next(err);
  }
};

export const createReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reply = await reviewService.createReply(
      req.userId!,
      req.params.id as string,
      req.body
    );
    res.status(201).json(successResponse(reply));
  } catch (err) {
    next(err);
  }
};

export const voteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await reviewService.voteReview(
      req.userId!,
      req.params.id as string,
      req.body
    );
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};
