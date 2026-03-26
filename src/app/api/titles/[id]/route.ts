import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as titleService from "@/lib/services/title.service";
import type { ReviewSort } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reviewSort = (searchParams.get("reviewSort") as ReviewSort) || "latest";

    const result = await titleService.getTitleById(id, reviewSort);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Get title error:", error);
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

    if (auth.userRole !== "ADMIN") {
      return NextResponse.json(errorResponse("Admin access required"), { status: 403 });
    }

    const { id } = await params;
    const result = await titleService.deleteTitleByAdmin(id);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Delete title error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
