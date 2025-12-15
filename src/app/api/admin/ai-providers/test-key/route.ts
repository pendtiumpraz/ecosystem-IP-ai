import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Provider test endpoints
const TEST_ENDPOINTS: Record<string, { url: string; method: string; headers: (key: string) => Record<string, string>; body?: any }> = {
  openai: {
    url: "https://api.openai.com/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    method: "POST",
    headers: (key) => ({ 
      "x-api-key": key, 
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    }),
    body: { model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{ role: "user", content: "hi" }] },
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta/models?key=",
    method: "GET",
    headers: () => ({}),
  },
  fal: {
    url: "https://queue.fal.run/fal-ai/flux/schnell",
    method: "POST",
    headers: (key) => ({ Authorization: `Key ${key}`, "Content-Type": "application/json" }),
    body: { prompt: "test", num_inference_steps: 1, image_size: "square_hd" },
  },
  replicate: {
    url: "https://api.replicate.com/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  stability: {
    url: "https://api.stability.ai/v1/user/account",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  elevenlabs: {
    url: "https://api.elevenlabs.io/v1/user",
    method: "GET",
    headers: (key) => ({ "xi-api-key": key }),
  },
  routeway: {
    url: "https://api.routeway.ai/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  mistral: {
    url: "https://api.mistral.ai/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  zhipu: {
    url: "https://open.bigmodel.cn/api/paas/v4/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  xai: {
    url: "https://api.x.ai/v1/models",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  qwen: {
    url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
    method: "GET",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
  },
};

// POST - Test API key for a provider
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, apiKey } = body;

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "Provider ID required" },
        { status: 400 }
      );
    }

    // Get provider info
    const provider = await sql`
      SELECT name, slug, api_base_url FROM ai_providers WHERE id = ${providerId}
    `;

    if (provider.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    // Get API key - use provided or fetch from database
    let keyToTest = apiKey;
    if (!keyToTest) {
      const storedKey = await sql`
        SELECT encrypted_key FROM platform_api_keys 
        WHERE provider_id = ${providerId} AND is_active = TRUE 
        LIMIT 1
      `;
      if (storedKey.length > 0) {
        keyToTest = storedKey[0].encrypted_key;
      }
    }

    if (!keyToTest) {
      return NextResponse.json({
        success: false,
        error: "No API key found. Please set an API key first.",
        status: "no_key",
      });
    }

    // Find test config
    const providerSlug = provider[0].slug.toLowerCase();
    let testConfig = TEST_ENDPOINTS[providerSlug];
    
    // Try partial match
    if (!testConfig) {
      const matchKey = Object.keys(TEST_ENDPOINTS).find(k => 
        providerSlug.includes(k) || k.includes(providerSlug)
      );
      if (matchKey) testConfig = TEST_ENDPOINTS[matchKey];
    }

    if (!testConfig) {
      return NextResponse.json({
        success: true,
        message: `API key saved. No test endpoint available for ${provider[0].name}.`,
        status: "saved_no_test",
      });
    }

    // Build request
    let url = testConfig.url;
    if (providerSlug.includes("google")) {
      url = testConfig.url + keyToTest;
    }

    const fetchOptions: RequestInit = {
      method: testConfig.method,
      headers: testConfig.headers(keyToTest),
    };

    if (testConfig.body && testConfig.method === "POST") {
      fetchOptions.body = JSON.stringify(testConfig.body);
    }

    // Make test request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: `API key valid! Connected to ${provider[0].name}.`,
          status: "valid",
        });
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        let errorMsg = `Invalid API key or access denied (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
        } catch {}

        return NextResponse.json({
          success: false,
          error: errorMsg,
          status: "invalid",
        });
      }
    } catch (fetchError: any) {
      clearTimeout(timeout);
      if (fetchError.name === "AbortError") {
        return NextResponse.json({
          success: false,
          error: "Connection timeout. Please check the API endpoint.",
          status: "timeout",
        });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Test API key error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test API key" },
      { status: 500 }
    );
  }
}
