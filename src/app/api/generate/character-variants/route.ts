/**
 * Generate Character Variants API
 * Generate character images with style, expression, and version control
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateCharacterImage } from "@/lib/ai-media-generation";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Art style prompt modifiers
const STYLE_PROMPTS: Record<string, string> = {
    realistic: "photorealistic, cinematic lighting, 8k, detailed skin texture, professional photography",
    anime: "anime style, vibrant colors, cel shading, detailed anime art, high quality anime",
    ghibli: "studio ghibli style, miyazaki art, watercolor painting, soft colors, whimsical, hand-drawn",
    disney: "disney pixar 3D, animated movie, illumination style, expressive cartoon, CGI rendering",
    comic: "comic book style, bold outlines, dynamic shading, superhero art, ink drawing",
    cyberpunk: "cyberpunk aesthetic, neon lighting, futuristic, digital art, synthwave colors",
    painterly: "oil painting, classical art, renaissance style, brush strokes visible, museum quality",
};

// Expression prompt modifiers
const EXPRESSION_PROMPTS: Record<string, string> = {
    neutral: "neutral expression, calm face, relaxed",
    happy: "happy expression, smiling, joyful, bright eyes",
    sad: "sad expression, melancholic, tearful eyes, frown",
    angry: "angry expression, furrowed brows, intense eyes, scowling",
    surprised: "surprised expression, wide eyes, open mouth, shocked",
    scared: "scared expression, fear in eyes, worried, anxious",
    disgusted: "disgusted expression, wrinkled nose, disapproval",
    confused: "confused expression, raised eyebrow, puzzled look",
    excited: "excited expression, enthusiastic, energetic, beaming",
};

// All expressions for expression sheet
const ALL_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "scared", "disgusted", "confused", "excited"];

export interface GenerateVariantsRequest {
    userId: string;
    characterId: string;
    projectId?: string;
    projectName?: string;
    characterData: {
        name: string;
        role?: string;
        gender?: string;
        age?: string;
        ethnicity?: string;
        skinTone?: string;
        hairStyle?: string;
        hairColor?: string;
        eyeColor?: string;
        bodyType?: string;
        height?: string;
        clothingStyle?: string;
        distinguishingFeatures?: string;
    };

    // Generation options
    style: string;  // realistic, anime, ghibli, etc.
    type: "single" | "expression_sheet";

    // For single generation
    expression?: string;
    pose?: string;

    // Version naming
    versionName?: string;  // User-defined name

    // Reference
    referenceAssetId?: string;
    referenceImageUrl?: string; // Direct URL for image-to-image (e.g., from imageReferences)
    additionalPrompt?: string;
}

async function getNextVersionNumber(entityId: string, style: string): Promise<number> {
    const [result] = await sql`
        SELECT COALESCE(MAX(generation_version), 0) + 1 as next_version
        FROM generated_media
        WHERE entity_id = ${entityId} AND style_used = ${style}
    `;
    return result?.next_version || 1;
}

async function generateAutoVersionName(style: string, versionNum: number): Promise<string> {
    const styleLabel = style.charAt(0).toUpperCase() + style.slice(1);
    return `${styleLabel} v${versionNum}`;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateVariantsRequest = await request.json();
        const {
            userId,
            characterId,
            projectId,
            projectName,
            characterData,
            style = "realistic",
            type = "single",
            expression,
            versionName,
            referenceAssetId,
            referenceImageUrl,
            additionalPrompt = "",
        } = body;

        // Validate
        if (!userId || !characterId || !characterData) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get next version number for this style
        const versionNum = await getNextVersionNumber(characterId, style);
        const finalVersionName = versionName || await generateAutoVersionName(style, versionNum);

        // Build style modifier
        const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic;

        if (type === "single") {
            // Single image generation
            const expressionModifier = expression ? EXPRESSION_PROMPTS[expression.toLowerCase()] || "" : "";
            const fullPrompt = [additionalPrompt, styleModifier, expressionModifier].filter(Boolean).join(", ");

            const result = await generateCharacterImage({
                userId,
                characterId,
                projectId,
                projectName,
                characterData,
                referenceAssetId,
                referenceImageUrl,
                additionalPrompt: fullPrompt,
                style,
            });

            if (!result.success) {
                return NextResponse.json(result, { status: 400 });
            }

            // Update with version control fields
            if (result.mediaId) {
                await db.update(generatedMedia)
                    .set({
                        variantType: expression ? "expression" : "default",
                        variantName: expression || null,
                        styleUsed: style,
                        generationVersion: versionNum,
                        versionName: finalVersionName,
                    })
                    .where(eq(generatedMedia.id, result.mediaId));
            }

            return NextResponse.json({
                success: true,
                mediaIds: [result.mediaId],
                thumbnailUrls: [result.thumbnailUrl],
                versionName: finalVersionName,
                versionNumber: versionNum,
                creditCost: result.creditCost,
            });

        } else if (type === "expression_sheet") {
            // Expression sheet generation (9 images)
            const results: { mediaId: string; thumbnailUrl: string; expression: string }[] = [];
            let totalCreditCost = 0;

            for (const expr of ALL_EXPRESSIONS) {
                const expressionModifier = EXPRESSION_PROMPTS[expr];
                const fullPrompt = [additionalPrompt, styleModifier, expressionModifier].filter(Boolean).join(", ");

                const result = await generateCharacterImage({
                    userId,
                    characterId,
                    projectId,
                    projectName,
                    characterData,
                    referenceAssetId,
                    referenceImageUrl,
                    additionalPrompt: fullPrompt,
                    style,
                });

                if (result.success && result.mediaId) {
                    // Update with version control fields
                    await db.update(generatedMedia)
                        .set({
                            variantType: "expression",
                            variantName: expr,
                            styleUsed: style,
                            generationVersion: versionNum,
                            versionName: `${finalVersionName} - ${expr.charAt(0).toUpperCase() + expr.slice(1)}`,
                        })
                        .where(eq(generatedMedia.id, result.mediaId));

                    results.push({
                        mediaId: result.mediaId,
                        thumbnailUrl: result.thumbnailUrl || "",
                        expression: expr,
                    });
                    totalCreditCost += result.creditCost;
                }

                // Small delay between generations to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return NextResponse.json({
                success: true,
                type: "expression_sheet",
                mediaIds: results.map(r => r.mediaId),
                thumbnailUrls: results.map(r => r.thumbnailUrl),
                expressions: results.map(r => r.expression),
                versionName: finalVersionName,
                versionNumber: versionNum,
                creditCost: totalCreditCost,
            });
        }

        return NextResponse.json(
            { success: false, error: "Invalid generation type" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Generate variants error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Generation failed" },
            { status: 500 }
        );
    }
}

// GET - Fetch character versions grouped by style
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    const userId = searchParams.get("userId");

    if (!characterId || !userId) {
        return NextResponse.json(
            { success: false, error: "characterId and userId required" },
            { status: 400 }
        );
    }

    try {
        const media = await db.select()
            .from(generatedMedia)
            .where(and(
                eq(generatedMedia.entityType, "character"),
                eq(generatedMedia.entityId, characterId),
                eq(generatedMedia.userId, userId),
                eq(generatedMedia.isAccessible, true)
            ))
            .orderBy(desc(generatedMedia.createdAt));

        // Group by style
        const byStyle: Record<string, {
            versions: typeof media;
            primary: typeof media[0] | null;
        }> = {};

        for (const m of media) {
            const style = m.styleUsed || "realistic";
            if (!byStyle[style]) {
                byStyle[style] = { versions: [], primary: null };
            }
            byStyle[style].versions.push(m);
            if (m.isPrimaryForStyle) {
                byStyle[style].primary = m;
            }
        }

        return NextResponse.json({
            success: true,
            characterId,
            styles: byStyle,
            totalCount: media.length,
        });

    } catch (error) {
        console.error("Get character versions error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch versions" },
            { status: 500 }
        );
    }
}
