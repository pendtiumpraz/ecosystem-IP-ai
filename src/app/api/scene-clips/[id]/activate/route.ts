import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-clips/[id]/activate - Set this clip as active
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Get the clip to find its scene_id
        const clipResult = await sql`
      SELECT id, scene_id FROM scene_clips
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;

        if (clipResult.length === 0) {
            return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
        }

        const clip = clipResult[0];

        // Deactivate all other clips for this scene
        await sql`
      UPDATE scene_clips
      SET is_active = FALSE, updated_at = NOW()
      WHERE scene_id = ${clip.scene_id}::uuid AND is_active = TRUE
    `;

        // Activate this clip
        const result = await sql`
      UPDATE scene_clips
      SET is_active = TRUE, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({
            success: true,
            clip: result[0],
            message: 'Clip activated'
        });
    } catch (error) {
        console.error('Error activating clip:', error);
        return NextResponse.json({ error: 'Failed to activate clip' }, { status: 500 });
    }
}
