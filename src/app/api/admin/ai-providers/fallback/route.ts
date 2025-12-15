import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all fallback configs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const modelType = searchParams.get("type");

    let configs;
    if (tier && modelType) {
      configs = await sql`
        SELECT * FROM ai_fallback_configs 
        WHERE tier = ${tier} AND model_type = ${modelType} AND is_active = TRUE
        ORDER BY priority ASC
      `;
    } else if (modelType) {
      configs = await sql`
        SELECT * FROM ai_fallback_configs 
        WHERE model_type = ${modelType} AND is_active = TRUE
        ORDER BY tier, priority ASC
      `;
    } else {
      configs = await sql`
        SELECT * FROM ai_fallback_configs 
        WHERE is_active = TRUE
        ORDER BY tier, model_type, priority ASC
      `;
    }

    return NextResponse.json({
      success: true,
      configs: configs.map((c) => ({
        id: c.id,
        tier: c.tier,
        modelType: c.model_type,
        priority: c.priority,
        providerName: c.provider_name,
        modelId: c.model_id,
        apiKeyId: c.api_key_id,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error("Get fallback configs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch configs" },
      { status: 500 }
    );
  }
}

// POST - Create/Update fallback config
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier = "all", modelType, priority, providerName, modelId, apiKeyId } = body;

    if (!modelType || !providerName || !modelId) {
      return NextResponse.json(
        { success: false, error: "modelType, providerName, and modelId required" },
        { status: 400 }
      );
    }

    // Upsert - update if exists for this tier/type/priority, otherwise insert
    const existing = await sql`
      SELECT id FROM ai_fallback_configs 
      WHERE tier = ${tier} AND model_type = ${modelType} AND priority = ${priority || 1}
    `;

    let config;
    if (existing.length > 0) {
      config = await sql`
        UPDATE ai_fallback_configs SET
          provider_name = ${providerName},
          model_id = ${modelId},
          api_key_id = ${apiKeyId || null},
          is_active = TRUE,
          updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
    } else {
      config = await sql`
        INSERT INTO ai_fallback_configs (tier, model_type, priority, provider_name, model_id, api_key_id)
        VALUES (${tier}, ${modelType}, ${priority || 1}, ${providerName}, ${modelId}, ${apiKeyId || null})
        RETURNING *
      `;
    }

    return NextResponse.json({
      success: true,
      config: config[0],
    });
  } catch (error) {
    console.error("Create fallback config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create config" },
      { status: 500 }
    );
  }
}

// PUT - Update fallback priority/order
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { configs } = body; // Array of { id, priority }

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { success: false, error: "configs array required" },
        { status: 400 }
      );
    }

    // Update priorities
    for (const { id, priority } of configs) {
      await sql`
        UPDATE ai_fallback_configs SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Priorities updated",
    });
  } catch (error) {
    console.error("Update fallback priority error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update priorities" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete fallback config
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

    await sql`
      UPDATE ai_fallback_configs SET is_active = FALSE, updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Config removed",
    });
  } catch (error) {
    console.error("Delete fallback config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete config" },
      { status: 500 }
    );
  }
}
