import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-scripts/[id]/activate - Set this version as active
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Get the script to find its scene_id
        const scriptResult = await sql`
      SELECT id, scene_id, version_number FROM scene_script_versions
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;

        if (scriptResult.length === 0) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 });
        }

        const script = scriptResult[0];

        // Deactivate all other versions for this scene
        await sql`
      UPDATE scene_script_versions
      SET is_active = FALSE, updated_at = NOW()
      WHERE scene_id = ${script.scene_id}::uuid AND is_active = TRUE
    `;

        // Activate this version
        const result = await sql`
      UPDATE scene_script_versions
      SET is_active = TRUE, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({
            success: true,
            script: result[0],
            message: `Version ${script.version_number} is now active`
        });
    } catch (error) {
        console.error('Error activating script:', error);
        return NextResponse.json({ error: 'Failed to activate script' }, { status: 500 });
    }
}
