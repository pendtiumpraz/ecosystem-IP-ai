/**
 * Character Image Generation Service
 * - Generate character images using AI
 * - Upload to Google Drive
 * - Save to generated_media table
 * - Support for Image-to-Image (reference images)
 */

import { db } from "@/db";
import { generatedMedia, type NewGeneratedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
    getOrCreateModoFolder,
    getOrCreateProjectFolder,
    uploadFileToDrive,
    refreshAccessToken,
    generateDriveUrls,
} from "./google-drive";
import { callAI, getActiveModelForTier, type SubscriptionTier } from "./ai-providers";
import { checkCredits, deductCredits, refundCredits } from "./ai-generation";
import { downloadAssetForGeneration } from "./asset-link-service";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ============ TYPES ============

export interface CharacterGenerationRequest {
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
    referenceAssetId?: string; // For Image-to-Image
    additionalPrompt?: string;
    style?: string;
}

export interface GenerationResult {
    success: boolean;
    mediaId?: string;
    thumbnailUrl?: string;
    publicUrl?: string;
    creditCost: number;
    error?: string;
}

// ============ CHARACTER IMAGE GENERATION ============

/**
 * Generate character image using AI
 */
export async function generateCharacterImage(
    request: CharacterGenerationRequest
): Promise<GenerationResult> {
    const {
        userId,
        characterId,
        projectId,
        projectName,
        characterData,
        referenceAssetId,
        additionalPrompt,
        style = "realistic"
    } = request;

    // Get user tier and model
    const userTier = await getUserTier(userId);
    const activeModel = await getActiveModelForTier("image", userTier);

    const creditCost = activeModel?.creditCost || 12;

    // 1. Check credits
    const hasCredits = await checkCredits(userId, creditCost);
    if (!hasCredits) {
        return {
            success: false,
            creditCost: 0,
            error: `Insufficient credits. You need ${creditCost} credits.`
        };
    }

    // 2. Build prompt from ALL character details
    const prompt = buildCharacterPrompt(characterData, style, additionalPrompt);
    console.log(`[AI] Character prompt built: ${prompt.substring(0, 200)}...`);

    // 3. Get reference image - either from provided ID or auto-fetch primary asset
    let referenceImageBase64: string | undefined;
    let actualReferenceAssetId = referenceAssetId;

    // If no reference provided, try to get primary asset from AssetGallery
    if (!actualReferenceAssetId) {
        const [primaryAsset] = await db.select()
            .from(generatedMedia)
            .where(and(
                eq(generatedMedia.entityType, "character"),
                eq(generatedMedia.entityId, characterId),
                eq(generatedMedia.isPrimary, true),
                eq(generatedMedia.isAccessible, true)
            ))
            .limit(1);

        if (primaryAsset) {
            actualReferenceAssetId = primaryAsset.id;
            console.log(`[AI] Auto-using primary asset as reference: ${primaryAsset.id}`);
        }
    }

    // Download reference image if we have one
    if (actualReferenceAssetId) {
        const refResult = await downloadAssetForGeneration(actualReferenceAssetId);
        if (refResult.success && refResult.base64) {
            referenceImageBase64 = `data:${refResult.mimeType};base64,${refResult.base64}`;
            console.log(`[AI] Reference image loaded, size: ${refResult.base64.length} bytes`);
        } else {
            console.warn(`[AI] Failed to load reference image: ${refResult.error}`);
        }
    }

    // 4. Deduct credits
    const generationId = `char_${characterId}_${Date.now()}`;
    await deductCredits(
        userId,
        creditCost,
        "character_image",
        generationId,
        `Character image: ${characterData.name}`
    );

    try {
        // 5. Call AI
        const aiType = referenceImageBase64 ? "image-to-image" : "text-to-image";
        const options: Record<string, unknown> = {
            tier: userTier,
            userId,
            referenceImage: referenceImageBase64,
        };

        const aiResult = await callAI(aiType as "image", prompt, options);

        if (!aiResult.success || !aiResult.result) {
            throw new Error(aiResult.error || "AI generation failed");
        }

        const aiGeneratedUrl = aiResult.result;
        console.log(`[AI] Got image URL from AI: ${aiGeneratedUrl}`);

        // 6. Try to download and upload to Google Drive (optional, graceful fallback)
        let finalUrl = aiGeneratedUrl; // Fallback to AI URL
        let thumbnailUrl = aiGeneratedUrl;
        let driveFileId: string | null = null;
        let driveWebViewLink: string | null = null;
        let fileSizeBytes = 0;
        let mimeType = "image/png";

        try {
            const imageResponse = await fetch(aiGeneratedUrl);
            if (imageResponse.ok) {
                const imageBlob = await imageResponse.blob();
                const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
                mimeType = imageResponse.headers.get("content-type") || "image/png";
                fileSizeBytes = imageBuffer.length;

                // 7. Try to upload to Google Drive
                const driveResult = await uploadToUserDrive(
                    userId,
                    imageBuffer,
                    `character_${characterData.name}_${Date.now()}.png`,
                    mimeType,
                    projectName
                );

                if (driveResult) {
                    const urls = generateDriveUrls(driveResult.fileId);
                    finalUrl = urls.publicUrl;
                    thumbnailUrl = urls.thumbnailUrl;
                    driveFileId = driveResult.fileId;
                    driveWebViewLink = driveResult.webViewLink;
                    console.log(`[AI] Uploaded to Google Drive: ${driveResult.fileId}`);
                } else {
                    console.warn("[AI] Google Drive upload failed, using AI URL as fallback");
                }
            }
        } catch (uploadError) {
            console.warn("[AI] Failed to process image for Drive, using AI URL:", uploadError);
        }

        // 8. Save to generated_media table (always save, even without Drive)
        const [media] = await db.insert(generatedMedia).values({
            userId,
            projectId,
            entityType: "character",
            entityId: characterId,
            mediaType: "image",
            fileName: `character_${characterData.name}_${Date.now()}.png`,
            mimeType,
            fileSizeBytes,
            sourceType: "generated",
            driveFileId,
            driveWebViewLink,
            downloadUrl: finalUrl,
            thumbnailUrl,
            publicUrl: finalUrl,
            modelUsed: activeModel?.modelId || "unknown",
            promptUsed: prompt,
            creditsUsed: creditCost,
            isAccessible: true,
            lastCheckedAt: new Date(),
        }).returning();

        return {
            success: true,
            mediaId: media.id,
            thumbnailUrl,
            publicUrl: finalUrl,
            creditCost,
        };

    } catch (error: unknown) {
        // Refund credits
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await refundCredits(userId, creditCost, generationId, `Generation failed: ${errorMessage}`);

        return {
            success: false,
            creditCost: 0,
            error: errorMessage,
        };
    }
}

