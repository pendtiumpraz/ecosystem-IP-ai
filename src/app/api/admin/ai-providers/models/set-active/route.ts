import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Set a model as the active/default for its type
// This will deactivate all other models of the same type
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelId, modelType } = body;

    if (!modelId || !modelType) {
      return NextResponse.json(
        { success: false, error: "modelId and modelType required" },
        { status: 400 }
      );
    }

    // Verify model exists and get its type
    const model = await sql`
      SELECT m.*, p.api_key, p.is_enabled as provider_enabled, p.display_name as provider_name
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = ${modelId}
    `;

    if (model.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    // Check if provider has API key
    if (!model[0].api_key) {
      return NextResponse.json(
        { success: false, error: `Provider ${model[0].provider_name} belum punya API key. Set API key dulu.` },
        { status: 400 }
      );
    }

    // Check if provider is enabled
    if (!model[0].provider_enabled) {
      return NextResponse.json(
        { success: false, error: `Provider ${model[0].provider_name} disabled. Enable provider dulu.` },
        { status: 400 }
      );
    }

    // Deactivate ALL models of the same type (across all providers)
    await sql`
      UPDATE ai_models 
      SET is_default = FALSE, is_enabled = FALSE, updated_at = NOW()
      WHERE model_type = ${modelType}
    `;

    // Activate the selected model
    await sql`
      UPDATE ai_models 
      SET is_default = TRUE, is_enabled = TRUE, updated_at = NOW()
      WHERE id = ${modelId}
    `;

    return NextResponse.json({
      success: true,
      message: `${model[0].display_name} is now the active ${modelType} model`,
      activeModel: {
        id: model[0].id,
        modelId: model[0].model_id,
        displayName: model[0].display_name,
        modelType: model[0].model_type,
        providerName: model[0].provider_name,
      },
    });
  } catch (error) {
    console.error("Set active model error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set active model" },
      { status: 500 }
    );
  }
}

// GET - Get current active models for each type
export async function GET() {
  try {
    const activeModels = await sql`
      SELECT 
        m.*,
        p.name as provider_name,
        p.display_name as provider_display_name
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.is_default = TRUE AND m.is_enabled = TRUE
      ORDER BY m.model_type
    `;

    const result: Record<string, any> = {
      text: null,
      image: null,
      video: null,
      audio: null,
    };

    activeModels.forEach((m) => {
      result[m.model_type] = {
        id: m.id,
        modelId: m.model_id,
        displayName: m.display_name,
        providerName: m.provider_display_name || m.provider_name,
        creditCostPerUse: m.credit_cost_per_use,
      };
    });

    return NextResponse.json({
      success: true,
      activeModels: result,
    });
  } catch (error) {
    console.error("Get active models error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get active models" },
      { status: 500 }
    );
  }
}
