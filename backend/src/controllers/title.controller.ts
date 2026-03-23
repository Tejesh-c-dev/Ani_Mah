// Title controller — handles HTTP request/response for title endpoints (anime, manhwa, movies)
import { Request, Response, NextFunction } from "express";
import * as titleService from "../services/title.service";
import { successResponse } from "../utils/response";
import { supabase, bucketName } from "../services/supabase";
import { AppError } from "../utils/AppError";
import { ReviewSort } from "../types";

export const createTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let imageUrl: string | undefined;

    // Upload image to Supabase if provided
    if (req.file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${req.file.originalname}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`titles/${filename}`, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        throw new AppError(`Image upload failed: ${uploadError.message}`, 500);
      }

      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`titles/${filename}`);

      imageUrl = data.publicUrl;
    }

    const title = await titleService.createTitle({ ...req.body, image: imageUrl });
    res.status(201).json(successResponse(title));
  } catch (err) {
    next(err);
  }
};

export const getAllTitles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const typeFilter = req.query.type as string | undefined;
    const titles = await titleService.getAllTitles(typeFilter);
    res.status(200).json(successResponse(titles));
  } catch (err) {
    next(err);
  }
};

export const getTitleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestedSort = (req.query.reviewSort as ReviewSort | undefined) || "latest";
    const allowedSorts: ReviewSort[] = ["latest", "top_rated", "most_helpful"];
    const reviewSort = allowedSorts.includes(requestedSort) ? requestedSort : "latest";

    const title = await titleService.getTitleById(req.params.id as string, reviewSort);
    res.status(200).json(successResponse(title));
  } catch (err) {
    next(err);
  }
};

export const getRecommendedTitles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const titles = await titleService.getRecommendedTitlesForUser(req.userId!);
    res.status(200).json(successResponse(titles));
  } catch (err) {
    next(err);
  }
};
