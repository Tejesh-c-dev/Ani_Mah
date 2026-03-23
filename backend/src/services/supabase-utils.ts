// Supabase storage utilities
import { supabase, bucketName } from "./supabase";
import { AppError } from "../utils/AppError";

/**
 * Extract the file path from a Supabase public URL
 * URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
export const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Delete an image from Supabase storage
 */
export const deleteSupabaseImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return;

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.warn(`Failed to delete image from Supabase: ${error.message}`);
    // Don't throw - image deletion failure shouldn't block title deletion
  }
};

/**
 * Batch delete multiple images from Supabase
 */
export const deleteSupabaseImages = async (imageUrls: string[]): Promise<void> => {
  const filePaths = imageUrls
    .map(extractFilePathFromUrl)
    .filter((path): path is string => path !== null);

  if (filePaths.length === 0) return;

  const { error } = await supabase.storage
    .from(bucketName)
    .remove(filePaths);

  if (error) {
    console.warn(`Failed to delete images from Supabase: ${error.message}`);
  }
};
