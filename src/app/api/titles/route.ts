import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import { supabase, bucketName } from "@/lib/supabase";
import * as titleService from "@/lib/services/title.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const result = await titleService.getAllTitles(type);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Get titles error:", errorMessage, error);
    return NextResponse.json(
      errorResponse(`Failed to fetch titles: ${errorMessage}`),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json(errorResponse("Authentication required"), { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const releaseYear = parseInt(formData.get("releaseYear") as string, 10);
    const type = (formData.get("type") as string) || undefined;
    const genre = (formData.get("genre") as string) || undefined;
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(errorResponse("Invalid file type. Allowed: JPEG, PNG, WebP, GIF"), { status: 400 });
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(errorResponse("File too large. Maximum size is 5MB"), { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;
      const path = `titles/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, buffer, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json(errorResponse(`Image upload failed: ${uploadError.message}`), { status: 500 });
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    const result = await titleService.createTitle({
      name,
      description,
      releaseYear,
      type: type as "ANIME" | "MANHWA" | "MOVIE" | undefined,
      genre,
      image: imageUrl,
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error.message), { status: error.statusCode });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Create title error:", errorMessage, error);
    return NextResponse.json(
      errorResponse(`Failed to create title: ${errorMessage}`),
      { status: 500 }
    );
  }
}
