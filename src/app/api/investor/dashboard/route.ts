import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Get user's investments
    const investments = await sql`
      SELECT 
        i.*,
        c.title as campaign_title,
        c.thumbnail_url as campaign_thumbnail,
        c.funding_goal,
        c.funding_raised,
        c.status as campaign_status,
        p.title as project_title,
        p.genre
      FROM investments i
      LEFT JOIN campaigns c ON i.campaign_id = c.id
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE i.user_id = ${userId} AND i.deleted_at IS NULL
      ORDER BY i.created_at DESC
    `;

    // Calculate totals
    const totalInvested = investments.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
    
    // Get featured/active campaigns (for discover section)
    const featuredCampaigns = await sql`
      SELECT 
        c.*,
        p.title as project_title,
        p.genre,
        p.thumbnail_url as project_thumbnail
      FROM campaigns c
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.status = 'active' AND c.deleted_at IS NULL
      ORDER BY c.funding_raised DESC
      LIMIT 5
    `;

    // Get investment stats
    const investmentCount = investments.length;
    const activeCampaigns = investments.filter((i: any) => i.campaign_status === "active").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalInvested,
        currentValue: totalInvested, // TODO: Calculate with returns
        totalReturns: 0, // TODO: Calculate actual returns
        activeInvestments: activeCampaigns,
        totalInvestments: investmentCount,
      },
      investments: investments.map((i: any) => ({
        id: i.id,
        campaignId: i.campaign_id,
        campaignTitle: i.campaign_title || i.project_title,
        campaignThumbnail: i.campaign_thumbnail || i.project_thumbnail,
        genre: i.genre,
        investedAmount: Number(i.amount),
        tierId: i.tier_id,
        status: i.status,
        campaignStatus: i.campaign_status,
        createdAt: i.created_at,
      })),
      featuredCampaigns: featuredCampaigns.map((c: any) => ({
        id: c.id,
        projectId: c.project_id,
        title: c.project_title || c.title,
        thumbnail: c.project_thumbnail || c.thumbnail_url,
        genre: c.genre,
        fundingGoal: Number(c.funding_goal),
        fundingRaised: Number(c.funding_raised),
        investorCount: Number(c.investor_count || 0),
        status: c.status,
        startDate: c.start_date,
        endDate: c.end_date,
      })),
    });
  } catch (error) {
    console.error("Investor dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
