import prisma from "@/lib/prisma";

export type ActivityAction =
  | "REVIEW_CREATED"
  | "REVIEW_UPDATED"
  | "REVIEW_DELETED"
  | "REVIEW_REPLIED"
  | "WATCHLIST_ADDED"
  | "WATCHLIST_UPDATED"
  | "WATCHLIST_REMOVED"
  | "FAVORITE_ADDED"
  | "FAVORITE_REMOVED";

export interface ActivityMetadata {
  [key: string]: unknown;
}

export const logActivity = async (
  userId: string,
  action: ActivityAction,
  targetId?: string,
  metadata?: ActivityMetadata
) => {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      ...(targetId ? { targetId } : {}),
      ...(metadata ? { metadata: JSON.stringify(metadata) } : {}),
    },
  });
};

export const getUserActivity = async (userId: string, limit = 50) => {
  const entries = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return entries.map((entry) => ({
    ...entry,
    metadata: entry.metadata,
  }));
};
