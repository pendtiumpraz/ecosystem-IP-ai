import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

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

    // Get total invested
    const investedResult = await sql`
      SELECT COALESCE(SUM(invested_amount), 0) as total
      FROM investments
      WHERE user_id = ${userId} AND status != 'cancelled'
    `;

    // Get returns received
    const returnsResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM investor_transactions
      WHERE user_id = ${userId} AND type = 'return'
    `;

    // Get pending returns (from active campaigns not yet distributed)
    const pendingResult = await sql`
      SELECT COALESCE(SUM(i.invested_amount * 0.1), 0) as pending
      FROM investments i
      JOIN investment_campaigns c ON i.campaign_id = c.id
      WHERE i.user_id = ${userId} 
        AND i.status = 'confirmed'
        AND c.status = 'active'
    `;

    const totalInvested = Number(investedResult[0]?.total || 0);
    const totalReturns = Number(returnsResult[0]?.total || 0);
    const pendingReturns = Number(pendingResult[0]?.pending || 0);
    const roi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Get return history
    const history = await sql`
      SELECT 
        t.id, t.amount, t.description, t.created_at,
        c.title as campaign_title
      FROM investor_transactions t
      LEFT JOIN investment_campaigns c ON t.reference_id::uuid = c.id
      WHERE t.user_id = ${userId} AND t.type = 'return'
      ORDER BY t.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      summary: {
        totalInvested,
        totalReturns,
        pendingReturns,
        roi: Math.round(roi * 10) / 10,
      },
      history: history.map(h => ({
        id: h.id,
        amount: h.amount,
        description: h.description,
        campaignTitle: h.campaign_title,
        createdAt: h.created_at,
      })),
    });
  } catch (error) {
    console.error("Get returns error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}
