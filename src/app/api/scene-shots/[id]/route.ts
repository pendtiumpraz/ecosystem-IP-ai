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
      WHERE id = ${id}::uuid AND deleted_at IS NULL
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
            framing,
            subject,
            emotional_tone,
            lighting_notes,
            shot_number
        } = body;

        const result = await sql`
      UPDATE scene_shots
      SET
        camera_type = COALESCE(${camera_type}, camera_type),
        camera_angle = COALESCE(${camera_angle}, camera_angle),
        camera_movement = COALESCE(${camera_movement}, camera_movement),
        duration_seconds = COALESCE(${duration_seconds}, duration_seconds),
        action = COALESCE(${action}, action),
        framing = COALESCE(${framing}, framing),
        subject = COALESCE(${subject}, subject),
        emotional_tone = COALESCE(${emotional_tone}, emotional_tone),
        lighting_notes = COALESCE(${lighting_notes}, lighting_notes),
        shot_number = COALESCE(${shot_number}, shot_number),
        updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NULL
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Shot not found' }, { status: 404 });
        }

        return NextResponse.json({ shot: result[0] });
    } catch (error) {
        console.error('Error updating shot:', error);
        return NextResponse.json({ error: 'Failed to update shot' }, { status: 500 });
    }
}

// DELETE /api/scene-shots/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      UPDATE scene_shots
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NULL
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
