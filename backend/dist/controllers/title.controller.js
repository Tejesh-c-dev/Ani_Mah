"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedTitles = exports.getTitleById = exports.getAllTitles = exports.createTitle = void 0;
const titleService = __importStar(require("../services/title.service"));
const response_1 = require("../utils/response");
const supabase_1 = require("../services/supabase");
const AppError_1 = require("../utils/AppError");
const createTitle = async (req, res, next) => {
    try {
        let imageUrl;
        // Upload image to Supabase if provided
        if (req.file) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${req.file.originalname}`;
            const { error: uploadError } = await supabase_1.supabase.storage
                .from(supabase_1.bucketName)
                .upload(`titles/${filename}`, req.file.buffer, {
                contentType: req.file.mimetype,
            });
            if (uploadError) {
                throw new AppError_1.AppError(`Image upload failed: ${uploadError.message}`, 500);
            }
            // Get public URL
            const { data } = supabase_1.supabase.storage
                .from(supabase_1.bucketName)
                .getPublicUrl(`titles/${filename}`);
            imageUrl = data.publicUrl;
        }
        const title = await titleService.createTitle({ ...req.body, image: imageUrl });
        res.status(201).json((0, response_1.successResponse)(title));
    }
    catch (err) {
        next(err);
    }
};
exports.createTitle = createTitle;
const getAllTitles = async (req, res, next) => {
    try {
        const typeFilter = req.query.type;
        const titles = await titleService.getAllTitles(typeFilter);
        res.status(200).json((0, response_1.successResponse)(titles));
    }
    catch (err) {
        next(err);
    }
};
exports.getAllTitles = getAllTitles;
const getTitleById = async (req, res, next) => {
    try {
        const requestedSort = req.query.reviewSort || "latest";
        const allowedSorts = ["latest", "top_rated", "most_helpful"];
        const reviewSort = allowedSorts.includes(requestedSort) ? requestedSort : "latest";
        const title = await titleService.getTitleById(req.params.id, reviewSort);
        res.status(200).json((0, response_1.successResponse)(title));
    }
    catch (err) {
        next(err);
    }
};
exports.getTitleById = getTitleById;
const getRecommendedTitles = async (req, res, next) => {
    try {
        const titles = await titleService.getRecommendedTitlesForUser(req.userId);
        res.status(200).json((0, response_1.successResponse)(titles));
    }
    catch (err) {
        next(err);
    }
};
exports.getRecommendedTitles = getRecommendedTitles;
//# sourceMappingURL=title.controller.js.map