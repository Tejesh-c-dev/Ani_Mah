// API service layer — centralized fetch wrapper with auth token injection
import type {
  ApiResponse,
  WatchlistStatus,
  WatchlistEntry,
  WatchlistStats,
  Favorite,
  ActivityLog,
  User,
} from "../types";

const BASE_URL = "/api";

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data: ApiResponse<T> = await res.json();
      return data;
    }

    const text = await res.text();
    return {
      success: false,
      data: null,
      error: `Unexpected non-JSON response (${res.status}): ${text.slice(0, 120)}`,
    } as ApiResponse<T>;
  } catch {
    return { success: false, data: null, error: "Network error" } as ApiResponse<T>;
  }
}

// Auth
export const registerUser = (body: {
  username: string;
  email: string;
  password: string;
}) => request("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const loginUser = (body: { email: string; password: string }) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(body) });

export const getMyProfile = () => request("/auth/me/profile");
export const getMyActivity = () => request<ActivityLog[]>("/auth/me/activity");

export const updateMyProfileImage = async (image: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("image", image);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}/auth/me/profile-image`, {
      method: "PATCH",
      headers,
      body: formData,
    });
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    return {
      success: false,
      data: null,
      error: `Unexpected non-JSON response (${res.status}): ${text.slice(0, 120)}`,
    };
  } catch {
    return { success: false, data: null, error: "Network error" };
  }
};

// Titles
export const getTitles = (type?: string) =>
  request(`/titles${type ? `?type=${type}` : ""}`);

export const getTitleById = (
  id: string,
  reviewSort: "latest" | "top_rated" | "most_helpful" = "latest"
) => request(`/titles/${id}?reviewSort=${reviewSort}`);

export const createTitle = async (body: {
  name: string;
  description: string;
  releaseYear: number;
  type?: string;
  genre?: string;
  image?: File | null;
}): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("name", body.name);
  formData.append("description", body.description);
  formData.append("releaseYear", String(body.releaseYear));
  if (body.type) formData.append("type", body.type);
  if (body.genre) formData.append("genre", body.genre);
  if (body.image) formData.append("image", body.image);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}/titles`, {
      method: "POST",
      headers,
      body: formData,
    });
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    return {
      success: false,
      data: null,
      error: `Unexpected non-JSON response (${res.status}): ${text.slice(0, 120)}`,
    };
  } catch {
    return { success: false, data: null, error: "Network error" };
  }
};

// Reviews
export const createReview = (body: {
  rating: number;
  comment: string;
  titleId: string;
}) => request("/reviews", { method: "POST", body: JSON.stringify(body) });

export const updateReview = (
  id: string,
  body: { rating?: number; comment?: string }
) =>
  request(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteReview = (id: string) =>
  request(`/reviews/${id}`, { method: "DELETE" });

export const voteReview = (
  id: string,
  vote: "helpful" | "not_helpful"
) => request(`/reviews/${id}/vote`, { method: "POST", body: JSON.stringify({ vote }) });

export const createReply = (id: string, comment: string) =>
  request(`/reviews/${id}/replies`, { method: "POST", body: JSON.stringify({ comment }) });

export const getRecommendedTitles = () => request("/titles/recommendations");

// Watchlist
export const getMyWatchlist = (status?: WatchlistStatus) =>
  request<WatchlistEntry[]>(`/watchlist${status ? `?status=${status}` : ""}`);

export const getWatchlistStats = () =>
  request<WatchlistStats>("/watchlist/stats");

export const getWatchlistEntry = (titleId: string) =>
  request<{ status: WatchlistStatus } | null>(`/watchlist/${titleId}`);

export const addToWatchlist = (titleId: string, status: WatchlistStatus = "PLAN_TO_WATCH") =>
  request<WatchlistEntry>("/watchlist", {
    method: "POST",
    body: JSON.stringify({ titleId, status }),
  });

export const updateWatchlistStatus = (titleId: string, status: WatchlistStatus) =>
  request<WatchlistEntry>(`/watchlist/${titleId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const removeFromWatchlist = (titleId: string) =>
  request(`/watchlist/${titleId}`, { method: "DELETE" });

// Favorites
export const getMyFavorites = () =>
  request<Favorite[]>("/favorites");

export const checkFavorite = (titleId: string) =>
  request<{ isFavorite: boolean }>(`/favorites/${titleId}`);

export const addToFavorites = (titleId: string) =>
  request<Favorite>("/favorites", {
    method: "POST",
    body: JSON.stringify({ titleId }),
  });

export const toggleFavorite = (titleId: string) =>
  request<{ isFavorite: boolean; message: string }>("/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ titleId }),
  });

export const removeFromFavorites = (titleId: string) =>
  request(`/favorites/${titleId}`, { method: "DELETE" });

// Admin
export const getAdminUsers = () =>
  request<User[]>("/auth/users");

export const deleteUserAsAdmin = (userId: string) =>
  request(`/auth/users/${userId}`, { method: "DELETE" });

export const updateUserRoleAsAdmin = (userId: string, role: "USER" | "ADMIN") =>
  request<User>(`/auth/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const deleteTitleAsAdmin = (titleId: string) =>
  request(`/titles/${titleId}`, { method: "DELETE" });

export const adminLoginUser = (body: { email: string; password: string }) =>
  request<{ token: string; user: User }>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const bootstrapAdminUser = (body: {
  username: string;
  email: string;
  password: string;
  setupKey: string;
}) =>
  request<{ token: string; user: User }>("/auth/admin/bootstrap", {
    method: "POST",
    body: JSON.stringify(body),
  });
