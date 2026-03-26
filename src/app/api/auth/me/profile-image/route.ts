import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import * as authService from "@/lib/services/auth.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(errorResponse("Profile image is required"), { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(errorResponse("Invalid file type. Allowed: JPEG, PNG, WebP, GIF"), { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(errorResponse("File too large. Maximum size is 5MB"), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await authService.updateMyProfileImage(auth.userId, {
      buffer,
      mimetype: file.type,
      originalname: file.name,
      size: file.size,
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    console.error("Update profile image error:", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
