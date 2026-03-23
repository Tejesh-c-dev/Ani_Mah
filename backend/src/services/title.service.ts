// Title service — handles anime, manhwa, and movie title CRUD and business logic
import prisma from "../prisma/client";
import { AppError } from "../utils/AppError";
import { CreateTitleInput, ReviewSort } from "../types";

const currentYear = new Date().getFullYear();

const VALID_TYPES = ["ANIME", "MANHWA", "MOVIE"];

export const createTitle = async (input: CreateTitleInput) => {
  const { name, description, releaseYear, type, genre, image } = input;

  if (!name) {
    throw new AppError("Title name is required", 400);
  }

  const existing = await prisma.title.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(`A title named "${name}" already exists`, 409);
  }

  if (!description) {
    throw new AppError("Description is required", 400);
  }
  if (!releaseYear || releaseYear < 1900 || releaseYear > currentYear) {
    throw new AppError(`Release year must be between 1900 and ${currentYear}`, 400);
  }

  const titleType = type && VALID_TYPES.includes(type.toUpperCase()) ? type.toUpperCase() : "ANIME";

  const title = await prisma.title.create({
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

export const getAllTitles = async (typeFilter?: string) => {
  const where = typeFilter && VALID_TYPES.includes(typeFilter.toUpperCase())
    ? { type: typeFilter.toUpperCase() }
    : undefined;

  const titles = await prisma.title.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return titles;
};

const reviewOrderByMap: Record<ReviewSort, any> = {
  latest: { createdAt: "desc" },
  top_rated: [{ rating: "desc" }, { createdAt: "desc" }],
  most_helpful: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
};

export const getTitleById = async (id: string, reviewSort: ReviewSort = "latest") => {
  const title = await prisma.title.findUnique({
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
    throw new AppError("Title not found", 404);
  }

  return title;
};

export const getRecommendedTitlesForUser = async (userId: string) => {
  const reviews = await prisma.review.findMany({
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

  const genreFrequency = new Map<string, number>();
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
    const recommendations = await prisma.title.findMany({
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
    const recommendations = await prisma.title.findMany({
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

  return prisma.title.findMany({
    where: { id: { notIn: reviewedTitleIds } },
    orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
};
