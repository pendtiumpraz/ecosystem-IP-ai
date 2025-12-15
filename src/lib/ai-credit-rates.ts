/**
 * AI Credit Rate System - MODO Creator Verse
 * Based on docs: 10-ai-providers-architecture, 10b-image-pricing, 10c-video-pricing
 * 
 * Currency: 1 Credit = Rp 200 = ~$0.0125 USD
 * Target Margin: 60-95% (tergantung tier)
 * 
 * December 2025 Pricing
 */

// =============================================================================
// CREDIT CONFIGURATION
// =============================================================================

export const CREDIT_CONFIG = {
  // 1 Credit = Rp 200 = $0.0125 USD
  creditValueUSD: 0.0125,
  creditValueIDR: 200,
  
  // Minimum margin target per tier
  margins: {
    economy: 0.90,   // 90% margin
    standard: 0.85,  // 85% margin
    quality: 0.70,   // 70% margin
    premium: 0.65,   // 65% margin
    ultra: 0.60,     // 60% margin
  },
};

// =============================================================================
// LLM TEXT GENERATION RATES
// Based on ~2000 tokens output average per generation
// =============================================================================

export const TEXT_MODEL_RATES: Record<string, ModelRate> = {
  // ========== FREE TIER (0 credits) - Routeway Free Models ==========
  // All FREE models from Routeway.ai aggregator
  "devstral-2512:free": {
    provider: "routeway",
    name: "Devstral 2 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    recommended: true,
    description: "Mistral agentic coding - FREE!",
  },
  "kimi-k2-0905:free": {
    provider: "routeway",
    name: "Kimi K2 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Moonshot AI thinking model - FREE!",
  },
  "longcat-flash-chat:free": {
    provider: "routeway",
    name: "LongCat Flash (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Meituan long context - FREE!",
  },
  "minimax-m2:free": {
    provider: "routeway",
    name: "MiniMax M2 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "MiniMax latest - FREE!",
  },
  "glm-4.6:free": {
    provider: "routeway",
    name: "GLM 4.6 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Zhipu GLM 4.6 - FREE!",
  },
  "deepseek-v3.1-terminus:free": {
    provider: "routeway",
    name: "DeepSeek V3.1 Terminus (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "DeepSeek V3.1 variant - FREE!",
  },
  "mai-ds-r1:free": {
    provider: "routeway",
    name: "MAI DS R1 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Microsoft reasoning - FREE!",
  },
  "nemotron-nano-9b-v2:free": {
    provider: "routeway",
    name: "Nemotron Nano 9B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "NVIDIA efficient - FREE!",
  },
  "deepseek-r1t2-chimera:free": {
    provider: "routeway",
    name: "DeepSeek R1T2 Chimera (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "DeepSeek reasoning variant - FREE!",
  },
  "deepseek-v3.1:free": {
    provider: "routeway",
    name: "DeepSeek V3.1 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    recommended: true,
    description: "DeepSeek V3.1 - FREE!",
  },
  "gpt-oss-120b:free": {
    provider: "routeway",
    name: "GPT OSS 120B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Open source GPT - FREE!",
  },
  "deepseek-r1-0528:free": {
    provider: "routeway",
    name: "DeepSeek R1 0528 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "DeepSeek R1 May version - FREE!",
  },
  "deepseek-r1:free": {
    provider: "routeway",
    name: "DeepSeek R1 (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    recommended: true,
    description: "DeepSeek R1 reasoning - FREE!",
  },
  "deepseek-r1-distill-qwen-32b:free": {
    provider: "routeway",
    name: "R1 Distill Qwen 32B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Distilled reasoning - FREE!",
  },
  "llama-3.2-3b-instruct:free": {
    provider: "routeway",
    name: "Llama 3.2 3B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Meta small model - FREE!",
  },
  "llama-3.2-1b-instruct:free": {
    provider: "routeway",
    name: "Llama 3.2 1B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Meta tiny model - FREE!",
  },
  "llama-3.1-8b-instruct:free": {
    provider: "routeway",
    name: "Llama 3.1 8B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Meta medium model - FREE!",
  },
  "llama-3.3-70b-instruct:free": {
    provider: "routeway",
    name: "Llama 3.3 70B (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    recommended: true,
    description: "Meta large model - FREE!",
  },
  "mistral-nemo-instruct:free": {
    provider: "routeway",
    name: "Mistral Nemo (Free)",
    apiCostUSD: 0,
    credits: 0,
    tier: "economy",
    description: "Mistral efficient - FREE!",
  },

  // ========== ECONOMY TIER (1-2 credits) ==========
  // DeepSeek V3 - $0.24 in / $0.38 out per 1M → ~$0.001/gen
  "deepseek-chat": {
    provider: "deepseek",
    name: "DeepSeek V3",
    apiCostUSD: 0.001,
    credits: 1,
    tier: "economy",
    recommended: true,
    description: "GPT-4 level quality, 95% cheaper",
  },
  "deepseek-reasoner": {
    provider: "deepseek",
    name: "DeepSeek R1 (Reasoning)",
    apiCostUSD: 0.004,
    credits: 2,
    tier: "economy",
    description: "Advanced reasoning model",
  },
  // Zhipu GLM-4 Flash - FREE!
  "glm-4-flash": {
    provider: "zhipu",
    name: "GLM-4 Flash",
    apiCostUSD: 0,
    credits: 0, // FREE!
    tier: "economy",
    description: "Free tier - limited",
  },
  // Gemini 1.5 Flash - $0.075 in / $0.30 out → ~$0.0008/gen
  "gemini-1.5-flash": {
    provider: "google",
    name: "Gemini 1.5 Flash",
    apiCostUSD: 0.0008,
    credits: 1,
    tier: "economy",
    description: "Google's fastest model",
  },
  "gemini-2.0-flash-exp": {
    provider: "google",
    name: "Gemini 2.0 Flash",
    apiCostUSD: 0.001,
    credits: 1,
    tier: "economy",
    description: "Latest Google flash model",
  },
  
  // ========== STANDARD TIER (3-5 credits) ==========
  // GPT-4o-mini - $0.15 in / $0.60 out → ~$0.0015/gen
  "gpt-4o-mini": {
    provider: "openai",
    name: "GPT-4o Mini",
    apiCostUSD: 0.0015,
    credits: 3,
    tier: "standard",
    recommended: true,
    description: "OpenAI's cost-effective model",
  },
  // Claude Haiku - $0.80 in / $4 out → ~$0.01/gen
  "claude-3-5-haiku-20241022": {
    provider: "anthropic",
    name: "Claude 3.5 Haiku",
    apiCostUSD: 0.01,
    credits: 3,
    tier: "standard",
    description: "Fast Anthropic model",
  },
  // Mistral Small
  "mistral-small-latest": {
    provider: "mistral",
    name: "Mistral Small",
    apiCostUSD: 0.002,
    credits: 3,
    tier: "standard",
    description: "Efficient Mistral model",
  },
  // Gemini 1.5 Pro - $1.25 in / $5 out → ~$0.012/gen
  "gemini-1.5-pro": {
    provider: "google",
    name: "Gemini 1.5 Pro",
    apiCostUSD: 0.012,
    credits: 4,
    tier: "standard",
    description: "Google's pro model, 2M context",
  },
  // Grok Fast
  "grok-2-latest": {
    provider: "xai",
    name: "Grok 2",
    apiCostUSD: 0.01,
    credits: 4,
    tier: "standard",
    description: "xAI's latest model",
  },
  
  // ========== QUALITY TIER (6-10 credits) ==========
  // GPT-4o - $2.50 in / $10 out → ~$0.025/gen
  "gpt-4o": {
    provider: "openai",
    name: "GPT-4o",
    apiCostUSD: 0.025,
    credits: 6,
    tier: "quality",
    recommended: true,
    description: "OpenAI's flagship model",
  },
  // Claude Sonnet - $3 in / $15 out → ~$0.035/gen
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    apiCostUSD: 0.035,
    credits: 8,
    tier: "quality",
    recommended: true,
    description: "Best for creative writing",
  },
  // Mistral Large - $2 in / $6 out → ~$0.016/gen
  "mistral-large-latest": {
    provider: "mistral",
    name: "Mistral Large",
    apiCostUSD: 0.016,
    credits: 6,
    tier: "quality",
    description: "Mistral's flagship",
  },
  
  // ========== PREMIUM TIER (12-20 credits) ==========
  // GPT-4 Turbo - $10 in / $30 out → ~$0.08/gen
  "gpt-4-turbo": {
    provider: "openai",
    name: "GPT-4 Turbo",
    apiCostUSD: 0.08,
    credits: 15,
    tier: "premium",
    description: "High capability model",
  },
  // Claude Opus - $15 in / $75 out → ~$0.18/gen
  "claude-3-opus-20240229": {
    provider: "anthropic",
    name: "Claude 3 Opus",
    apiCostUSD: 0.18,
    credits: 20,
    tier: "premium",
    description: "Most capable Claude",
  },
  // o1-mini - $3 in / $12 out → ~$0.03/gen
  "o1-mini": {
    provider: "openai",
    name: "o1 Mini (Reasoning)",
    apiCostUSD: 0.03,
    credits: 12,
    tier: "premium",
    description: "Advanced reasoning",
  },
  
  // ========== ULTRA TIER (25+ credits) ==========
  // o1 - $15 in / $60 out → ~$0.15/gen
  "o1": {
    provider: "openai",
    name: "o1 (Reasoning)",
    apiCostUSD: 0.15,
    credits: 25,
    tier: "ultra",
    description: "Best reasoning model",
  },
};

