// API service layer — centralized fetch wrapper with auth token injection
import type { ApiResponse } from "../types";

const API = import.meta.env.VITE_API_URL;
const API_ORIGIN = API?.replace(/\/$/, "");
if (!API_ORIGIN) {
  throw new Error("Missing VITE_API_URL. Set it to your Railway backend URL.");
}
const BASE_URL = `${API_ORIGIN}/api`;

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
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

export const updateMyProfileImage = async (image: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("image", image);

  const token = localStorage.getItem("token");
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

  const token = localStorage.getItem("token");
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
