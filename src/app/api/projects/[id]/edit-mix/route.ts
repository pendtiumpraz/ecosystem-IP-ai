import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get edit/mix sessions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user owns project
    const project = await sql`
      SELECT id, user_id 
      FROM projects 
      WHERE id = ${projectId}
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project[0].user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get sessions
    const sessions = await sql`
      SELECT 
        id,
        project_id as "projectId",
        name,
        description,
        type,
        source_materials as "sourceMaterials",
        source_urls as "sourceUrls",
        mix_mode as "mixMode",
        blend_mode as "blendMode",
        opacity,
        duration,
        filters,
        effects,
        output_url as "outputUrl",
        output_format as "outputFormat",
        output_quality as "outputQuality",
        ai_generated as "aiGenerated",
        ai_prompt as "aiPrompt",
        ai_model as "aiModel",
        ai_provider as "aiProvider",
        status,
        error_message as "errorMessage",
        created_by as "createdBy",
        is_public as "isPublic",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM edit_mix_sessions
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching edit/mix sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create new edit/mix session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user owns project
    const project = await sql`
      SELECT id, user_id 
      FROM projects 
      WHERE id = ${projectId}
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project[0].user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      sourceMaterials,
      sourceUrls,
      mixMode,
      blendMode,
      opacity,
      duration,
      filters,
      effects,
      outputFormat,
      outputQuality,
      aiGenerated,
      aiPrompt,
      aiModel,
      aiProvider,
      isPublic,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Insert session
    const result = await sql`
      INSERT INTO edit_mix_sessions (
        project_id,
        name,
        description,
        type,
        source_materials,
        source_urls,
        mix_mode,
        blend_mode,
        opacity,
        duration,
        filters,
        effects,
        output_format,
        output_quality,
        ai_generated,
        ai_prompt,
        ai_model,
        ai_provider,
        created_by,
        is_public,
        status
      ) VALUES (
        ${projectId},
        ${name},
        ${description || null},
        ${type},
        ${sourceMaterials ? JSON.stringify(sourceMaterials) : null}::jsonb,
        ${sourceUrls ? JSON.stringify(sourceUrls) : null}::jsonb,
        ${mixMode || null},
        ${blendMode || null},
        ${opacity || 100},
        ${duration || null},
        ${filters ? JSON.stringify(filters) : null}::jsonb,
        ${effects ? JSON.stringify(effects) : null}::jsonb,
        ${outputFormat || null},
        ${outputQuality || 100},
        ${aiGenerated || false},
        ${aiPrompt || null},
        ${aiModel || null},
        ${aiProvider || null},
        ${userId},
        ${isPublic || false},
        'draft'
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      sessionId: result[0].id,
    });
  } catch (error) {
    console.error('Error creating edit/mix session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// DELETE - Remove edit/mix session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Verify user owns project
    const project = await sql`
      SELECT id, user_id 
      FROM projects 
      WHERE id = ${projectId}
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project[0].user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete session
    await sql`
      DELETE FROM edit_mix_sessions
      WHERE id = ${sessionId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting edit/mix session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

// PATCH - Update edit/mix session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Verify user owns project
    const project = await sql`
      SELECT id, user_id 
      FROM projects 
      WHERE id = ${projectId}
    `;

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project[0].user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      sourceMaterials,
      sourceUrls,
      mixMode,
      blendMode,
      opacity,
      duration,
      filters,
      effects,
      outputUrl,
      outputFormat,
      outputQuality,
      aiGenerated,
      aiPrompt,
      aiModel,
      aiProvider,
      status,
      errorMessage,
      isPublic,
    } = body;

    // Update session with all fields
    await sql`
      UPDATE edit_mix_sessions
      SET 
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description || null}, description),
        type = COALESCE(${type || null}, type),
        source_materials = COALESCE(${sourceMaterials ? JSON.stringify(sourceMaterials) : null}::jsonb, source_materials),
        source_urls = COALESCE(${sourceUrls ? JSON.stringify(sourceUrls) : null}::jsonb, source_urls),
        mix_mode = COALESCE(${mixMode || null}, mix_mode),
        blend_mode = COALESCE(${blendMode || null}, blend_mode),
        opacity = COALESCE(${opacity !== undefined ? opacity : null}, opacity),
        duration = COALESCE(${duration || null}, duration),
        filters = COALESCE(${filters ? JSON.stringify(filters) : null}::jsonb, filters),
        effects = COALESCE(${effects ? JSON.stringify(effects) : null}::jsonb, effects),
        output_url = COALESCE(${outputUrl || null}, output_url),
        output_format = COALESCE(${outputFormat || null}, output_format),
        output_quality = COALESCE(${outputQuality !== undefined ? outputQuality : null}, output_quality),
        ai_generated = COALESCE(${aiGenerated !== undefined ? aiGenerated : null}::boolean, ai_generated),
        ai_prompt = COALESCE(${aiPrompt || null}, ai_prompt),
        ai_model = COALESCE(${aiModel || null}, ai_model),
        ai_provider = COALESCE(${aiProvider || null}, ai_provider),
        status = COALESCE(${status || null}, status),
        error_message = COALESCE(${errorMessage || null}, error_message),
        is_public = COALESCE(${isPublic !== undefined ? isPublic : null}::boolean, is_public),
        updated_at = NOW()
      WHERE id = ${sessionId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating edit/mix session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
