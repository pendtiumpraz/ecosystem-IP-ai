import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/scene-images/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      SELECT * FROM scene_image_versions
      WHERE id = ${id}::uuid
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Image version not found' }, { status: 404 });
        }

        return NextResponse.json({ imageVersion: result[0] });
    } catch (error) {
        console.error('Error fetching image version:', error);
        return NextResponse.json({ error: 'Failed to fetch image version' }, { status: 500 });
    }
}

// DELETE /api/scene-images/[id] - Soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      UPDATE scene_image_versions
      SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NULL
      RETURNING id, version_number, scene_id
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Image version not found' }, { status: 404 });
        }

        // If this was the active image, make the latest remaining version active
        const deleted = result[0];
        await sql`
      UPDATE scene_image_versions
      SET is_active = TRUE, updated_at = NOW()
      WHERE scene_id = ${deleted.scene_id}::uuid 
      AND deleted_at IS NULL
      AND id != ${id}::uuid
      ORDER BY version_number DESC
      LIMIT 1
    `;

        return NextResponse.json({
            success: true,
            deleted: result[0],
            canRestore: true,
            message: 'Image version deleted'
        });
    } catch (error) {
        console.error('Error deleting image version:', error);
        return NextResponse.json({ error: 'Failed to delete image version' }, { status: 500 });
    }
}
