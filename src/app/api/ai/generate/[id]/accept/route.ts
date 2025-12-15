import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Accept/use a specific generation version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const body = await request.json();
    const { userId, projectId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Get the generation to find its type
    const generation = await sql`
      SELECT * FROM ai_generation_logs 
      WHERE id = ${generationId} AND user_id = ${userId} AND deleted_at IS NULL
    `;

    if (generation.length === 0) {
      return NextResponse.json(
        { success: false, error: "Generation not found" },
        { status: 404 }
      );
    }

    const genType = generation[0].generation_type;
    const genProjectId = generation[0].project_id;

    // Unset any previously accepted generation of the same type for this project
    await sql`
      UPDATE ai_generation_logs 
      SET is_accepted = FALSE 
      WHERE user_id = ${userId} 
        AND project_id = ${genProjectId}
        AND generation_type = ${genType}
        AND is_accepted = TRUE
        AND deleted_at IS NULL
    `;

    // Set this generation as accepted
    await sql`
      UPDATE ai_generation_logs 
      SET is_accepted = TRUE 
      WHERE id = ${generationId}
    `;

    return NextResponse.json({
      success: true,
      message: "Generation accepted",
      generationId,
    });
  } catch (error: any) {
    console.error("Accept generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to accept generation" },
      { status: 500 }
    );
  }
}
