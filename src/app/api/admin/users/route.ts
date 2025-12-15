import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

// GET - List users (excluding soft deleted)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let users;
    if (userType && userType !== "all") {
      users = await sql`
        SELECT id, email, name, avatar_url, user_type, subscription_tier, credit_balance, 
               email_verified, is_active, trial_ends_at, last_login_at, created_at
        FROM users 
        WHERE user_type = ${userType} AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (search) {
      users = await sql`
        SELECT id, email, name, avatar_url, user_type, subscription_tier, credit_balance,
               email_verified, is_active, trial_ends_at, last_login_at, created_at
        FROM users 
        WHERE (name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'}) AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      users = await sql`
        SELECT id, email, name, avatar_url, user_type, subscription_tier, credit_balance,
               email_verified, is_active, trial_ends_at, last_login_at, created_at
        FROM users 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`;

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatar_url,
        userType: u.user_type,
        subscriptionTier: u.subscription_tier,
        creditBalance: u.credit_balance,
        emailVerified: u.email_verified,
        isActive: u.is_active,
        trialEndsAt: u.trial_ends_at,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at,
      })),
      total: Number(countResult[0]?.count || 0),
    });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, userType, subscriptionTier, creditBalance, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        user_type = COALESCE(${userType}, user_type),
        subscription_tier = COALESCE(${subscriptionTier}, subscription_tier),
        credit_balance = COALESCE(${creditBalance}, credit_balance),
        is_active = COALESCE(${isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, user_type, subscription_tier, credit_balance, is_active
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updated[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Prevent deleting superadmin
    const user = await sql`SELECT user_type FROM users WHERE id = ${id} AND deleted_at IS NULL`;
    if (user[0]?.user_type === "superadmin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete superadmin user" },
        { status: 403 }
      );
    }

    // SOFT DELETE - set deleted_at instead of actual delete
    const deleted = await sql`
      UPDATE users SET deleted_at = NOW(), updated_at = NOW() 
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
