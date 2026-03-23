"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteReview = exports.createReply = exports.deleteReview = exports.updateReview = exports.createReview = void 0;
// Review service — handles review CRUD and averageRating recalculation
const client_1 = __importDefault(require("../prisma/client"));
const AppError_1 = require("../utils/AppError");
// Recalculates and updates the averageRating on a Title
const recalculateAverage = async (titleId) => {
    const result = await client_1.default.review.aggregate({
        where: {
            titleId,
            parentId: null,
            rating: { not: null },
        },
        _avg: { rating: true },
    });
    await client_1.default.title.update({
        where: { id: titleId },
        data: { averageRating: result._avg.rating ?? 0 },
    });
};
const createReview = async (userId, input) => {
    const { rating, comment, titleId, parentId } = input;
    if (parentId) {
        throw new AppError_1.AppError("Use the reply endpoint to create replies", 400);
    }
    if (!rating || rating < 1 || rating > 5) {
        throw new AppError_1.AppError("Rating must be between 1 and 5", 400);
    }
    if (!comment) {
        throw new AppError_1.AppError("Comment is required", 400);
    }
    if (!titleId) {
        throw new AppError_1.AppError("Title ID is required", 400);
    }
    // Check title exists
    const title = await client_1.default.title.findUnique({ where: { id: titleId } });
    if (!title) {
        throw new AppError_1.AppError("Title not found", 404);
    }
    // One top-level review per user per title
    const existing = await client_1.default.review.findFirst({
        where: { userId, titleId, parentId: null },
    });
    if (existing) {
        throw new AppError_1.AppError("You have already reviewed this title", 409);
    }
    const review = await client_1.default.review.create({
        data: { rating, comment, userId, titleId },
        include: {
            user: { select: { id: true, username: true } },
        },
    });
    await recalculateAverage(titleId);
    return review;
};
exports.createReview = createReview;
const updateReview = async (userId, reviewId, input) => {
    const review = await client_1.default.review.findUnique({ where: { id: reviewId } });
    if (!review) {
        throw new AppError_1.AppError("Review not found", 404);
    }
    if (review.userId !== userId) {
        throw new AppError_1.AppError("Not authorized to update this review", 403);
    }
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
        throw new AppError_1.AppError("Rating must be between 1 and 5", 400);
    }
    if (review.parentId && input.rating !== undefined) {
        throw new AppError_1.AppError("Replies cannot have ratings", 400);
    }
    const updated = await client_1.default.review.update({
        where: { id: reviewId },
        data: {
            ...(input.rating !== undefined && { rating: input.rating }),
            ...(input.comment !== undefined && { comment: input.comment }),
        },
        include: {
            user: { select: { id: true, username: true } },
        },
    });
    await recalculateAverage(review.titleId);
    return updated;
};
exports.updateReview = updateReview;
const deleteReview = async (userId, reviewId, userRole = "USER") => {
    const review = await client_1.default.review.findUnique({ where: { id: reviewId } });
    if (!review) {
        throw new AppError_1.AppError("Review not found", 404);
    }
    if (review.userId !== userId && userRole !== "ADMIN") {
        throw new AppError_1.AppError("Not authorized to delete this review", 403);
    }
    await client_1.default.review.delete({ where: { id: reviewId } });
    await recalculateAverage(review.titleId);
};
exports.deleteReview = deleteReview;
const createReply = async (userId, reviewId, input) => {
    const { comment } = input;
    if (!comment?.trim()) {
        throw new AppError_1.AppError("Reply comment is required", 400);
    }
    const parentReview = await client_1.default.review.findUnique({ where: { id: reviewId } });
    if (!parentReview) {
        throw new AppError_1.AppError("Review not found", 404);
    }
    if (parentReview.parentId) {
        throw new AppError_1.AppError("Nested replies are not supported", 400);
    }
    const reply = await client_1.default.review.create({
        data: {
            userId,
            titleId: parentReview.titleId,
            parentId: parentReview.id,
            rating: null,
            comment: comment.trim(),
        },
        include: {
            user: { select: { id: true, username: true } },
        },
    });
    return reply;
};
exports.createReply = createReply;
const refreshHelpfulCounts = async (reviewId) => {
    const grouped = await client_1.default.reviewVote.groupBy({
        by: ["value"],
        where: { reviewId },
        _count: { _all: true },
    });
    const helpfulCount = grouped.find((g) => g.value === 1)?._count._all ?? 0;
    const notHelpfulCount = grouped.find((g) => g.value === -1)?._count._all ?? 0;
    await client_1.default.review.update({
        where: { id: reviewId },
        data: { helpfulCount, notHelpfulCount },
    });
};
const voteReview = async (userId, reviewId, input) => {
    const review = await client_1.default.review.findUnique({ where: { id: reviewId } });
    if (!review) {
        throw new AppError_1.AppError("Review not found", 404);
    }
    const nextValue = input.vote === "helpful" ? 1 : -1;
    const existing = await client_1.default.reviewVote.findUnique({
        where: { userId_reviewId: { userId, reviewId } },
    });
    if (existing && existing.value === nextValue) {
        await client_1.default.reviewVote.delete({ where: { userId_reviewId: { userId, reviewId } } });
    }
    else if (existing) {
        await client_1.default.reviewVote.update({
            where: { userId_reviewId: { userId, reviewId } },
            data: { value: nextValue },
        });
    }
    else {
        await client_1.default.reviewVote.create({
            data: { userId, reviewId, value: nextValue },
        });
    }
    await refreshHelpfulCounts(reviewId);
    return client_1.default.review.findUnique({
        where: { id: reviewId },
        select: {
            id: true,
            helpfulCount: true,
            notHelpfulCount: true,
        },
    });
};
exports.voteReview = voteReview;
//# sourceMappingURL=review.service.js.map