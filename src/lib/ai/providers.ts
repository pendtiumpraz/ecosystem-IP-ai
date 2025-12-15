import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

// Provider configurations
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model mappings
export const TEXT_MODELS = {
  // OpenAI
  "gpt-4o": openai("gpt-4o"),
  "gpt-4o-mini": openai("gpt-4o-mini"),
  "gpt-4-turbo": openai("gpt-4-turbo"),
  
  // Google
  "gemini-2.0-flash": google("gemini-2.0-flash-exp"),
  "gemini-1.5-pro": google("gemini-1.5-pro"),
  "gemini-1.5-flash": google("gemini-1.5-flash"),
  
  // Anthropic
  "claude-3.5-sonnet": anthropic("claude-3-5-sonnet-20241022"),
  "claude-3-haiku": anthropic("claude-3-haiku-20240307"),
} as const;

export type TextModelId = keyof typeof TEXT_MODELS;

// Default models per task
export const DEFAULT_MODELS = {
  synopsis: "gemini-2.0-flash" as TextModelId,
  structure: "gemini-2.0-flash" as TextModelId,
  character: "gpt-4o-mini" as TextModelId,
  script: "claude-3.5-sonnet" as TextModelId,
  general: "gemini-1.5-flash" as TextModelId,
};

// Credit costs per model
export const CREDIT_COSTS: Record<TextModelId, number> = {
  "gpt-4o": 5,
  "gpt-4o-mini": 1,
  "gpt-4-turbo": 4,
  "gemini-2.0-flash": 1,
  "gemini-1.5-pro": 3,
  "gemini-1.5-flash": 1,
  "claude-3.5-sonnet": 4,
  "claude-3-haiku": 1,
};

// Get model by ID with fallback
export function getTextModel(modelId?: TextModelId) {
  if (modelId && TEXT_MODELS[modelId]) {
    return TEXT_MODELS[modelId];
  }
  return TEXT_MODELS[DEFAULT_MODELS.general];
}

// Check if provider is configured
export function isProviderConfigured(provider: "openai" | "google" | "anthropic"): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "google":
      return !!process.env.GOOGLE_AI_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

// Get available models based on configured providers
export function getAvailableModels(): TextModelId[] {
  const available: TextModelId[] = [];
  
  if (isProviderConfigured("openai")) {
    available.push("gpt-4o", "gpt-4o-mini", "gpt-4-turbo");
  }
  if (isProviderConfigured("google")) {
    available.push("gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash");
  }
  if (isProviderConfigured("anthropic")) {
    available.push("claude-3.5-sonnet", "claude-3-haiku");
  }
  
  return available;
}
