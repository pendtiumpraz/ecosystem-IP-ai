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

    // Get user's projects count (exclude soft deleted)
    const projectsCount = await sql`
      SELECT COUNT(*) as count FROM projects WHERE user_id = ${userId} AND deleted_at IS NULL
    `;

    // Get user's credit balance (exclude soft deleted)
    const userCredits = await sql`
      SELECT credit_balance FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;

    // Get recent projects (exclude soft deleted)
    const recentProjects = await sql`
      SELECT id, title, description, thumbnail_url, genre, status, created_at, updated_at
      FROM projects 
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    // Get AI generation stats (exclude soft deleted)
    const generationStats = await sql`
      SELECT 
        COUNT(*) as total_generations,
        COALESCE(SUM(credit_cost), 0) as total_credits_used
      FROM ai_generation_logs 
      WHERE user_id = ${userId} AND deleted_at IS NULL
    `;

    // Get generation by type (exclude soft deleted)
    const generationsByType = await sql`
      SELECT generation_type, COUNT(*) as count
      FROM ai_generation_logs 
      WHERE user_id = ${userId} AND deleted_at IS NULL
      GROUP BY generation_type
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: Number(projectsCount[0]?.count || 0),
        creditBalance: Number(userCredits[0]?.credit_balance || 0),
        totalGenerations: Number(generationStats[0]?.total_generations || 0),
        creditsUsed: Number(generationStats[0]?.total_credits_used || 0),
      },
      recentProjects: recentProjects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        thumbnailUrl: p.thumbnail_url,
        genre: p.genre,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      generationsByType: generationsByType.reduce((acc: Record<string, number>, g: any) => {
        if (g.generation_type) acc[g.generation_type] = Number(g.count);
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Creator dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
