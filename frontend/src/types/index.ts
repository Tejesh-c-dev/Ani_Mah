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
