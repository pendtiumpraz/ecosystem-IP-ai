import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get total users
    const usersCount = await sql`
      SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL
    `;

    // Get new users today
    const newUsersToday = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE
    `;

    // Get total payments (revenue)
    const totalRevenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'verified'
    `;

    // Get revenue this month
    const revenueThisMonth = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments 
      WHERE status = 'verified' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Get total AI generations
    const totalGenerations = await sql`
      SELECT COUNT(*) as count FROM ai_generation_logs WHERE deleted_at IS NULL
    `;

    // Get generations today
    const generationsToday = await sql`
      SELECT COUNT(*) as count FROM ai_generation_logs 
      WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE
    `;

    // Get active subscriptions (users with non-trial tier)
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE deleted_at IS NULL AND subscription_tier != 'trial'
    `;

    // Calculate conversion rate
    const totalUsers = Number(usersCount[0]?.count || 1);
    const paidUsers = Number(activeSubscriptions[0]?.count || 0);
    const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: Number(usersCount[0]?.count || 0),
        newUsersToday: Number(newUsersToday[0]?.count || 0),
        totalRevenue: Number(totalRevenue[0]?.total || 0),
        revenueThisMonth: Number(revenueThisMonth[0]?.total || 0),
        totalGenerations: Number(totalGenerations[0]?.count || 0),
        generationsToday: Number(generationsToday[0]?.count || 0),
        activeSubscriptions: paidUsers,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
