import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get custom roles
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

    // Get custom roles
    const roles = await sql`
      SELECT 
        id,
        project_id as "projectId",
        name,
        description,
        color,
        icon,
        permissions,
        is_predefined as "isPredefined",
        created_by as "createdBy",
        is_public as "isPublic",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM custom_roles
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching custom roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST - Create new custom role
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
      color,
      icon,
      permissions,
      isPublic,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Insert custom role
    const result = await sql`
      INSERT INTO custom_roles (
        project_id,
        name,
        description,
        color,
        icon,
        permissions,
        is_predefined,
        created_by,
        is_public
      ) VALUES (
        ${projectId},
        ${name},
        ${description || null},
        ${color || null},
        ${icon || null},
        ${permissions ? JSON.stringify(permissions) : null}::jsonb,
        false,
        ${userId},
        ${isPublic || false}
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      roleId: result[0].id,
    });
  } catch (error) {
    console.error('Error creating custom role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// DELETE - Remove custom role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID required' },
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

    // Delete custom role
    await sql`
      DELETE FROM custom_roles
      WHERE id = ${roleId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}

// PATCH - Update custom role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID required' },
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
      color,
      icon,
      permissions,
      isPublic,
    } = body;

    // Update custom role with all fields
    await sql`
      UPDATE custom_roles
      SET 
        name = COALESCE(${name || null}, name),
        description = COALESCE(${description || null}, description),
        color = COALESCE(${color || null}, color),
        icon = COALESCE(${icon || null}, icon),
        permissions = COALESCE(${permissions ? JSON.stringify(permissions) : null}::jsonb, permissions),
        is_public = COALESCE(${isPublic !== undefined ? isPublic : null}::boolean, is_public),
        updated_at = NOW()
      WHERE id = ${roleId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating custom role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
