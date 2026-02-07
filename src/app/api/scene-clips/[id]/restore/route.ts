import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-clips/[id]/restore
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const clip = await sql`SELECT * FROM scene_clips WHERE id = ${id}::uuid`;
        if (clip.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!clip[0].deleted_at) {
            return NextResponse.json({ error: 'Clip is not deleted' }, { status: 400 });
        }

        const result = await sql`
      UPDATE scene_clips
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({ message: 'Restored', clip: result[0] });
    } catch (error) {
        console.error('Error restoring clip:', error);
        return NextResponse.json({ error: 'Failed to restore' }, { status: 500 });
    }
}
