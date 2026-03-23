/**
 * Extract the file path from a Supabase public URL
 * URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
export declare const extractFilePathFromUrl: (url: string) => string | null;
/**
 * Delete an image from Supabase storage
 */
export declare const deleteSupabaseImage: (imageUrl: string) => Promise<void>;
/**
 * Batch delete multiple images from Supabase
 */
export declare const deleteSupabaseImages: (imageUrls: string[]) => Promise<void>;
