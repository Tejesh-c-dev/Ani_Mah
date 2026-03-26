import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as watchlistService from "@/lib/services/watchlist.service";
import type { WatchlistStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as WatchlistStatus | null;

    const result = await watchlistService.getUserWatchlist(auth.userId, status || undefined);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Get watchlist error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const body = sanitizeBody(await request.json());
    const result = await watchlistService.addToWatchlist(auth.userId, body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Add to watchlist error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
