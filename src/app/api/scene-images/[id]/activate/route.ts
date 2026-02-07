import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/scene-images/[id]/activate - Set this version as active
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Get the image version to find its scene_id
        const imageResult = await sql`
      SELECT id, scene_id, version_number FROM scene_image_versions
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;

        if (imageResult.length === 0) {
            return NextResponse.json({ error: 'Image version not found' }, { status: 404 });
        }

        const imageVersion = imageResult[0];

        // Deactivate all other versions for this scene
        await sql`
      UPDATE scene_image_versions
      SET is_active = FALSE, updated_at = NOW()
      WHERE scene_id = ${imageVersion.scene_id}::uuid AND is_active = TRUE
    `;

        // Activate this version
        const result = await sql`
      UPDATE scene_image_versions
      SET is_active = TRUE, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

        return NextResponse.json({
            success: true,
            imageVersion: result[0],
            message: `Version ${imageVersion.version_number} is now active`
        });
    } catch (error) {
        console.error('Error activating image version:', error);
        return NextResponse.json({ error: 'Failed to activate image version' }, { status: 500 });
    }
}
