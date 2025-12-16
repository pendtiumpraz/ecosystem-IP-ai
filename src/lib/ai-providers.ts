/**
 * AI Provider Service - Complete Configuration
 * Based on docs: 10-ai-providers-architecture, 10b-image-pricing, 10c-video-pricing
 * December 2025
 */

import { neon } from "@neondatabase/serverless";

// =============================================================================
// PROVIDER CONFIGURATIONS - Cara panggil API tiap provider
// =============================================================================

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  // =========================================================================
  // LLM TEXT PROVIDERS
  // =========================================================================
  
  // OpenAI - GPT-5.2, GPT-4.1, o-series
  openai: {
    name: "OpenAI",
    displayName: "OpenAI (GPT)",
    types: ["text", "image", "audio"],
    baseUrl: "https://api.openai.com/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: {
      text: "/chat/completions",
      image: "/images/generations",
      audio: "/audio/speech",
    },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant for IP development." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
      image: (model, prompt, options = {}) => ({
        model: model || "dall-e-3",
        prompt,
        n: 1,
        size: options.size || "1024x1024",
        quality: options.quality || "standard",
        response_format: "url",
      }),
      audio: (model, prompt, options = {}) => ({
        model: model || "tts-1",
        input: prompt,
        voice: options.voice || "alloy",
        response_format: "mp3",
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
      image: (data) => data.data?.[0]?.url || "",
      audio: (data) => data, // binary
    },
  },

  // Anthropic Claude - Claude 4.5, 3.5
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic (Claude)",
    types: ["text"],
    baseUrl: "https://api.anthropic.com",
    authHeader: (apiKey) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/v1/messages" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        max_tokens: options.maxTokens || 4000,
        system: options.systemPrompt || "You are a creative writing assistant for IP development.",
        messages: [{ role: "user", content: prompt }],
      }),
    },
    parseResponse: {
      text: (data) => data.content?.[0]?.text || "",
    },
  },

  // Google Gemini - Gemini 3, 2.5, 2.0, 1.5
  google: {
    name: "google",
    displayName: "Google (Gemini)",
    types: ["text", "image"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    authHeader: () => ({ "Content-Type": "application/json" }), // Key in URL
    authInUrl: true,
    endpoints: { 
      text: (model: string) => `/models/${model}:generateContent`,
      image: (model: string) => `/models/${model}:generateContent`,
    },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.7,
        },
      }),
    },
    parseResponse: {
      text: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    },
  },

  // DeepSeek - V3.2, R1 (SUPER MURAH!)
  deepseek: {
    name: "deepseek",
    displayName: "DeepSeek",
    types: ["text"],
    baseUrl: "https://api.deepseek.com",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // xAI Grok - Grok 4.x
  xai: {
    name: "xai",
    displayName: "xAI (Grok)",
    types: ["text"],
    baseUrl: "https://api.x.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // Zhipu/Z.AI - GLM-4.6 (ada yang GRATIS!)
  zhipu: {
    name: "zhipu",
    displayName: "Zhipu AI (GLM)",
    types: ["text"],
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // Mistral - Large 3, Devstral 2
  mistral: {
    name: "mistral",
    displayName: "Mistral AI",
    types: ["text"],
    baseUrl: "https://api.mistral.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // Alibaba Qwen
  qwen: {
    name: "qwen",
    displayName: "Alibaba (Qwen)",
    types: ["text"],
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // Routeway - FREE models aggregator (19 free models!)
  routeway: {
    name: "routeway",
    displayName: "Routeway (Free Models)",
    types: ["text"],
    baseUrl: "https://api.routeway.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { text: "/chat/completions" },
    buildRequest: {
      text: (model, prompt, options = {}) => ({
        model,
        messages: [
          { role: "system", content: options.systemPrompt || "You are a creative writing assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      }),
    },
    parseResponse: {
      text: (data) => data.choices?.[0]?.message?.content || "",
    },
  },

  // =========================================================================
  // IMAGE PROVIDERS
  // =========================================================================

  // Fal.ai - FLUX (Best quality-price ratio)
  fal: {
    name: "fal",
    displayName: "Fal.ai (FLUX)",
    types: ["image", "video"],
    baseUrl: "https://queue.fal.run",
    authHeader: (apiKey) => ({
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: {
      image: (model: string) => `/${model}`,
      video: (model: string) => `/${model}`,
    },
    buildRequest: {
      image: (model, prompt, options = {}) => ({
        prompt,
        image_size: options.imageSize || "landscape_16_9",
        num_inference_steps: options.steps || 28,
        guidance_scale: options.guidance || 3.5,
        num_images: 1,
        enable_safety_checker: true,
        ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
      }),
      video: (model, prompt, options = {}) => ({
        prompt,
        num_frames: options.frames || 49,
        fps: options.fps || 8,
        guidance_scale: options.guidance || 6,
      }),
    },
    parseResponse: {
      image: (data) => data.images?.[0]?.url || data.image?.url || "",
      video: (data) => data.video?.url || "",
    },
    isAsync: true, // Fal uses queue system
  },

  // Stability AI - Stable Diffusion (SDXL termurah!)
  stability: {
    name: "stability",
    displayName: "Stability AI (SD)",
    types: ["image"],
    baseUrl: "https://api.stability.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    }),
    endpoints: {
      image: (model: string) => `/generation/${model}/text-to-image`,
    },
    buildRequest: {
      image: (model, prompt, options = {}) => ({
        text_prompts: [
          { text: prompt, weight: 1 },
          ...(options.negativePrompt ? [{ text: options.negativePrompt, weight: -1 }] : []),
        ],
        cfg_scale: options.cfgScale || 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: 1,
        steps: options.steps || 30,
      }),
    },
    parseResponse: {
      image: (data) => {
        const base64 = data.artifacts?.[0]?.base64;
        return base64 ? `data:image/png;base64,${base64}` : "";
      },
    },
  },

  // Replicate - Various models
  replicate: {
    name: "replicate",
    displayName: "Replicate",
    types: ["image", "video"],
    baseUrl: "https://api.replicate.com/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: {
      image: "/predictions",
      video: "/predictions",
    },
    buildRequest: {
      image: (model, prompt, options = {}) => ({
        version: model, // Replicate uses version hash
        input: {
          prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          num_outputs: 1,
          ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
        },
      }),
      video: (model, prompt, options = {}) => ({
        version: model,
        input: {
          prompt,
          num_frames: options.frames || 25,
        },
      }),
    },
    parseResponse: {
      image: (data) => data.output?.[0] || "",
      video: (data) => data.output || "",
    },
    isAsync: true,
  },

  // getimg.ai - TERMURAH untuk image!
  getimg: {
    name: "getimg",
    displayName: "getimg.ai",
    types: ["image"],
    baseUrl: "https://api.getimg.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { image: "/stable-diffusion-xl/text-to-image" },
    buildRequest: {
      image: (model, prompt, options = {}) => ({
        model: model || "stable-diffusion-xl-v1-0",
        prompt,
        negative_prompt: options.negativePrompt || "",
        width: options.width || 1024,
        height: options.height || 1024,
        steps: options.steps || 30,
        guidance: options.guidance || 7.5,
        output_format: "png",
      }),
    },
    parseResponse: {
      image: (data) => data.image ? `data:image/png;base64,${data.image}` : "",
    },
  },

  // Nebius - Very cheap
  nebius: {
    name: "nebius",
    displayName: "Nebius AI",
    types: ["image"],
    baseUrl: "https://llm.api.cloud.nebius.ai/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { image: "/images/generations" },
    buildRequest: {
      image: (model, prompt, options = {}) => ({
        model: model || "stability-ai/sdxl",
        prompt,
        n: 1,
        size: options.size || "1024x1024",
      }),
    },
    parseResponse: {
      image: (data) => data.data?.[0]?.url || "",
    },
  },

  // =========================================================================
  // VIDEO PROVIDERS
  // =========================================================================

  // Runway - Gen-3, Gen-4.5 (via third party API)
  runway: {
    name: "runway",
    displayName: "Runway ML",
    types: ["video"],
    baseUrl: "https://api.useapi.net/v1/runwayml", // Third party
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { video: "/gen3turbo/video" },
    buildRequest: {
      video: (model, prompt, options = {}) => ({
        text_prompt: prompt,
        seconds: options.duration || 5,
        aspect_ratio: options.aspectRatio || "16:9",
        ...(options.imageUrl && { init_image: options.imageUrl }),
      }),
    },
    parseResponse: {
      video: (data) => data.video_url || "",
    },
    isAsync: true,
  },

  // Kling AI - Good value video
  kling: {
    name: "kling",
    displayName: "Kling AI",
    types: ["video"],
    baseUrl: "https://api.klingai.com/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { video: "/videos/generations" },
    buildRequest: {
      video: (model, prompt, options = {}) => ({
        model: model || "kling-v1",
        prompt,
        duration: options.duration || 5,
        aspect_ratio: options.aspectRatio || "16:9",
      }),
    },
    parseResponse: {
      video: (data) => data.data?.[0]?.url || "",
    },
    isAsync: true,
  },

  // Minimax/Hailuo - Budget video
  minimax: {
    name: "minimax",
    displayName: "Minimax (Hailuo)",
    types: ["video"],
    baseUrl: "https://api.minimax.chat/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { video: "/video/generation" },
    buildRequest: {
      video: (model, prompt, options = {}) => ({
        model: model || "video-01",
        prompt,
      }),
    },
    parseResponse: {
      video: (data) => data.video_url || "",
    },
    isAsync: true,
  },

  // Luma - Dream Machine
  luma: {
    name: "luma",
    displayName: "Luma AI",
    types: ["video"],
    baseUrl: "https://api.lumalabs.ai/dream-machine/v1",
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { video: "/generations" },
    buildRequest: {
      video: (model, prompt, options = {}) => ({
        prompt,
        aspect_ratio: options.aspectRatio || "16:9",
        loop: options.loop || false,
      }),
    },
    parseResponse: {
      video: (data) => data.assets?.video || "",
    },
    isAsync: true,
  },

  // =========================================================================
  // AUDIO PROVIDERS
  // =========================================================================

  // ElevenLabs - TTS/Voice
  elevenlabs: {
    name: "elevenlabs",
    displayName: "ElevenLabs",
    types: ["audio"],
    baseUrl: "https://api.elevenlabs.io/v1",
    authHeader: (apiKey) => ({
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    }),
    endpoints: {
      audio: (voiceId: string) => `/text-to-speech/${voiceId || "21m00Tcm4TlvDq8ikWAM"}`,
    },
    buildRequest: {
      audio: (model, prompt, options = {}) => ({
        text: prompt,
        model_id: model || "eleven_multilingual_v2",
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.75,
        },
      }),
    },
    parseResponse: {
      audio: (data) => data, // Returns audio buffer
    },
    responseType: "arraybuffer",
  },

  // Suno - Music generation
  suno: {
    name: "suno",
    displayName: "Suno AI",
    types: ["audio"],
    baseUrl: "https://api.suno.ai/v1", // Unofficial/proxy
    authHeader: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    endpoints: { audio: "/generate" },
    buildRequest: {
      audio: (model, prompt, options = {}) => ({
        prompt,
        style: options.style || "pop",
        duration: options.duration || 30,
      }),
    },
    parseResponse: {
      audio: (data) => data.audio_url || "",
    },
    isAsync: true,
  },
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ProviderConfig {
  name: string;
  displayName: string;
  types: string[];
  baseUrl: string;
  authHeader: (apiKey: string) => Record<string, string>;
  authInUrl?: boolean;
  endpoints: Record<string, string | ((param: string) => string)>;
  buildRequest: Record<string, (model: string, prompt: string, options?: any) => any>;
  parseResponse: Record<string, (data: any) => string>;
  isAsync?: boolean;
  responseType?: string;
}

interface ActiveModel {
  id: string;
  modelId: string;
  displayName: string;
  creditCost: number;
  providerName: string;
  apiKey: string;
  baseUrl: string;
}

// =============================================================================
// TIER CONFIGURATION
// =============================================================================

export type SubscriptionTier = "trial" | "creator" | "studio" | "enterprise";

// Delay in seconds for rate-limited free models
export const TIER_DELAYS: Record<SubscriptionTier, number> = {
  trial: 30,      // 30 detik delay untuk trial (free models punya rate limit)
  creator: 5,     // 5 detik untuk creator
  studio: 0,      // No delay
  enterprise: 0,  // No delay
};

// =============================================================================
// FALLBACK SYSTEM (Admin-only configuration)
// Provides reliability when primary model fails (rate limit, errors)
// =============================================================================

export interface FallbackConfig {
  id: string;
  priority: number; // 1 = primary, 2 = first fallback, etc.
  providerName: string;
  modelId: string;
  apiKeyId?: string; // Optional: specific API key from ai_provider_api_keys
  apiKey: string;
  displayName: string;
  creditCost: number;
}

/**
 * Get fallback queue for a tier and type
 * Returns array sorted by priority (1 = primary, 2+ = fallbacks)
 */
export async function getFallbackQueue(
  type: "text" | "image" | "video" | "audio",
  tier: SubscriptionTier
): Promise<FallbackConfig[]> {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Get fallback configs from ai_fallback_configs table
  const fallbacks = await sql`
    SELECT 
      fc.id, fc.priority, fc.provider_name, fc.model_id, fc.api_key_id,
      m.name as display_name, m.credit_cost,
      COALESCE(ak.encrypted_key, '') as api_key
    FROM ai_fallback_configs fc
    JOIN ai_models m ON fc.model_id = m.model_id
    JOIN ai_providers p ON fc.provider_name = p.name
    LEFT JOIN platform_api_keys ak ON fc.api_key_id = ak.id
    WHERE fc.tier = ${tier}
      AND fc.model_type = ${type}
      AND fc.is_active = TRUE
      AND m.is_active = TRUE
      AND p.is_active = TRUE
    ORDER BY fc.priority ASC
  `;

  if (fallbacks.length > 0) {
    return fallbacks.map(f => ({
      id: f.id,
      priority: f.priority,
      providerName: f.provider_name,
      modelId: f.model_id,
      apiKeyId: f.api_key_id,
      apiKey: f.api_key,
      displayName: f.display_name,
      creditCost: f.credit_cost,
    }));
  }

  // Fallback to tier model + default model if no specific fallback config
  const primary = await getActiveModelForTier(type, tier);
  const defaultModel = await getActiveModel(type);
  
  const queue: FallbackConfig[] = [];
  
  if (primary) {
    queue.push({
      id: primary.id,
      priority: 1,
      providerName: primary.providerName,
      modelId: primary.modelId,
      apiKey: primary.apiKey,
      displayName: primary.displayName,
      creditCost: primary.creditCost,
    });
  }
  
  // Add default as fallback if different from primary
  if (defaultModel && (!primary || defaultModel.id !== primary.id)) {
    queue.push({
      id: defaultModel.id,
      priority: 2,
      providerName: defaultModel.providerName,
      modelId: defaultModel.modelId,
      apiKey: defaultModel.apiKey,
      displayName: defaultModel.displayName,
      creditCost: defaultModel.creditCost,
    });
  }
  
  return queue;
}

/**
 * Save fallback configuration (Superadmin only)
 */
export async function saveFallbackConfig(
  tier: SubscriptionTier,
  modelType: "text" | "image" | "video" | "audio",
  configs: Array<{
    priority: number;
    providerName: string;
    modelId: string;
    apiKeyId?: string;
  }>
): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Delete existing configs for this tier/type
    await sql`
      DELETE FROM ai_fallback_configs 
      WHERE tier = ${tier} AND model_type = ${modelType}
    `;
    
    // Insert new configs
    for (const config of configs) {
      await sql`
        INSERT INTO ai_fallback_configs (tier, model_type, priority, provider_name, model_id, api_key_id, is_active)
        VALUES (${tier}, ${modelType}, ${config.priority}, ${config.providerName}, ${config.modelId}, ${config.apiKeyId || null}, TRUE)
      `;
    }
    
    return true;
  } catch (e) {
    console.error("Failed to save fallback config:", e);
    return false;
  }
}

/**
 * Get all fallback configs for admin UI
 */
export async function getAllFallbackConfigs(): Promise<Record<string, Record<string, FallbackConfig[]>>> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const configs = await sql`
    SELECT 
      fc.id, fc.tier, fc.model_type, fc.priority, fc.provider_name, fc.model_id, fc.api_key_id,
      m.name as display_name, m.credit_cost
    FROM ai_fallback_configs fc
    JOIN ai_providers p ON fc.provider_name = p.name
    JOIN ai_models m ON fc.model_id = m.model_id AND p.id = m.provider_id
    WHERE fc.is_active = TRUE
    ORDER BY fc.tier, fc.model_type, fc.priority
  `;
  
  const result: Record<string, Record<string, FallbackConfig[]>> = {};
  
  for (const c of configs) {
    if (!result[c.tier]) result[c.tier] = {};
    if (!result[c.tier][c.model_type]) result[c.tier][c.model_type] = [];
    
    result[c.tier][c.model_type].push({
      id: c.id,
      priority: c.priority,
      providerName: c.provider_name,
      modelId: c.model_id,
      apiKeyId: c.api_key_id,
      apiKey: "", // Don't expose API key in list
      displayName: c.display_name,
      creditCost: c.credit_cost,
    });
  }
  
  return result;
}

// =============================================================================
// MULTIPLE API KEYS PER PROVIDER
// =============================================================================

export interface ProviderApiKey {
  id: string;
  providerName: string;
  label: string;
  apiKey: string; // Masked for display
  isEnabled: boolean;
  usageCount: number;
  lastUsedAt?: string;
}

/**
 * Get all API keys for a provider (admin only)
 */
export async function getProviderApiKeys(providerName: string): Promise<ProviderApiKey[]> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const keys = await sql`
    SELECT pk.id, p.slug as provider_name, pk.name as label, pk.encrypted_key as api_key, pk.is_active as is_enabled, pk.usage_count, pk.last_used_at
    FROM platform_api_keys pk
    JOIN ai_providers p ON pk.provider_id = p.id
    WHERE p.slug = ${providerName}
    ORDER BY pk.created_at ASC
  `;
  
  return keys.map(k => ({
    id: k.id,
    providerName: k.provider_name,
    label: k.label,
    apiKey: maskKey(k.api_key),
    isEnabled: k.is_enabled,
    usageCount: k.usage_count || 0,
    lastUsedAt: k.last_used_at,
  }));
}

function maskKey(key: string): string {
  if (!key || key.length <= 8) return "****";
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}

/**
 * Add API key to provider (admin only)
 */
export async function addProviderApiKey(
  providerName: string,
  label: string,
  apiKey: string
): Promise<string | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Get provider ID from slug
    const provider = await sql`SELECT id FROM ai_providers WHERE slug = ${providerName} LIMIT 1`;
    if (provider.length === 0) return null;
    
    const result = await sql`
      INSERT INTO platform_api_keys (provider_id, name, encrypted_key, is_active)
      VALUES (${provider[0].id}, ${label}, ${apiKey}, TRUE)
      RETURNING id
    `;
    return result[0]?.id;
  } catch (e) {
    console.error("Failed to add provider API key:", e);
    return null;
  }
}

/**
 * Delete API key (admin only)
 */
export async function deleteProviderApiKey(keyId: string): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    await sql`DELETE FROM platform_api_keys WHERE id = ${keyId}`;
    return true;
  } catch (e) {
    console.error("Failed to delete API key:", e);
    return false;
  }
}

/**
 * Update API key usage counter
 */
async function incrementApiKeyUsage(keyId: string): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    await sql`
      UPDATE platform_api_keys 
      SET usage_count = COALESCE(usage_count, 0) + 1, last_used_at = NOW()
      WHERE id = ${keyId}
    `;
  } catch (e) {
    console.error("Failed to update API key usage:", e);
  }
}

