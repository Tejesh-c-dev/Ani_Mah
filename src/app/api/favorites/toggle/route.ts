import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as favoriteService from "@/lib/services/favorite.service";

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const body = sanitizeBody(await request.json());
    const result = await favoriteService.toggleFavorite(auth.userId, body.titleId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Toggle favorite error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
