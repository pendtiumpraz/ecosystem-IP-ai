import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-images?sceneId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sceneId = searchParams.get('sceneId');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        if (!sceneId) {
            return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
        }

        // Get active versions
        const versions = await sql`
      SELECT * FROM scene_image_versions
      WHERE scene_id = ${sceneId}::uuid
      AND deleted_at IS NULL
      ORDER BY version_number DESC
    `;

        // Get deleted versions if requested
        let deletedVersions: any[] = [];
        if (includeDeleted) {
            deletedVersions = await sql`
        SELECT * FROM scene_image_versions
        WHERE scene_id = ${sceneId}::uuid
        AND deleted_at IS NOT NULL
        ORDER BY version_number DESC
      `;
        }

        return NextResponse.json({
            versions,
            deletedVersions,
            activeVersion: versions.find((v: any) => v.is_active) || null
        });
    } catch (error) {
        console.error('Error fetching image versions:', error);
        return NextResponse.json({ error: 'Failed to fetch image versions' }, { status: 500 });
    }
}

// POST /api/scene-images - Create new image version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            scene_id,
            image_url,
            prompt,
            provider,
            model,
            credit_cost = 0,
            generation_mode = 't2i',
            reference_images = [],
            is_active = true
        } = body;

        if (!scene_id || !image_url) {
            return NextResponse.json(
                { error: 'scene_id and image_url are required' },
                { status: 400 }
            );
        }

        // Get next version number
        const maxResult = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_num
      FROM scene_image_versions
      WHERE scene_id = ${scene_id}::uuid AND deleted_at IS NULL
    `;
        const nextVersion = (maxResult[0]?.max_num || 0) + 1;

        // If setting as active, deactivate other versions
        if (is_active) {
            await sql`
        UPDATE scene_image_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${scene_id}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      INSERT INTO scene_image_versions (
        scene_id, version_number, image_url, prompt, provider, model,
        credit_cost, generation_mode, reference_images, is_active
      ) VALUES (
        ${scene_id}::uuid,
        ${nextVersion},
        ${image_url},
        ${prompt || null},
        ${provider || null},
        ${model || null},
        ${credit_cost},
        ${generation_mode},
        ${JSON.stringify(reference_images)},
        ${is_active}
      )
      RETURNING *
    `;

        // Update scene status
        await sql`
      UPDATE scene_plots
      SET 
        status = CASE 
          WHEN status IN ('empty', 'plotted', 'shot_listed') THEN 'storyboarded'
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = ${scene_id}::uuid
    `;

        return NextResponse.json({
            imageVersion: result[0],
            versionNumber: nextVersion
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating image version:', error);
        return NextResponse.json({ error: 'Failed to create image version' }, { status: 500 });
    }
}
