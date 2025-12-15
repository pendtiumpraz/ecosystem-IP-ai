import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List active campaigns (public, no auth required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const limit = parseInt(searchParams.get("limit") || "20");

    let campaigns;
    if (status === "all") {
      campaigns = await sql`
        SELECT 
          c.*, 
          p.title as project_title, 
          p.thumbnail_url as project_thumbnail,
          p.genre,
          p.description as project_description,
          u.full_name as creator_name
        FROM campaigns c
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE c.deleted_at IS NULL AND c.status IN ('active', 'funded')
        ORDER BY c.investor_count DESC, c.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      campaigns = await sql`
        SELECT 
          c.*, 
          p.title as project_title, 
          p.thumbnail_url as project_thumbnail,
          p.genre,
          p.description as project_description,
          u.full_name as creator_name
        FROM campaigns c
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE c.deleted_at IS NULL AND c.status = ${status}
        ORDER BY c.investor_count DESC, c.created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(c => ({
        id: c.id,
        projectId: c.project_id,
        title: c.project_title || c.title,
        description: c.description || c.project_description,
        thumbnail: c.thumbnail_url || c.project_thumbnail,
        genre: c.genre || "IP Project",
        fundingGoal: Number(c.funding_goal || c.goal_amount || 0),
        fundingRaised: Number(c.funding_raised || c.raised_amount || 0),
        investorCount: Number(c.investor_count || c.backer_count || 0),
        minInvestment: Number(c.min_investment || 1000000),
        status: c.status,
        startDate: c.start_date,
        endDate: c.end_date,
        creatorName: c.creator_name,
      })),
    });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
