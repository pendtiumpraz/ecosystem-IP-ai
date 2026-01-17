import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/moodboard/versions
// Returns all moodboard versions for a project (across all story versions)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;

        // Get all moodboard versions for this project
        const versions = await sql`
            SELECT 
                m.id,
                m.version_number,
                m.version_name,
                m.art_style,
                m.story_version_id,
                m.is_active,
                m.created_at,
                sv.version_name as story_version_name,
                (SELECT COUNT(*) FROM moodboard_items WHERE moodboard_id = m.id) as item_count,
                (SELECT COUNT(*) FROM moodboard_items WHERE moodboard_id = m.id AND image_url IS NOT NULL) as image_count
            FROM moodboards m
            JOIN story_versions sv ON m.story_version_id = sv.id
            WHERE m.project_id = ${projectId}
              AND m.deleted_at IS NULL
            ORDER BY m.is_active DESC, m.created_at DESC
        `;

        if (versions.length === 0) {
            return NextResponse.json({ versions: [] });
        }

        return NextResponse.json({
            versions: versions.map((v: any) => ({
                id: v.id,
                versionNumber: v.version_number,
                versionName: v.version_name || `v${v.version_number}`,
                artStyle: v.art_style,
                storyVersionId: v.story_version_id,
                storyVersionName: v.story_version_name,
                isActive: v.is_active,
                itemCount: v.item_count,
                imageCount: v.image_count,
                createdAt: v.created_at,
            })),
        });
    } catch (error) {
        console.error("Error fetching moodboard versions:", error);
        return NextResponse.json(
            { error: "Failed to fetch moodboard versions" },
            { status: 500 }
        );
    }
}
