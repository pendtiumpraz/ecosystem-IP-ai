import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get user profile
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

    const users = await sql`
      SELECT id, email, name, avatar_url, user_type, subscription_tier, 
             credit_balance, email_verified, trial_ends_at, created_at
      FROM users 
      WHERE id = ${userId} AND deleted_at IS NULL
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        userType: user.user_type,
        subscriptionTier: user.subscription_tier,
        creditBalance: user.credit_balance,
        emailVerified: user.email_verified,
        trialEndsAt: user.trial_ends_at,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        avatar_url = COALESCE(${avatarUrl || null}, avatar_url),
        updated_at = NOW()
      WHERE id = ${userId} AND deleted_at IS NULL
      RETURNING id, name, avatar_url
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated[0].id,
        name: updated[0].name,
        avatarUrl: updated[0].avatar_url,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
