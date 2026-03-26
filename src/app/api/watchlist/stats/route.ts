import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as watchlistService from "@/lib/services/watchlist.service";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const result = await watchlistService.getWatchlistStats(auth.userId);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Get watchlist stats error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
