// JWT authentication utility for Next.js API routes
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./types";

export interface AuthResult {
  userId: string;
  userRole: "USER" | "ADMIN";
}

/**
 * Verify JWT token from request headers
 * Returns null if no valid token is present
 */
export const verifyAuth = (request: NextRequest): AuthResult | null => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return {
      userId: decoded.userId,
      userRole: decoded.role,
    };
  } catch {
    return null;
  }
};

/**
 * Require authentication - throws if not authenticated
 */
export const requireAuth = (request: NextRequest): AuthResult => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new Error("Authentication required");
  }
  return auth;
};

/**
 * Require admin role - throws if not admin
 */
export const requireAdmin = (request: NextRequest): AuthResult => {
  const auth = requireAuth(request);
  if (auth.userRole !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return auth;
};