// =============================================================================
// DATABASE FUNCTIONS
// =============================================================================

/**
 * Get active model for a specific tier
 * Admin sets different models for different tiers
 */
export async function getActiveModelForTier(
  type: "text" | "image" | "video" | "audio",
  tier: SubscriptionTier = "trial"
): Promise<ActiveModel | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  // First try to get tier-specific model from ai_tier_models table
  const tierResult = await sql`
    SELECT 
      m.id, m.model_id, m.name as display_name, m.credit_cost,
      p.name as provider_name, pk.encrypted_key as api_key, p.api_base_url as base_url
    FROM ai_tier_models tm
    JOIN ai_models m ON tm.model_id = m.id
    JOIN ai_providers p ON m.provider_id = p.id
    LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
    WHERE tm.tier = ${tier}
      AND tm.model_type = ${type}
      AND m.is_active = TRUE
      AND p.is_active = TRUE
    LIMIT 1
  `;

  if (tierResult.length > 0) {
    return {
      id: tierResult[0].id,
      modelId: tierResult[0].model_id,
      displayName: tierResult[0].display_name,
      creditCost: tierResult[0].credit_cost,
      providerName: tierResult[0].provider_name,
      apiKey: tierResult[0].api_key || "",
      baseUrl: tierResult[0].base_url,
    };
  }

  // Fallback to default model (is_default = true)
  return getActiveModel(type);
}

