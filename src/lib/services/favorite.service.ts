// Favorite service — handles favorites CRUD operations
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity.service";

export const addToFavorites = async (userId: string, titleId: string) => {
  const title = await prisma.title.findUnique({ where: { id: titleId } });
  if (!title) {
    throw new AppError("Title not found", 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (existing) {
    throw new AppError("Title already in favorites", 409);
  }

  const created = await prisma.favorite.create({
    data: { userId, titleId },
    include: {
      title: {
        select: { id: true, name: true, type: true, image: true, averageRating: true },
      },
    },
  });

  await logActivity(userId, "FAVORITE_ADDED", titleId);
  return created;
};

export const removeFromFavorites = async (userId: string, titleId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (!existing) {
    throw new AppError("Title not in favorites", 404);
  }

  await prisma.favorite.delete({
    where: { userId_titleId: { userId, titleId } },
  });

  await logActivity(userId, "FAVORITE_REMOVED", titleId);

  return { message: "Removed from favorites" };
};

export const getUserFavorites = async (userId: string) => {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      title: {
        select: {
          id: true,
          name: true,
          type: true,
          genre: true,
          image: true,
          releaseYear: true,
          averageRating: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const isFavorite = async (userId: string, titleId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });
  return { isFavorite: !!favorite };
};

export const toggleFavorite = async (userId: string, titleId: string) => {
  const title = await prisma.title.findUnique({ where: { id: titleId } });
  if (!title) {
    throw new AppError("Title not found", 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_titleId: { userId, titleId } },
    });
    await logActivity(userId, "FAVORITE_REMOVED", titleId);
    return { isFavorite: false, message: "Removed from favorites" };
  }

  await prisma.favorite.create({
    data: { userId, titleId },
  });
  await logActivity(userId, "FAVORITE_ADDED", titleId);
  return { isFavorite: true, message: "Added to favorites" };
};
