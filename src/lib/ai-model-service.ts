/**
 * AI Model Service
 * Helper functions for getting active models per subcategory
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// All subcategories available in the system
export const AI_SUBCATEGORIES = [
    // LLM
    "llm",
    // Image
    "text-to-image",
    "image-to-image",
    "inpainting",
    "upscaling",
    "face-swap",
    "interior",
    // Video
    "text-to-video",
    "image-to-video",
    "face-swap-video",
    "video-editing",
    // Audio
    "text-to-speech",
    "voice-cloning",
    "text-to-music",
    // 3D
    "text-to-3d",
    "image-to-3d",
] as const;

export type AISubcategory = typeof AI_SUBCATEGORIES[number];

export interface ActiveModelInfo {
    id: string;
    subcategory: string;
    modelId: string;
    modelName: string;
    modelApiId: string; // The actual API model identifier (e.g., "gpt-4o-mini", "text-to-image")
    modelType: string;
    creditCost: number;
    providerName: string;
    providerId: string;
    apiBaseUrl: string;
}

/**
 * Get active model for a specific subcategory
 * @param subcategory - The subcategory to get active model for (e.g., "llm", "text-to-image")
 * @returns ActiveModelInfo or null if not set
 */
export async function getActiveModel(subcategory: AISubcategory): Promise<ActiveModelInfo | null> {
    try {
        const result = await sql`
      SELECT 
        am.id,
        am.subcategory,
        am.model_id as "modelId",
        m.name as "modelName",
        m.model_id as "modelApiId",
        m.type as "modelType",
        m.credit_cost as "creditCost",
        p.name as "providerName",
        p.id as "providerId",
        p.api_base_url as "apiBaseUrl"
      FROM ai_active_models am
      JOIN ai_models m ON am.model_id = m.id
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE am.subcategory = ${subcategory}
      LIMIT 1
    `;

        if (result.length === 0) {
            return null;
        }

        return result[0] as ActiveModelInfo;
    } catch (error) {
        console.error(`Error getting active model for ${subcategory}:`, error);
        return null;
    }
}

/**
 * Get all active models grouped by subcategory
 * @returns Map of subcategory to ActiveModelInfo
 */
export async function getAllActiveModels(): Promise<Map<string, ActiveModelInfo>> {
    try {
        const result = await sql`
      SELECT 
        am.id,
        am.subcategory,
        am.model_id as "modelId",
        m.name as "modelName",
        m.model_id as "modelApiId",
        m.type as "modelType",
        m.credit_cost as "creditCost",
        p.name as "providerName",
        p.id as "providerId",
        p.api_base_url as "apiBaseUrl"
      FROM ai_active_models am
      JOIN ai_models m ON am.model_id = m.id
      JOIN ai_providers p ON m.provider_id = p.id
    `;

        const activeModelsMap = new Map<string, ActiveModelInfo>();
        for (const row of result) {
            activeModelsMap.set(row.subcategory as string, row as ActiveModelInfo);
        }

        return activeModelsMap;
    } catch (error) {
        console.error("Error getting all active models:", error);
        return new Map();
    }
}

/**
 * Check if a subcategory has an active model configured
 * @param subcategory - The subcategory to check
 * @returns boolean
 */
export async function hasActiveModel(subcategory: AISubcategory): Promise<boolean> {
    const activeModel = await getActiveModel(subcategory);
    return activeModel !== null;
}

/**
 * Get API key for a provider (platform key)
 * @param providerId - Provider ID
 * @returns Decrypted API key or null
 */
export async function getProviderApiKey(providerId: string): Promise<string | null> {
    try {
        const result = await sql`
      SELECT encrypted_key 
      FROM platform_api_keys 
      WHERE provider_id = ${providerId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

        if (result.length === 0) {
            return null;
        }

        // Note: In production, you would decrypt this key
        // For now, assuming it's stored as plain text or use your decryption function
        return result[0].encrypted_key as string;
    } catch (error) {
        console.error("Error getting provider API key:", error);
        return null;
    }
}

/**
 * Derive subcategory from model_id string
 * This is used when the database doesn't have explicit subcategory
 * @param modelId - The model_id string (e.g., "text-to-image", "flux-text-to-image")
 * @returns Subcategory string
 */
export function deriveSubcategoryFromModelId(modelId: string): AISubcategory {
    // Video subcategories
    if (modelId.includes("text-to-video")) return "text-to-video";
    if (modelId.includes("image-to-video") || modelId === "scene-maker") return "image-to-video";
    if (modelId.includes("video-swap") || modelId.includes("face-swap-video")) return "face-swap-video";
    if (modelId.includes("watermark")) return "video-editing";

    // Image subcategories  
    if (modelId.includes("text-to-image") || modelId.includes("flux")) return "text-to-image";
    if (modelId.includes("image-to-image") || modelId === "controlnet") return "image-to-image";
    if (modelId.includes("inpaint")) return "inpainting";
    if (modelId.includes("face-swap") && !modelId.includes("video")) return "face-swap";
    if (modelId.includes("interior") || modelId.includes("floor") || modelId.includes("room") ||
        modelId.includes("exterior") || modelId.includes("scenario") || modelId.includes("sketch") ||
        modelId.includes("object-removal") || modelId.includes("mixer")) return "interior";

    // 3D subcategories
    if (modelId.includes("text-to-3d")) return "text-to-3d";
    if (modelId.includes("image-to-3d")) return "image-to-3d";

    // Audio subcategories
    if (modelId.includes("tts") || modelId.includes("text-to-speech")) return "text-to-speech";
    if (modelId.includes("voice") || modelId.includes("clone")) return "voice-cloning";
    if (modelId.includes("music") || modelId.includes("suno") || modelId.includes("udio")) return "text-to-music";

    // LLM (default for chat/text)
    if (modelId.includes("chat") || modelId.includes("gpt") || modelId.includes("claude") ||
        modelId.includes("gemini") || modelId.includes("deepseek") || modelId.includes("llama")) return "llm";

    return "llm"; // Default fallback
}
