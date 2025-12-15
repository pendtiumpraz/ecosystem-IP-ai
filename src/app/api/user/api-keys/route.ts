import { NextResponse } from "next/server";
import { 
  getUserAISettings, 
  saveUserAISettings,
  PROVIDER_CONFIGS,
} from "@/lib/ai-providers";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get user's AI settings (enterprise only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const settings = await getUserAISettings(userId);
    
    if (!settings) {
      return NextResponse.json({ 
        success: false, 
        error: "Only enterprise tier can manage own AI",
        isEnterprise: false 
      }, { status: 403 });
    }

    // Get available providers for selection
    const availableProviders = Object.entries(PROVIDER_CONFIGS)
      .filter(([_, config]) => config.types.includes("text"))
      .map(([name, config]) => ({
        name,
        displayName: config.displayName,
      }));

    return NextResponse.json({
      success: true,
      isEnterprise: true,
      useSystemAI: settings.useSystemAI,
      ownProvider: settings.ownProvider,
      ownModelId: settings.ownModelId,
      ownApiKey: settings.ownApiKey, // Already masked
      availableProviders,
    });
  } catch (error) {
    console.error("Get user AI settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to get settings" }, { status: 500 });
  }
}

// POST - Save user's AI settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, useSystemAI, ownProvider, ownModelId, ownApiKey } = body;

    if (!userId || useSystemAI === undefined) {
      return NextResponse.json(
        { success: false, error: "userId and useSystemAI required" },
        { status: 400 }
      );
    }

    // If using own AI, validate required fields
    if (!useSystemAI && (!ownProvider || !ownModelId || !ownApiKey)) {
      return NextResponse.json(
        { success: false, error: "ownProvider, ownModelId, and ownApiKey required when using own AI" },
        { status: 400 }
      );
    }

    const success = await saveUserAISettings(
      userId, 
      useSystemAI, 
      ownProvider, 
      ownModelId, 
      ownApiKey
    );
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to save. Make sure you have enterprise tier." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: "AI settings saved" });
  } catch (error) {
    console.error("Save user AI settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