// ============ MOODBOARD IMAGE GENERATION ============

export interface MoodboardGenerationRequest {
    userId: string;
    moodboardId: string;
    projectId?: string;
    projectName?: string;
    beatName: string;
    prompt: string;
    style?: string;
    referenceAssetId?: string;
    // Character-based generation
    characterId?: string;           // If provided, use character's active image version for image2image
    characterImageUrl?: string;     // Direct URL to character's active image version
    characterDetails?: string;      // Character description for text prompt enhancement
}

/**
 * Generate moodboard image using AI
 * - If characterImageUrl provided: use image2image with character as reference
 * - If no character image but characterDetails: enhance prompt with character description
 * - Otherwise: standard text2image
 */
export async function generateMoodboardImage(
    request: MoodboardGenerationRequest
): Promise<GenerationResult> {
    const {
        userId,
        moodboardId,
        projectId,
        projectName,
        beatName,
        prompt,
        style = "cinematic",
        referenceAssetId,
        characterImageUrl,
        characterDetails
    } = request;

    // Get user tier and model
    const userTier = await getUserTier(userId);
    const activeModel = await getActiveModelForTier("image", userTier);

    const creditCost = activeModel?.creditCost || 12;

    // 1. Check credits
    const hasCredits = await checkCredits(userId, creditCost);
    if (!hasCredits) {
        return {
            success: false,
            creditCost: 0,
            error: `Insufficient credits. You need ${creditCost} credits.`
        };
    }

    // 2. Build prompt - enhance with character details if provided
    let enhancedPrompt = prompt;
    if (characterDetails) {
        enhancedPrompt = `${prompt}\n\nCharacter in scene: ${characterDetails}`;
    }
    const fullPrompt = buildMoodboardPrompt(enhancedPrompt, style);

    // 3. Determine reference image for image2image
    // ModelsLab accepts URLs directly, so pass URL when available
    let referenceImageUrl: string | undefined;
    let referenceImageBase64: string | undefined;

    // Priority: characterImageUrl > referenceAssetId
    if (characterImageUrl) {
        // Use URL directly for ModelsLab I2I
        referenceImageUrl = characterImageUrl;
        console.log(`[MOODBOARD] Using character image URL for I2I: ${characterImageUrl}`);
    } else if (referenceAssetId) {
        // Fallback to reference asset - need to download and convert to base64
        const refResult = await downloadAssetForGeneration(referenceAssetId);
        if (refResult.success && refResult.base64) {
            referenceImageBase64 = `data:${refResult.mimeType};base64,${refResult.base64}`;
        }
    }

    // 4. Deduct credits - generationId must fit in varchar(36)
    const shortId = moodboardId.slice(-8); // Last 8 chars of UUID
    const timestamp = Date.now().toString(36); // Base36 timestamp (shorter)
    const generationId = `m_${shortId}_${timestamp}`; // ~20 chars max
    await deductCredits(
        userId,
        creditCost,
        "moodboard_image",
        generationId,
        `Moodboard: ${beatName}${referenceImageUrl ? ' (I2I)' : ''}`
    );

    try {
        // 5. Call AI - use image2image if we have reference, otherwise text2image
        const hasReference = referenceImageUrl || referenceImageBase64;
        const aiType = hasReference ? "image-to-image" : "image";
        const options: Record<string, unknown> = {
            tier: userTier,
            userId,
            referenceImage: referenceImageUrl || referenceImageBase64, // Prefer URL
            referenceImageUrl, // Pass URL separately for providers that need it
        };

        console.log(`[MOODBOARD] Generating with ${aiType}, hasRef: ${!!hasReference}`);

        const aiResult = await callAI(aiType, fullPrompt, options);

        if (!aiResult.success || !aiResult.result) {
            throw new Error(aiResult.error || "AI generation failed");
        }

        // 6. Download image from AI result URL
        const imageResponse = await fetch(aiResult.result);
        const imageBlob = await imageResponse.blob();
        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
        const mimeType = imageResponse.headers.get("content-type") || "image/png";

        // 7. Upload to Google Drive
        const driveResult = await uploadToUserDrive(
            userId,
            imageBuffer,
            `moodboard_${beatName}_${Date.now()}.png`,
            mimeType,
            projectName
        );

        if (!driveResult) {
            throw new Error("Failed to upload to Google Drive");
        }

        // 8. Generate URLs
        const urls = generateDriveUrls(driveResult.fileId);

        // 9. Save to generated_media table
        const [media] = await db.insert(generatedMedia).values({
            userId,
            projectId,
            entityType: "moodboard",
            entityId: moodboardId,
            mediaType: "image",
            fileName: `moodboard_${beatName}_${Date.now()}.png`,
            mimeType,
            fileSizeBytes: imageBuffer.length,
            sourceType: "generated",
            driveFileId: driveResult.fileId,
            driveWebViewLink: driveResult.webViewLink,
            downloadUrl: urls.downloadUrl,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,
            modelUsed: activeModel?.modelId || "unknown",
            promptUsed: fullPrompt,
            creditsUsed: creditCost,
            isAccessible: true,
            lastCheckedAt: new Date(),
        }).returning();

        return {
            success: true,
            mediaId: media.id,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,
            creditCost,
        };

    } catch (error: unknown) {
        // Refund credits
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await refundCredits(userId, creditCost, generationId, `Generation failed: ${errorMessage}`);

        return {
            success: false,
            creditCost: 0,
            error: errorMessage,
        };
    }
}

