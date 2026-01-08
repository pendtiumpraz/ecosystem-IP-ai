import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// POST /api/creator/projects/[id]/moodboard/clear
// Clear moodboard content (prompts, images, or all)

interface ClearRequest {
  moodboardId: string;
  type: "descriptions" | "prompts" | "images" | "all";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id: projectId } = await params;
    const body: ClearRequest = await request.json();

    const { moodboardId, type } = body;

    if (!moodboardId || !type) {
      return NextResponse.json(
        { error: "moodboardId and type are required" },
        { status: 400 }
      );
    }

    // Verify moodboard belongs to this project
    const moodboard = await sql`
      SELECT * FROM moodboards
      WHERE id = ${moodboardId}
        AND project_id = ${projectId}
        AND deleted_at IS NULL
    `;

    if (moodboard.length === 0) {
      return NextResponse.json(
        { error: "Moodboard not found" },
        { status: 404 }
      );
    }

    let clearedCount = 0;

    switch (type) {
      case "descriptions":
        // Clear key action descriptions
        const descResult = await sql`
          UPDATE moodboard_items
          SET 
            key_action_description = NULL,
            characters_involved = NULL,
            universe_level = NULL,
            prompt = NULL,
            negative_prompt = NULL,
            image_url = NULL,
            video_prompt = NULL,
            video_url = NULL,
            previous_image_url = NULL,
            edit_count = 0,
            status = 'empty',
            updated_at = NOW()
          WHERE moodboard_id = ${moodboardId}
        `;
        clearedCount = descResult.length || 0;
        break;

      case "prompts":
        // Clear prompts (keep descriptions)
        const promptResult = await sql`
          UPDATE moodboard_items
          SET 
            prompt = NULL,
            negative_prompt = NULL,
            image_url = NULL,
            video_prompt = NULL,
            video_url = NULL,
            previous_image_url = NULL,
            status = CASE 
              WHEN key_action_description IS NOT NULL THEN 'has_description'
              ELSE 'empty'
            END,
            updated_at = NOW()
          WHERE moodboard_id = ${moodboardId}
        `;
        clearedCount = promptResult.length || 0;
        break;

      case "images":
        // Clear images only (keep prompts)
        const imageResult = await sql`
          UPDATE moodboard_items
          SET 
            image_url = NULL,
            video_url = NULL,
            previous_image_url = NULL,
            status = CASE 
              WHEN prompt IS NOT NULL THEN 'has_prompt'
              WHEN key_action_description IS NOT NULL THEN 'has_description'
              ELSE 'empty'
            END,
            updated_at = NOW()
          WHERE moodboard_id = ${moodboardId}
        `;
        clearedCount = imageResult.length || 0;
        break;

      case "all":
        // Clear everything
        const allResult = await sql`
          UPDATE moodboard_items
          SET 
            key_action_description = NULL,
            characters_involved = NULL,
            universe_level = NULL,
            prompt = NULL,
            negative_prompt = NULL,
            image_url = NULL,
            video_prompt = NULL,
            video_url = NULL,
            previous_image_url = NULL,
            edit_count = 0,
            status = 'empty',
            updated_at = NOW()
          WHERE moodboard_id = ${moodboardId}
        `;
        clearedCount = allResult.length || 0;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type. Use descriptions, prompts, images, or all" },
          { status: 400 }
        );
    }

    // Update moodboard timestamp
    await sql`
      UPDATE moodboards
      SET updated_at = NOW()
      WHERE id = ${moodboardId}
    `;

    return NextResponse.json({
      success: true,
      type,
      clearedCount,
      message: `Cleared ${type} from moodboard`,
    });
  } catch (error) {
    console.error("Error clearing moodboard content:", error);
    return NextResponse.json(
      { error: "Failed to clear moodboard content" },
      { status: 500 }
    );
  }
}
