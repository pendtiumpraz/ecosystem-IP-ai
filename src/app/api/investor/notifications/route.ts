import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      );
    }

    // Get notifications from various sources
    const notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      time: string;
      read: boolean;
    }> = [];

    // 1. Recent returns (from transactions)
    const returns = await sql`
      SELECT id, amount, description, created_at
      FROM investor_transactions
      WHERE user_id = ${userId} AND type = 'return'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    returns.forEach(r => {
      notifications.push({
        id: `return-${r.id}`,
        type: "return",
        title: "Return Received",
        message: `You received Rp ${(r.amount / 1000000).toFixed(1)}M - ${r.description}`,
        time: r.created_at,
        read: true,
      });
    });

    // 2. Investment confirmations
    const investments = await sql`
      SELECT i.id, i.invested_amount, c.title, i.created_at
      FROM investments i
      JOIN investment_campaigns c ON i.campaign_id = c.id
      WHERE i.user_id = ${userId} AND i.status = 'confirmed'
      ORDER BY i.created_at DESC
      LIMIT 5
    `;

    investments.forEach(inv => {
      notifications.push({
        id: `invest-${inv.id}`,
        type: "success",
        title: "Investment Confirmed",
        message: `Your investment in ${inv.title} has been confirmed`,
        time: inv.created_at,
        read: true,
      });
    });

    // 3. Campaign updates (campaigns user invested in that are now funded/completed)
    const campaignUpdates = await sql`
      SELECT c.id, c.title, c.status, c.updated_at
      FROM investment_campaigns c
      WHERE c.id IN (
        SELECT campaign_id FROM investments WHERE user_id = ${userId}
      )
      AND c.status IN ('funded', 'completed')
      ORDER BY c.updated_at DESC
      LIMIT 5
    `;

    campaignUpdates.forEach(c => {
      notifications.push({
        id: `campaign-${c.id}`,
        type: "update",
        title: "Project Update",
        message: `${c.title} is now ${c.status}`,
        time: c.updated_at,
        read: true,
      });
    });

    // Sort by time
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // If no notifications, add a welcome message
    if (notifications.length === 0) {
      notifications.push({
        id: "welcome",
        type: "info",
        title: "Welcome to MODO Investor",
        message: "Start exploring projects to invest in!",
        time: new Date().toISOString(),
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 20),
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT - Mark as read
export async function PUT(request: Request) {
  // For now, just return success since we don't have a separate notifications table
  return NextResponse.json({
    success: true,
    message: "Notifications marked as read",
  });
}
