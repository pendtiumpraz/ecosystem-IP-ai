import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/scene-clips/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const clip = await sql`
      SELECT sc.*, siv.image_url as source_image_url
      FROM scene_clips sc
      LEFT JOIN scene_image_versions siv ON sc.image_version_id = siv.id
      WHERE sc.id = ${id}::uuid
    `;

        if (clip.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ clip: clip[0] });
    } catch (error) {
        console.error('Error fetching clip:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// PATCH /api/scene-clips/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const clip = await sql`SELECT * FROM scene_clips WHERE id = ${id}::uuid`;
        if (clip.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // If setting active, deactivate others
        if (body.isActive === true) {
            await sql`
        UPDATE scene_clips
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${clip[0].scene_id}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      UPDATE scene_clips
      SET 
        video_url = COALESCE(${body.videoUrl}, video_url),
        thumbnail_url = COALESCE(${body.thumbnailUrl}, thumbnail_url),
        duration = COALESCE(${body.duration}, duration),
        status = COALESCE(${body.status}, status),
        error_message = COALESCE(${body.errorMessage}, error_message),
        is_active = COALESCE(${body.isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({ clip: result[0] });
    } catch (error) {
        console.error('Error updating clip:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/scene-clips/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const permanent = request.nextUrl.searchParams.get('permanent') === 'true';

        if (permanent) {
            await sql`DELETE FROM scene_clips WHERE id = ${id}::uuid`;
            return NextResponse.json({ message: 'Permanently deleted' });
        } else {
            await sql`
        UPDATE scene_clips
        SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
            return NextResponse.json({ message: 'Deleted', canRestore: true });
        }
    } catch (error) {
        console.error('Error deleting clip:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
