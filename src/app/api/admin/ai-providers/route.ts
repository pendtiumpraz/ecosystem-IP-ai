import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all AI providers with their API keys
export async function GET() {
  try {
    const providers = await sql`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM ai_models WHERE provider_id = p.id AND is_active = TRUE) as models_count,
        (SELECT encrypted_key FROM platform_api_keys WHERE provider_id = p.id AND is_active = TRUE LIMIT 1) as api_key
      FROM ai_providers p
      ORDER BY p.name ASC
    `;

    return NextResponse.json({
      success: true,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        apiBaseUrl: p.api_base_url,
        logoUrl: p.logo_url,
        websiteUrl: p.website_url,
        hasApiKey: !!(p.api_key && p.api_key !== ""),
        isActive: p.is_active ?? true,
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
    const { name, slug, type, apiBaseUrl, apiKey, logoUrl, websiteUrl } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Name and type required" },
        { status: 400 }
      );
    }

    const providerSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const providerId = crypto.randomUUID();

    // Create provider
    const newProvider = await sql`
      INSERT INTO ai_providers (id, name, slug, type, api_base_url, logo_url, website_url, is_active)
      VALUES (${providerId}, ${name}, ${providerSlug}, ${type}, ${apiBaseUrl || null}, ${logoUrl || null}, ${websiteUrl || null}, TRUE)
      RETURNING *
    `;

    // If API key provided, store in platform_api_keys
    if (apiKey) {
      const keyId = crypto.randomUUID();
      await sql`
        INSERT INTO platform_api_keys (id, provider_id, name, encrypted_key, is_active)
        VALUES (${keyId}, ${providerId}, ${name + ' Default Key'}, ${apiKey}, TRUE)
      `;
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: newProvider[0].id,
        name: newProvider[0].name,
        slug: newProvider[0].slug,
        type: newProvider[0].type,
        apiBaseUrl: newProvider[0].api_base_url,
        isActive: newProvider[0].is_active,
        hasApiKey: !!apiKey,
      },
    });
  } catch (error: any) {
    console.error("Create provider error:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Provider with this slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

// PUT - Update provider (including API key)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, apiBaseUrl, apiKey, isActive, logoUrl, websiteUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Provider ID required" },
        { status: 400 }
      );
    }

    // Update provider
    const updated = await sql`
      UPDATE ai_providers
      SET 
        name = COALESCE(${name}, name),
        api_base_url = COALESCE(${apiBaseUrl}, api_base_url),
        logo_url = COALESCE(${logoUrl}, logo_url),
        website_url = COALESCE(${websiteUrl}, website_url),
        is_active = COALESCE(${isActive}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    // Update or create API key if provided
    if (apiKey !== undefined && apiKey !== null) {
      const existingKey = await sql`
        SELECT id FROM platform_api_keys WHERE provider_id = ${id} AND is_active = TRUE LIMIT 1
      `;
      
      if (existingKey.length > 0) {
        await sql`
          UPDATE platform_api_keys 
          SET encrypted_key = ${apiKey}
          WHERE id = ${existingKey[0].id}
        `;
      } else if (apiKey) {
        const keyId = crypto.randomUUID();
        await sql`
          INSERT INTO platform_api_keys (id, provider_id, name, encrypted_key, is_active)
          VALUES (${keyId}, ${id}, ${updated[0].name + ' Key'}, ${apiKey}, TRUE)
        `;
      }
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: updated[0].id,
        name: updated[0].name,
        slug: updated[0].slug,
        type: updated[0].type,
        apiBaseUrl: updated[0].api_base_url,
        isActive: updated[0].is_active,
      },
    });
  } catch (error) {
    console.error("Update provider error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete provider
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

    // Soft delete provider
    await sql`UPDATE ai_providers SET is_active = FALSE WHERE id = ${id}`;
    
    // Also disable API keys
    await sql`UPDATE platform_api_keys SET is_active = FALSE WHERE provider_id = ${id}`;

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
