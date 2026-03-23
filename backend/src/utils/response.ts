// Helper to wrap API responses in a consistent format
import { ApiResponse } from "../types";

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (error: string): ApiResponse => ({
  success: false,
  data: null,
  error,
});
