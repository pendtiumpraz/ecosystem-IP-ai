import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Simple test prompts for different model types
const TEST_PROMPTS: Record<string, string> = {
  text: "Say 'Hello, MODO!' in one short sentence.",
  image: "A simple red circle on white background",
  video: "A bouncing ball animation",
  audio: "Hello world",
  multimodal: "Describe this test in one word: success",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: "modelId required" },
        { status: 400 }
      );
    }

    // Get model info
    const model = await sql`
      SELECT 
        m.id, m.model_id, m.name, m.type, m.credit_cost,
        p.id as provider_id, p.name as provider_name, p.slug as provider_slug, p.api_base_url
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = ${modelId}
    `;

    if (model.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    const m = model[0];

    // Get API key for this provider
    let apiKey = null;
    
    // For FREE models (Routeway), use the Routeway API key
    if (m.credit_cost === 0 || m.provider_slug === "routeway") {
      const routewayKey = await sql`
        SELECT encrypted_key FROM platform_api_keys 
        WHERE provider_id IN (SELECT id FROM ai_providers WHERE slug = 'routeway')
        AND is_active = TRUE LIMIT 1
      `;
      if (routewayKey.length > 0) {
        apiKey = routewayKey[0].encrypted_key;
      }
    } else {
      const providerKey = await sql`
        SELECT encrypted_key FROM platform_api_keys 
        WHERE provider_id = ${m.provider_id} AND is_active = TRUE 
        LIMIT 1
      `;
      if (providerKey.length > 0) {
        apiKey = providerKey[0].encrypted_key;
      }
    }

    if (!apiKey && m.credit_cost > 0) {
      return NextResponse.json({
        success: false,
        error: `No API key found for ${m.provider_name}. Please set API key first.`,
      });
    }

    // Test the model based on type
    const testPrompt = TEST_PROMPTS[m.type] || TEST_PROMPTS.text;
    
    try {
      const result = await testModelCall(m, apiKey, testPrompt);
      return NextResponse.json({
        success: true,
        message: result.message || `Model ${m.name} is working!`,
        response: result.response,
      });
    } catch (testError: any) {
      return NextResponse.json({
        success: false,
        error: testError.message || "Model test failed",
      });
    }

  } catch (error: any) {
    console.error("Test model error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test model" },
      { status: 500 }
    );
  }
}

async function testModelCall(model: any, apiKey: string, prompt: string): Promise<{ message: string; response?: string }> {
  const providerSlug = model.provider_slug.toLowerCase();
  const modelId = model.model_id;
  
  // Set timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    // OpenAI / OpenAI-compatible (Routeway, DeepSeek, etc.)
    if (providerSlug.includes("openai") || providerSlug.includes("routeway") || 
        providerSlug.includes("deepseek") || providerSlug.includes("groq")) {
      
      let baseUrl = "https://api.openai.com/v1";
      if (providerSlug.includes("routeway")) baseUrl = "https://api.routeway.ai/v1";
      if (providerSlug.includes("deepseek")) baseUrl = "https://api.deepseek.com/v1";
      
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error: ${res.status} - ${err.substring(0, 200)}`);
      }

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || "";
      return { message: "Model responded successfully!", response: response.substring(0, 100) };
    }

    // Google Gemini
    if (providerSlug.includes("google")) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 50 },
          }),
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini error: ${res.status} - ${err.substring(0, 200)}`);
      }

      const data = await res.json();
      const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { message: "Gemini responded successfully!", response: response.substring(0, 100) };
    }

    // Anthropic Claude
    if (providerSlug.includes("anthropic")) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 50,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude error: ${res.status} - ${err.substring(0, 200)}`);
      }

      const data = await res.json();
      const response = data.content?.[0]?.text || "";
      return { message: "Claude responded successfully!", response: response.substring(0, 100) };
    }

    // Mistral
    if (providerSlug.includes("mistral")) {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Mistral error: ${res.status} - ${err.substring(0, 200)}`);
      }

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || "";
      return { message: "Mistral responded successfully!", response: response.substring(0, 100) };
    }

    // Zhipu GLM
    if (providerSlug.includes("zhipu")) {
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Zhipu error: ${res.status} - ${err.substring(0, 200)}`);
      }

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || "";
      return { message: "GLM responded successfully!", response: response.substring(0, 100) };
    }

    // For image/video/audio models, just verify the API is accessible
    if (model.type === "image" || model.type === "video" || model.type === "audio") {
      return { 
        message: `${model.name} API key is configured. Full test requires generation (costs credits).`,
      };
    }

    // Default: just verify we have the key
    return { 
      message: `${model.name} is configured. No direct test available for this provider.`,
    };

  } finally {
    clearTimeout(timeout);
  }
}