// ============ ANIMATION (I2V) GENERATION ============

export interface AnimationGenerationRequest {
    userId: string;
    animationId: string;
    projectId?: string;
    projectName?: string;
    sourceAssetId: string; // Required - image to animate
    motionPrompt: string;
    duration?: number; // seconds
}

/**
 * Generate animation from image using AI (Image-to-Video)
 */
export async function generateAnimation(
    request: AnimationGenerationRequest
): Promise<GenerationResult> {
    const {
        userId,
        animationId,
        projectId,
        projectName,
        sourceAssetId,
        motionPrompt,
        duration = 5
    } = request;

    // Get user tier and model
    const userTier = await getUserTier(userId);
    const activeModel = await getActiveModelForTier("video", userTier);

    const creditCost = activeModel?.creditCost || 50;

    // 1. Check credits
    const hasCredits = await checkCredits(userId, creditCost);
    if (!hasCredits) {
        return {
            success: false,
            creditCost: 0,
            error: `Insufficient credits. You need ${creditCost} credits.`
        };
    }

    // 2. Download source image
    const sourceResult = await downloadAssetForGeneration(sourceAssetId);
    if (!sourceResult.success || !sourceResult.base64) {
        return {
            success: false,
            creditCost: 0,
            error: "Failed to download source image"
        };
    }

    const sourceImageBase64 = `data:${sourceResult.mimeType};base64,${sourceResult.base64}`;

    // 3. Deduct credits
    const generationId = `anim_${animationId}_${Date.now()}`;
    await deductCredits(
        userId,
        creditCost,
        "animation",
        generationId,
        `Animation from image`
    );

    try {
        // 4. Call AI
        const options: Record<string, unknown> = {
            tier: userTier,
            userId,
            sourceImage: sourceImageBase64,
            duration,
        };

        const aiResult = await callAI("video", motionPrompt, options);

        if (!aiResult.success || !aiResult.result) {
            throw new Error(aiResult.error || "AI generation failed");
        }

        // 5. Download video from AI result URL
        const videoResponse = await fetch(aiResult.result);
        const videoBlob = await videoResponse.blob();
        const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
        const mimeType = videoResponse.headers.get("content-type") || "video/mp4";

        // 6. Upload to Google Drive
        const driveResult = await uploadToUserDrive(
            userId,
            videoBuffer,
            `animation_${Date.now()}.mp4`,
            mimeType,
            projectName
        );

        if (!driveResult) {
            throw new Error("Failed to upload to Google Drive");
        }

        // 7. Generate URLs
        const urls = generateDriveUrls(driveResult.fileId);

        // 8. Save to generated_media table
        const [media] = await db.insert(generatedMedia).values({
            userId,
            projectId,
            entityType: "animation",
            entityId: animationId,
            mediaType: "video",
            fileName: `animation_${Date.now()}.mp4`,
            mimeType,
            fileSizeBytes: videoBuffer.length,
            sourceType: "generated",
            driveFileId: driveResult.fileId,
            driveWebViewLink: driveResult.webViewLink,
            downloadUrl: urls.downloadUrl,
            thumbnailUrl: urls.thumbnailUrl, // Won't show for video but store anyway
            publicUrl: urls.publicUrl,
            modelUsed: activeModel?.modelId || "unknown",
            promptUsed: motionPrompt,
            creditsUsed: creditCost,
            isAccessible: true,
            lastCheckedAt: new Date(),
        }).returning();

        return {
            success: true,
            mediaId: media.id,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,
            creditCost,
        };

    } catch (error: unknown) {
        // Refund credits
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await refundCredits(userId, creditCost, generationId, `Generation failed: ${errorMessage}`);

        return {
            success: false,
            creditCost: 0,
            error: errorMessage,
        };
    }
}

