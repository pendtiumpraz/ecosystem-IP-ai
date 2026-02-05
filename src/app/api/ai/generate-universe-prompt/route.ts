/**
 * POST /api/ai/generate-universe-prompt
 * Generate enhanced prompt for universe field using AI (text model)
 */

import { NextRequest, NextResponse } from "next/server";
import { callAI, getActiveModelForTier, type SubscriptionTier } from "@/lib/ai-providers";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// System prompt for enhancing universe field descriptions into image prompts
const SYSTEM_PROMPT = `You are an expert visual prompt engineer specializing in cinematic world-building imagery.
Your task is to take a description of a universe/world element and transform it into a detailed, evocative image generation prompt.

Output ONLY valid JSON with this structure:
{
  "scene": "Main scene description",
  "setting": "Time of day, weather, season",
  "lighting": "Light sources, shadows, mood lighting details",
  "camera": "Camera angle and perspective (e.g., wide establishing shot, aerial view)",
  "atmosphere": "Mood, feeling, ambiance",
  "elements": ["key visual element 1", "key visual element 2", "..."],
  "colorPalette": "Primary colors and tones",
  "style": "Art style (cinematic, concept art, matte painting)",
  "mood": "Emotional tone",
  "details": "Technical quality specs",
  "enhancedPrompt": "Full combined prompt ready for image generation"
}

The enhancedPrompt should be a single string that combines all elements into a cohesive, detailed prompt suitable for AI image generation.
Make it cinematic, visually stunning, and rich with specific details.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            projectId,
            fieldKey,
            levelNumber,
            fieldLabel,
            description,
            universeName,
            period,
            levelName,
        } = body;

        // Validate required fields
        if (!userId || !projectId || !fieldKey || !description) {
            return NextResponse.json(
                { success: false, error: "userId, projectId, fieldKey, and description are required" },
                { status: 400 }
            );
        }

        // Get user tier
        const userResult = await sql`
            SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
        `;
        const userTier = (userResult[0]?.subscription_tier as SubscriptionTier) || "trial";

        // Build the prompt for AI
        const userPrompt = `Transform this universe element into a cinematic image prompt:

Universe: ${universeName || "Unknown Universe"}
Era/Period: ${period || "Unspecified"}
Level: ${levelNumber} - ${levelName || "Unknown Level"}
Field: ${fieldLabel || fieldKey}

Description to visualize:
"${description}"

Create a detailed, atmospheric image prompt that captures the essence of this place/setting.
Focus on mood, lighting, and visual storytelling. Make it feel like a frame from a high-budget film or concept art for a AAA game.`;

        console.log(`[UniversePrompt] Generating enhanced prompt for ${fieldKey}`);

        // Call AI for text generation
        const result = await callAI("text", userPrompt, {
            tier: userTier,
            userId,
            systemPrompt: SYSTEM_PROMPT,
            maxTokens: 1500,
            temperature: 0.8,
        });

        if (!result.success || !result.result) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to generate prompt" },
                { status: 500 }
            );
        }

        // Parse and validate JSON response
        let promptData;
        try {
            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = result.result;
            if (jsonStr.includes("```json")) {
                jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");
            } else if (jsonStr.includes("```")) {
                jsonStr = jsonStr.replace(/```\s*/g, "");
            }
            promptData = JSON.parse(jsonStr.trim());
        } catch (parseError) {
            console.error("[UniversePrompt] Failed to parse AI response:", result.result);
            // Fallback: use the raw result as the enhanced prompt
            promptData = {
                scene: description,
                enhancedPrompt: `${description}, cinematic lighting, 8k quality, detailed environment, atmospheric, ${universeName || ""} aesthetic, ${period || ""} era`,
            };
        }

        return NextResponse.json({
            success: true,
            promptData,
            enhancedPrompt: promptData.enhancedPrompt || promptData.scene,
            creditCost: result.creditCost || 0,
            provider: result.provider,
        });

    } catch (error) {
        console.error("[UniversePrompt] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
