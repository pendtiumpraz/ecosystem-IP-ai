import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Get project team members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Get team members
  const team = await sql`
    SELECT * FROM project_team WHERE project_id = ${id} ORDER BY joined_at ASC
  `;

  return NextResponse.json({ team });
}

// POST - Add team member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json();
  const { memberId, name, email, role, responsibilities, expertise } = body;

  if (!memberId) {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
  }

  // Add team member
  const created = await sql`
    INSERT INTO project_team (
      project_id, user_id, name, email, role, responsibilities, expertise, joined_at, created_at, updated_at
    )
    VALUES (
      ${id}, ${memberId}, ${name || null}, ${email || null}, ${role || null}, 
      ${responsibilities || null}, ${expertise || null}, NOW(), NOW()
    )
    RETURNING *
  `;

  return NextResponse.json({ success: true, member: created[0] });
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const memberId = searchParams.get('memberId');

  if (!userId || !memberId) {
    return NextResponse.json({ error: 'userId and memberId are required' }, { status: 400 });
  }

  // Verify user owns project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Delete team member
  await sql`
    DELETE FROM project_team WHERE id = ${memberId} AND project_id = ${id}
  `;

  return NextResponse.json({ success: true });
}

// PATCH - Update team member (Modo token holder status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const memberId = searchParams.get('memberId');

  if (!userId || !memberId) {
    return NextResponse.json({ error: 'userId and memberId are required' }, { status: 400 });
  }

  // Verify user owns project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json();
  const { isModoTokenHolder, modoTokenAddress, modoTokenAmount } = body;

  // Update team member
  const updated = await sql`
    UPDATE project_team SET
      is_modo_token_holder = ${isModoTokenHolder !== undefined ? isModoTokenHolder : 'is_modo_token_holder'},
      modo_token_address = ${modoTokenAddress || null},
      modo_token_amount = ${modoTokenAmount || null},
      updated_at = NOW()
    WHERE id = ${memberId} AND project_id = ${id}
    RETURNING *
  `;

  return NextResponse.json({ success: true, member: updated[0] });
}
