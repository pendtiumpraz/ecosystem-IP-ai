import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// POST /api/creator/projects/[id]/moodboard/restore
// Restore a soft-deleted moodboard

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const body = await request.json();

        const { moodboardId } = body;

        if (!moodboardId) {
            return NextResponse.json(
                { error: "moodboardId is required" },
                { status: 400 }
            );
        }

        // Check if moodboard exists and is deleted
        const existing = await sql`
      SELECT * FROM moodboards
      WHERE id = ${moodboardId}
        AND project_id = ${projectId}
        AND deleted_at IS NOT NULL
    `;

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Deleted moodboard not found" },
                { status: 404 }
            );
        }

        // Restore moodboard (clear deleted_at)
        const restored = await sql`
      UPDATE moodboards
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${moodboardId}
      RETURNING *
    `;

        return NextResponse.json({
            moodboard: {
                id: restored[0].id,
                storyVersionId: restored[0].story_version_id,
                artStyle: restored[0].art_style,
                keyActionCount: restored[0].key_action_count,
            },
            message: "Moodboard restored successfully",
        });
    } catch (error) {
        console.error("Error restoring moodboard:", error);
        return NextResponse.json(
            { error: "Failed to restore moodboard" },
            { status: 500 }
        );
    }
}
