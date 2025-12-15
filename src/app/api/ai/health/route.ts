import { NextResponse } from "next/server";
import { isProviderConfigured, getAvailableModels } from "@/lib/ai/providers";

export async function GET() {
  const providers = {
    openai: isProviderConfigured("openai"),
    google: isProviderConfigured("google"),
    anthropic: isProviderConfigured("anthropic"),
  };

  const availableModels = getAvailableModels();
  const hasAnyProvider = Object.values(providers).some(Boolean);

  return NextResponse.json({
    status: hasAnyProvider ? "ok" : "no_providers",
    providers,
    availableModels,
    message: hasAnyProvider
      ? `${availableModels.length} models available`
      : "No AI providers configured. Add API keys to .env.local",
  });
}
