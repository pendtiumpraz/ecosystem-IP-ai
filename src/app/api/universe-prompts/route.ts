/**
 * Universe Prompts API
 * GET - Load prompts for a project/story
 * POST - Save/update prompt for a field
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Load all prompts for a project/story
export async function GET(request: NextRequest) {
    try {
        const projectId = request.nextUrl.searchParams.get("projectId");
        const storyId = request.nextUrl.searchParams.get("storyId");

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: "projectId is required" },
                { status: 400 }
            );
        }

        let prompts;
        if (storyId) {
            prompts = await sql`
                SELECT * FROM universe_field_prompts
                WHERE project_id = ${projectId}::uuid
                  AND story_id = ${storyId}::uuid
                ORDER BY field_key
            `;
        } else {
            prompts = await sql`
                SELECT * FROM universe_field_prompts
                WHERE project_id = ${projectId}::uuid
                  AND story_id IS NULL
                ORDER BY field_key
            `;
        }

        // Convert to Record<string, {prompt, reference}>
        const promptsRecord: Record<string, {
            prompt: string;
            reference: string;
            originalDescription?: string;
        }> = {};

        for (const p of prompts) {
            promptsRecord[p.field_key] = {
                prompt: p.enhanced_prompt || '',
                reference: p.prompt_reference || '',
                originalDescription: p.original_description,
            };
        }

        return NextResponse.json({
            success: true,
            prompts: promptsRecord,
            total: prompts.length,
        });

    } catch (error) {
        console.error("[UniversePrompts] GET Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch prompts" },
            { status: 500 }
        );
    }
}

// POST - Save/update prompt for a field
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            storyId,
            fieldKey,
            levelNumber,
            enhancedPrompt,
            promptReference,
            originalDescription,
            modelUsed,
            provider,
        } = body;

        if (!projectId || !fieldKey) {
            return NextResponse.json(
                { success: false, error: "projectId and fieldKey are required" },
                { status: 400 }
            );
        }

        // Check if prompt exists
        let existing;
        if (storyId) {
            existing = await sql`
                SELECT id FROM universe_field_prompts
                WHERE project_id = ${projectId}::uuid
                  AND story_id = ${storyId}::uuid
                  AND field_key = ${fieldKey}
                LIMIT 1
            `;
        } else {
            existing = await sql`
                SELECT id FROM universe_field_prompts
                WHERE project_id = ${projectId}::uuid
                  AND story_id IS NULL
                  AND field_key = ${fieldKey}
                LIMIT 1
            `;
        }

        let result;

        if (existing.length > 0) {
            // Update existing
            result = await sql`
                UPDATE universe_field_prompts SET
                    enhanced_prompt = ${enhancedPrompt || null},
                    prompt_reference = ${promptReference || null},
                    original_description = ${originalDescription || null},
                    model_used = COALESCE(${modelUsed || null}, model_used),
                    provider = COALESCE(${provider || null}, provider),
                    updated_at = NOW()
                WHERE id = ${existing[0].id}
                RETURNING id, field_key, enhanced_prompt, prompt_reference
            `;
        } else {
            // Insert new
            result = await sql`
                INSERT INTO universe_field_prompts (
                    project_id, story_id, field_key, level_number,
                    enhanced_prompt, prompt_reference, original_description,
                    model_used, provider
                ) VALUES (
                    ${projectId}::uuid, ${storyId ? storyId : null}::uuid, ${fieldKey}, ${levelNumber || 0},
                    ${enhancedPrompt || null}, ${promptReference || null}, ${originalDescription || null},
                    ${modelUsed || null}, ${provider || null}
                )
                RETURNING id, field_key, enhanced_prompt, prompt_reference
            `;
        }

        return NextResponse.json({
            success: true,
            prompt: {
                id: result[0].id,
                fieldKey: result[0].field_key,
                enhancedPrompt: result[0].enhanced_prompt,
                promptReference: result[0].prompt_reference,
            },
        });

    } catch (error) {
        console.error("[UniversePrompts] POST Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save prompt" },
            { status: 500 }
        );
    }
}
