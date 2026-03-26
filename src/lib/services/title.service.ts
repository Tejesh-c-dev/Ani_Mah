// Title service — handles anime, manhwa, and movie title CRUD and business logic
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { deleteSupabaseImage } from "@/lib/supabase-utils";
import type { CreateTitleInput, ReviewSort } from "@/lib/types";

const currentYear = new Date().getFullYear();

const VALID_TYPES = ["ANIME", "MANHWA", "MOVIE"];
const splitGenres = (genreText: string | undefined) =>
  (genreText || "General")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

export const createTitle = async (input: CreateTitleInput) => {
  const { name, description, releaseYear, type, genre, image } = input;
  const normalizedGenres = Array.from(new Set(splitGenres(genre)));

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
      genre: normalizedGenres.join(", ") || "General",
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

const reviewOrderByMap = {
  latest: { createdAt: "desc" as const },
  top_rated: [{ rating: "desc" as const }, { createdAt: "desc" as const }],
  most_helpful: [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }],
} satisfies Record<ReviewSort, object | object[]>;

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

  const reviewedTitleIds = reviews.map((r: { titleId: string }) => r.titleId);

  const genreFrequency = new Map<string, number>();
  for (const review of reviews) {
    if ((review.rating ?? 0) >= 4) {
      const titleGenres = splitGenres(review.title.genre);
      for (const key of titleGenres) {
        genreFrequency.set(key, (genreFrequency.get(key) ?? 0) + 1);
      }
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
        OR: preferredGenres.map((g) => ({ genre: { contains: g } })),
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

export const deleteTitleByAdmin = async (titleId: string) => {
  const title = await prisma.title.findUnique({ where: { id: titleId } });
  if (!title) {
    throw new AppError("Title not found", 404);
  }

  await prisma.title.delete({ where: { id: titleId } });

  if (title.image) {
    await deleteSupabaseImage(title.image);
  }

  return { message: "Title deleted" };
};
