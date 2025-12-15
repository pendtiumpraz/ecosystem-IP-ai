import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await sql`
      SELECT u.*, o.id as organization_id, o.name as organization_name
      FROM users u
      LEFT JOIN org_members om ON u.id = om.user_id
      LEFT JOIN organizations o ON om.org_id = o.id
      WHERE u.email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || "");
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await sql`
      UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}
    `;

    // Return user data (without password)
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
        trialEndsAt: user.trial_ends_at,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
