import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get project materials
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

    // Get materials
    const materials = await sql`
      SELECT 
        id,
        project_id as "projectId",
        name,
        description,
        type,
        file_url as "fileUrl",
        file_size as "fileSize",
        mime_type as "mimeType",
        category,
        tags,
        uploaded_by as "uploadedBy",
        is_public as "isPublic",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM project_materials
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

// POST - Add new material
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
      fileUrl,
      fileSize,
      mimeType,
      category,
      tags,
      isPublic,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Insert material
    const result = await sql`
      INSERT INTO project_materials (
        project_id,
        name,
        description,
        type,
        file_url,
        file_size,
        mime_type,
        category,
        tags,
        uploaded_by,
        is_public
      ) VALUES (
        ${projectId},
        ${name},
        ${description || null},
        ${type},
        ${fileUrl || null},
        ${fileSize || null},
        ${mimeType || null},
        ${category || null},
        ${tags ? JSON.stringify(tags) : null}::jsonb,
        ${userId},
        ${isPublic || false}
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      materialId: result[0].id,
    });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    );
  }
}

// DELETE - Remove material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const materialId = searchParams.get('materialId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID required' },
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

    // Delete material
    await sql`
      DELETE FROM project_materials
      WHERE id = ${materialId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}

// PATCH - Update material
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const materialId = searchParams.get('materialId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID required' },
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
      fileUrl,
      fileSize,
      mimeType,
      category,
      tags,
      isPublic,
    } = body;

    // Update material with all fields
    await sql`
      UPDATE project_materials
      SET
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description || null}, description),
        type = COALESCE(${type || null}, type),
        file_url = COALESCE(${fileUrl || null}, file_url),
        file_size = COALESCE(${fileSize || null}, file_size),
        mime_type = COALESCE(${mimeType || null}, mime_type),
        category = COALESCE(${category || null}, category),
        tags = COALESCE(${tags ? JSON.stringify(tags) : null}::jsonb, tags),
        is_public = COALESCE(${isPublic !== undefined ? isPublic : null}::boolean, is_public),
        updated_at = NOW()
      WHERE id = ${materialId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    );
  }
}