// =============================================================================
// IMAGE GENERATION RATES
// =============================================================================

export const IMAGE_MODEL_RATES: Record<string, ModelRate> = {
  // ========== ECONOMY TIER (1-3 credits) - ANTI BONCOS! ==========
  // getimg.ai LCM - $0.00031/image
  "getimg-lcm": {
    provider: "getimg",
    name: "getimg LCM",
    apiCostUSD: 0.00031,
    credits: 1,
    tier: "economy",
    description: "TERMURAH! Fast generation",
  },
  // getimg.ai SDXL - $0.00157/image
  "getimg-sdxl": {
    provider: "getimg",
    name: "getimg SDXL",
    apiCostUSD: 0.00157,
    credits: 1,
    tier: "economy",
    recommended: true,
    description: "Best value for bulk",
  },
  // FLUX Schnell - ~$0.003/image
  "fal-ai/flux/schnell": {
    provider: "fal",
    name: "FLUX Schnell",
    apiCostUSD: 0.003,
    credits: 2,
    tier: "economy",
    description: "Fast FLUX model",
  },
  // Nebius SDXL - $0.003/image
  "nebius-sdxl": {
    provider: "nebius",
    name: "Nebius SDXL",
    apiCostUSD: 0.003,
    credits: 2,
    tier: "economy",
    description: "Cheap cloud option",
  },
  // Stability SDXL - $0.009/image
  "stable-diffusion-xl-1024-v1-0": {
    provider: "stability",
    name: "SDXL 1.0",
    apiCostUSD: 0.009,
    credits: 3,
    tier: "economy",
    description: "Official Stability API",
  },
  
  // ========== STANDARD TIER (4-8 credits) ==========
  // FLUX Dev - ~$0.015/image
  "fal-ai/flux/dev": {
    provider: "fal",
    name: "FLUX Dev",
    apiCostUSD: 0.015,
    credits: 4,
    tier: "standard",
    description: "Development quality",
  },
  // Replicate FLUX - ~$0.025/image
  "replicate-flux-dev": {
    provider: "replicate",
    name: "Replicate FLUX Dev",
    apiCostUSD: 0.025,
    credits: 5,
    tier: "standard",
    description: "Replicate hosted FLUX",
  },
  // SD 3.5 Flash - $0.025/image
  "sd3.5-flash": {
    provider: "stability",
    name: "SD 3.5 Flash",
    apiCostUSD: 0.025,
    credits: 5,
    tier: "standard",
    description: "Fast SD 3.5",
  },
  // Google Imagen 3 - $0.03/image
  "imagen-3": {
    provider: "google",
    name: "Imagen 3",
    apiCostUSD: 0.03,
    credits: 6,
    tier: "standard",
    recommended: true,
    description: "Google's best image model",
  },
  
  // ========== QUALITY TIER (8-15 credits) ==========
  // FLUX Pro - $0.04/image
  "fal-ai/flux-pro": {
    provider: "fal",
    name: "FLUX Pro",
    apiCostUSD: 0.04,
    credits: 8,
    tier: "quality",
    recommended: true,
    description: "Production quality",
  },
  // FLUX 1.1 Pro - $0.04/image
  "fal-ai/flux-pro/v1.1": {
    provider: "fal",
    name: "FLUX Pro 1.1",
    apiCostUSD: 0.04,
    credits: 10,
    tier: "quality",
    description: "Latest FLUX Pro",
  },
  // OpenAI DALL-E 3 Standard - $0.04/image
  "dall-e-3-standard": {
    provider: "openai",
    name: "DALL-E 3",
    apiCostUSD: 0.04,
    credits: 10,
    tier: "quality",
    description: "OpenAI image gen",
  },
  // SD 3.5 Large - $0.065/image
  "sd3.5-large": {
    provider: "stability",
    name: "SD 3.5 Large",
    apiCostUSD: 0.065,
    credits: 12,
    tier: "quality",
    description: "Best Stability model",
  },
  
  // ========== PREMIUM TIER (15-25 credits) ==========
  // FLUX Pro Ultra - $0.06/image
  "fal-ai/flux-pro/v1.1-ultra": {
    provider: "fal",
    name: "FLUX Pro Ultra",
    apiCostUSD: 0.06,
    credits: 15,
    tier: "premium",
    description: "High-res FLUX",
  },
  // DALL-E 3 HD - $0.08/image
  "dall-e-3-hd": {
    provider: "openai",
    name: "DALL-E 3 HD",
    apiCostUSD: 0.08,
    credits: 18,
    tier: "premium",
    description: "HD quality",
  },
  // Stable Image Ultra - $0.08/image
  "stable-image-ultra": {
    provider: "stability",
    name: "Stable Image Ultra",
    apiCostUSD: 0.08,
    credits: 18,
    tier: "premium",
    description: "Best Stability quality",
  },
  
  // ========== ULTRA TIER (25+ credits) ==========
  // Google Nano Banana Pro - $0.134/image
  "nano-banana-pro": {
    provider: "google",
    name: "Gemini Image Pro",
    apiCostUSD: 0.134,
    credits: 25,
    tier: "ultra",
    description: "Google's premium image",
  },
  // DALL-E 3 HD Wide - $0.12/image
  "dall-e-3-hd-wide": {
    provider: "openai",
    name: "DALL-E 3 HD Wide",
    apiCostUSD: 0.12,
    credits: 25,
    tier: "ultra",
    description: "HD wide format",
  },
};

