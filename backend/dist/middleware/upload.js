"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// Multer middleware — handles image file validation and temporary buffering for Supabase upload
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../utils/AppError");
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.AppError("Only JPEG, PNG, WebP, and GIF images are allowed", 400));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
//# sourceMappingURL=upload.js.map