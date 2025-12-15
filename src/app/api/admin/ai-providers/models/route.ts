import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List models for a provider
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "Provider ID required" },
        { status: 400 }
      );
    }

    const models = await sql`
      SELECT * FROM ai_models 
      WHERE provider_id = ${providerId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      models: models.map((m) => ({
        id: m.id,
        providerId: m.provider_id,
        modelId: m.model_id,
        displayName: m.display_name,
        modelType: m.model_type,
        creditCostPerUse: m.credit_cost_per_use,
        isEnabled: m.is_enabled,
        isDefault: m.is_default,
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
    const { providerId, modelId, displayName, modelType, creditCostPerUse } = body;

    if (!providerId || !modelId || !displayName) {
      return NextResponse.json(
        { success: false, error: "providerId, modelId, and displayName required" },
        { status: 400 }
      );
    }

    // Check if first model of this type for this provider - make it default
    const existingCount = await sql`
      SELECT COUNT(*) as count FROM ai_models 
      WHERE provider_id = ${providerId} AND model_type = ${modelType || "text"}
    `;
    const isDefault = Number(existingCount[0]?.count) === 0;

    const newModel = await sql`
      INSERT INTO ai_models (provider_id, model_id, display_name, model_type, credit_cost_per_use, is_enabled, is_default)
      VALUES (${providerId}, ${modelId}, ${displayName}, ${modelType || "text"}, ${creditCostPerUse || 5}, true, ${isDefault})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      model: {
        id: newModel[0].id,
        providerId: newModel[0].provider_id,
        modelId: newModel[0].model_id,
        displayName: newModel[0].display_name,
        modelType: newModel[0].model_type,
        creditCostPerUse: newModel[0].credit_cost_per_use,
        isEnabled: newModel[0].is_enabled,
        isDefault: newModel[0].is_default,
      },
    });
  } catch (error) {
    console.error("Create model error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create model" },
      { status: 500 }
    );
  }
}

// PUT - Update model
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isEnabled, isDefault, creditCostPerUse } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Model ID required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults of same type for same provider
    if (isDefault) {
      const model = await sql`SELECT provider_id, model_type FROM ai_models WHERE id = ${id}`;
      if (model.length > 0) {
        await sql`
          UPDATE ai_models SET is_default = FALSE 
          WHERE provider_id = ${model[0].provider_id} 
            AND model_type = ${model[0].model_type} 
            AND id != ${id}
        `;
      }
    }

    const updated = await sql`
      UPDATE ai_models
      SET 
        is_enabled = COALESCE(${isEnabled}, is_enabled),
        is_default = COALESCE(${isDefault}, is_default),
        credit_cost_per_use = COALESCE(${creditCostPerUse}, credit_cost_per_use),
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
      model: updated[0],
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

    await sql`UPDATE ai_models SET is_enabled = FALSE WHERE id = ${id}`;

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
