import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as reviewService from "@/lib/services/review.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { id } = await params;
    const body = sanitizeBody(await request.json());
    const result = await reviewService.updateReview(auth.userId, id, body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Update review error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const { id } = await params;
    await reviewService.deleteReview(auth.userId, id, auth.userRole);
    return NextResponse.json(successResponse({ message: "Review deleted" }));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Delete review error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
