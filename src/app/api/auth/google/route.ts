import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-drive";

// GET - Redirect to Google OAuth
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID required" },
      { status: 400 }
    );
  }

  // Create state with userId and returnUrl
  const state = Buffer.from(JSON.stringify({ userId, returnUrl })).toString("base64");
  const authUrl = getGoogleAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
