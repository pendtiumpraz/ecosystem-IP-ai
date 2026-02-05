/**
 * POST /api/ai/generate-universe-image
 * Generate image for universe field using AI (image model)
 * Following pattern from ai-media-generation.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { callAI, getActiveModelForTier, type SubscriptionTier } from "@/lib/ai-providers";
import { checkCredits, deductCredits, refundCredits } from "@/lib/ai-generation";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            projectId,
            storyId,
            fieldKey,
            levelNumber,
            prompt,
            originalDescription,
            style = "cinematic",
        } = body;

        // Validate required fields
        if (!userId || !projectId || !fieldKey || !prompt) {
            return NextResponse.json(
                { success: false, error: "userId, projectId, fieldKey, and prompt are required" },
                { status: 400 }
            );
        }

        // Get user tier
        const userResult = await sql`
            SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
        `;
        const userTier = (userResult[0]?.subscription_tier as SubscriptionTier) || "trial";

        // Get active image model
        const activeModel = await getActiveModelForTier("image", userTier);
        const creditCost = activeModel?.creditCost || 12;

        // Check credits
        const hasCredits = await checkCredits(userId, creditCost);
        if (!hasCredits) {
            return NextResponse.json(
                { success: false, error: `Insufficient credits. You need ${creditCost} credits.` },
                { status: 400 }
            );
        }

        // Get next version number
        const versionResult = await sql`
            SELECT COALESCE(MAX(version_number), 0) as max_version
            FROM universe_field_images
            WHERE project_id = ${projectId}
              AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${storyId || null}, '00000000-0000-0000-0000-000000000000')
              AND field_key = ${fieldKey}
        `;
        const nextVersionNumber = (versionResult[0]?.max_version || 0) + 1;

        // Deduct credits
        const generationId = `univ_${fieldKey}_${Date.now()}`;
        await deductCredits(
            userId,
            creditCost,
            "universe_image",
            generationId,
            `Universe: ${fieldKey} v${nextVersionNumber}`
        );

        try {
            console.log(`[UniverseImage] Generating image for ${fieldKey} v${nextVersionNumber}`);

            // Call AI for image generation
            const aiResult = await callAI("image", prompt, {
                tier: userTier,
                userId,
                aspectRatio: "16:9", // Landscape for environments
            });

            if (!aiResult.success || !aiResult.result) {
                throw new Error(aiResult.error || "AI generation failed");
            }

            const imageUrl = aiResult.result;
            console.log(`[UniverseImage] Got image URL: ${imageUrl}`);

            // Deactivate all other versions for this field
            await sql`
                UPDATE universe_field_images
                SET is_active = FALSE, updated_at = NOW()
                WHERE project_id = ${projectId}
                  AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${storyId || null}, '00000000-0000-0000-0000-000000000000')
                  AND field_key = ${fieldKey}
                  AND deleted_at IS NULL
            `;

            // Insert new version as active
            const insertResult = await sql`
                INSERT INTO universe_field_images (
                    project_id, story_id, field_key, level_number,
                    version_number, image_url, thumbnail_url,
                    enhanced_prompt, original_description, style,
                    model_used, provider, credit_cost, is_active
                ) VALUES (
                    ${projectId}, ${storyId || null}, ${fieldKey}, ${levelNumber || 0},
                    ${nextVersionNumber}, ${imageUrl}, ${imageUrl},
                    ${prompt}, ${originalDescription || null}, ${style},
                    ${activeModel?.modelId || 'unknown'}, ${aiResult.provider || 'unknown'}, ${creditCost}, TRUE
                )
                RETURNING id, version_number, image_url, is_active
            `;

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
            });

        } catch (genError: unknown) {
            // Refund credits on failure
            const errorMessage = genError instanceof Error ? genError.message : "Unknown error";
            await refundCredits(userId, creditCost, generationId, `Generation failed: ${errorMessage}`);

            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("[UniverseImage] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
