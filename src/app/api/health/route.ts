import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Health check failed:", errorMessage);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
