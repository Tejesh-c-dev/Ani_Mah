import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as watchlistService from "@/lib/services/watchlist.service";

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
    const result = await watchlistService.getWatchlistEntry(auth.userId, titleId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Get watchlist entry error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ titleId: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { titleId } = await params;
    const body = sanitizeBody(await request.json());
    const result = await watchlistService.updateWatchlistStatus(auth.userId, titleId, body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Update watchlist error:", error);
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
    const result = await watchlistService.removeFromWatchlist(auth.userId, titleId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Remove from watchlist error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
