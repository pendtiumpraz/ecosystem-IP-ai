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
      WHERE scene_plot_id = ${sceneId}
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
            scene_id, // frontend sends scene_id, we map to scene_plot_id
            shot_number,
            camera_type,
            camera_angle,
            camera_movement,
            duration_seconds,
            action,
            shot_description,
            dialogue,
            audio_notes,
            visual_notes
        } = body;

        const sceneplotId = scene_id;

        if (!sceneplotId) {
            return NextResponse.json({ error: 'scene_id is required' }, { status: 400 });
        }

        // Get next shot number if not provided
        let finalShotNumber = shot_number;
        if (!finalShotNumber) {
            const maxResult = await sql`
        SELECT COALESCE(MAX(shot_number), 0) as max_num
        FROM scene_shots
        WHERE scene_plot_id = ${sceneplotId} AND deleted_at IS NULL
      `;
            finalShotNumber = (maxResult[0]?.max_num || 0) + 1;
        }

        const result = await sql`
      INSERT INTO scene_shots (
        scene_plot_id, shot_number, shot_type, shot_size, shot_angle, 
        camera_movement, duration_seconds, action, shot_description,
        dialogue, audio_notes, visual_notes
      ) VALUES (
        ${sceneplotId},
        ${finalShotNumber},
        ${camera_type || 'medium'},
        ${camera_type || 'medium'},
        ${camera_angle || 'eye-level'},
        ${camera_movement || 'static'},
        ${duration_seconds || 3},
        ${action || null},
        ${shot_description || null},
        ${dialogue || null},
        ${audio_notes || null},
        ${visual_notes || null}
      )
      RETURNING *
    `;

        return NextResponse.json({ shot: result[0] }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating shot:', error?.message);
        return NextResponse.json({ error: 'Failed to create shot', details: error?.message }, { status: 500 });
    }
}

