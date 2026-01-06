import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/stories - List all story versions
// POST /api/creator/projects/[id]/stories - Create new story version

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;

        // Get all story versions for this project (not deleted)
        const versions = await sql`
      SELECT 
        sv.id,
        sv.story_id,
        sv.version_number,
        sv.version_name,
        sv.is_active,
        sv.structure,
        sv.premise,
        sv.created_at,
        sv.updated_at
      FROM story_versions sv
      WHERE sv.project_id = ${projectId}
        AND sv.deleted_at IS NULL
      ORDER BY sv.created_at DESC
    `;

        // Get the active version's full data
        const activeVersion = await sql`
      SELECT * FROM story_versions
      WHERE project_id = ${projectId}
        AND is_active = TRUE
        AND deleted_at IS NULL
      LIMIT 1
    `;

        return NextResponse.json({
            versions: versions.map(v => ({
                id: v.id,
                storyId: v.story_id,
                versionNumber: v.version_number,
                versionName: v.version_name,
                isActive: v.is_active,
                structure: v.structure,
                premise: v.premise?.substring(0, 100) + (v.premise?.length > 100 ? '...' : ''),
                createdAt: v.created_at,
                updatedAt: v.updated_at,
            })),
            activeVersion: activeVersion[0] ? mapVersionToStory(activeVersion[0]) : null,
        });
    } catch (error) {
        console.error("Error fetching story versions:", error);
        return NextResponse.json(
            { error: "Failed to fetch story versions" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const body = await request.json();

        const {
            name, // Optional custom name
            structure = "Save the Cat",
            copyFromVersionId, // Optional: copy data from existing version
            isDuplicate = false // If true, copy all data including beats
        } = body;

        // Get story_id for this project
        const storyResult = await sql`
      SELECT id FROM stories WHERE project_id = ${projectId} AND deleted_at IS NULL LIMIT 1
    `;

        if (storyResult.length === 0) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        const storyId = storyResult[0].id;

        // Get next version number for this structure
        const versionCountResult = await sql`
      SELECT COUNT(*) as count FROM story_versions 
      WHERE story_id = ${storyId} 
        AND structure = ${structure}
        AND deleted_at IS NULL
    `;
        const nextVersionNumber = parseInt(versionCountResult[0].count) + 1;

        // Auto-generate version name
        const versionName = name || `${structure} v${nextVersionNumber}`;

        // Prepare data - either copy from existing or start fresh
        let versionData = {
            premise: null,
            synopsis: null,
            global_synopsis: null,
            genre: null,
            sub_genre: null,
            format: null,
            duration: null,
            tone: null,
            theme: null,
            conflict: null,
            target_audience: null,
            ending_type: null,
            cat_beats: '{}',
            hero_beats: '{}',
            harmon_beats: '{}',
            tension_levels: '{}',
            want_need_matrix: '{}',
            beat_characters: '{}',
        };

        if (copyFromVersionId) {
            const sourceVersion = await sql`
        SELECT * FROM story_versions WHERE id = ${copyFromVersionId} AND deleted_at IS NULL
      `;

            if (sourceVersion.length > 0) {
                const source = sourceVersion[0];
                if (isDuplicate) {
                    // Copy everything (duplicate)
                    versionData = {
                        premise: source.premise,
                        synopsis: source.synopsis,
                        global_synopsis: source.global_synopsis,
                        genre: source.genre,
                        sub_genre: source.sub_genre,
                        format: source.format,
                        duration: source.duration,
                        tone: source.tone,
                        theme: source.theme,
                        conflict: source.conflict,
                        target_audience: source.target_audience,
                        ending_type: source.ending_type,
                        cat_beats: JSON.stringify(source.cat_beats || {}),
                        hero_beats: JSON.stringify(source.hero_beats || {}),
                        harmon_beats: JSON.stringify(source.harmon_beats || {}),
                        tension_levels: JSON.stringify(source.tension_levels || {}),
                        want_need_matrix: JSON.stringify(source.want_need_matrix || {}),
                        beat_characters: JSON.stringify(source.beat_characters || {}),
                    };
                } else {
                    // Only copy premise for new structure
                    versionData.premise = source.premise;
                    versionData.genre = source.genre;
                    versionData.tone = source.tone;
                    versionData.theme = source.theme;
                    versionData.conflict = source.conflict;
                }
            }
        }

        // Deactivate all other versions for this story
        await sql`
      UPDATE story_versions 
      SET is_active = FALSE, updated_at = NOW()
      WHERE story_id = ${storyId} AND deleted_at IS NULL
    `;

        // Create new version
        const newVersion = await sql`
      INSERT INTO story_versions (
        story_id, project_id, version_number, version_name, is_active, structure,
        premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
        tone, theme, conflict, target_audience, ending_type,
        cat_beats, hero_beats, harmon_beats, tension_levels, want_need_matrix, beat_characters,
        created_by
      ) VALUES (
        ${storyId}, ${projectId}, ${nextVersionNumber}, ${versionName}, TRUE, ${structure},
        ${versionData.premise}, ${versionData.synopsis}, ${versionData.global_synopsis},
        ${versionData.genre}, ${versionData.sub_genre}, ${versionData.format}, ${versionData.duration},
        ${versionData.tone}, ${versionData.theme}, ${versionData.conflict},
        ${versionData.target_audience}, ${versionData.ending_type},
        ${versionData.cat_beats}::jsonb, ${versionData.hero_beats}::jsonb, ${versionData.harmon_beats}::jsonb,
        ${versionData.tension_levels}::jsonb, ${versionData.want_need_matrix}::jsonb, ${versionData.beat_characters}::jsonb,
        NULL
      )
      RETURNING *
    `;

        return NextResponse.json({
            success: true,
            version: mapVersionToStory(newVersion[0]),
        });
    } catch (error) {
        console.error("Error creating story version:", error);
        return NextResponse.json(
            { error: "Failed to create story version" },
            { status: 500 }
        );
    }
}

// Helper to map database row to story object
function mapVersionToStory(row: any) {
    return {
        id: row.id,
        storyId: row.story_id,
        versionNumber: row.version_number,
        versionName: row.version_name,
        isActive: row.is_active,
        structure: row.structure || 'Save the Cat',
        premise: row.premise,
        synopsis: row.synopsis,
        globalSynopsis: row.global_synopsis,
        genre: row.genre,
        subGenre: row.sub_genre,
        format: row.format,
        duration: row.duration,
        tone: row.tone,
        theme: row.theme,
        conflict: row.conflict,
        targetAudience: row.target_audience,
        endingType: row.ending_type,
        catBeats: row.cat_beats || {},
        heroBeats: row.hero_beats || {},
        harmonBeats: row.harmon_beats || {},
        tensionLevels: row.tension_levels || {},
        wantNeedMatrix: row.want_need_matrix || {},
        beatCharacters: row.beat_characters || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
