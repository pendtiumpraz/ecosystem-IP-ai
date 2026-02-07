import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-plots/[id]/restore - Restore soft-deleted scene
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const scene = await sql`SELECT * FROM scene_plots WHERE id = ${id}::uuid`;

        if (scene.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        if (!scene[0].deleted_at) {
            return NextResponse.json({ error: 'Scene is not deleted' }, { status: 400 });
        }

        const result = await sql`
      UPDATE scene_plots
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({
            message: 'Scene restored',
            scene: result[0]
        });
    } catch (error) {
        console.error('Error restoring scene plot:', error);
        return NextResponse.json({ error: 'Failed to restore scene plot' }, { status: 500 });
    }
}
