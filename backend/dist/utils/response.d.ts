import { ApiResponse } from "../types";
export declare const successResponse: <T>(data: T) => ApiResponse<T>;
export declare const errorResponse: (error: string) => ApiResponse;
