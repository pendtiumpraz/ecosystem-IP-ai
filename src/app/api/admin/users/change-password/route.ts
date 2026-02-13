import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

// POST - Admin change user password (no old password needed)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json(
                { success: false, error: "User ID and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if user exists
        const users = await sql`
      SELECT id, name, email FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user password
        await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `;

        return NextResponse.json({
            success: true,
            message: `Password for ${users[0].name || users[0].email} has been changed successfully`,
        });
    } catch (error) {
        console.error("Admin change password error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to change password" },
            { status: 500 }
        );
    }
}