// =============================================================================
// VIDEO GENERATION RATES - HATI-HATI BONCOS!
// =============================================================================

export const VIDEO_MODEL_RATES: Record<string, ModelRate> = {
  // ========== BUDGET TIER (10-20 credits) ==========
  // Replicate AnimateDiff - $0.01/video
  "animatediff": {
    provider: "replicate",
    name: "AnimateDiff",
    apiCostUSD: 0.01,
    credits: 5,
    tier: "economy",
    description: "TERMURAH! 2s video",
  },
  // Replicate Stable Video - $0.013/video
  "stable-video-diffusion": {
    provider: "replicate",
    name: "Stable Video",
    apiCostUSD: 0.013,
    credits: 8,
    tier: "economy",
    description: "4s video, budget option",
  },
  // Minimax Hailuo 512p - $0.10/video
  "hailuo-512p": {
    provider: "minimax",
    name: "Hailuo 512p",
    apiCostUSD: 0.10,
    credits: 15,
    tier: "economy",
    recommended: true,
    description: "6s low-res, best value",
  },
  // CogVideoX - $0.15/video
  "fal-ai/cogvideox-5b": {
    provider: "fal",
    name: "CogVideoX",
    apiCostUSD: 0.15,
    credits: 18,
    tier: "economy",
    description: "Open source video",
  },
  
  // ========== STANDARD TIER (20-35 credits) ==========
  // Kling 1.5 Standard - $0.14/video
  "kling-v1.5-std": {
    provider: "kling",
    name: "Kling 1.5 Standard",
    apiCostUSD: 0.14,
    credits: 20,
    tier: "standard",
    description: "5s good quality",
  },
  // Hailuo 768p - $0.19/video
  "hailuo-768p": {
    provider: "minimax",
    name: "Hailuo 768p",
    apiCostUSD: 0.19,
    credits: 25,
    tier: "standard",
    recommended: true,
    description: "6s HD video",
  },
  // Kling 2.5 - $0.21-0.35/video
  "kling-v2.5": {
    provider: "kling",
    name: "Kling 2.5",
    apiCostUSD: 0.28,
    credits: 30,
    tier: "standard",
    description: "Latest Kling",
  },
  // Runway Gen-3 Turbo 5s - $0.25/video
  "gen3a_turbo-5s": {
    provider: "runway",
    name: "Runway Turbo 5s",
    apiCostUSD: 0.25,
    credits: 35,
    tier: "standard",
    description: "Fast Runway",
  },
  
  // ========== QUALITY TIER (40-60 credits) ==========
  // Hailuo 1080p - $0.33/video
  "hailuo-1080p": {
    provider: "minimax",
    name: "Hailuo 1080p",
    apiCostUSD: 0.33,
    credits: 40,
    tier: "quality",
    description: "6s Full HD",
  },
  // Luma Dream Machine - ~$0.40/video (based on credits)
  "luma-ray2": {
    provider: "luma",
    name: "Luma Ray2",
    apiCostUSD: 0.40,
    credits: 45,
    tier: "quality",
    description: "5s high quality",
  },
  // Runway Gen-3 Alpha 5s - $0.50/video
  "gen3a-5s": {
    provider: "runway",
    name: "Runway Alpha 5s",
    apiCostUSD: 0.50,
    credits: 55,
    tier: "quality",
    recommended: true,
    description: "Best Runway quality",
  },
  // Runway Turbo 10s - $0.50/video
  "gen3a_turbo-10s": {
    provider: "runway",
    name: "Runway Turbo 10s",
    apiCostUSD: 0.50,
    credits: 55,
    tier: "quality",
    description: "10s fast video",
  },
  
  // ========== PREMIUM TIER (60-100 credits) ==========
  // Kling 10s - $0.42-0.70/video
  "kling-v2.5-10s": {
    provider: "kling",
    name: "Kling 2.5 10s",
    apiCostUSD: 0.56,
    credits: 65,
    tier: "premium",
    description: "10s Kling video",
  },
  // Sora 2 - $0.10/s → $1.00 for 10s
  "sora-2": {
    provider: "openai",
    name: "Sora 2",
    apiCostUSD: 1.00,
    credits: 100,
    tier: "premium",
    description: "OpenAI video (10s)",
  },
  // Runway Alpha 10s - $1.00/video
  "gen3a-10s": {
    provider: "runway",
    name: "Runway Alpha 10s",
    apiCostUSD: 1.00,
    credits: 100,
    tier: "premium",
    description: "Best quality 10s",
  },
  
  // ========== ULTRA TIER (150+ credits) - DANGER ZONE! ==========
  // Sora 2 Pro - $0.30-0.50/s → $3-5 for 10s
  "sora-2-pro": {
    provider: "openai",
    name: "Sora 2 Pro",
    apiCostUSD: 4.00,
    credits: 350,
    tier: "ultra",
    description: "Premium Sora (10s)",
  },
  // Runway Gen-4.5 20s 1080p - ~$27/video
  "gen4.5-20s": {
    provider: "runway",
    name: "Runway Gen-4.5 20s",
    apiCostUSD: 27.00,
    credits: 2500, // MAHAL BANGET!
    tier: "ultra",
    description: "⚠️ VERY EXPENSIVE!",
  },
};