/**
 * Get default active model (original function for backwards compatibility)
 */
export async function getActiveModel(type: "text" | "image" | "video" | "audio"): Promise<ActiveModel | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const result = await sql`
    SELECT 
      m.id, m.model_id, m.name as display_name, m.credit_cost,
      p.name as provider_name, pk.encrypted_key as api_key, p.api_base_url as base_url
    FROM ai_models m
    JOIN ai_providers p ON m.provider_id = p.id
    LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
    WHERE m.type = ${type} 
      AND m.is_default = TRUE 
      AND m.is_active = TRUE
      AND p.is_active = TRUE
    LIMIT 1
  `;

  if (result.length === 0) return null;

  return {
    id: result[0].id,
    modelId: result[0].model_id,
    displayName: result[0].display_name,
    creditCost: result[0].credit_cost,
    providerName: result[0].provider_name,
    apiKey: result[0].api_key || "",
    baseUrl: result[0].base_url,
  };
}

/**
 * Set model for a specific tier
 */
export async function setTierModel(
  tier: SubscriptionTier,
  modelType: "text" | "image" | "video" | "audio",
  modelId: string
): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Upsert tier model setting
    await sql`
      INSERT INTO ai_tier_models (tier, model_type, model_id)
      VALUES (${tier}, ${modelType}, ${modelId})
      ON CONFLICT (tier, model_type) 
      DO UPDATE SET model_id = ${modelId}, updated_at = NOW()
    `;
    return true;
  } catch (e) {
    console.error("Failed to set tier model:", e);
    return false;
  }
}

