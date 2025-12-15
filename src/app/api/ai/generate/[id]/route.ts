import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get single generation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

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

    const g = generation[0];
    return NextResponse.json({
      success: true,
      generation: {
        id: g.id,
        projectId: g.project_id,
        generationType: g.generation_type,
        modelId: g.model_id,
        modelProvider: g.model_provider,
        prompt: g.prompt,
        inputParams: g.input_params,
        resultText: g.result_text,
        resultUrl: g.result_url,
        resultDriveId: g.result_drive_id,
        resultMetadata: g.result_metadata,
        creditCost: g.credit_cost,
        tokenInput: g.token_input,
        tokenOutput: g.token_output,
        status: g.status,
        isAccepted: g.is_accepted,
        errorMessage: g.error_message,
        startedAt: g.started_at,
        completedAt: g.completed_at,
        createdAt: g.created_at,
      },
    });
  } catch (error: any) {
    console.error("Get generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get generation" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete generation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // SOFT DELETE
    const deleted = await sql`
      UPDATE ai_generation_logs 
      SET deleted_at = NOW()
      WHERE id = ${generationId} AND user_id = ${userId} AND deleted_at IS NULL
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: "Generation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Generation deleted",
    });
  } catch (error: any) {
    console.error("Delete generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete generation" },
      { status: 500 }
    );
  }
}
