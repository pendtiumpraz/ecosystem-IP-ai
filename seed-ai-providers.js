const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Generate UUID v4
function uuidv4() {
  return crypto.randomUUID();
}

async function seed() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Seeding AI Providers & Models...\n');
  
  // ==========================================================================
  // AI PROVIDERS (match existing schema: name, slug, type, api_base_url)
  // type ENUM: text, image, video, audio, multimodal
  // ==========================================================================
  
  const providers = [
    // LLM Providers  
    { name: 'DeepSeek', slug: 'deepseek', type: 'text', api_base_url: 'https://api.deepseek.com' },
    { name: 'xAI Grok', slug: 'xai', type: 'text', api_base_url: 'https://api.x.ai/v1' },
    { name: 'Alibaba Qwen', slug: 'qwen', type: 'text', api_base_url: 'https://dashscope.aliyuncs.com/api/v1' },
    { name: 'Routeway (FREE)', slug: 'routeway', type: 'text', api_base_url: 'https://api.routeway.ai/v1' },
    
    // Image Providers
    { name: 'Stability AI', slug: 'stability', type: 'image', api_base_url: 'https://api.stability.ai/v2beta' },
    { name: 'getimg.ai', slug: 'getimg', type: 'image', api_base_url: 'https://api.getimg.ai/v1' },
    { name: 'Nebius', slug: 'nebius', type: 'image', api_base_url: 'https://api.nebius.ai/v1' },
    
    // Video Providers
    { name: 'Runway', slug: 'runway', type: 'video', api_base_url: 'https://api.runwayml.com/v1' },
    { name: 'Kling AI', slug: 'kling', type: 'video', api_base_url: 'https://api.klingai.com' },
    { name: 'Minimax Hailuo', slug: 'minimax', type: 'video', api_base_url: 'https://api.minimax.chat/v1' },
    { name: 'Luma Dream Machine', slug: 'luma', type: 'video', api_base_url: 'https://api.lumalabs.ai/dream-machine/v1' },
    
    // Audio Providers
    { name: 'ElevenLabs', slug: 'elevenlabs', type: 'audio', api_base_url: 'https://api.elevenlabs.io/v1' },
    { name: 'Suno Music', slug: 'suno', type: 'audio', api_base_url: 'https://studio-api.suno.ai' },
  ];
  
  console.log('📦 Creating providers...');
  for (const p of providers) {
    const id = uuidv4();
    await sql`
      INSERT INTO ai_providers (id, name, slug, type, api_base_url, is_active)
      VALUES (${id}, ${p.name}, ${p.slug}, ${p.type}, ${p.api_base_url}, TRUE)
      ON CONFLICT (slug) DO UPDATE SET 
        name = ${p.name},
        api_base_url = ${p.api_base_url},
        is_active = TRUE
    `;
    console.log(`  ✓ ${p.name}`);
  }
  
  // Get provider IDs (by slug, since name might have spaces)
  const providerRows = await sql`SELECT id, slug FROM ai_providers`;
  const providerMap = {};
  providerRows.forEach(p => { providerMap[p.slug] = p.id; });
  
  // Also map by name for existing providers
  const providerByName = await sql`SELECT id, name FROM ai_providers`;
  providerByName.forEach(p => {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!providerMap[slug]) providerMap[slug] = p.id;
    // Map OpenAI, Anthropic, etc
    if (p.name === 'OpenAI') providerMap['openai'] = p.id;
    if (p.name === 'Anthropic') providerMap['anthropic'] = p.id;
    if (p.name === 'Google AI') providerMap['google'] = p.id;
    if (p.name === 'Zhipu AI') providerMap['zhipu'] = p.id;
    if (p.name === 'Mistral AI') providerMap['mistral'] = p.id;
    if (p.name === 'Replicate') providerMap['replicate'] = p.id;
    if (p.name === 'Fal.ai') providerMap['fal'] = p.id;
  });
  
  // ==========================================================================
  // AI MODELS (schema: id, provider_id, name, model_id, type, credit_cost, is_default, is_active)
  // ==========================================================================
  
  const models = [
    // ========== TEXT/LLM MODELS ==========
    
    // OpenAI
    { provider: 'openai', model_id: 'gpt-5.2', name: 'GPT-5.2', type: 'text', cost: 25 },
    { provider: 'openai', model_id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', type: 'text', cost: 80 },
    { provider: 'openai', model_id: 'gpt-4.1', name: 'GPT-4.1', type: 'text', cost: 15 },
    { provider: 'openai', model_id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', type: 'text', cost: 5 },
    { provider: 'openai', model_id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', type: 'text', cost: 2 },
    { provider: 'openai', model_id: 'o3', name: 'o3 (Reasoning)', type: 'text', cost: 20 },
    { provider: 'openai', model_id: 'o3-mini', name: 'o3 Mini', type: 'text', cost: 10 },
    
    // Anthropic
    { provider: 'anthropic', model_id: 'claude-opus-4.5', name: 'Claude Opus 4.5', type: 'text', cost: 35 },
    { provider: 'anthropic', model_id: 'claude-sonnet-4', name: 'Claude Sonnet 4', type: 'text', cost: 20 },
    { provider: 'anthropic', model_id: 'claude-haiku-4', name: 'Claude Haiku 4', type: 'text', cost: 8 },
    
    // Google Gemini (December 2025 - Latest Working Models)
    { provider: 'google', model_id: 'gemini-3-pro', name: 'Gemini 3 Pro', type: 'text', cost: 20 },
    { provider: 'google', model_id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'text', cost: 12 },
    { provider: 'google', model_id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'text', cost: 3 },
    { provider: 'google', model_id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', type: 'text', cost: 2 },
    { provider: 'google', model_id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'text', cost: 1 },
    // NOTE: Gemini 1.5 Flash is DEPRECATED as of Dec 2025!
    
    // DeepSeek (SUPER MURAH!)
    { provider: 'deepseek', model_id: 'deepseek-chat', name: 'DeepSeek V3.2', type: 'text', cost: 1 },
    { provider: 'deepseek', model_id: 'deepseek-v3.2-speciale', name: 'DeepSeek V3.2 Speciale', type: 'text', cost: 2 },
    { provider: 'deepseek', model_id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoning)', type: 'text', cost: 3 },
    
    // xAI Grok
    { provider: 'xai', model_id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', type: 'text', cost: 2 },
    { provider: 'xai', model_id: 'grok-4', name: 'Grok 4', type: 'text', cost: 20 },
    { provider: 'xai', model_id: 'grok-3', name: 'Grok 3', type: 'text', cost: 15 },
    
    // Zhipu GLM
    { provider: 'zhipu', model_id: 'glm-4.6', name: 'GLM-4.6', type: 'text', cost: 5 },
    { provider: 'zhipu', model_id: 'glm-4.6v', name: 'GLM-4.6V (Vision)', type: 'text', cost: 3 },
    { provider: 'zhipu', model_id: 'glm-4-flash', name: 'GLM-4 Flash (FREE)', type: 'text', cost: 0 },
    
    // Mistral
    { provider: 'mistral', model_id: 'mistral-large-3-2512', name: 'Mistral Large 3', type: 'text', cost: 8 },
    { provider: 'mistral', model_id: 'devstral-2-2512', name: 'Devstral 2 (Coding)', type: 'text', cost: 3 },
    { provider: 'mistral', model_id: 'ministral-3-14b', name: 'Ministral 3 14B', type: 'text', cost: 2 },
    { provider: 'mistral', model_id: 'mistral-nemo', name: 'Mistral Nemo', type: 'text', cost: 1 },
    
    // Qwen
    { provider: 'qwen', model_id: 'qwen3-235b-a22b', name: 'Qwen3 235B', type: 'text', cost: 10 },
    { provider: 'qwen', model_id: 'qwen-max', name: 'Qwen Max', type: 'text', cost: 8 },
    { provider: 'qwen', model_id: 'qwen-plus', name: 'Qwen Plus', type: 'text', cost: 4 },
    { provider: 'qwen', model_id: 'qwen-flash', name: 'Qwen Flash', type: 'text', cost: 1 },
    
    // ========== ROUTEWAY FREE MODELS (0 CREDITS!) ==========
    { provider: 'routeway', model_id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3.1 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'deepseek/deepseek-r1-distill-qwen-32b:free', name: 'DeepSeek R1 Distill Qwen 32B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'meta-llama/llama-3.2-1b-instruct:free', name: 'Llama 3.2 1B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'moonshotai/kimi-k2-instruct:free', name: 'Kimi K2 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'thudm/glm-4-9b-0414:free', name: 'GLM 4.6 9B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'minimax/minimax-m1-80k:free', name: 'MiniMax M2 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'mistralai/devstral-2503:free', name: 'Devstral 2 (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Nemotron Super 49B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'open-r1/olympiccoder-32b:free', name: 'Olympic Coder 32B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'qwen/qwen3-32b:free', name: 'Qwen3 32B (FREE)', type: 'text', cost: 0 },
    { provider: 'routeway', model_id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B (FREE)', type: 'text', cost: 0 },
    
    // ========== IMAGE MODELS ==========
    
    // Fal.ai FLUX
    { provider: 'fal', model_id: 'fal-ai/flux-pro/v1.1', name: 'FLUX 1.1 Pro', type: 'image', cost: 10 },
    { provider: 'fal', model_id: 'fal-ai/flux-pro/v1.1-ultra', name: 'FLUX 1.1 Pro Ultra (4K)', type: 'image', cost: 15 },
    { provider: 'fal', model_id: 'fal-ai/flux/dev', name: 'FLUX Dev', type: 'image', cost: 6 },
    { provider: 'fal', model_id: 'fal-ai/flux/schnell', name: 'FLUX Schnell (Fast)', type: 'image', cost: 2 },
    { provider: 'fal', model_id: 'fal-ai/flux-pro/kontext', name: 'FLUX Kontext (Edit)', type: 'image', cost: 12 },
    
    // Stability AI
    { provider: 'stability', model_id: 'stable-image-ultra', name: 'Stable Image Ultra', type: 'image', cost: 20 },
    { provider: 'stability', model_id: 'sd3.5-large', name: 'SD 3.5 Large', type: 'image', cost: 15 },
    { provider: 'stability', model_id: 'sd3.5-medium', name: 'SD 3.5 Medium', type: 'image', cost: 8 },
    { provider: 'stability', model_id: 'sd3.5-flash', name: 'SD 3.5 Flash', type: 'image', cost: 5 },
    { provider: 'stability', model_id: 'sdxl-1.0', name: 'SDXL 1.0', type: 'image', cost: 2 },
    
    // Google Imagen
    { provider: 'google', model_id: 'imagen-3', name: 'Imagen 3', type: 'image', cost: 8 },
    { provider: 'google', model_id: 'nano-banana-pro', name: 'Nano Banana Pro (Gemini 3)', type: 'image', cost: 30 },
    
    // getimg.ai (TERMURAH!)
    { provider: 'getimg', model_id: 'lcm', name: 'LCM (Ultra Fast)', type: 'image', cost: 1 },
    { provider: 'getimg', model_id: 'getimg-sdxl', name: 'SDXL', type: 'image', cost: 1 },
    { provider: 'getimg', model_id: 'getimg-flux-schnell', name: 'FLUX Schnell', type: 'image', cost: 2 },
    
    // Nebius
    { provider: 'nebius', model_id: 'sdxl-premium', name: 'SDXL Premium', type: 'image', cost: 2 },
    { provider: 'nebius', model_id: 'nebius-fast', name: 'Fast Model', type: 'image', cost: 1 },
    
    // ========== VIDEO MODELS ==========
    
    // Runway
    { provider: 'runway', model_id: 'gen-3-alpha-turbo', name: 'Gen-3 Alpha Turbo (5s)', type: 'video', cost: 60 },
    { provider: 'runway', model_id: 'gen-3-alpha', name: 'Gen-3 Alpha (5s)', type: 'video', cost: 120 },
    { provider: 'runway', model_id: 'gen-4.5', name: 'Gen-4.5 (20s 1080p)', type: 'video', cost: 2500 },
    
    // Kling
    { provider: 'kling', model_id: 'kling-1.5-standard', name: 'Kling 1.5 Standard', type: 'video', cost: 35 },
    { provider: 'kling', model_id: 'kling-2.0', name: 'Kling 2.0', type: 'video', cost: 70 },
    { provider: 'kling', model_id: 'kling-2.5', name: 'Kling 2.5', type: 'video', cost: 85 },
    
    // Minimax Hailuo
    { provider: 'minimax', model_id: 'hailuo-512p', name: 'Hailuo 512p (6s)', type: 'video', cost: 25 },
    { provider: 'minimax', model_id: 'hailuo-768p', name: 'Hailuo 768p (6s)', type: 'video', cost: 50 },
    { provider: 'minimax', model_id: 'hailuo-1080p', name: 'Hailuo 1080p (6s)', type: 'video', cost: 100 },
    { provider: 'minimax', model_id: 'hailuo-02', name: 'Hailuo 02 (Latest)', type: 'video', cost: 70 },
    
    // Luma
    { provider: 'luma', model_id: 'dream-machine', name: 'Dream Machine', type: 'video', cost: 50 },
    { provider: 'luma', model_id: 'ray3', name: 'Ray 3', type: 'video', cost: 200 },
    
    // Replicate (Budget)
    { provider: 'replicate', model_id: 'animatediff', name: 'AnimateDiff (2s)', type: 'video', cost: 5 },
    { provider: 'replicate', model_id: 'stable-video-diffusion', name: 'Stable Video (4s)', type: 'video', cost: 8 },
    { provider: 'replicate', model_id: 'cogvideox', name: 'CogVideoX (6s)', type: 'video', cost: 40 },
    
    // OpenAI Sora
    { provider: 'openai', model_id: 'sora-2', name: 'Sora 2 (10s)', type: 'video', cost: 200 },
    { provider: 'openai', model_id: 'sora-2-pro', name: 'Sora 2 Pro (4K)', type: 'video', cost: 350 },
    
    // ========== AUDIO MODELS ==========
    
    // ElevenLabs
    { provider: 'elevenlabs', model_id: 'eleven_multilingual_v2', name: 'Multilingual V2 TTS', type: 'audio', cost: 5 },
    { provider: 'elevenlabs', model_id: 'eleven_turbo_v2_5', name: 'Turbo V2.5 TTS', type: 'audio', cost: 3 },
    { provider: 'elevenlabs', model_id: 'eleven_flash_v2_5', name: 'Flash V2.5 TTS', type: 'audio', cost: 2 },
    
    // OpenAI TTS
    { provider: 'openai', model_id: 'tts-1', name: 'TTS-1', type: 'audio', cost: 3 },
    { provider: 'openai', model_id: 'tts-1-hd', name: 'TTS-1 HD', type: 'audio', cost: 6 },
    
    // Suno Music
    { provider: 'suno', model_id: 'suno-v4', name: 'Suno V4 Music', type: 'audio', cost: 25 },
    { provider: 'suno', model_id: 'suno-v3.5', name: 'Suno V3.5 Music', type: 'audio', cost: 15 },
  ];
  
  console.log('\n📦 Creating models...');
  let count = 0;
  for (const m of models) {
    const providerId = providerMap[m.provider];
    if (!providerId) {
      console.log(`  ⚠ Provider ${m.provider} not found, skipping ${m.model_id}`);
      continue;
    }
    
    const id = uuidv4();
    
    // Check if model exists
    const existing = await sql`SELECT id FROM ai_models WHERE model_id = ${m.model_id}`;
    
    if (existing.length > 0) {
      // Update existing
      await sql`
        UPDATE ai_models SET 
          name = ${m.name},
          credit_cost = ${m.cost},
          is_active = TRUE
        WHERE model_id = ${m.model_id}
      `;
    } else {
      // Insert new
      await sql`
        INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, is_active)
        VALUES (${id}, ${providerId}, ${m.name}, ${m.model_id}, ${m.type}, ${m.cost}, TRUE)
      `;
    }
    count++;
  }
  console.log(`  ✓ ${count} models created/updated`);
  
  // ==========================================================================
  // SET DEFAULT MODELS PER TYPE
  // ==========================================================================
  
  console.log('\n📦 Setting default models...');
  
  // Default: Use FREE Routeway models for text
  await sql`UPDATE ai_models SET is_default = FALSE WHERE type = 'text'`;
  await sql`UPDATE ai_models SET is_default = TRUE WHERE model_id = 'deepseek/deepseek-r1:free'`;
  console.log('  ✓ Default text: DeepSeek R1 (FREE via Routeway)');
  
  // Default image: getimg.ai LCM (cheapest)
  await sql`UPDATE ai_models SET is_default = FALSE WHERE type = 'image'`;
  await sql`UPDATE ai_models SET is_default = TRUE WHERE model_id = 'lcm'`;
  console.log('  ✓ Default image: getimg.ai LCM (cheapest)');
  
  // Default video: Minimax Hailuo 512p (budget)
  await sql`UPDATE ai_models SET is_default = FALSE WHERE type = 'video'`;
  await sql`UPDATE ai_models SET is_default = TRUE WHERE model_id = 'hailuo-512p'`;
  console.log('  ✓ Default video: Minimax Hailuo 512p (budget)');
  
  // Default audio: ElevenLabs Flash (cheapest)
  await sql`UPDATE ai_models SET is_default = FALSE WHERE type = 'audio'`;
  await sql`UPDATE ai_models SET is_default = TRUE WHERE model_id = 'eleven_flash_v2_5'`;
  console.log('  ✓ Default audio: ElevenLabs Flash V2.5');
  
  // ==========================================================================
  // ADD ROUTEWAY API KEY TO platform_api_keys
  // ==========================================================================
  
  console.log('\n📦 Adding Routeway API key...');
  const routewayProviderId = providerMap['routeway'];
  if (routewayProviderId) {
    const keyId = uuidv4();
    const existingKey = await sql`SELECT id FROM platform_api_keys WHERE provider_id = ${routewayProviderId}`;
    
    if (existingKey.length === 0) {
      await sql`
        INSERT INTO platform_api_keys (id, provider_id, name, encrypted_key, is_active)
        VALUES (${keyId}, ${routewayProviderId}, 'Routeway Default Key', 'sk-rAL3dbl26RtWPjfmeOcBTP3X8fVOxiQoj7JTIParRLec1rmk', TRUE)
      `;
      console.log('  ✓ Routeway API key added');
    } else {
      console.log('  ✓ Routeway API key already exists');
    }
  }
  
  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  
  const summary = await sql`
    SELECT type, COUNT(*) as count 
    FROM ai_models 
    GROUP BY type
  `;
  
  console.log('\n✅ SEED COMPLETED!\n');
  console.log('📊 Summary:');
  summary.forEach(s => {
    console.log(`   ${s.type}: ${s.count} models`);
  });
  
  const freeModels = await sql`SELECT COUNT(*) as count FROM ai_models WHERE credit_cost = 0`;
  console.log(`\n🎁 FREE models: ${freeModels[0].count} (via Routeway + Zhipu)`);
  
  console.log('\n⚠️  IMPORTANT: Set API keys for paid providers in Admin > AI Providers!');
  console.log('   Routeway API key sudah di-set otomatis.\n');
}

seed().catch(console.error);
