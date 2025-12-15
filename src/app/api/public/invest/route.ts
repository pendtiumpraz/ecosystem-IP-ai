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
        SELECT c.*, p.title as project_title, p.thumbnail_url as project_thumbnail
        FROM campaigns c
        LEFT JOIN projects p ON c.project_id = p.id
        WHERE c.status IN ('active', 'funded')
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      campaigns = await sql`
        SELECT c.*, p.title as project_title, p.thumbnail_url as project_thumbnail
        FROM campaigns c
        LEFT JOIN projects p ON c.project_id = p.id
        WHERE c.status = ${status}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(c => ({
        id: c.id,
        projectId: c.project_id,
        title: c.title,
        description: c.description,
        posterUrl: c.poster_url || c.project_thumbnail,
        goalAmount: Number(c.goal_amount),
        raisedAmount: Number(c.raised_amount),
        backerCount: c.backer_count,
        status: c.status,
        startDate: c.start_date,
        endDate: c.end_date,
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
