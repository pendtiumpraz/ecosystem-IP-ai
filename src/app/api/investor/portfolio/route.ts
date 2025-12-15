import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get user's investment portfolio
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    let investments;
    if (status && status !== "all") {
      investments = await sql`
        SELECT 
          i.*,
          c.title as campaign_title,
          c.thumbnail_url as campaign_thumbnail,
          c.funding_goal,
          c.funding_raised,
          c.status as campaign_status,
          c.end_date,
          p.title as project_title,
          p.genre,
          p.thumbnail_url as project_thumbnail,
          t.name as tier_name,
          t.min_amount as tier_min,
          t.rewards as tier_rewards
        FROM investments i
        LEFT JOIN campaigns c ON i.campaign_id = c.id
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN investment_tiers t ON i.tier_id = t.id
        WHERE i.user_id = ${userId} AND i.status = ${status} AND i.deleted_at IS NULL
        ORDER BY i.created_at DESC
      `;
    } else {
      investments = await sql`
        SELECT 
          i.*,
          c.title as campaign_title,
          c.thumbnail_url as campaign_thumbnail,
          c.funding_goal,
          c.funding_raised,
          c.status as campaign_status,
          c.end_date,
          p.title as project_title,
          p.genre,
          p.thumbnail_url as project_thumbnail,
          t.name as tier_name,
          t.min_amount as tier_min,
          t.rewards as tier_rewards
        FROM investments i
        LEFT JOIN campaigns c ON i.campaign_id = c.id
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN investment_tiers t ON i.tier_id = t.id
        WHERE i.user_id = ${userId} AND i.deleted_at IS NULL
        ORDER BY i.created_at DESC
      `;
    }

    return NextResponse.json({
      success: true,
      investments: investments.map((i: any) => ({
        id: i.id,
        campaignId: i.campaign_id,
        campaignTitle: i.campaign_title || i.project_title,
        campaignThumbnail: i.campaign_thumbnail || i.project_thumbnail,
        projectTitle: i.project_title,
        genre: i.genre,
        investedAmount: Number(i.amount),
        tierName: i.tier_name,
        tierRewards: i.tier_rewards,
        status: i.status,
        campaignStatus: i.campaign_status,
        fundingGoal: Number(i.funding_goal),
        fundingRaised: Number(i.funding_raised),
        endDate: i.end_date,
        createdAt: i.created_at,
      })),
      total: investments.length,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// POST - Make a new investment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, campaignId, tierId, amount, paymentMethod } = body;

    if (!userId || !campaignId || !amount) {
      return NextResponse.json(
        { success: false, error: "userId, campaignId, and amount required" },
        { status: 400 }
      );
    }

    // Check campaign is active
    const campaign = await sql`
      SELECT * FROM campaigns WHERE id = ${campaignId} AND status = 'active' AND deleted_at IS NULL
    `;

    if (campaign.length === 0) {
      return NextResponse.json(
        { success: false, error: "Campaign not found or not active" },
        { status: 404 }
      );
    }

    // Create investment
    const investment = await sql`
      INSERT INTO investments (user_id, campaign_id, tier_id, amount, payment_method, status)
      VALUES (${userId}, ${campaignId}, ${tierId || null}, ${amount}, ${paymentMethod || "transfer"}, 'pending')
      RETURNING *
    `;

    // Update campaign funding raised
    await sql`
      UPDATE campaigns 
      SET funding_raised = funding_raised + ${amount},
          investor_count = investor_count + 1
      WHERE id = ${campaignId}
    `;

    return NextResponse.json({
      success: true,
      investment: {
        id: investment[0].id,
        campaignId: investment[0].campaign_id,
        amount: investment[0].amount,
        status: investment[0].status,
        createdAt: investment[0].created_at,
      },
    });
  } catch (error) {
    console.error("Create investment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create investment" },
      { status: 500 }
    );
  }
}