// ============ HELPER FUNCTIONS ============

/**
 * Get user's subscription tier
 */
async function getUserTier(userId: string): Promise<SubscriptionTier> {
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as SubscriptionTier) || "trial";
}

/**
 * Upload to user's Google Drive
 */
async function uploadToUserDrive(
    userId: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    projectName?: string
): Promise<{ fileId: string; webViewLink: string } | null> {
    // Get user's Google Drive tokens
    const tokens = await sql`
    SELECT * FROM user_google_drive_tokens WHERE user_id = ${userId} AND is_active = true
  `;

    if (tokens.length === 0) {
        // Fallback to legacy user_google_tokens table
        const legacyTokens = await sql`
      SELECT * FROM user_google_tokens WHERE user_id = ${userId}
    `;

        if (legacyTokens.length === 0) {
            console.warn(`No Google Drive tokens for user ${userId}`);
            return null;
        }

        // Use legacy tokens
        const token = legacyTokens[0];
        let accessToken = token.access_token;

        // Check if expired
        if (new Date(token.expires_at) <= new Date()) {
            if (!token.refresh_token) return null;

            try {
                const newTokens = await refreshAccessToken(token.refresh_token);
                accessToken = newTokens.accessToken;

                // Update legacy token
                await sql`
          UPDATE user_google_tokens 
          SET access_token = ${newTokens.accessToken}, 
              expires_at = ${new Date(newTokens.expiresAt).toISOString()},
              updated_at = NOW()
          WHERE user_id = ${userId}
        `;
            } catch (e) {
                console.error("Failed to refresh legacy Google token:", e);
                return null;
            }
        }

        return await performDriveUpload(accessToken, buffer, fileName, mimeType, projectName);
    }

    const tokenData = tokens[0];
    let accessToken = tokenData.access_token;

    // Check if token is expired
    if (new Date(tokenData.token_expires_at) <= new Date()) {
        if (!tokenData.refresh_token) return null;

        try {
            const newTokens = await refreshAccessToken(tokenData.refresh_token);
            accessToken = newTokens.accessToken;

            // Update in database
            await sql`
        UPDATE user_google_drive_tokens 
        SET access_token = ${newTokens.accessToken}, 
            token_expires_at = ${new Date(newTokens.expiresAt).toISOString()},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
        } catch (e) {
            console.error("Failed to refresh Google token:", e);
            return null;
        }
    }

    return await performDriveUpload(accessToken, buffer, fileName, mimeType, projectName);
}

/**
 * Perform actual upload to Drive
 */
async function performDriveUpload(
    accessToken: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    projectName?: string
): Promise<{ fileId: string; webViewLink: string } | null> {
    try {
        // Get or create MODO folder
        const modoFolderId = await getOrCreateModoFolder(accessToken);

        // Get or create project folder if project name provided
        let targetFolderId = modoFolderId;
        if (projectName) {
            targetFolderId = await getOrCreateProjectFolder(accessToken, modoFolderId, projectName);
        }

        // Upload file
        const file = await uploadFileToDrive(accessToken, targetFolderId, fileName, buffer, mimeType);

        return {
            fileId: file.id,
            webViewLink: file.webViewLink,
        };
    } catch (e) {
        console.error("Failed to upload to Google Drive:", e);
        return null;
    }
}

/**
 * Build character image prompt
 */
function buildCharacterPrompt(
    character: CharacterGenerationRequest["characterData"],
    style: string,
    additionalPrompt?: string
): string {
    const parts: string[] = [];

    // Style
    parts.push(`${style} style portrait of`);

    // Physical description
    if (character.gender) parts.push(character.gender);
    if (character.age) parts.push(`${character.age} years old`);
    if (character.ethnicity) parts.push(character.ethnicity);

    parts.push("person");

    // Physical features
    if (character.skinTone) parts.push(`with ${character.skinTone} skin`);
    if (character.hairStyle && character.hairColor) {
        parts.push(`${character.hairColor} ${character.hairStyle} hair`);
    }
    if (character.eyeColor) parts.push(`${character.eyeColor} eyes`);
    if (character.bodyType) parts.push(`${character.bodyType} build`);

    // Clothing
    if (character.clothingStyle) parts.push(`wearing ${character.clothingStyle}`);

    // Distinguishing features
    if (character.distinguishingFeatures) parts.push(character.distinguishingFeatures);

    // Additional prompt
    if (additionalPrompt) parts.push(additionalPrompt);

    // Quality tags
    parts.push("highly detailed, professional lighting, 8k quality");

    return parts.join(", ");
}

/**
 * Build moodboard image prompt
 */
function buildMoodboardPrompt(basePrompt: string, style: string): string {
    const styleMap: Record<string, string> = {
        cinematic: "cinematic lighting, film still, movie scene, dramatic composition",
        anime: "anime style, vibrant colors, detailed anime art",
        realistic: "photorealistic, ultra realistic, highly detailed",
        concept_art: "concept art, digital painting, artstation",
        illustration: "illustration, detailed artwork, artistic style",
        painterly: "painterly style, brush strokes, artistic rendering",
    };

    const stylePrompt = styleMap[style] || styleMap.cinematic;
    return `${basePrompt}, ${stylePrompt}, 8k quality, masterpiece`;
}
