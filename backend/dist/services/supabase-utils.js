"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupabaseImages = exports.deleteSupabaseImage = exports.extractFilePathFromUrl = void 0;
// Supabase storage utilities
const supabase_1 = require("./supabase");
/**
 * Extract the file path from a Supabase public URL
 * URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
const extractFilePathFromUrl = (url) => {
    try {
        const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
        return match ? match[1] : null;
    }
    catch {
        return null;
    }
};
exports.extractFilePathFromUrl = extractFilePathFromUrl;
/**
 * Delete an image from Supabase storage
 */
const deleteSupabaseImage = async (imageUrl) => {
    if (!imageUrl)
        return;
    const filePath = (0, exports.extractFilePathFromUrl)(imageUrl);
    if (!filePath)
        return;
    const { error } = await supabase_1.supabase.storage
        .from(supabase_1.bucketName)
        .remove([filePath]);
    if (error) {
        console.warn(`Failed to delete image from Supabase: ${error.message}`);
        // Don't throw - image deletion failure shouldn't block title deletion
    }
};
exports.deleteSupabaseImage = deleteSupabaseImage;
/**
 * Batch delete multiple images from Supabase
 */
const deleteSupabaseImages = async (imageUrls) => {
    const filePaths = imageUrls
        .map(exports.extractFilePathFromUrl)
        .filter((path) => path !== null);
    if (filePaths.length === 0)
        return;
    const { error } = await supabase_1.supabase.storage
        .from(supabase_1.bucketName)
        .remove(filePaths);
    if (error) {
        console.warn(`Failed to delete images from Supabase: ${error.message}`);
    }
};
exports.deleteSupabaseImages = deleteSupabaseImages;
//# sourceMappingURL=supabase-utils.js.map