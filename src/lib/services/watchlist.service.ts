// Watchlist service — handles watchlist CRUD operations
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logActivity } from "./activity.service";
import type { WatchlistStatus } from "@/lib/types";

export interface AddToWatchlistInput {
  titleId: string;
  status?: WatchlistStatus;
}

export interface UpdateWatchlistInput {
  status: WatchlistStatus;
}

export const addToWatchlist = async (userId: string, input: AddToWatchlistInput) => {
  const { titleId, status = "PLAN_TO_WATCH" } = input;

  const title = await prisma.title.findUnique({ where: { id: titleId } });
  if (!title) {
    throw new AppError("Title not found", 404);
  }

  const existing = await prisma.watchlist.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (existing) {
    const updated = await prisma.watchlist.update({
      where: { userId_titleId: { userId, titleId } },
      data: { status },
      include: {
        title: {
          select: { id: true, name: true, type: true, image: true, averageRating: true },
        },
      },
    });

    await logActivity(userId, "WATCHLIST_UPDATED", titleId, { status });
    return updated;
  }

  const created = await prisma.watchlist.create({
    data: { userId, titleId, status },
    include: {
      title: {
        select: { id: true, name: true, type: true, image: true, averageRating: true },
      },
    },
  });

  await logActivity(userId, "WATCHLIST_ADDED", titleId, { status });
  return created;
};

export const removeFromWatchlist = async (userId: string, titleId: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (!existing) {
    throw new AppError("Title not in watchlist", 404);
  }

  await prisma.watchlist.delete({
    where: { userId_titleId: { userId, titleId } },
  });

  await logActivity(userId, "WATCHLIST_REMOVED", titleId);

  return { message: "Removed from watchlist" };
};

export const updateWatchlistStatus = async (
  userId: string,
  titleId: string,
  input: UpdateWatchlistInput
) => {
  const { status } = input;

  const existing = await prisma.watchlist.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  if (!existing) {
    throw new AppError("Title not in watchlist", 404);
  }

  const updated = await prisma.watchlist.update({
    where: { userId_titleId: { userId, titleId } },
    data: { status },
    include: {
      title: {
        select: { id: true, name: true, type: true, image: true, averageRating: true },
      },
    },
  });

  await logActivity(userId, "WATCHLIST_UPDATED", titleId, { status });
  return updated;
};

export const getUserWatchlist = async (userId: string, status?: WatchlistStatus) => {
  return prisma.watchlist.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
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
    orderBy: { updatedAt: "desc" },
  });
};

export const getWatchlistEntry = async (userId: string, titleId: string) => {
  return prisma.watchlist.findUnique({
    where: { userId_titleId: { userId, titleId } },
    select: { status: true },
  });
};

export const getWatchlistStats = async (userId: string) => {
  const stats = await prisma.watchlist.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  return {
    planToWatch: stats.find((s) => s.status === "PLAN_TO_WATCH")?._count._all ?? 0,
    watching: stats.find((s) => s.status === "WATCHING")?._count._all ?? 0,
    completed: stats.find((s) => s.status === "COMPLETED")?._count._all ?? 0,
    dropped: stats.find((s) => s.status === "DROPPED")?._count._all ?? 0,
  };
};
