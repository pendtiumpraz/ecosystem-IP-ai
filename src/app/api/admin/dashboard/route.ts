import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get total users count
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    
    // Get total organizations
    const orgsCount = await sql`SELECT COUNT(*) as count FROM organizations`;
    
    // Get active subscriptions (excluding trial)
    const subsCount = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE subscription_tier IS NOT NULL AND subscription_tier != 'trial'
    `;
    
    // Get pending payments
    const pendingPayments = await sql`
      SELECT COUNT(*) as count FROM payments WHERE status = 'pending'
    `;
    
    // Get total revenue (verified payments)
    const revenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'verified'
    `;
    
    // Get AI generations count
    const generations = await sql`
      SELECT COUNT(*) as count FROM ai_generation_logs
    `;
    
    // Recent users
    const recentUsers = await sql`
      SELECT id, name, email, user_type, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    // Recent payments
    const recentPaymentsData = await sql`
      SELECT p.id, p.amount, p.status, p.created_at, u.name as user_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: Number(usersCount[0]?.count || 0),
        totalOrganizations: Number(orgsCount[0]?.count || 0),
        activeSubscriptions: Number(subsCount[0]?.count || 0),
        pendingPayments: Number(pendingPayments[0]?.count || 0),
        totalRevenue: Number(revenue[0]?.total || 0),
        aiGenerations: Number(generations[0]?.count || 0),
        userGrowth: 15, // Mock growth percentage
        revenueGrowth: 24, // Mock growth percentage
      },
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        userType: u.user_type,
        createdAt: u.created_at,
      })),
      recentPayments: recentPaymentsData.map(p => ({
        id: p.id,
        userName: p.user_name,
        amount: p.amount,
        status: p.status,
        createdAt: p.created_at,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
