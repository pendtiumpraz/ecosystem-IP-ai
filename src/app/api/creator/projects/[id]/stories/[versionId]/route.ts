import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/stories/[versionId] - Get single version
// PATCH /api/creator/projects/[id]/stories/[versionId] - Update version
// DELETE /api/creator/projects/[id]/stories/[versionId] - Soft delete version

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { versionId } = await params;

        const version = await sql`
      SELECT * FROM story_versions
      WHERE id = ${versionId} AND deleted_at IS NULL
    `;

        if (version.length === 0) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        return NextResponse.json({
            version: mapVersionToStory(version[0]),
        });
    } catch (error) {
        console.error("Error fetching story version:", error);
        return NextResponse.json(
            { error: "Failed to fetch story version" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { versionId } = await params;
        const body = await request.json();

        // Debug logging
        console.log('[PATCH story version] versionId:', versionId);
        console.log('[PATCH story version] body keys:', Object.keys(body));
        if (body.catBeats) {
            console.log('[PATCH story version] catBeats count:', Object.keys(body.catBeats).length);
        }

        // Handle restore (from soft delete)
        if (body.restore === true) {
            const deleted = await sql`
              SELECT id, story_id FROM story_versions 
              WHERE id = ${versionId} AND deleted_at IS NOT NULL
            `;

            if (deleted.length === 0) {
                return NextResponse.json({ error: "Deleted version not found" }, { status: 404 });
            }

            // Restore the version
            await sql`
              UPDATE story_versions 
              SET deleted_at = NULL, updated_at = NOW()
              WHERE id = ${versionId}
            `;

            const restored = await sql`SELECT * FROM story_versions WHERE id = ${versionId}`;
            return NextResponse.json({
                success: true,
                message: "Story version restored",
                version: mapVersionToStory(restored[0]),
            });
        }

        // Check if version exists (not deleted)
        const existing = await sql`
          SELECT id, story_id FROM story_versions 
          WHERE id = ${versionId} AND deleted_at IS NULL
        `;

        if (existing.length === 0) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        // Handle activation (switching to this version)
        if (body.activate === true) {
            const storyId = existing[0].story_id;

            // Deactivate all other versions
            await sql`
        UPDATE story_versions 
        SET is_active = FALSE, updated_at = NOW()
        WHERE story_id = ${storyId} AND deleted_at IS NULL
      `;

            // Activate this version
            await sql`
        UPDATE story_versions 
        SET is_active = TRUE, updated_at = NOW()
        WHERE id = ${versionId}
      `;

            const updated = await sql`SELECT * FROM story_versions WHERE id = ${versionId}`;
            return NextResponse.json({
                success: true,
                version: mapVersionToStory(updated[0]),
            });
        }

        // Prepare update fields
        const updates: string[] = [];
        const values: any = {};

        const fieldMappings: Record<string, string> = {
            versionName: 'version_name',
            premise: 'premise',
            synopsis: 'synopsis',
            globalSynopsis: 'global_synopsis',
            genre: 'genre',
            subGenre: 'sub_genre',
            format: 'format',
            duration: 'duration',
            tone: 'tone',
            theme: 'theme',
            conflict: 'conflict',
            targetAudience: 'target_audience',
            endingType: 'ending_type',
            structure: 'structure',
        };

        const jsonFields = ['catBeats', 'heroBeats', 'harmonBeats', 'tensionLevels', 'wantNeedMatrix', 'beatCharacters'];
        const jsonFieldMappings: Record<string, string> = {
            catBeats: 'cat_beats',
            heroBeats: 'hero_beats',
            harmonBeats: 'harmon_beats',
            tensionLevels: 'tension_levels',
            wantNeedMatrix: 'want_need_matrix',
            beatCharacters: 'beat_characters',
        };

        // Build dynamic update
        let updateQuery = `UPDATE story_versions SET updated_at = NOW()`;

        for (const [jsField, dbField] of Object.entries(fieldMappings)) {
            if (body[jsField] !== undefined) {
                updateQuery += `, ${dbField} = $${jsField}`;
                values[jsField] = body[jsField];
            }
        }

        for (const jsField of jsonFields) {
            if (body[jsField] !== undefined) {
                const dbField = jsonFieldMappings[jsField];
                updateQuery += `, ${dbField} = $${jsField}::jsonb`;
                values[jsField] = JSON.stringify(body[jsField]);
            }
        }

        updateQuery += ` WHERE id = $versionId RETURNING *`;
        values.versionId = versionId;

        // Execute update using template literal approach
        const updated = await sql`
      UPDATE story_versions SET 
        updated_at = NOW(),
        version_name = COALESCE(${body.versionName}, version_name),
        premise = COALESCE(${body.premise}, premise),
        synopsis = COALESCE(${body.synopsis}, synopsis),
        global_synopsis = COALESCE(${body.globalSynopsis}, global_synopsis),
        genre = COALESCE(${body.genre}, genre),
        sub_genre = COALESCE(${body.subGenre}, sub_genre),
        format = COALESCE(${body.format}, format),
        duration = COALESCE(${body.duration}, duration),
        tone = COALESCE(${body.tone}, tone),
        theme = COALESCE(${body.theme}, theme),
        conflict = COALESCE(${body.conflict}, conflict),
        target_audience = COALESCE(${body.targetAudience}, target_audience),
        ending_type = COALESCE(${body.endingType}, ending_type),
        structure = COALESCE(${body.structure}, structure),
        cat_beats = COALESCE(${body.catBeats ? JSON.stringify(body.catBeats) : null}::jsonb, cat_beats),
        hero_beats = COALESCE(${body.heroBeats ? JSON.stringify(body.heroBeats) : null}::jsonb, hero_beats),
        harmon_beats = COALESCE(${body.harmonBeats ? JSON.stringify(body.harmonBeats) : null}::jsonb, harmon_beats),
        tension_levels = COALESCE(${body.tensionLevels ? JSON.stringify(body.tensionLevels) : null}::jsonb, tension_levels),
        want_need_matrix = COALESCE(${body.wantNeedMatrix ? JSON.stringify(body.wantNeedMatrix) : null}::jsonb, want_need_matrix),
        beat_characters = COALESCE(${body.beatCharacters ? JSON.stringify(body.beatCharacters) : null}::jsonb, beat_characters)
      WHERE id = ${versionId}
      RETURNING *
    `;

        // Update character_ids separately if provided (handles uuid[] properly)
        if (body.characterIds !== undefined) {
            await sql`
              UPDATE story_versions 
              SET character_ids = ${body.characterIds}
              WHERE id = ${versionId}
            `;
        }

        // Fetch final state
        const final = await sql`SELECT * FROM story_versions WHERE id = ${versionId}`;

        return NextResponse.json({
            success: true,
            version: mapVersionToStory(final[0]),
        });
    } catch (error) {
        console.error("Error updating story version:", error);
        return NextResponse.json(
            { error: "Failed to update story version" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, versionId } = await params;

        // Check if version exists and get story_id
        const existing = await sql`
      SELECT id, story_id, is_active FROM story_versions 
      WHERE id = ${versionId} AND deleted_at IS NULL
    `;

        if (existing.length === 0) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        const storyId = existing[0].story_id;
        const wasActive = existing[0].is_active;

        // Soft delete the version
        await sql`
      UPDATE story_versions 
      SET deleted_at = NOW(), is_active = FALSE
      WHERE id = ${versionId}
    `;

        // If deleted version was active, activate the most recent remaining version
        if (wasActive) {
            await sql`
        UPDATE story_versions 
        SET is_active = TRUE
        WHERE id = (
          SELECT id FROM story_versions 
          WHERE story_id = ${storyId} AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        )
      `;
        }

        // Get the new active version
        const newActive = await sql`
      SELECT * FROM story_versions
      WHERE story_id = ${storyId} AND is_active = TRUE AND deleted_at IS NULL
      LIMIT 1
    `;

        return NextResponse.json({
            success: true,
            message: "Story version deleted",
            newActiveVersion: newActive.length > 0 ? mapVersionToStory(newActive[0]) : null,
        });
    } catch (error) {
        console.error("Error deleting story version:", error);
        return NextResponse.json(
            { error: "Failed to delete story version" },
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
