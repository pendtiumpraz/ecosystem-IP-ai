import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all AI providers
export async function GET() {
  try {
    const providers = await sql`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM ai_models WHERE provider_id = p.id) as models_count
      FROM ai_providers p
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        displayName: p.display_name || p.name,
        providerType: p.provider_type || p.type,
        baseUrl: p.base_url || p.api_base_url,
        hasApiKey: !!(p.api_key && p.api_key !== ""),
        isEnabled: p.is_enabled ?? p.is_active ?? true,
        isDefault: p.is_default ?? false,
        modelsCount: Number(p.models_count),
        createdAt: p.created_at,
      })),
    });
  } catch (error) {
    console.error("List providers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

// POST - Create new provider
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, displayName, providerType, baseUrl, apiKey } = body;

    if (!name || !displayName || !providerType) {
      return NextResponse.json(
        { success: false, error: "Name, displayName, and providerType required" },
        { status: 400 }
      );
    }

    // Check if first provider of this type - make it default
    const existingCount = await sql`
      SELECT COUNT(*) as count FROM ai_providers WHERE provider_type = ${providerType}
    `;
    const isDefault = Number(existingCount[0]?.count) === 0;

    const newProvider = await sql`
      INSERT INTO ai_providers (name, display_name, provider_type, base_url, api_key, is_enabled, is_default)
      VALUES (${name}, ${displayName}, ${providerType}, ${baseUrl || null}, ${apiKey || null}, true, ${isDefault})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      provider: {
        id: newProvider[0].id,
        name: newProvider[0].name,
        displayName: newProvider[0].display_name,
        providerType: newProvider[0].provider_type,
        isEnabled: newProvider[0].is_enabled,
        isDefault: newProvider[0].is_default,
      },
    });
  } catch (error) {
    console.error("Create provider error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

// PUT - Update provider
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isEnabled, isDefault, apiKey } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provider ID required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      const provider = await sql`SELECT provider_type FROM ai_providers WHERE id = ${id}`;
      if (provider.length > 0) {
        await sql`
          UPDATE ai_providers SET is_default = FALSE 
          WHERE provider_type = ${provider[0].provider_type} AND id != ${id}
        `;
      }
    }

    const updated = await sql`
      UPDATE ai_providers
      SET 
        is_enabled = COALESCE(${isEnabled}, is_enabled),
        is_default = COALESCE(${isDefault}, is_default),
        api_key = COALESCE(${apiKey || null}, api_key),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: updated[0],
    });
  } catch (error) {
    console.error("Update provider error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

// DELETE - Delete provider (soft delete by disabling)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provider ID required" },
        { status: 400 }
      );
    }

    await sql`UPDATE ai_providers SET is_enabled = FALSE WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Provider disabled",
    });
  } catch (error) {
    console.error("Delete provider error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}
