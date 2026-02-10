import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/scene-shots/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      SELECT * FROM scene_shots
      WHERE id = ${id} AND deleted_at IS NULL
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Shot not found' }, { status: 404 });
        }

        return NextResponse.json({ shot: result[0] });
    } catch (error) {
        console.error('Error fetching shot:', error);
        return NextResponse.json({ error: 'Failed to fetch shot' }, { status: 500 });
    }
}

// PATCH /api/scene-shots/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const {
            camera_type,
            camera_angle,
            camera_movement,
            duration_seconds,
            action,
            shot_description,
            dialogue,
            audio_notes,
            visual_notes,
            shot_number
        } = body;

        const result = await sql`
      UPDATE scene_shots
      SET
        shot_type = COALESCE(${camera_type}, shot_type),
        shot_size = COALESCE(${camera_type}, shot_size),
        shot_angle = COALESCE(${camera_angle}, shot_angle),
        camera_movement = COALESCE(${camera_movement}, camera_movement),
        duration_seconds = COALESCE(${duration_seconds}, duration_seconds),
        action = COALESCE(${action}, action),
        shot_description = COALESCE(${shot_description}, shot_description),
        dialogue = COALESCE(${dialogue}, dialogue),
        audio_notes = COALESCE(${audio_notes}, audio_notes),
        visual_notes = COALESCE(${visual_notes}, visual_notes),
        shot_number = COALESCE(${shot_number}, shot_number)
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Shot not found' }, { status: 404 });
        }

        return NextResponse.json({ shot: result[0] });
    } catch (error: any) {
        console.error('Error updating shot:', error?.message);
        return NextResponse.json({ error: 'Failed to update shot', details: error?.message }, { status: 500 });
    }
}

// DELETE /api/scene-shots/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      UPDATE scene_shots
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, shot_number
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Shot not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            deleted: result[0],
            canRestore: true,
            message: 'Shot deleted'
        });
    } catch (error) {
        console.error('Error deleting shot:', error);
        return NextResponse.json({ error: 'Failed to delete shot' }, { status: 500 });
    }
}
