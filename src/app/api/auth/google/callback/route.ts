import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { exchangeCodeForTokens } from "@/lib/google-drive";

const sql = neon(process.env.DATABASE_URL!);

// GET - Handle OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}/settings?error=google_auth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/settings?error=invalid_callback`);
  }

  try {
    // Decode state
    const { userId, returnUrl } = JSON.parse(Buffer.from(state, "base64").toString());

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save tokens to database
    await sql`
      INSERT INTO user_google_tokens (user_id, access_token, refresh_token, expires_at, created_at)
      VALUES (${userId}, ${tokens.accessToken}, ${tokens.refreshToken}, ${new Date(tokens.expiresAt).toISOString()}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, user_google_tokens.refresh_token),
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `;

    return NextResponse.redirect(`${baseUrl}${returnUrl}?google_connected=true`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/settings?error=google_auth_failed`);
  }
}
