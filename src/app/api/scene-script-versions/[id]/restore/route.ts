import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-script-versions/[id]/restore
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const version = await sql`SELECT * FROM scene_script_versions WHERE id = ${id}::uuid`;
        if (version.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!version[0].deleted_at) {
            return NextResponse.json({ error: 'Version is not deleted' }, { status: 400 });
        }

        const result = await sql`
      UPDATE scene_script_versions
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({ message: 'Restored', version: result[0] });
    } catch (error) {
        console.error('Error restoring script version:', error);
        return NextResponse.json({ error: 'Failed to restore' }, { status: 500 });
    }
}
