import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH /api/scene-script-versions/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const version = await sql`SELECT * FROM scene_script_versions WHERE id = ${id}::uuid`;
        if (version.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // If setting active, deactivate others
        if (body.isActive === true) {
            await sql`
        UPDATE scene_script_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${version[0].scene_id}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      UPDATE scene_script_versions
      SET 
        script_content = COALESCE(${body.scriptContent}, script_content),
        is_active = COALESCE(${body.isActive}, is_active),
        is_manual_edit = CASE WHEN ${body.scriptContent} IS NOT NULL THEN TRUE ELSE is_manual_edit END,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({ version: result[0] });
    } catch (error) {
        console.error('Error updating script version:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/scene-script-versions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const permanent = request.nextUrl.searchParams.get('permanent') === 'true';

        if (permanent) {
            await sql`DELETE FROM scene_script_versions WHERE id = ${id}::uuid`;
            return NextResponse.json({ message: 'Permanently deleted' });
        } else {
            await sql`
        UPDATE scene_script_versions
        SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
            return NextResponse.json({ message: 'Deleted', canRestore: true });
        }
    } catch (error) {
        console.error('Error deleting script version:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
