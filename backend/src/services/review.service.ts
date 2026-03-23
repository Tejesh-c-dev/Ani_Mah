// Review service — handles review CRUD and averageRating recalculation
import prisma from "../prisma/client";
import { AppError } from "../utils/AppError";
import { CreateReplyInput, CreateReviewInput, UpdateReviewInput, VoteReviewInput } from "../types";

// Recalculates and updates the averageRating on a Title
const recalculateAverage = async (titleId: string) => {
  const result = await prisma.review.aggregate({
    where: {
      titleId,
      parentId: null,
      rating: { not: null },
    },
    _avg: { rating: true },
  });

  await prisma.title.update({
    where: { id: titleId },
    data: { averageRating: result._avg.rating ?? 0 },
  });
};

export const createReview = async (userId: string, input: CreateReviewInput) => {
  const { rating, comment, titleId, parentId } = input;

  if (parentId) {
    throw new AppError("Use the reply endpoint to create replies", 400);
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }
  if (!comment) {
    throw new AppError("Comment is required", 400);
  }
  if (!titleId) {
    throw new AppError("Title ID is required", 400);
  }

  // Check title exists
  const title = await prisma.title.findUnique({ where: { id: titleId } });
  if (!title) {
    throw new AppError("Title not found", 404);
  }

  // One top-level review per user per title
  const existing = await prisma.review.findFirst({
    where: { userId, titleId, parentId: null },
  });
  if (existing) {
    throw new AppError("You have already reviewed this title", 409);
  }

  const review = await prisma.review.create({
    data: { rating, comment, userId, titleId },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  await recalculateAverage(titleId);
  return review;
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  input: UpdateReviewInput
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  if (review.userId !== userId) {
    throw new AppError("Not authorized to update this review", 403);
  }

  if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }
  if (review.parentId && input.rating !== undefined) {
    throw new AppError("Replies cannot have ratings", 400);
  }

  const updated = await prisma.review.update({
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

export const deleteReview = async (
  userId: string,
  reviewId: string,
  userRole: "USER" | "ADMIN" = "USER"
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  if (review.userId !== userId && userRole !== "ADMIN") {
    throw new AppError("Not authorized to delete this review", 403);
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await recalculateAverage(review.titleId);
};

export const createReply = async (userId: string, reviewId: string, input: CreateReplyInput) => {
  const { comment } = input;

  if (!comment?.trim()) {
    throw new AppError("Reply comment is required", 400);
  }

  const parentReview = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!parentReview) {
    throw new AppError("Review not found", 404);
  }
  if (parentReview.parentId) {
    throw new AppError("Nested replies are not supported", 400);
  }

  const reply = await prisma.review.create({
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

const refreshHelpfulCounts = async (reviewId: string) => {
  const grouped = await prisma.reviewVote.groupBy({
    by: ["value"],
    where: { reviewId },
    _count: { _all: true },
  });

  const helpfulCount = grouped.find((g) => g.value === 1)?._count._all ?? 0;
  const notHelpfulCount = grouped.find((g) => g.value === -1)?._count._all ?? 0;

  await prisma.review.update({
    where: { id: reviewId },
    data: { helpfulCount, notHelpfulCount },
  });
};

export const voteReview = async (userId: string, reviewId: string, input: VoteReviewInput) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const nextValue = input.vote === "helpful" ? 1 : -1;

  const existing = await prisma.reviewVote.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
  });

  if (existing && existing.value === nextValue) {
    await prisma.reviewVote.delete({ where: { userId_reviewId: { userId, reviewId } } });
  } else if (existing) {
    await prisma.reviewVote.update({
      where: { userId_reviewId: { userId, reviewId } },
      data: { value: nextValue },
    });
  } else {
    await prisma.reviewVote.create({
      data: { userId, reviewId, value: nextValue },
    });
  }

  await refreshHelpfulCounts(reviewId);

  return prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      helpfulCount: true,
      notHelpfulCount: true,
    },
  });
};
