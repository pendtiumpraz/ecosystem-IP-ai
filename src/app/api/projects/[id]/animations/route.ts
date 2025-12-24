import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get animations
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

    // Get animations
    const animations = await sql`
      SELECT 
        id,
        project_id as "projectId",
        scene_name as "sceneName",
        scene_order as "sceneOrder",
        description,
        prompt,
        style,
        video_url as "videoUrl",
        preview_url as "previewUrl",
        thumbnail_url as "thumbnailUrl",
        duration,
        status,
        error_message as "errorMessage",
        ai_model as "aiModel",
        generation_cost as "generationCost",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM animations
      WHERE project_id = ${projectId}
      ORDER BY scene_order ASC, created_at DESC
    `;

    return NextResponse.json({ animations });
  } catch (error) {
    console.error('Error fetching animations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animations' },
      { status: 500 }
    );
  }
}

// POST - Create new animation
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
      sceneName,
      sceneOrder,
      description,
      prompt,
      style,
      aiModel,
      generationCost,
    } = body;

    if (!sceneName) {
      return NextResponse.json(
        { error: 'Scene name is required' },
        { status: 400 }
      );
    }

    // Insert animation
    const result = await sql`
      INSERT INTO animations (
        project_id,
        scene_name,
        scene_order,
        description,
        prompt,
        style,
        ai_model,
        generation_cost,
        status
      ) VALUES (
        ${projectId},
        ${sceneName},
        ${sceneOrder || 0},
        ${description || null},
        ${prompt || null},
        ${style || '3d'},
        ${aiModel || null},
        ${generationCost || null},
        'pending'
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      animationId: result[0].id,
    });
  } catch (error) {
    console.error('Error creating animation:', error);
    return NextResponse.json(
      { error: 'Failed to create animation' },
      { status: 500 }
    );
  }
}

// DELETE - Remove animation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const animationId = searchParams.get('animationId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!animationId) {
      return NextResponse.json(
        { error: 'Animation ID required' },
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

    // Delete animation
    await sql`
      DELETE FROM animations
      WHERE id = ${animationId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting animation:', error);
    return NextResponse.json(
      { error: 'Failed to delete animation' },
      { status: 500 }
    );
  }
}

// PATCH - Update animation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const animationId = searchParams.get('animationId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!animationId) {
      return NextResponse.json(
        { error: 'Animation ID required' },
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
      sceneName,
      sceneOrder,
      description,
      prompt,
      style,
      videoUrl,
      previewUrl,
      thumbnailUrl,
      duration,
      status,
      errorMessage,
      aiModel,
      generationCost,
    } = body;

    // Update animation with all fields
    await sql`
      UPDATE animations
      SET 
        scene_name = COALESCE(${sceneName || null}, scene_name),
        scene_order = COALESCE(${sceneOrder !== undefined ? sceneOrder : null}, scene_order),
        description = COALESCE(${description || null}, description),
        prompt = COALESCE(${prompt || null}, prompt),
        style = COALESCE(${style || null}, style),
        video_url = COALESCE(${videoUrl || null}, video_url),
        preview_url = COALESCE(${previewUrl || null}, preview_url),
        thumbnail_url = COALESCE(${thumbnailUrl || null}, thumbnail_url),
        duration = COALESCE(${duration !== undefined ? duration : null}, duration),
        status = COALESCE(${status || null}, status),
        error_message = COALESCE(${errorMessage || null}, error_message),
        ai_model = COALESCE(${aiModel || null}, ai_model),
        generation_cost = COALESCE(${generationCost !== undefined ? generationCost : null}, generation_cost),
        updated_at = NOW()
      WHERE id = ${animationId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating animation:', error);
    return NextResponse.json(
      { error: 'Failed to update animation' },
      { status: 500 }
    );
  }
}
