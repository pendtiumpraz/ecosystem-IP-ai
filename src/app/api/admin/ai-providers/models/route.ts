import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

// GET - List models for a provider (or all models if no providerId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const type = searchParams.get("type"); // text, image, video, audio

    let models;
    if (providerId) {
      models = await sql`
        SELECT m.*, p.name as provider_name 
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE m.provider_id = ${providerId} AND m.is_active = TRUE
        ORDER BY m.sort_order ASC, m.name ASC
      `;
    } else if (type) {
      models = await sql`
        SELECT m.*, p.name as provider_name 
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE m.type = ${type} AND m.is_active = TRUE AND p.is_active = TRUE
        ORDER BY p.name ASC, m.credit_cost ASC
      `;
    } else {
      models = await sql`
        SELECT m.*, p.name as provider_name 
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE m.is_active = TRUE AND p.is_active = TRUE
        ORDER BY m.type ASC, p.name ASC, m.credit_cost ASC
      `;
    }

    return NextResponse.json({
      success: true,
      models: models.map((m) => ({
        id: m.id,
        providerId: m.provider_id,
        providerName: m.provider_name,
        modelId: m.model_id,
        name: m.name,
        type: m.type,
        creditCost: m.credit_cost,
        inputPrice: m.input_price_per_million,
        outputPrice: m.output_price_per_million,
        pricePerGeneration: m.price_per_generation,
        maxTokens: m.max_tokens,
        contextWindow: m.context_window,
        capabilities: m.capabilities,
        isActive: m.is_active,
        isDefault: m.is_default,
        sortOrder: m.sort_order,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("List models error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

// POST - Create new model
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      providerId, modelId, name, type, creditCost, 
      inputPrice, outputPrice, pricePerGeneration,
      maxTokens, contextWindow, capabilities 
    } = body;

    if (!providerId || !modelId || !name) {
      return NextResponse.json(
        { success: false, error: "providerId, modelId, and name required" },
        { status: 400 }
      );
    }

    // Check if model_id already exists
    const existing = await sql`SELECT id FROM ai_models WHERE model_id = ${modelId}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Model with this model_id already exists" },
        { status: 400 }
      );
    }

    // Check if first model of this type - make it default
    const existingCount = await sql`
      SELECT COUNT(*) as count FROM ai_models WHERE type = ${type || "text"} AND is_active = TRUE
    `;
    const isDefault = Number(existingCount[0]?.count) === 0;

    const id = crypto.randomUUID();
    const newModel = await sql`
      INSERT INTO ai_models (
        id, provider_id, model_id, name, type, credit_cost,
        input_price_per_million, output_price_per_million, price_per_generation,
        max_tokens, context_window, capabilities, is_active, is_default
      )
      VALUES (
        ${id}, ${providerId}, ${modelId}, ${name}, ${type || "text"}, ${creditCost || 5},
        ${inputPrice || null}, ${outputPrice || null}, ${pricePerGeneration || null},
        ${maxTokens || null}, ${contextWindow || null}, ${capabilities ? JSON.stringify(capabilities) : null},
        TRUE, ${isDefault}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      model: {
        id: newModel[0].id,
        providerId: newModel[0].provider_id,
        modelId: newModel[0].model_id,
        name: newModel[0].name,
        type: newModel[0].type,
        creditCost: newModel[0].credit_cost,
        isActive: newModel[0].is_active,
        isDefault: newModel[0].is_default,
      },
    });
  } catch (error: any) {
    console.error("Create model error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create model" },
      { status: 500 }
    );
  }
}

// PUT - Update model
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, creditCost, isActive, isDefault, inputPrice, outputPrice, capabilities } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Model ID required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      const model = await sql`SELECT type FROM ai_models WHERE id = ${id}`;
      if (model.length > 0) {
        await sql`
          UPDATE ai_models SET is_default = FALSE 
          WHERE type = ${model[0].type} AND id != ${id}
        `;
      }
    }

    const updated = await sql`
      UPDATE ai_models
      SET 
        name = COALESCE(${name}, name),
        credit_cost = COALESCE(${creditCost}, credit_cost),
        input_price_per_million = COALESCE(${inputPrice}, input_price_per_million),
        output_price_per_million = COALESCE(${outputPrice}, output_price_per_million),
        capabilities = COALESCE(${capabilities ? JSON.stringify(capabilities) : null}, capabilities),
        is_active = COALESCE(${isActive}, is_active),
        is_default = COALESCE(${isDefault}, is_default),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model: {
        id: updated[0].id,
        modelId: updated[0].model_id,
        name: updated[0].name,
        type: updated[0].type,
        creditCost: updated[0].credit_cost,
        isActive: updated[0].is_active,
        isDefault: updated[0].is_default,
      },
    });
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update model" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete model
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Model ID required" },
        { status: 400 }
      );
    }

    await sql`UPDATE ai_models SET is_active = FALSE WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Model disabled",
    });
  } catch (error) {
    console.error("Delete model error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
