"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedTitlesForUser = exports.getTitleById = exports.getAllTitles = exports.createTitle = void 0;
// Title service — handles anime, manhwa, and movie title CRUD and business logic
const client_1 = __importDefault(require("../prisma/client"));
const AppError_1 = require("../utils/AppError");
const currentYear = new Date().getFullYear();
const VALID_TYPES = ["ANIME", "MANHWA", "MOVIE"];
const createTitle = async (input) => {
    const { name, description, releaseYear, type, genre, image } = input;
    if (!name) {
        throw new AppError_1.AppError("Title name is required", 400);
    }
    const existing = await client_1.default.title.findUnique({ where: { name } });
    if (existing) {
        throw new AppError_1.AppError(`A title named "${name}" already exists`, 409);
    }
    if (!description) {
        throw new AppError_1.AppError("Description is required", 400);
    }
    if (!releaseYear || releaseYear < 1900 || releaseYear > currentYear) {
        throw new AppError_1.AppError(`Release year must be between 1900 and ${currentYear}`, 400);
    }
    const titleType = type && VALID_TYPES.includes(type.toUpperCase()) ? type.toUpperCase() : "ANIME";
    const title = await client_1.default.title.create({
        data: {
            name,
            description,
            genre: genre?.trim() || "General",
            releaseYear: typeof releaseYear === "string" ? parseInt(releaseYear, 10) : releaseYear,
            type: titleType,
            ...(image ? { image } : {}),
        },
    });
    return title;
};
exports.createTitle = createTitle;
const getAllTitles = async (typeFilter) => {
    const where = typeFilter && VALID_TYPES.includes(typeFilter.toUpperCase())
        ? { type: typeFilter.toUpperCase() }
        : undefined;
    const titles = await client_1.default.title.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    return titles;
};
exports.getAllTitles = getAllTitles;
const reviewOrderByMap = {
    latest: { createdAt: "desc" },
    top_rated: [{ rating: "desc" }, { createdAt: "desc" }],
    most_helpful: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
};
const getTitleById = async (id, reviewSort = "latest") => {
    const title = await client_1.default.title.findUnique({
        where: { id },
        include: {
            reviews: {
                where: { parentId: null },
                include: {
                    user: { select: { id: true, username: true } },
                    replies: {
                        include: {
                            user: { select: { id: true, username: true } },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: reviewOrderByMap[reviewSort],
            },
        },
    });
    if (!title) {
        throw new AppError_1.AppError("Title not found", 404);
    }
    return title;
};
exports.getTitleById = getTitleById;
const getRecommendedTitlesForUser = async (userId) => {
    const reviews = await client_1.default.review.findMany({
        where: {
            userId,
            parentId: null,
            rating: { not: null },
        },
        include: {
            title: {
                select: { id: true, genre: true, type: true },
            },
        },
        orderBy: { rating: "desc" },
    });
    const reviewedTitleIds = reviews.map((r) => r.titleId);
    const genreFrequency = new Map();
    for (const review of reviews) {
        if ((review.rating ?? 0) >= 4) {
            const key = review.title.genre || "General";
            genreFrequency.set(key, (genreFrequency.get(key) ?? 0) + 1);
        }
    }
    const preferredGenres = [...genreFrequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre)
        .slice(0, 3);
    if (preferredGenres.length > 0) {
        const recommendations = await client_1.default.title.findMany({
            where: {
                id: { notIn: reviewedTitleIds },
                genre: { in: preferredGenres },
            },
            orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
            take: 8,
        });
        if (recommendations.length > 0) {
            return recommendations;
        }
    }
    const fallbackType = reviews[0]?.title.type;
    if (fallbackType) {
        const recommendations = await client_1.default.title.findMany({
            where: {
                id: { notIn: reviewedTitleIds },
                type: fallbackType,
            },
            orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
            take: 8,
        });
        if (recommendations.length > 0) {
            return recommendations;
        }
    }
    return client_1.default.title.findMany({
        where: { id: { notIn: reviewedTitleIds } },
        orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
        take: 8,
    });
};
exports.getRecommendedTitlesForUser = getRecommendedTitlesForUser;
//# sourceMappingURL=title.service.js.map