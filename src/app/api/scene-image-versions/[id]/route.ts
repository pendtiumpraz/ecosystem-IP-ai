import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH /api/scene-image-versions/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const version = await sql`SELECT * FROM scene_image_versions WHERE id = ${id}::uuid`;
        if (version.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // If setting active, deactivate others
        if (body.isActive === true) {
            await sql`
        UPDATE scene_image_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${version[0].scene_id}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      UPDATE scene_image_versions
      SET is_active = COALESCE(${body.isActive}, is_active), updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({ version: result[0] });
    } catch (error) {
        console.error('Error updating image version:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/scene-image-versions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const permanent = request.nextUrl.searchParams.get('permanent') === 'true';

        if (permanent) {
            await sql`DELETE FROM scene_image_versions WHERE id = ${id}::uuid`;
            return NextResponse.json({ message: 'Permanently deleted' });
        } else {
            await sql`
        UPDATE scene_image_versions
        SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
            return NextResponse.json({ message: 'Deleted', canRestore: true });
        }
    } catch (error) {
        console.error('Error deleting image version:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
