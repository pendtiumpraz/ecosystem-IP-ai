import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-clips?sceneId=xxx
export async function GET(request: NextRequest) {
    try {
        const sceneId = request.nextUrl.searchParams.get('sceneId');
        const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

        if (!sceneId) {
            return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
        }

        const clips = await sql`
      SELECT sc.*, siv.image_url as source_image_url
      FROM scene_clips sc
      LEFT JOIN scene_image_versions siv ON sc.image_version_id = siv.id
      WHERE sc.scene_id = ${sceneId}::uuid
      ${includeDeleted ? sql`` : sql`AND sc.deleted_at IS NULL`}
      ORDER BY sc.version_number DESC
    `;

        return NextResponse.json({
            clips,
            activeClip: clips.find(c => c.is_active) || null
        });
    } catch (error) {
        console.error('Error fetching clips:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// POST /api/scene-clips
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            sceneId, shotId, imageVersionId, cameraMovement, movementDirection,
            movementSpeed, prompt, seedPromptData, provider, model, creditCost, setActive
        } = body;

        if (!sceneId || !imageVersionId) {
            return NextResponse.json({ error: 'sceneId and imageVersionId are required' }, { status: 400 });
        }

        // Get next version number
        const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version
      FROM scene_clips WHERE scene_id = ${sceneId}::uuid
    `;
        const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

        // Deactivate others if setting active
        if (setActive !== false) {
            await sql`
        UPDATE scene_clips
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      INSERT INTO scene_clips (
        scene_id, shot_id, image_version_id, version_number,
        camera_movement, movement_direction, movement_speed,
        prompt, seed_prompt_data, provider, model, credit_cost,
        status, is_active
      ) VALUES (
        ${sceneId}::uuid, 
        ${shotId || null}::uuid,
        ${imageVersionId}::uuid, 
        ${nextVersion},
        ${cameraMovement || 'static'}, 
        ${movementDirection || null}, 
        ${movementSpeed || 'normal'},
        ${prompt || null}, 
        ${JSON.stringify(seedPromptData || {})}::jsonb,
        ${provider || 'seedance'}, 
        ${model || null}, 
        ${creditCost || 0},
        'pending',
        ${setActive !== false}
      )
      RETURNING *
    `;

        return NextResponse.json({ clip: result[0], message: 'Clip created' }, { status: 201 });
    } catch (error) {
        console.error('Error creating clip:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
