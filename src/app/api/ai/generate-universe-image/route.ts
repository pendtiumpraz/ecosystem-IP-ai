/**
 * POST /api/ai/generate-universe-image
 * Generate image for universe field using AI (image model)
 * Following pattern from generate-image/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { callAI, getActiveModelForTier } from "@/lib/ai-providers";
import { checkCredits, deductCredits, refundCredits } from "@/lib/ai-generation";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    try {
        const result = await sql`
      SELECT subscription_tier FROM users WHERE id = ${userId}::uuid AND deleted_at IS NULL
    `;
        return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
    } catch (e) {
        console.error("[UniverseImage] Error getting user tier:", e);
        return "trial";
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            projectId,
            storyId,
            fieldKey,
            levelNumber = 0,
            prompt,
            originalDescription,
            style = "cinematic",
        } = body;

        console.log("[UniverseImage] Request:", { userId, projectId, fieldKey, storyId });

        // Validate required fields
        if (!userId || !projectId || !fieldKey || !prompt) {
            return NextResponse.json(
                { success: false, error: "userId, projectId, fieldKey, and prompt are required" },
                { status: 400 }
            );
        }

        // Get user tier
        const tier = await getUserTier(userId);
        console.log("[UniverseImage] User tier:", tier);

        // Get active image model to check credit cost
        const activeModel = await getActiveModelForTier("image", tier);
        const creditCost = activeModel?.creditCost || 12;
        console.log("[UniverseImage] Credit cost:", creditCost);

        // Check credits
        const hasCredits = await checkCredits(userId, creditCost);
        if (!hasCredits) {
            return NextResponse.json(
                { success: false, error: `Insufficient credits. You need ${creditCost} credits.` },
                { status: 402 }
            );
        }

        // Get next version number for this field
        let nextVersionNumber = 1;
        try {
            const versionResult = storyId
                ? await sql`
                    SELECT COALESCE(MAX(version_number), 0) as max_version
                    FROM universe_field_images
                    WHERE project_id = ${projectId}::uuid
                      AND story_id = ${storyId}::uuid
                      AND field_key = ${fieldKey}
                  `
                : await sql`
                    SELECT COALESCE(MAX(version_number), 0) as max_version
                    FROM universe_field_images
                    WHERE project_id = ${projectId}::uuid
                      AND story_id IS NULL
                      AND field_key = ${fieldKey}
                  `;
            nextVersionNumber = (versionResult[0]?.max_version || 0) + 1;
        } catch (e) {
            console.error("[UniverseImage] Error getting version:", e);
        }
        console.log("[UniverseImage] Next version:", nextVersionNumber);

        // Build enhanced prompt
        const fullPrompt = style ? `${style} style: ${prompt}` : prompt;

        // Deduct credits before generation
        const generationId = `univ_${fieldKey}_${Date.now()}`;
        await deductCredits(
            userId,
            creditCost,
            "universe_image",
            generationId,
            `Universe: ${fieldKey} v${nextVersionNumber}`
        );
        console.log("[UniverseImage] Credits deducted");

        // Call AI for image generation
        console.log("[UniverseImage] Calling AI...");
        const aiResult = await callAI("image", fullPrompt, {
            tier,
            userId,
            aspectRatio: "16:9", // Landscape for environments
        });

        if (!aiResult.success || !aiResult.result) {
            // Refund credits on failure
            await refundCredits(userId, creditCost, generationId, `Generation failed: ${aiResult.error}`);
            console.error("[UniverseImage] AI generation failed:", aiResult.error);
            return NextResponse.json({
                success: false,
                error: aiResult.error || "Image generation failed",
                creditCost: 0,
            }, { status: 500 });
        }

        const imageUrl = aiResult.result;
        console.log("[UniverseImage] Got image URL:", imageUrl?.slice(0, 50) + "...");

        // Deactivate all other versions for this field
        if (storyId) {
            await sql`
                UPDATE universe_field_images
                SET is_active = FALSE, updated_at = NOW()
                WHERE project_id = ${projectId}::uuid
                  AND story_id = ${storyId}::uuid
                  AND field_key = ${fieldKey}
                  AND deleted_at IS NULL
            `;
        } else {
            await sql`
                UPDATE universe_field_images
                SET is_active = FALSE, updated_at = NOW()
                WHERE project_id = ${projectId}::uuid
                  AND story_id IS NULL
                  AND field_key = ${fieldKey}
                  AND deleted_at IS NULL
            `;
        }

        // Insert new version as active
        const insertResult = await sql`
            INSERT INTO universe_field_images (
                project_id, story_id, field_key, level_number,
                version_number, image_url, thumbnail_url,
                enhanced_prompt, original_description, style,
                model_used, provider, credit_cost, is_active
            ) VALUES (
                ${projectId}::uuid, ${storyId ? storyId : null}::uuid, ${fieldKey}, ${levelNumber},
                ${nextVersionNumber}, ${imageUrl}, ${imageUrl},
                ${prompt}, ${originalDescription || null}, ${style},
                ${activeModel?.modelId || 'unknown'}, ${aiResult.provider || 'unknown'}, ${creditCost}, TRUE
            )
            RETURNING id, version_number, image_url, is_active
        `;

        console.log("[UniverseImage] Image saved to database");

        return NextResponse.json({
            success: true,
            image: {
                id: insertResult[0].id,
                versionNumber: insertResult[0].version_number,
                imageUrl: insertResult[0].image_url,
                isActive: insertResult[0].is_active,
                fieldKey,
                creditCost,
            },
            provider: aiResult.provider,
        });

    } catch (error) {
        console.error("[UniverseImage] Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, error: `Internal server error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
