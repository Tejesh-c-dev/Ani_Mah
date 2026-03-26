// Shared frontend types matching the backend API

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: "USER" | "ADMIN";
  profileImage?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string | null;
  createdAt: string;
  stats: {
    reviewsCount: number;
    likesReceived: number;
  };
}

export interface Title {
  id: string;
  name: string;
  type: "ANIME" | "MANHWA" | "MOVIE";
  genre: string;
  description: string;
  image?: string | null;
  releaseYear: number;
  averageRating: number;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating?: number | null;
  comment: string;
  userId: string;
  titleId: string;
  parentId?: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  replies?: Review[];
  user?: { id: string; username: string };
}

// Watchlist types
export type WatchlistStatus = "PLAN_TO_WATCH" | "WATCHING" | "COMPLETED" | "DROPPED";

export interface WatchlistEntry {
  id: string;
  userId: string;
  titleId: string;
  status: WatchlistStatus;
  createdAt: string;
  updatedAt: string;
  title?: Pick<Title, "id" | "name" | "type" | "genre" | "image" | "releaseYear" | "averageRating">;
}

export interface WatchlistStats {
  planToWatch: number;
  watching: number;
  completed: number;
  dropped: number;
}

// Favorites types
export interface Favorite {
  id: string;
  userId: string;
  titleId: string;
  createdAt: string;
  title?: Pick<Title, "id" | "name" | "type" | "genre" | "image" | "releaseYear" | "averageRating">;
}

// Activity types
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

export interface ActivityLog {
  id: string;
  userId: string;
  action: ActivityAction;
  targetId?: string;
  metadata?: string;
  createdAt: string;
}