/**
 * Get all tier model settings
 */
export async function getTierModels(): Promise<Record<string, Record<string, any>>> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const result = await sql`
    SELECT 
      tm.tier, tm.model_type, tm.model_id as db_model_id,
      m.model_id, m.name as display_name,
      p.name as provider_name
    FROM ai_tier_models tm
    JOIN ai_models m ON tm.model_id = m.id
    JOIN ai_providers p ON m.provider_id = p.id
  `;

  const tierModels: Record<string, Record<string, any>> = {};
  for (const row of result) {
    if (!tierModels[row.tier]) tierModels[row.tier] = {};
    tierModels[row.tier][row.model_type] = {
      modelId: row.db_model_id,
      modelApiId: row.model_id,
      displayName: row.display_name,
      providerName: row.provider_name,
    };
  }
  return tierModels;
}

// =============================================================================
// USER AI SETTINGS (Enterprise/Unlimited tier only)
// Enterprise users can choose: "Pakai AI System" or "Pakai AI Sendiri"
// =============================================================================

export interface UserAISettings {
  useSystemAI: boolean; // true = pakai system, false = pakai sendiri
  ownProvider?: string; // provider yang dipilih user
  ownModelId?: string;  // model yang dipilih user
  ownApiKey?: string;   // API key user (masked for display)
}

