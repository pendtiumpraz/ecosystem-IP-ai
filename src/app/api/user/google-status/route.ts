import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const tokens = await sql`
      SELECT id, expires_at, drive_folder_id FROM user_google_tokens 
      WHERE user_id = ${userId}
    `;

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        connected: false,
      });
    }

    const token = tokens[0];
    const isExpired = new Date(token.expires_at) <= new Date();

    return NextResponse.json({
      success: true,
      connected: true,
      hasFolder: !!token.drive_folder_id,
      isExpired,
    });
  } catch (error) {
    console.error("Check Google status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
