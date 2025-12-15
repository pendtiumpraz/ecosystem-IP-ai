import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all plans
export async function GET() {
  try {
    const plans = await sql`
      SELECT * FROM subscription_plans
      ORDER BY price_monthly ASC
    `;

    return NextResponse.json({
      success: true,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceMonthly: p.price_monthly,
        priceYearly: p.price_yearly,
        creditsMonthly: p.credits_monthly,
        maxProjects: p.max_projects,
        maxTeamMembers: p.max_team_members,
        features: p.features || [],
        isActive: p.is_active ?? true,
        isPopular: p.is_popular ?? false,
      })),
    });
  } catch (error) {
    console.error("List plans error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST - Create plan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, priceMonthly, priceYearly, creditsMonthly, maxProjects, maxTeamMembers, features, isPopular } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug required" },
        { status: 400 }
      );
    }

    const plan = await sql`
      INSERT INTO subscription_plans (
        name, slug, price_monthly, price_yearly, 
        credits_monthly, max_projects, max_team_members,
        features, is_active, is_popular
      )
      VALUES (
        ${name}, ${slug}, ${priceMonthly || 0}, ${priceYearly || 0},
        ${creditsMonthly || 0}, ${maxProjects || 5}, ${maxTeamMembers || 1},
        ${JSON.stringify(features || [])}, true, ${isPopular || false}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      plan: plan[0],
    });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create plan" },
      { status: 500 }
    );
  }
}

// PUT - Update plan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, priceMonthly, priceYearly, creditsMonthly, maxProjects, maxTeamMembers, features, isActive, isPopular } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE subscription_plans
      SET 
        name = COALESCE(${name}, name),
        slug = COALESCE(${slug}, slug),
        price_monthly = COALESCE(${priceMonthly}, price_monthly),
        price_yearly = COALESCE(${priceYearly}, price_yearly),
        credits_monthly = COALESCE(${creditsMonthly}, credits_monthly),
        max_projects = COALESCE(${maxProjects}, max_projects),
        max_team_members = COALESCE(${maxTeamMembers}, max_team_members),
        features = COALESCE(${features ? JSON.stringify(features) : null}, features),
        is_active = COALESCE(${isActive}, is_active),
        is_popular = COALESCE(${isPopular}, is_popular),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      plan: updated[0],
    });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete plan
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

    // Hard delete since plans are config data
    await sql`DELETE FROM subscription_plans WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Plan deleted",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