/**
 * Get user's AI settings
 * Only for enterprise tier users
 */
export async function getUserAISettings(userId: string): Promise<UserAISettings | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Check if user is enterprise tier
  const userCheck = await sql`
    SELECT subscription_tier, use_own_api_key, own_ai_provider, own_ai_model, own_ai_api_key
    FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  
  if (userCheck.length === 0 || userCheck[0].subscription_tier !== "enterprise") {
    return null; // Only enterprise can use own AI
  }
  
  const user = userCheck[0];
  return {
    useSystemAI: !user.use_own_api_key, // inverted: use_own_api_key = false means use system
    ownProvider: user.own_ai_provider || undefined,
    ownModelId: user.own_ai_model || undefined,
    ownApiKey: user.own_ai_api_key ? maskApiKey(user.own_ai_api_key) : undefined,
  };
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return "*".repeat(key.length - 4) + key.slice(-4);
}

/**
 * Save user's AI settings (enterprise only)
 * @param useSystemAI - true = pakai AI system, false = pakai AI sendiri
 */
export async function saveUserAISettings(
  userId: string,
  useSystemAI: boolean,
  ownProvider?: string,
  ownModelId?: string,
  ownApiKey?: string
): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Verify user is enterprise tier
    const check = await sql`
      SELECT subscription_tier FROM users WHERE id = ${userId}
    `;
    if (check[0]?.subscription_tier !== "enterprise") {
      return false;
    }
    
    // Update user settings
    await sql`
      UPDATE users SET 
        use_own_api_key = ${!useSystemAI},
        own_ai_provider = ${ownProvider || null},
        own_ai_model = ${ownModelId || null},
        own_ai_api_key = ${ownApiKey || null},
        updated_at = NOW()
      WHERE id = ${userId}
    `;
    return true;
  } catch (e) {
    console.error("Failed to save user AI settings:", e);
    return false;
  }
}

/**
 * Get AI config for user - returns either system config or user's own config
 * Used during AI generation
 */
export async function getAIConfigForUser(
  userId: string,
  type: "text" | "image" | "video" | "audio",
  tier: SubscriptionTier
): Promise<{ 
  useOwnAI: boolean;
  provider?: string;
  modelId?: string;
  apiKey?: string;
  activeModel?: ActiveModel | null;
}> {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Only enterprise can use own AI
  if (tier !== "enterprise") {
    const activeModel = await getActiveModelForTier(type, tier);
    return { useOwnAI: false, activeModel };
  }
  
  // Check user preference
  const userSettings = await sql`
    SELECT use_own_api_key, own_ai_provider, own_ai_model, own_ai_api_key
    FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  
  if (userSettings.length === 0 || !userSettings[0].use_own_api_key) {
    // Use system AI
    const activeModel = await getActiveModelForTier(type, tier);
    return { useOwnAI: false, activeModel };
  }
  
  const user = userSettings[0];
  
  // User wants to use their own AI
  return {
    useOwnAI: true,
    provider: user.own_ai_provider,
    modelId: user.own_ai_model,
    apiKey: user.own_ai_api_key,
  };
}

// =============================================================================
// MAIN AI CALL FUNCTION
// =============================================================================

export interface CallAIOptions extends Record<string, any> {
  tier?: SubscriptionTier;
  userId?: string; // For enterprise users to use their own API keys
  skipDelay?: boolean;
}

/**
 * Helper to add delay for rate-limited tiers
 */
