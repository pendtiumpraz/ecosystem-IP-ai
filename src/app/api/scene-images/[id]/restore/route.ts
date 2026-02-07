import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-images/[id]/restore - Restore a soft-deleted version
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await sql`
      UPDATE scene_image_versions
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid AND deleted_at IS NOT NULL
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Image version not found or not deleted' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            imageVersion: result[0],
            message: 'Image version restored'
        });
    } catch (error) {
        console.error('Error restoring image version:', error);
        return NextResponse.json({ error: 'Failed to restore image version' }, { status: 500 });
    }
}
