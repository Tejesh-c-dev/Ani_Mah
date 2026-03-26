import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as favoriteService from "@/lib/services/favorite.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ titleId: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { titleId } = await params;
    const result = await favoriteService.isFavorite(auth.userId, titleId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Check favorite error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ titleId: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { titleId } = await params;
    const result = await favoriteService.removeFromFavorites(auth.userId, titleId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Remove from favorites error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