async function applyTierDelay(tier: SubscriptionTier): Promise<void> {
  const delay = TIER_DELAYS[tier] || 0;
  if (delay > 0) {
    console.log(`[AI] Applying ${delay}s delay for ${tier} tier (rate limit protection)`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }
}

export async function callAI(
  type: "text" | "image" | "video" | "audio",
  prompt: string,
  options: CallAIOptions = {}
): Promise<{ success: boolean; result?: string; error?: string; creditCost?: number; provider?: string; delayApplied?: number }> {
  try {
    const tier = options.tier || "trial";
    const userId = options.userId;
    
    // Get AI config - either system or user's own (for enterprise)
    const aiConfig = userId 
      ? await getAIConfigForUser(userId, type, tier)
      : { useOwnAI: false, activeModel: await getActiveModelForTier(type, tier) };
    
    let providerName: string;
    let modelId: string;
    let apiKeyToUse: string;
    let displayName: string;
    let creditCost: number;
    
    if (aiConfig.useOwnAI && aiConfig.provider && aiConfig.modelId && aiConfig.apiKey) {
      // Enterprise user dengan AI sendiri
      providerName = aiConfig.provider;
      modelId = aiConfig.modelId;
      apiKeyToUse = aiConfig.apiKey;
      displayName = `${providerName}/${modelId} (User's Own)`;
      creditCost = 0; // No credit cost for own API
      console.log(`[AI] Using user's own AI config: ${providerName}/${modelId}`);
    } else if (aiConfig.activeModel) {
      // System AI
      providerName = aiConfig.activeModel.providerName;
      modelId = aiConfig.activeModel.modelId;
      apiKeyToUse = aiConfig.activeModel.apiKey;
      displayName = aiConfig.activeModel.displayName;
      creditCost = aiConfig.activeModel.creditCost;
    } else {
      return { success: false, error: `No active ${type} model configured. Admin perlu set di AI Providers.` };
    }

    if (!apiKeyToUse) {
      return { success: false, error: `API key belum diset untuk ${providerName}` };
    }
    
    // Apply delay for rate-limited tiers (free models)
    // Skip delay if user uses their own AI (no rate limit from our side)
    const delayApplied = (!aiConfig.useOwnAI && TIER_DELAYS[tier]) || 0;
    if (!options.skipDelay && delayApplied > 0) {
      await applyTierDelay(tier);
    }

    const providerConfig = PROVIDER_CONFIGS[providerName];
    if (!providerConfig) {
      return { success: false, error: `Unknown provider: ${providerName}` };
    }

    const buildFn = providerConfig.buildRequest[type];
    if (!buildFn) {
      return { success: false, error: `${providerName} tidak support ${type}` };
    }

    // Build request body
    const requestBody = buildFn(modelId, prompt, options);
    
    // Build URL
    const endpointConfig = providerConfig.endpoints[type];
    const endpoint = typeof endpointConfig === "function" 
      ? endpointConfig(modelId) 
      : endpointConfig;
    
    let fullUrl = providerConfig.baseUrl + endpoint;
    
    // Google: API key in URL
    if (providerConfig.authInUrl) {
      fullUrl += `?key=${apiKeyToUse}`;
    }

    console.log(`[AI] Calling ${providerName}/${modelId} for ${type}${aiConfig.useOwnAI ? " (user's own)" : ""}`);

    // Make request
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: providerConfig.authHeader(apiKeyToUse),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Error from ${providerName}:`, errorText);
      return { success: false, error: `API error ${response.status}: ${errorText.slice(0, 200)}` };
    }

    // Handle response
    let data;
    if (providerConfig.responseType === "arraybuffer") {
      const buffer = await response.arrayBuffer();
      data = Buffer.from(buffer).toString("base64");
      return { 
        success: true, 
        result: `data:audio/mpeg;base64,${data}`,
        creditCost,
        provider: providerName,
      };
    }
    
    data = await response.json();

    // Handle async providers (queue-based like Fal.ai)
    if (providerConfig.isAsync && data.request_id) {
      const asyncModel = { providerName, modelId, apiKey: apiKeyToUse, baseUrl: providerConfig.baseUrl } as any;
      const asyncResult = await pollAsyncResult(providerConfig, asyncModel, data.request_id);
      if (!asyncResult.success) return asyncResult;
      data = asyncResult.data;
    }

    // Parse response
    const parseFn = providerConfig.parseResponse[type];
    const result = parseFn ? parseFn(data) : "";
    
    if (!result) {
      console.error(`[AI] Empty response from ${providerName}:`, JSON.stringify(data).slice(0, 500));
      return { success: false, error: "Empty response from AI" };
    }

    return { 
      success: true, 
      result,
      creditCost,
      provider: providerName,
      delayApplied,
    };

  } catch (error) {
    console.error("[AI] Call error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Poll for async results (Fal.ai, Replicate, etc.)
async function pollAsyncResult(
  config: ProviderConfig, 
  model: ActiveModel, 
  requestId: string,
  maxAttempts = 60
): Promise<{ success: boolean; data?: any; error?: string }> {
  const statusUrl = `${model.baseUrl || config.baseUrl}/requests/${requestId}/status`;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s
    
    const res = await fetch(statusUrl, {
      headers: config.authHeader(model.apiKey),
    });
    
    if (!res.ok) continue;
    
    const status = await res.json();
    
    if (status.status === "COMPLETED" || status.status === "succeeded") {
      // Fetch result
      const resultUrl = `${model.baseUrl || config.baseUrl}/requests/${requestId}`;
      const resultRes = await fetch(resultUrl, {
        headers: config.authHeader(model.apiKey),
      });
      const data = await resultRes.json();
      return { success: true, data };
    }
    
    if (status.status === "FAILED" || status.status === "failed") {
      return { success: false, error: status.error || "Generation failed" };
    }
  }
  
  return { success: false, error: "Timeout waiting for result" };
}

// =============================================================================
// CALL AI WITH FALLBACK (Auto-retry on failure)
// =============================================================================

export interface CallAIWithFallbackResult {
  success: boolean;
  result?: string;
  error?: string;
  creditCost?: number;
  provider?: string;
  modelUsed?: string;
  attemptsMade: number;
  fallbacksUsed: string[];
}

/**
 * Call AI with automatic fallback on failure
 * Tries each model in the fallback queue until one succeeds
 * Enterprise users with own AI: try their config first, then fallback to system
 */
export async function callAIWithFallback(
  type: "text" | "image" | "video" | "audio",
  prompt: string,
  options: CallAIOptions = {}
): Promise<CallAIWithFallbackResult> {
  const tier = options.tier || "trial";
  const userId = options.userId;
  const fallbacksUsed: string[] = [];
  let attemptsMade = 0;
  let lastError = "";
  
  // If enterprise user with own AI, try their config first
  if (userId && tier === "enterprise") {
    const aiConfig = await getAIConfigForUser(userId, type, tier);
    
    if (aiConfig.useOwnAI && aiConfig.provider && aiConfig.modelId && aiConfig.apiKey) {
      attemptsMade++;
      console.log(`[AI Fallback] Attempt ${attemptsMade}: User's own AI (${aiConfig.provider}/${aiConfig.modelId})`);
      
      const result = await callAISingle(
        type, prompt, 
        aiConfig.provider, aiConfig.modelId, aiConfig.apiKey,
        0, // No credit cost for own API
        options
      );
      
      if (result.success) {
        return {
          ...result,
          attemptsMade,
          fallbacksUsed,
          modelUsed: `${aiConfig.provider}/${aiConfig.modelId} (User's Own)`,
        };
      }
      
      lastError = result.error || "Unknown error";
      fallbacksUsed.push(`${aiConfig.provider}/${aiConfig.modelId} (User's Own)`);
      console.log(`[AI Fallback] User's own AI failed: ${lastError}. Trying system fallbacks...`);
    }
  }
  
  // Get fallback queue from system
  const fallbackQueue = await getFallbackQueue(type, tier);
  
  if (fallbackQueue.length === 0) {
    return {
      success: false,
      error: `No AI models configured for ${tier} tier. Admin perlu set di AI Providers.`,
      attemptsMade,
      fallbacksUsed,
    };
  }
  
  // Try each model in the fallback queue
  for (const config of fallbackQueue) {
    attemptsMade++;
    console.log(`[AI Fallback] Attempt ${attemptsMade}: ${config.providerName}/${config.modelId} (priority ${config.priority})`);
    
    // Apply delay only for first attempt on rate-limited tiers
    const shouldDelay = attemptsMade === 1 && !options.skipDelay && TIER_DELAYS[tier] > 0;
    
    const result = await callAISingle(
      type, prompt,
      config.providerName, config.modelId, config.apiKey,
      config.creditCost,
      { ...options, skipDelay: !shouldDelay }
    );
    
    if (result.success) {
      // Track API key usage if using specific key
      if (config.apiKeyId) {
        await incrementApiKeyUsage(config.apiKeyId);
      }
      
      return {
        ...result,
        attemptsMade,
        fallbacksUsed,
        modelUsed: `${config.providerName}/${config.modelId}`,
      };
    }
    
    lastError = result.error || "Unknown error";
    fallbacksUsed.push(`${config.providerName}/${config.modelId}`);
    
    // Check if error is rate limit - add small delay before next attempt
    if (lastError.toLowerCase().includes("rate") || lastError.includes("429") || lastError.includes("limit")) {
      console.log(`[AI Fallback] Rate limit detected. Waiting 5s before next attempt...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  // All fallbacks failed
  return {
    success: false,
    error: `All AI models failed. Last error: ${lastError}`,
    attemptsMade,
    fallbacksUsed,
  };
}

/**
 * Single AI call without fallback logic (internal use)
 */
async function callAISingle(
  type: "text" | "image" | "video" | "audio",
  prompt: string,
  providerName: string,
  modelId: string,
  apiKey: string,
  creditCost: number,
  options: CallAIOptions = {}
): Promise<{ success: boolean; result?: string; error?: string; creditCost?: number; provider?: string }> {
  try {
    const providerConfig = PROVIDER_CONFIGS[providerName];
    if (!providerConfig) {
      return { success: false, error: `Unknown provider: ${providerName}` };
    }

    if (!apiKey) {
      return { success: false, error: `API key not configured for ${providerName}` };
    }

    const buildFn = providerConfig.buildRequest[type];
    if (!buildFn) {
      return { success: false, error: `${providerName} doesn't support ${type}` };
    }

    // Build request
    const requestBody = buildFn(modelId, prompt, options);
    const endpointConfig = providerConfig.endpoints[type];
    const endpoint = typeof endpointConfig === "function" ? endpointConfig(modelId) : endpointConfig;
    let fullUrl = providerConfig.baseUrl + endpoint;

    if (providerConfig.authInUrl) {
      fullUrl += `?key=${apiKey}`;
    }

    // Make request
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: providerConfig.authHeader(apiKey),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error ${response.status}: ${errorText.slice(0, 200)}` };
    }

    // Handle response
    let data;
    if (providerConfig.responseType === "arraybuffer") {
      const buffer = await response.arrayBuffer();
      data = Buffer.from(buffer).toString("base64");
      return { success: true, result: `data:audio/mpeg;base64,${data}`, creditCost, provider: providerName };
    }

    data = await response.json();

    // Handle async providers
    if (providerConfig.isAsync && data.request_id) {
      const asyncModel = { providerName, modelId, apiKey, baseUrl: providerConfig.baseUrl } as any;
      const asyncResult = await pollAsyncResult(providerConfig, asyncModel, data.request_id);
      if (!asyncResult.success) {
        return { success: false, error: asyncResult.error };
      }
      data = asyncResult.data;
    }

    // Parse response
    const parseFn = providerConfig.parseResponse[type];
    const result = parseFn ? parseFn(data) : "";

    if (!result) {
      return { success: false, error: "Empty response from AI" };
    }

    return { success: true, result, creditCost, provider: providerName };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const generateText = (prompt: string, options?: any) => callAI("text", prompt, options);
export const generateImage = (prompt: string, options?: any) => callAI("image", prompt, options);
export const generateVideo = (prompt: string, options?: any) => callAI("video", prompt, options);
export const generateAudio = (prompt: string, options?: any) => callAI("audio", prompt, options);

// With fallback support
export const generateTextWithFallback = (prompt: string, options?: any) => callAIWithFallback("text", prompt, options);
export const generateImageWithFallback = (prompt: string, options?: any) => callAIWithFallback("image", prompt, options);
export const generateVideoWithFallback = (prompt: string, options?: any) => callAIWithFallback("video", prompt, options);
export const generateAudioWithFallback = (prompt: string, options?: any) => callAIWithFallback("audio", prompt, options);

// =============================================================================
// MODEL PRESETS - Quick reference untuk admin setup
// =============================================================================

export const MODEL_PRESETS = {
  // TEXT - LLM
  text: [
    // OpenAI
    { provider: "openai", modelId: "gpt-4o-mini", name: "GPT-4o Mini", cost: 3 },
    { provider: "openai", modelId: "gpt-4o", name: "GPT-4o", cost: 10 },
    { provider: "openai", modelId: "gpt-4-turbo", name: "GPT-4 Turbo", cost: 15 },
    // Anthropic
    { provider: "anthropic", modelId: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", cost: 8 },
    { provider: "anthropic", modelId: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", cost: 3 },
    // Google
    { provider: "google", modelId: "gemini-1.5-flash", name: "Gemini 1.5 Flash", cost: 2 },
    { provider: "google", modelId: "gemini-1.5-pro", name: "Gemini 1.5 Pro", cost: 5 },
    { provider: "google", modelId: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", cost: 3 },
    // DeepSeek - MURAH!
    { provider: "deepseek", modelId: "deepseek-chat", name: "DeepSeek V3", cost: 1 },
    { provider: "deepseek", modelId: "deepseek-reasoner", name: "DeepSeek R1", cost: 2 },
    // Mistral
    { provider: "mistral", modelId: "mistral-large-latest", name: "Mistral Large", cost: 4 },
    { provider: "mistral", modelId: "codestral-latest", name: "Codestral", cost: 3 },
    // xAI
    { provider: "xai", modelId: "grok-2-latest", name: "Grok 2", cost: 5 },
    // Zhipu - GRATIS!
    { provider: "zhipu", modelId: "glm-4-flash", name: "GLM-4 Flash (FREE)", cost: 0 },
    { provider: "zhipu", modelId: "glm-4-plus", name: "GLM-4 Plus", cost: 2 },
  ],
  
  // IMAGE
  image: [
    // Fal.ai FLUX - Best value
    { provider: "fal", modelId: "fal-ai/flux/schnell", name: "FLUX Schnell (Fast)", cost: 2 },
    { provider: "fal", modelId: "fal-ai/flux/dev", name: "FLUX Dev", cost: 5 },
    { provider: "fal", modelId: "fal-ai/flux-pro", name: "FLUX Pro", cost: 8 },
    { provider: "fal", modelId: "fal-ai/flux-pro/v1.1", name: "FLUX Pro 1.1", cost: 10 },
    // Stability - MURAH!
    { provider: "stability", modelId: "stable-diffusion-xl-1024-v1-0", name: "SDXL 1.0", cost: 3 },
    { provider: "stability", modelId: "sd3.5-large", name: "SD 3.5 Large", cost: 8 },
    // OpenAI
    { provider: "openai", modelId: "dall-e-3", name: "DALL-E 3", cost: 15 },
    // getimg.ai - TERMURAH!
    { provider: "getimg", modelId: "stable-diffusion-xl-v1-0", name: "getimg SDXL", cost: 1 },
    { provider: "getimg", modelId: "lcm-realistic-vision-v5-1", name: "getimg LCM", cost: 1 },
    // Replicate
    { provider: "replicate", modelId: "black-forest-labs/flux-schnell", name: "Replicate FLUX", cost: 3 },
  ],
  
  // VIDEO - HATI-HATI MAHAL!
  video: [
    // Fal.ai - Budget
    { provider: "fal", modelId: "fal-ai/cogvideox-5b", name: "CogVideoX 5B", cost: 25 },
    { provider: "fal", modelId: "fal-ai/minimax/video-01", name: "Minimax Video", cost: 20 },
    // Minimax - MURAH
    { provider: "minimax", modelId: "video-01", name: "Hailuo Video", cost: 15 },
    // Kling - Good value
    { provider: "kling", modelId: "kling-v1", name: "Kling 1.0", cost: 25 },
    { provider: "kling", modelId: "kling-v1.5", name: "Kling 1.5", cost: 30 },
    // Luma
    { provider: "luma", modelId: "ray2", name: "Luma Ray2", cost: 40 },
    // Runway - MAHAL!
    { provider: "runway", modelId: "gen3a_turbo", name: "Runway Gen-3 Turbo", cost: 50 },
  ],
  
  // AUDIO
  audio: [
    // ElevenLabs
    { provider: "elevenlabs", modelId: "eleven_multilingual_v2", name: "ElevenLabs Multilingual", cost: 10 },
    { provider: "elevenlabs", modelId: "eleven_turbo_v2_5", name: "ElevenLabs Turbo", cost: 5 },
    // OpenAI TTS
    { provider: "openai", modelId: "tts-1", name: "OpenAI TTS", cost: 8 },
    { provider: "openai", modelId: "tts-1-hd", name: "OpenAI TTS HD", cost: 15 },
    // Suno
    { provider: "suno", modelId: "chirp-v3", name: "Suno Music", cost: 20 },
  ],
};

// Get all available providers for a type
export function getProvidersForType(type: string) {
  return Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => config.types.includes(type))
    .map(([key, config]) => ({
      id: key,
      name: config.displayName,
      types: config.types,
    }));
}
