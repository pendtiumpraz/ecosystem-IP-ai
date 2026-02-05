import { NextRequest, NextResponse } from "next/server";
import { callAI, getActiveModelForTier } from "@/lib/ai-providers";
import { checkCredits, deductCredits, refundCredits } from "@/lib/ai-generation";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
  if (!userId) return "trial";
  const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

// Image generation using AI providers (ModelsLab SeedDream, DALL-E, etc)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      style = "cinematic",
      width = 1024,
      height = 1024,
      referenceImageUrl,
      referenceImageUrls,
      strength = 0.65,
      metadata = {}
    } = body;

    const userId = metadata.userId;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get user tier
    const tier = await getUserTier(userId);

    // Determine if this is image-to-image or text-to-image
    // Use i2i if single reference OR multiple reference images provided
    const hasReferenceImages = !!referenceImageUrl || (Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0);
    const isI2I = hasReferenceImages;
    const aiType = isI2I ? "image-to-image" : "image";

    // Get active model to check credit cost
    const activeModel = await getActiveModelForTier(aiType, tier);
    const creditCost = activeModel?.creditCost || 12;

    // Check credits if userId provided
    if (userId) {
      const hasCredits = await checkCredits(userId, creditCost);
      if (!hasCredits) {
        return NextResponse.json({
          success: false,
          error: `Insufficient credits. You need ${creditCost} credits.`,
          creditCost: 0,
        }, { status: 402 });
      }
    }

    // Build enhanced prompt
    const fullPrompt = style ? `${style} style: ${prompt}` : prompt;

    // Prepare options
    const options: Record<string, unknown> = {
      tier,
      userId,
      aspectRatio: width === height ? "1:1" : (width > height ? "16:9" : "9:16"),
    };

    // Add reference images for i2i
    if (isI2I) {
      // Single reference image has priority (protagonist image)
      if (referenceImageUrl) {
        options.referenceImageUrl = referenceImageUrl;
        options.referenceImage = referenceImageUrl;
      } else if (referenceImageUrls && referenceImageUrls.length > 0) {
        // Use first uploaded reference image as primary
        options.referenceImageUrl = referenceImageUrls[0];
        options.referenceImage = referenceImageUrls[0];
      }
      // Pass all reference URLs for providers that support multiple
      if (referenceImageUrls && referenceImageUrls.length > 0) {
        options.referenceImageUrls = referenceImageUrls;
      }
      options.strength = strength;
    }

    // Deduct credits before generation
    const generationId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (userId) {
      await deductCredits(
        userId,
        creditCost,
        isI2I ? "image_to_image" : "text_to_image",
        generationId,
        `Image generation: ${prompt.slice(0, 50)}...`
      );
    }

    console.log(`[API] Generating ${aiType} with prompt: ${fullPrompt.slice(0, 100)}...`);

    // Call AI
    const aiResult = await callAI(aiType, fullPrompt, options);

    if (!aiResult.success || !aiResult.result) {
      // Refund credits on failure
      if (userId) {
        await refundCredits(userId, creditCost, generationId, `Generation failed: ${aiResult.error}`);
      }
      console.error("[API] AI generation failed:", aiResult.error);
      return NextResponse.json({
        success: false,
        error: aiResult.error || "Image generation failed",
        creditCost: 0,
      }, { status: 500 });
    }

    console.log(`[API] Generation successful, URL: ${aiResult.result}`);

    return NextResponse.json({
      success: true,
      imageUrl: aiResult.result,
      url: aiResult.result, // Alias for compatibility
      isPlaceholder: false,
      creditCost,
      provider: aiResult.provider,
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
