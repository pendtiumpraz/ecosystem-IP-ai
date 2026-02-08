import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { UpdateScenePlotRequest } from '@/types/storyboard';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/scene-plots/[id] - Get single scene plot with all versions
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

        const scenes = await sql`SELECT * FROM scene_plots WHERE id = ${id}::uuid`;

        if (scenes.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        const scene = scenes[0];

        // Get shots
        const shots = await sql`
      SELECT * FROM scene_shots
      WHERE scene_id = ${id}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY shot_number ASC
    `;

        // Get image versions
        const imageVersions = await sql`
      SELECT * FROM scene_image_versions
      WHERE scene_id = ${id}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY version_number DESC
    `;

        // Get script versions
        const scriptVersions = await sql`
      SELECT * FROM scene_script_versions
      WHERE scene_id = ${id}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY version_number DESC
    `;

        // Get clips
        const clips = await sql`
      SELECT * FROM scene_clips
      WHERE scene_id = ${id}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY version_number DESC
    `;

        return NextResponse.json({
            scene: {
                ...scene,
                shots,
                image_versions: imageVersions,
                script_versions: scriptVersions,
                clips,
                active_image_version: imageVersions.find(v => v.is_active) || null,
                active_script_version: scriptVersions.find(v => v.is_active) || null,
                active_clip: clips.find(v => v.is_active) || null
            }
        });
    } catch (error) {
        console.error('Error fetching scene plot:', error);
        return NextResponse.json({ error: 'Failed to fetch scene plot' }, { status: 500 });
    }
}

// PATCH /api/scene-plots/[id] - Update scene plot
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdateScenePlotRequest = await request.json();

        const result = await sql`
      UPDATE scene_plots
      SET 
        scene_title = COALESCE(${body.title}, scene_title),
        scene_description = COALESCE(${body.synopsis}, scene_description),
        emotional_beat = COALESCE(${body.emotional_beat}, emotional_beat),
        beat_key = COALESCE(${body.story_beat_id}, beat_key),
        scene_location = COALESCE(${body.location}, scene_location),
        scene_time = COALESCE(${body.time_of_day}, scene_time),
        characters_present = COALESCE(${body.characters_involved ? body.characters_involved.map((c: any) => c.name || c) : null}::text[], characters_present),
        updated_at = NOW()
      WHERE id = CAST(${id} AS uuid)
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        return NextResponse.json({ scene: result[0] });
    } catch (error) {
        console.error('Error updating scene plot:', error);
        return NextResponse.json({ error: 'Failed to update scene plot' }, { status: 500 });
    }
}

// DELETE /api/scene-plots/[id] - Soft delete scene plot
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const permanent = request.nextUrl.searchParams.get('permanent') === 'true';

        if (permanent) {
            await sql`DELETE FROM scene_plots WHERE id = ${id}::uuid`;
            return NextResponse.json({ message: 'Scene permanently deleted' });
        } else {
            await sql`
        UPDATE scene_plots
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
            return NextResponse.json({ message: 'Scene deleted', canRestore: true });
        }
    } catch (error) {
        console.error('Error deleting scene plot:', error);
        return NextResponse.json({ error: 'Failed to delete scene plot' }, { status: 500 });
    }
}
