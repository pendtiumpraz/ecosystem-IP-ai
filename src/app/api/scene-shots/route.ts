import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-shots?sceneId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sceneId = searchParams.get('sceneId');

        if (!sceneId) {
            return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
        }

        const shots = await sql`
      SELECT * FROM scene_shots
      WHERE scene_id = ${sceneId}::uuid
      AND deleted_at IS NULL
      ORDER BY shot_number ASC
    `;

        return NextResponse.json({ shots });
    } catch (error) {
        console.error('Error fetching shots:', error);
        return NextResponse.json({ error: 'Failed to fetch shots' }, { status: 500 });
    }
}

// POST /api/scene-shots - Create a new shot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            scene_id,
            shot_number,
            camera_type,
            camera_angle,
            camera_movement,
            duration_seconds,
            action,
            framing,
            subject,
            emotional_tone,
            lighting_notes
        } = body;

        if (!scene_id) {
            return NextResponse.json({ error: 'scene_id is required' }, { status: 400 });
        }

        // Get next shot number if not provided
        let finalShotNumber = shot_number;
        if (!finalShotNumber) {
            const maxResult = await sql`
        SELECT COALESCE(MAX(shot_number), 0) as max_num
        FROM scene_shots
        WHERE scene_id = ${scene_id}::uuid AND deleted_at IS NULL
      `;
            finalShotNumber = (maxResult[0]?.max_num || 0) + 1;
        }

        const result = await sql`
      INSERT INTO scene_shots (
        scene_id, shot_number, camera_type, camera_angle, camera_movement,
        duration_seconds, action, framing, subject, emotional_tone, lighting_notes
      ) VALUES (
        ${scene_id}::uuid,
        ${finalShotNumber},
        ${camera_type || 'medium'},
        ${camera_angle || 'eye-level'},
        ${camera_movement || 'static'},
        ${duration_seconds || 3},
        ${action || null},
        ${framing || null},
        ${subject || null},
        ${emotional_tone || null},
        ${lighting_notes || null}
      )
      RETURNING *
    `;

        return NextResponse.json({ shot: result[0] }, { status: 201 });
    } catch (error) {
        console.error('Error creating shot:', error);
        return NextResponse.json({ error: 'Failed to create shot' }, { status: 500 });
    }
}
