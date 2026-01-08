import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/moodboard/prerequisites?storyVersionId=xxx
// Check if prerequisites are met for moodboard creation

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const storyVersionId = searchParams.get("storyVersionId");

        if (!storyVersionId) {
            return NextResponse.json(
                { error: "storyVersionId is required" },
                { status: 400 }
            );
        }

        // Get project and universe data
        const projects = await sql`
      SELECT id, title, universe FROM projects WHERE id = ${projectId}
    `;

        if (projects.length === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const project = projects[0];

        // Get story version data
        const storyVersions = await sql`
      SELECT 
        id, 
        version_name,
        structure, 
        structure_type, 
        character_ids,
        premise
      FROM story_versions 
      WHERE id = ${storyVersionId}
        AND project_id = ${projectId}
        AND deleted_at IS NULL
    `;

        if (storyVersions.length === 0) {
            return NextResponse.json(
                { error: "Story version not found" },
                { status: 404 }
            );
        }

        const storyVersion = storyVersions[0];

        // Check universe
        const hasUniverse = project.universe &&
            typeof project.universe === 'object' &&
            Object.keys(project.universe).length > 0;

        // Check story beats
        const structure = storyVersion.structure;
        const hasStoryBeats = structure &&
            typeof structure === 'object' &&
            Object.values(structure).some((v: any) => v && v.length > 0);

        // Count filled beats
        const filledBeats = structure ?
            Object.values(structure).filter((v: any) => v && v.length > 0).length : 0;

        // Check characters
        const characterIds = storyVersion.character_ids || [];
        const hasCharacters = characterIds.length > 0;

        // Get character details if linked
        let characters: any[] = [];
        if (hasCharacters) {
            characters = await sql`
        SELECT id, name, role, image_url
        FROM characters
        WHERE id = ANY(${characterIds}::text[])
          AND deleted_at IS NULL
      `;
        }

        // Check if moodboard already exists
        const existingMoodboard = await sql`
      SELECT id, art_style, key_action_count, created_at
      FROM moodboards
      WHERE story_version_id = ${storyVersionId}
        AND deleted_at IS NULL
    `;

        const hasMoodboard = existingMoodboard.length > 0;

        // Get moodboard stats if exists
        let moodboardStats = null;
        if (hasMoodboard) {
            const stats = await sql`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status = 'empty' THEN 1 END) as empty_count,
          COUNT(CASE WHEN status = 'has_description' THEN 1 END) as description_count,
          COUNT(CASE WHEN status = 'has_prompt' THEN 1 END) as prompt_count,
          COUNT(CASE WHEN status = 'has_image' THEN 1 END) as image_count,
          COUNT(CASE WHEN status = 'has_video' THEN 1 END) as video_count
        FROM moodboard_items
        WHERE moodboard_id = ${existingMoodboard[0].id}
      `;

            moodboardStats = {
                id: existingMoodboard[0].id,
                artStyle: existingMoodboard[0].art_style,
                keyActionCount: existingMoodboard[0].key_action_count,
                createdAt: existingMoodboard[0].created_at,
                totalItems: parseInt(stats[0].total_items),
                emptyCount: parseInt(stats[0].empty_count),
                descriptionCount: parseInt(stats[0].description_count),
                promptCount: parseInt(stats[0].prompt_count),
                imageCount: parseInt(stats[0].image_count),
                videoCount: parseInt(stats[0].video_count),
            };
        }

        // Determine structure type and beat count
        const structureType = storyVersion.structure_type || "harmon";
        const beatCounts: Record<string, number> = {
            harmon: 8,
            savethecat: 15,
            save_the_cat: 15,
            herosjourney: 12,
            heros_journey: 12,
        };
        const totalBeats = beatCounts[structureType] || 8;

        return NextResponse.json({
            prerequisites: {
                hasUniverse,
                hasStoryBeats,
                hasCharacters,
                canCreate: hasStoryBeats, // Only story beats are required
            },
            project: {
                id: project.id,
                title: project.title,
            },
            storyVersion: {
                id: storyVersion.id,
                name: storyVersion.version_name,
                structureType,
                totalBeats,
                filledBeats,
                premise: storyVersion.premise?.substring(0, 100),
            },
            characters: characters.map(c => ({
                id: c.id,
                name: c.name,
                role: c.role,
                imageUrl: c.image_url,
            })),
            moodboard: hasMoodboard ? moodboardStats : null,
            recommendations: {
                addUniverse: !hasUniverse ? "Add universe formula for better location context" : null,
                addCharacters: !hasCharacters ? "Link characters for better visual prompts" : null,
                fillBeats: filledBeats < totalBeats ? `Fill remaining ${totalBeats - filledBeats} story beats` : null,
            },
        });
    } catch (error) {
        console.error("Error checking moodboard prerequisites:", error);
        return NextResponse.json(
            { error: "Failed to check prerequisites" },
            { status: 500 }
        );
    }
}
