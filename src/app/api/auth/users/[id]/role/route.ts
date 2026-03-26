import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as authService from "@/lib/services/auth.service";

export async function PATCH(
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
    const body = sanitizeBody(await request.json());
    const result = await authService.updateUserRole(id, body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Update user role error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
