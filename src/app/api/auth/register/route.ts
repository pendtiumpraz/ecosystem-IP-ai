import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { email, password, name, role = "tenant" } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate trial end date (14 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Determine user type
    const userType = role === "investor" ? "investor" : "tenant";
    const subscriptionTier = userType === "tenant" ? "trial" : null;
    const creditBalance = userType === "tenant" ? 100 : 0;

    // Create user
    const newUsers = await sql`
      INSERT INTO users (email, name, password, user_type, subscription_tier, credit_balance, trial_started_at, trial_ends_at, email_verified)
      VALUES (${email.toLowerCase()}, ${name}, ${hashedPassword}, ${userType}, ${subscriptionTier}, ${creditBalance}, NOW(), ${trialEndsAt}, false)
      RETURNING id, email, name, avatar_url, user_type, subscription_tier, credit_balance, trial_ends_at, created_at
    `;

    const user = newUsers[0];

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
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
