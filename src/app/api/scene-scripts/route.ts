import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-scripts?sceneId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sceneId = searchParams.get('sceneId');

        if (!sceneId) {
            return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
        }

        const scripts = await sql`
      SELECT * FROM scene_script_versions
      WHERE scene_id = ${sceneId}::uuid
      AND deleted_at IS NULL
      ORDER BY version_number DESC
    `;

        return NextResponse.json({
            scripts,
            activeScript: scripts.find((s: any) => s.is_active) || null
        });
    } catch (error) {
        console.error('Error fetching scripts:', error);
        return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 });
    }
}

// POST /api/scene-scripts - Create a new script version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            scene_id,
            script_content,
            generation_context_hash,
            is_active
        } = body;

        if (!scene_id || !script_content) {
            return NextResponse.json(
                { error: 'scene_id and script_content are required' },
                { status: 400 }
            );
        }

        // Get next version number
        const maxResult = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_num
      FROM scene_script_versions
      WHERE scene_id = ${scene_id}::uuid AND deleted_at IS NULL
    `;
        const nextVersion = (maxResult[0]?.max_num || 0) + 1;

        // Calculate hash if not provided
        const contentHash = generation_context_hash ||
            crypto.createHash('md5').update(script_content).digest('hex').substring(0, 16);

        // If setting as active, deactivate other versions
        if (is_active) {
            await sql`
        UPDATE scene_script_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${scene_id}::uuid AND is_active = TRUE
      `;
        }

        const result = await sql`
      INSERT INTO scene_script_versions (
        scene_id, version_number, script_content, 
        generation_context_hash, is_active
      ) VALUES (
        ${scene_id}::uuid,
        ${nextVersion},
        ${script_content},
        ${contentHash},
        ${is_active !== false}
      )
      RETURNING *
    `;

        // Update scene status if this is the first script
        await sql`
      UPDATE scene_plots
      SET 
        status = CASE 
          WHEN status IN ('empty', 'plotted', 'shot_listed') THEN 'scripted'
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = ${scene_id}::uuid
    `;

        return NextResponse.json({
            script: result[0],
            versionNumber: nextVersion
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating script:', error);
        return NextResponse.json({ error: 'Failed to create script' }, { status: 500 });
    }
}
