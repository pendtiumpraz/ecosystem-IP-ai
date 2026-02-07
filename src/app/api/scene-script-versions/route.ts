import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

function createContextHash(synopsis: string, shotList: string): string {
  return crypto.createHash('md5').update(`${synopsis}|${shotList}`).digest('hex');
}

// GET /api/scene-script-versions?sceneId=xxx
export async function GET(request: NextRequest) {
  try {
    const sceneId = request.nextUrl.searchParams.get('sceneId');
    const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
    }

    const versions = await sql`
      SELECT * FROM scene_script_versions
      WHERE scene_id = ${sceneId}::uuid
      ${includeDeleted ? sql`` : sql`AND deleted_at IS NULL`}
      ORDER BY version_number DESC
    `;

    return NextResponse.json({
      versions,
      activeVersion: versions.find(v => v.is_active) || null
    });
  } catch (error) {
    console.error('Error fetching script versions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/scene-script-versions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sceneId, scriptContent, prompt, provider, model,
      creditCost, isManualEdit, setActive, forceNewVersion
    } = body;

    if (!sceneId || !scriptContent) {
      return NextResponse.json({ error: 'sceneId and scriptContent are required' }, { status: 400 });
    }

    // Get scene data for context
    const sceneData = await sql`SELECT * FROM scene_plots WHERE id = ${sceneId}::uuid`;
    if (sceneData.length === 0) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }
    const scene = sceneData[0];

    // Get shots for context hash
    const shots = await sql`
      SELECT * FROM scene_shots
      WHERE scene_id = ${sceneId}::uuid AND deleted_at IS NULL
      ORDER BY shot_number
    `;

    // Create context snapshot
    const shotListString = shots.map(s => `${s.shot_number}:${s.action || ''}`).join('|');
    const contextHash = createContextHash(scene.synopsis || '', shotListString);

    const contextSnapshot = {
      scene_plot_hash: contextHash,
      shot_list_hash: crypto.createHash('md5').update(shotListString).digest('hex'),
      beat_id: scene.story_beat_id,
      scene_synopsis: scene.synopsis?.substring(0, 200)
    };

    // Check if should create new version or update existing
    const latestVersion = await sql`
      SELECT * FROM scene_script_versions
      WHERE scene_id = ${sceneId}::uuid AND deleted_at IS NULL
      ORDER BY version_number DESC LIMIT 1
    `;

    let shouldCreateNew = true;

    if (latestVersion.length > 0 && !forceNewVersion) {
      const existingContext = latestVersion[0].context_snapshot;
      if (isManualEdit && existingContext?.scene_plot_hash === contextHash) {
        shouldCreateNew = false;
      }
    }

    if (!shouldCreateNew && latestVersion.length > 0) {
      const result = await sql`
        UPDATE scene_script_versions
        SET script_content = ${scriptContent}, is_manual_edit = TRUE, updated_at = NOW()
        WHERE id = ${latestVersion[0].id}::uuid
        RETURNING *
      `;
      return NextResponse.json({ version: result[0], updated: true });
    }

    // Get next version number
    const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version
      FROM scene_script_versions WHERE scene_id = ${sceneId}::uuid
    `;
    const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

    // Deactivate others if setting active
    if (setActive !== false) {
      await sql`
        UPDATE scene_script_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
      `;
    }

    const result = await sql`
      INSERT INTO scene_script_versions (
        scene_id, version_number, script_content, context_snapshot,
        provider, model, credit_cost, prompt, is_active, is_manual_edit
      ) VALUES (
        ${sceneId}::uuid, ${nextVersion}, ${scriptContent}, 
        ${JSON.stringify(contextSnapshot)}::jsonb,
        ${provider || null}, ${model || null}, ${creditCost || 0}, 
        ${prompt || null}, ${setActive !== false}, ${isManualEdit || false}
      )
      RETURNING *
    `;

    // Update scene status
    await sql`
      UPDATE scene_plots
      SET status = CASE 
        WHEN status IN ('empty', 'plotted', 'shot_listed', 'storyboarded') THEN 'scripted'
        ELSE status
      END, updated_at = NOW()
      WHERE id = ${sceneId}::uuid
    `;

    return NextResponse.json({ version: result[0], created: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating script version:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
