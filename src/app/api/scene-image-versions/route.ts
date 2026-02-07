import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-image-versions?sceneId=xxx
export async function GET(request: NextRequest) {
  try {
    const sceneId = request.nextUrl.searchParams.get('sceneId');
    const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
    }

    const versions = await sql`
      SELECT * FROM scene_image_versions
      WHERE scene_id = ${sceneId}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY version_number DESC
    `;

    return NextResponse.json({
      versions,
      activeVersion: versions.find(v => v.is_active) || null
    });
  } catch (error) {
    console.error('Error fetching image versions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/scene-image-versions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sceneId, imageUrl, thumbnailUrl, prompt, provider, model,
      creditCost, generationMode, referenceImages, setActive
    } = body;

    if (!sceneId || !imageUrl) {
      return NextResponse.json({ error: 'sceneId and imageUrl are required' }, { status: 400 });
    }

    // Get next version number
    const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version
      FROM scene_image_versions WHERE scene_id = ${sceneId}::uuid
    `;
    const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

    // Deactivate others if setting active
    if (setActive !== false) {
      await sql`
        UPDATE scene_image_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
      `;
    }

    const result = await sql`
      INSERT INTO scene_image_versions (
        scene_id, version_number, image_url, thumbnail_url, prompt,
        provider, model, credit_cost, generation_mode, reference_images, is_active
      ) VALUES (
        ${sceneId}::uuid, ${nextVersion}, ${imageUrl}, ${thumbnailUrl || null}, ${prompt || null},
        ${provider || null}, ${model || null}, ${creditCost || 0}, ${generationMode || 'i2i'}, 
        ${JSON.stringify(referenceImages || [])}::jsonb, ${setActive !== false}
      )
      RETURNING *
    `;

    // Update scene status
    await sql`
      UPDATE scene_plots
      SET status = CASE 
        WHEN status IN ('empty', 'plotted', 'shot_listed') THEN 'storyboarded'
        ELSE status
      END, updated_at = NOW()
      WHERE id = ${sceneId}::uuid
    `;

    return NextResponse.json({ version: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating image version:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
