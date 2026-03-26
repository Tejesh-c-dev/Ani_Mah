import { NextRequest, NextResponse } from "next/server";
import { sanitizeBody } from "@/lib/sanitize";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as authService from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = sanitizeBody(await request.json());
    const result = await authService.register(body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Register error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
