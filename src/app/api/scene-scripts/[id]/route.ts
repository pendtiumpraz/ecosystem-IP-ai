import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/scene-scripts/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      SELECT * FROM scene_script_versions
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 });
        }

        return NextResponse.json({ script: result[0] });
    } catch (error) {
        console.error('Error fetching script:', error);
        return NextResponse.json({ error: 'Failed to fetch script' }, { status: 500 });
    }
}

// PATCH /api/scene-scripts/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { script_content } = body;

        const result = await sql`
      UPDATE scene_script_versions
      SET
        script_content = COALESCE(${script_content}, script_content),
        updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NULL
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 });
        }

        return NextResponse.json({ script: result[0] });
    } catch (error) {
        console.error('Error updating script:', error);
        return NextResponse.json({ error: 'Failed to update script' }, { status: 500 });
    }
}

// DELETE /api/scene-scripts/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      UPDATE scene_script_versions
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NULL
      RETURNING id, version_number, scene_id
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 });
        }

        // If this was the active script, make the latest remaining version active
        const deleted = result[0];
        if (deleted.is_active) {
            await sql`
        UPDATE scene_script_versions
        SET is_active = TRUE, updated_at = NOW()
        WHERE scene_id = ${deleted.scene_id}::uuid 
        AND deleted_at IS NULL
        AND id != ${id}::uuid
        ORDER BY version_number DESC
        LIMIT 1
      `;
        }

        return NextResponse.json({
            success: true,
            deleted: result[0],
            canRestore: true,
            message: 'Script version deleted'
        });
    } catch (error) {
        console.error('Error deleting script:', error);
        return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 });
    }
}
