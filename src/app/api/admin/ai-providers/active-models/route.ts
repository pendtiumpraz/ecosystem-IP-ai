import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get all active models per subcategory
export async function GET() {
    try {
        // Get all active models with their model details
        const activeModels = await sql`
      SELECT 
        am.id,
        am.subcategory,
        am.model_id,
        am.created_at,
        am.updated_at,
        m.name as model_name,
        m.model_id as model_api_id,
        m.type as model_type,
        m.credit_cost,
        p.name as provider_name,
        p.id as provider_id
      FROM ai_active_models am
      JOIN ai_models m ON am.model_id = m.id
      JOIN ai_providers p ON m.provider_id = p.id
      ORDER BY am.subcategory
    `;

        return NextResponse.json({
            success: true,
            activeModels
        });
    } catch (error) {
        console.error("Error fetching active models:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch active models" }, { status: 500 });
    }
}

// POST - Set active model for a subcategory
export async function POST(request: NextRequest) {
    try {
        const { subcategory, modelId } = await request.json();

        if (!subcategory || !modelId) {
            return NextResponse.json({ success: false, error: "subcategory and modelId are required" }, { status: 400 });
        }

        // Verify model exists
        const model = await sql`SELECT id, name FROM ai_models WHERE id = ${modelId}`;
        if (model.length === 0) {
            return NextResponse.json({ success: false, error: "Model not found" }, { status: 404 });
        }

        // Upsert active model
        await sql`
      INSERT INTO ai_active_models (subcategory, model_id, updated_at)
      VALUES (${subcategory}, ${modelId}, NOW())
      ON CONFLICT (subcategory) 
      DO UPDATE SET model_id = ${modelId}, updated_at = NOW()
    `;

        return NextResponse.json({
            success: true,
            message: `Active model for ${subcategory} set to ${model[0].name}`
        });
    } catch (error) {
        console.error("Error setting active model:", error);
        return NextResponse.json({ success: false, error: "Failed to set active model" }, { status: 500 });
    }
}

// DELETE - Remove active model for a subcategory
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subcategory = searchParams.get("subcategory");

        if (!subcategory) {
            return NextResponse.json({ success: false, error: "subcategory is required" }, { status: 400 });
        }

        await sql`DELETE FROM ai_active_models WHERE subcategory = ${subcategory}`;

        return NextResponse.json({ success: true, message: `Active model for ${subcategory} removed` });
    } catch (error) {
        console.error("Error removing active model:", error);
        return NextResponse.json({ success: false, error: "Failed to remove active model" }, { status: 500 });
    }
}