// =============================================================================
// AUDIO GENERATION RATES
// =============================================================================

export const AUDIO_MODEL_RATES: Record<string, ModelRate> = {
  // ========== TTS - Text to Speech ==========
  // OpenAI TTS - $15/1M chars → ~$0.003 per 200 chars
  "tts-1": {
    provider: "openai",
    name: "OpenAI TTS",
    apiCostUSD: 0.003,
    credits: 3,
    tier: "standard",
    description: "Standard quality TTS",
  },
  "tts-1-hd": {
    provider: "openai",
    name: "OpenAI TTS HD",
    apiCostUSD: 0.006,
    credits: 5,
    tier: "quality",
    description: "HD quality TTS",
  },
  // ElevenLabs - ~$0.018 per 1000 chars
  "eleven_turbo_v2_5": {
    provider: "elevenlabs",
    name: "ElevenLabs Turbo",
    apiCostUSD: 0.01,
    credits: 5,
    tier: "standard",
    recommended: true,
    description: "Fast voice generation",
  },
  "eleven_multilingual_v2": {
    provider: "elevenlabs",
    name: "ElevenLabs Multilingual",
    apiCostUSD: 0.018,
    credits: 8,
    tier: "quality",
    description: "Multi-language support",
  },
  
  // ========== MUSIC GENERATION ==========
  // Suno - ~$0.04 per song (Pro plan)
  "suno-chirp-v3": {
    provider: "suno",
    name: "Suno Music",
    apiCostUSD: 0.04,
    credits: 15,
    tier: "quality",
    description: "AI music generation",
  },
  "suno-chirp-v4": {
    provider: "suno",
    name: "Suno V4",
    apiCostUSD: 0.06,
    credits: 20,
    tier: "premium",
    description: "Latest Suno model",
  },
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ModelRate {
  provider: string;
  name: string;
  apiCostUSD: number;
  credits: number;
  tier: "economy" | "standard" | "quality" | "premium" | "ultra";
  recommended?: boolean;
  description: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get all rates by type
export function getRatesByType(type: "text" | "image" | "video" | "audio"): Record<string, ModelRate> {
  switch (type) {
    case "text": return TEXT_MODEL_RATES;
    case "image": return IMAGE_MODEL_RATES;
    case "video": return VIDEO_MODEL_RATES;
    case "audio": return AUDIO_MODEL_RATES;
    default: return {};
  }
}

// Get rate for specific model
export function getModelRate(modelId: string): ModelRate | null {
  return (
    TEXT_MODEL_RATES[modelId] ||
    IMAGE_MODEL_RATES[modelId] ||
    VIDEO_MODEL_RATES[modelId] ||
    AUDIO_MODEL_RATES[modelId] ||
    null
  );
}

// Calculate credit cost
export function calculateCreditCost(modelId: string): number {
  const rate = getModelRate(modelId);
  return rate?.credits || 5; // Default 5 credits
}

// Get recommended models per type
export function getRecommendedModels(type: "text" | "image" | "video" | "audio") {
  const rates = getRatesByType(type);
  return Object.entries(rates)
    .filter(([_, rate]) => rate.recommended)
    .map(([modelId, rate]) => ({ modelId, ...rate }));
}

// Get models by tier
export function getModelsByTier(type: "text" | "image" | "video" | "audio", tier: string) {
  const rates = getRatesByType(type);
  return Object.entries(rates)
    .filter(([_, rate]) => rate.tier === tier)
    .map(([modelId, rate]) => ({ modelId, ...rate }))
    .sort((a, b) => a.credits - b.credits);
}

// Calculate margin
export function calculateMargin(apiCostUSD: number, credits: number): number {
  const revenue = credits * CREDIT_CONFIG.creditValueUSD;
  return ((revenue - apiCostUSD) / revenue) * 100;
}

// Estimate monthly cost for usage
export function estimateMonthlyCost(usagePerType: Record<string, { modelId: string; count: number }>) {
  let totalApiCost = 0;
  let totalCredits = 0;
  
  for (const [type, usage] of Object.entries(usagePerType)) {
    const rate = getModelRate(usage.modelId);
    if (rate) {
      totalApiCost += rate.apiCostUSD * usage.count;
      totalCredits += rate.credits * usage.count;
    }
  }
  
  return {
    apiCostUSD: totalApiCost,
    creditsUsed: totalCredits,
    revenueUSD: totalCredits * CREDIT_CONFIG.creditValueUSD,
    profitUSD: (totalCredits * CREDIT_CONFIG.creditValueUSD) - totalApiCost,
    margin: calculateMargin(totalApiCost, totalCredits),
  };
}

// =============================================================================
// SUBSCRIPTION PLAN LIMITS (Referensi dari pricing)
// =============================================================================

export const PLAN_CREDIT_LIMITS = {
  trial: {
    name: "Free Trial",
    credits: 50, // One-time
    videoAllowed: false,
    maxVideoCredits: 0,
  },
  creator: {
    name: "Creator",
    credits: 500, // Per month
    videoAllowed: true,
    maxVideoCredits: 50, // ~3 budget videos
  },
  studio: {
    name: "Studio",
    credits: 2000, // Per month
    videoAllowed: true,
    maxVideoCredits: 200, // ~10 standard videos
  },
  enterprise: {
    name: "Enterprise",
    credits: 10000, // Per month
    videoAllowed: true,
    maxVideoCredits: 1000, // ~25 quality videos
  },
};
