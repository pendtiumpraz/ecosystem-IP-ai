import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { withErrorHandling } from "@/lib/api-error-handler";

const sql = neon(process.env.DATABASE_URL!);

export const GET = withErrorHandling(async () => {
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

  // Get recent users (last 7 days)
  const recentUsers = await sql`
    SELECT 
      id, name, email, user_type, subscription_tier, created_at,
      (SELECT COUNT(*) FROM projects WHERE user_id = users.id AND deleted_at IS NULL) as project_count
    FROM users 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY created_at DESC
    LIMIT 10
  `;

  // Get recent projects
  const recentProjects = await sql`
    SELECT 
      p.id, p.title, p.status, p.created_at,
      u.name as creator_name, u.email as creator_email
    FROM projects p
    JOIN users u ON p.user_id = u.id
    WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY p.created_at DESC
    LIMIT 10
  `;

  // Get recent payments
  const recentPayments = await sql`
    SELECT 
      p.id, p.amount, p.status, p.created_at,
      u.name as user_name, u.email as user_email
    FROM payments p
    JOIN users u ON p.user_id = u.id
    WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY p.created_at DESC
    LIMIT 10
  `;

  // Get top AI models usage
  const topModels = await sql`
    SELECT 
      m.name as model_name,
      m.model_id,
      COUNT(*) as usage_count
    FROM ai_generation_logs lg
    JOIN ai_models m ON lg.model_id = m.model_id
    WHERE lg.deleted_at IS NULL
    GROUP BY m.name, m.model_id
    ORDER BY usage_count DESC
    LIMIT 5
  `;

  // Get user growth trend (last 30 days)
  const userGrowth = await sql`
    SELECT 
      DATE_TRUNC('day', created_at) as day,
      COUNT(*) as new_users
    FROM users 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day
  `;

  // Get revenue trend (last 30 days)
  const revenueTrend = await sql`
    SELECT 
      DATE_TRUNC('day', created_at) as day,
      COALESCE(SUM(amount), 0) as daily_revenue
    FROM payments 
    WHERE status = 'verified' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day
  `;

  // Calculate conversion rate
  const totalUsers = Number(usersCount[0]?.count || 1);
  const paidUsers = Number(activeSubscriptions[0]?.count || 0);
  const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  return NextResponse.json({
    success: true,
    dashboard: {
      // Key metrics
      totalUsers: Number(usersCount[0]?.count || 0),
      newUsersToday: Number(newUsersToday[0]?.count || 0),
      totalRevenue: Number(totalRevenue[0]?.total || 0),
      revenueThisMonth: Number(revenueThisMonth[0]?.total || 0),
      totalGenerations: Number(totalGenerations[0]?.count || 0),
      generationsToday: Number(generationsToday[0]?.count || 0),
      activeSubscriptions: paidUsers,
      conversionRate,
      
      // Recent activities
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        userType: u.user_type,
        subscriptionTier: u.subscription_tier,
        createdAt: u.created_at,
        projectCount: Number(u.project_count || 0),
      })),
      
      recentProjects: recentProjects.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        creatorName: p.creator_name,
        creatorEmail: p.creator_email,
        createdAt: p.created_at,
      })),
      
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        userName: p.user_name,
        userEmail: p.user_email,
        createdAt: p.created_at,
      })),
      
      // Usage analytics
      topModels: topModels.map(m => ({
        modelName: m.model_name,
        modelId: m.model_id,
        usageCount: Number(m.usage_count),
      })),
      
      // Trends
      userGrowth: userGrowth.map(g => ({
        day: g.day,
        newUsers: Number(g.new_users || 0),
      })),
      
      revenueTrend: revenueTrend.map(r => ({
        day: r.day,
        dailyRevenue: Number(r.daily_revenue || 0),
      })),
    },
  });
});