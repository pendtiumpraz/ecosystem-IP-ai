import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all organizations
export async function GET() {
  try {
    const orgs = await sql`
      SELECT 
        o.*,
        p.name as plan_name,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id AND deleted_at IS NULL) as member_count,
        (SELECT COUNT(*) FROM projects WHERE org_id = o.id AND deleted_at IS NULL) as project_count
      FROM organizations o
      LEFT JOIN subscription_plans p ON o.current_plan_id = p.id
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      organizations: orgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        planId: o.current_plan_id,
        planName: o.plan_name,
        memberCount: Number(o.member_count),
        projectCount: Number(o.project_count),
        isActive: o.is_active ?? true,
        createdAt: o.created_at,
      })),
    });
  } catch (error) {
    console.error("List organizations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST - Create organization
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, planId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await sql`SELECT id FROM organizations WHERE slug = ${slug} AND deleted_at IS NULL`;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 }
      );
    }

    const org = await sql`
      INSERT INTO organizations (name, slug, current_plan_id, is_active)
      VALUES (${name}, ${slug}, ${planId || null}, true)
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      organization: org[0],
    });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

// PUT - Update organization
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, planId, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE organizations
      SET 
        name = COALESCE(${name}, name),
        slug = COALESCE(${slug}, slug),
        current_plan_id = COALESCE(${planId || null}, current_plan_id),
        is_active = COALESCE(${isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: updated[0],
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete organization
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    // Soft delete
    await sql`
      UPDATE organizations 
      SET deleted_at = NOW(), is_active = false 
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Organization deleted",
    });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
