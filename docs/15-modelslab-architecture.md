# 🎨 MODELSLAB API ARCHITECTURE
## Image & Video AI Integration for ecosystem-IP-ai

**Date:** December 2025  
**API Provider:** https://modelslab.com  
**LLM Provider:** OpenRouter  
**Goal:** Complete AI integration with character & universe consistency

---

# 📊 EXECUTIVE SUMMARY

ecosystem-IP-ai akan menggunakan:
- **LLM (Text AI):** OpenRouter API (multi-provider, model selection)
- **Image AI:** Modelslab API (text-to-image, image-to-image, image-to-video)
- **Video AI:** Modelslab API (text-to-video, image-to-video)
- **Consistency:** Custom system for character & universe consistency

---

# 🤖 LLM (TEXT AI) - OPENROUTER

## OpenRouter Integration

### Why OpenRouter?
- ✅ Single API key for 500+ models
- ✅ Switch between models without code changes
- ✅ Cost tracking per model
- ✅ Fallback support
- ✅ Latest models (GPT-5.2, Claude 4.5, Gemini 3, etc.)

### Recommended Models for Different Use Cases

| Use Case | Model | Cost/1M tokens | Why |
|----------|-------|----------------|-----|
| **Default** | Gemini 2.5 Flash | $0.075 in / $0.30 out | Fast, reliable, cost-effective |
| **Premium** | Gemini 3 Pro | $2.00 in / $12.00 out | #1 AI globally |
| **Fast** | Grok 4.1 Fast | $0.20 in / $0.50 out | 2M context, fast |
| **Coding** | Devstral 2 2512 | $0.15 in / $0.60 out | Best agentic coding |
| **Vision** | GLM-4.6V | $0.30 in / $0.90 out | Vision + tools |
| **Reasoning** | DeepSeek R1 | $0.55 in / $2.19 out | Deep reasoning |

### API Integration

```typescript
// src/lib/openrouter.ts

interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

interface OpenRouterRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = {
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'google/gemini-2.5-flash',
      ...config,
    };
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://modo-ecosystem.com',
        'X-Title': 'MODO Ecosystem',
      },
      body: JSON.stringify({
        model: request.model || this.config.defaultModel,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2000,
        stream: request.stream || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async generateWithModel(
    prompt: string,
    model: string,
    options?: Partial<OpenRouterRequest>
  ): Promise<string> {
    const response = await this.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });

    return response.choices[0].message.content;
  }

  // Get available models
  async getModels(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY || '',
      defaultModel: 'google/gemini-2.5-flash',
    });
  }
  return openRouterClient;
}
```

### API Endpoint Implementation

```typescript
// src/app/api/ai/generate-text/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, temperature, maxTokens } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const client = getOpenRouterClient();
    const response = await client.chat({
      model: model || 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000,
    });

    return NextResponse.json({
      text: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Text generation error:', error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}
```

---

# 🖼️ IMAGE AI - MODELSLAB

## Modelslab API Overview

Modelslab provides unified API for:
- **Text-to-Image** (SDXL, FLUX, etc.)
- **Image-to-Image** (edit existing images)
- **Image-to-Video** (convert images to video)
- **Text-to-Video** (generate video from text)

### Pricing (from modelslab.com/pricing)

| Service | Model | Price | Notes |
|---------|-------|-------|-------|
| Text-to-Image | SDXL | $0.003 | Standard |
| Text-to-Image | FLUX.1 | $0.015 | High quality |
| Text-to-Image | FLUX.1 Pro | $0.03 | Premium |
| Image-to-Image | SDXL | $0.003 | Edit |
| Image-to-Video | AnimateDiff | $0.01 | 2s video |
| Text-to-Video | Stable Video | $0.013 | 4s video |

### API Integration

```typescript
// src/lib/modelslab.ts

interface ModelslabConfig {
  apiKey: string;
  baseUrl: string;
}

interface TextToImageRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  model?: string;
  num_images?: number;
  seed?: number;
  steps?: number;
  guidance_scale?: number;
}

interface ImageToImageRequest {
  prompt: string;
  init_image: string; // base64 or URL
  negative_prompt?: string;
  strength?: number;
  guidance_scale?: number;
  num_images?: number;
  model?: string;
}

interface ImageToVideoRequest {
  init_image: string;
  motion_bucket_id?: number;
  fps?: number;
  num_frames?: number;
  model?: string;
}

interface TextToVideoRequest {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  model?: string;
}

export class ModelslabClient {
  private config: ModelslabConfig;

  constructor(config: ModelslabConfig) {
    this.config = {
      baseUrl: 'https://api.modelslab.com/v1',
      ...config,
    };
  }

  private async request(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Modelslab API error: ${response.statusText}`);
    }

    return await response.json();
  }

  // Text to Image
  async textToImage(request: TextToImageRequest): Promise<{ images: string[] }> {
    return await this.request('/text-to-image', {
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || '',
      width: request.width || 1024,
      height: request.height || 1024,
      model: request.model || 'sdxl',
      num_images: request.num_images || 1,
      seed: request.seed || -1,
      steps: request.steps || 30,
      guidance_scale: request.guidance_scale || 7.5,
    });
  }

  // Image to Image (for character consistency)
  async imageToImage(request: ImageToImageRequest): Promise<{ images: string[] }> {
    return await this.request('/image-to-image', {
      prompt: request.prompt,
      init_image: request.init_image,
      negative_prompt: request.negative_prompt || '',
      strength: request.strength || 0.7,
      guidance_scale: request.guidance_scale || 7.5,
      num_images: request.num_images || 1,
      model: request.model || 'sdxl',
    });
  }

  // Image to Video
  async imageToVideo(request: ImageToVideoRequest): Promise<{ video: string }> {
    return await this.request('/image-to-video', {
      init_image: request.init_image,
      motion_bucket_id: request.motion_bucket_id || 127,
      fps: request.fps || 24,
      num_frames: request.num_frames || 24,
      model: request.model || 'animatediff',
    });
  }

  // Text to Video
  async textToVideo(request: TextToVideoRequest): Promise<{ video: string }> {
    return await this.request('/text-to-video', {
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || '',
      num_frames: request.num_frames || 24,
      fps: request.fps || 24,
      model: request.model || 'stable-video',
    });
  }

  // Get available models
  async getModels(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Modelslab API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models;
  }
}

// Singleton instance
let modelslabClient: ModelslabClient | null = null;

export function getModelslabClient(): ModelslabClient {
  if (!modelslabClient) {
    modelslabClient = new ModelslabClient({
      apiKey: process.env.MODELSLAB_API_KEY || '',
    });
  }
  return modelslabClient;
}
```

### API Endpoints

```typescript
// src/app/api/ai/generate-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getModelslabClient } from '@/lib/modelslab';

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, width, height, model, numImages } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const client = getModelslabClient();
    const response = await client.textToImage({
      prompt,
      negative_prompt: negativePrompt,
      width: width || 1024,
      height: height || 1024,
      model: model || 'sdxl',
      num_images: numImages || 1,
    });

    return NextResponse.json({
      images: response.images,
      model: model || 'sdxl',
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}

// src/app/api/ai/edit-image/route.ts

export async function POST(req: NextRequest) {
  try {
    const { prompt, initImage, strength, model } = await req.json();

    if (!prompt || !initImage) {
      return NextResponse.json({ error: 'Prompt and initImage are required' }, { status: 400 });
    }

    const client = getModelslabClient();
    const response = await client.imageToImage({
      prompt,
      init_image: initImage,
      strength: strength || 0.7,
      model: model || 'sdxl',
    });

    return NextResponse.json({
      images: response.images,
      model: model || 'sdxl',
    });

  } catch (error) {
    console.error('Image edit error:', error);
    return NextResponse.json({ error: 'Failed to edit image' }, { status: 500 });
  }
}

// src/app/api/ai/image-to-video/route.ts

export async function POST(req: NextRequest) {
  try {
    const { initImage, motionBucketId, fps, numFrames, model } = await req.json();

    if (!initImage) {
      return NextResponse.json({ error: 'initImage is required' }, { status: 400 });
    }

    const client = getModelslabClient();
    const response = await client.imageToVideo({
      init_image: initImage,
      motion_bucket_id: motionBucketId || 127,
      fps: fps || 24,
      num_frames: numFrames || 24,
      model: model || 'animatediff',
    });

    return NextResponse.json({
      video: response.video,
      model: model || 'animatediff',
    });

  } catch (error) {
    console.error('Image to video error:', error);
    return NextResponse.json({ error: 'Failed to generate video' }, { status: 500 });
  }
}

// src/app/api/ai/text-to-video/route.ts

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, fps, numFrames, model } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const client = getModelslabClient();
    const response = await client.textToVideo({
      prompt,
      negative_prompt: negativePrompt,
      fps: fps || 24,
      num_frames: numFrames || 24,
      model: model || 'stable-video',
    });

    return NextResponse.json({
      video: response.video,
      model: model || 'stable-video',
    });

  } catch (error) {
    console.error('Text to video error:', error);
    return NextResponse.json({ error: 'Failed to generate video' }, { status: 500 });
  }
}
```

---

# 👤 CHARACTER CONSISTENCY SYSTEM

## Overview

Character consistency ensures that the same character looks identical across all generated images and videos.

### Implementation Strategy

1. **Character Reference Images** - Store base character images
2. **Character Prompts** - Generate detailed character descriptions
3. **Image-to-Image** - Use reference image to generate consistent variations
4. **Character Embeddings** - Store visual embeddings for similarity matching

### Database Schema

```sql
-- Character reference images
CREATE TABLE character_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL, -- 'base', 'front', 'side', 'action', 'emotion'
  pose VARCHAR(50),
  emotion VARCHAR(50),
  description TEXT,
  embedding VECTOR(512), -- For visual similarity
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(character_id, image_type, pose, emotion)
);

-- Character consistency settings
CREATE TABLE character_consistency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
  base_image_id UUID REFERENCES character_reference_images(id),
  strength DECIMAL(3,2) DEFAULT 0.7, -- How much to preserve original
  guidance_scale DECIMAL(3,2) DEFAULT 7.5,
  negative_prompt TEXT DEFAULT 'blurry, distorted, low quality',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Character Consistency Service

```typescript
// src/lib/character-consistency.ts

interface CharacterData {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  age?: number;
  gender?: string;
}

interface CharacterPrompt {
  base: string;
  detailed: string;
  visualStyle: string;
}

export class CharacterConsistencyService {
  private modelslabClient: ModelslabClient;
  private openRouterClient: OpenRouterClient;

  constructor() {
    this.modelslabClient = getModelslabClient();
    this.openRouterClient = getOpenRouterClient();
  }

  // Generate detailed character prompt from character data
  async generateCharacterPrompt(character: CharacterData): Promise<CharacterPrompt> {
    const prompt = `Generate a detailed visual description for this character:

CHARACTER NAME: ${character.name}
ROLE: ${character.role}
AGE: ${character.age || 'Not specified'}
GENDER: ${character.gender || 'Not specified'}
APPEARANCE: ${character.appearance || 'Not specified'}
PERSONALITY: ${character.personality || 'Not specified'}

Generate:
1. Base description (physical features, clothing style, accessories)
2. Detailed description (facial features, expressions, body type)
3. Visual style (art style, lighting, color palette)

Return as JSON:
{
  "base": "detailed physical description...",
  "detailed": "very detailed description including facial features...",
  "visualStyle": "art style, lighting, colors..."
}`;

    const response = await this.openRouterClient.generateWithModel(
      prompt,
      'google/gemini-2.5-flash',
      { temperature: 0.7 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse character prompt');
    }

    return JSON.parse(jsonMatch[0]);
  }

  // Generate base character image
  async generateBaseCharacterImage(
    character: CharacterData,
    prompt: CharacterPrompt
  ): Promise<string> {
    const fullPrompt = `${prompt.detailed}

${prompt.visualStyle}

Character: ${character.name}, ${character.role}
Style: Professional character design, high quality, detailed`;

    const response = await this.modelslabClient.textToImage({
      prompt: fullPrompt,
      negative_prompt: 'blurry, distorted, low quality, bad anatomy, deformed',
      width: 1024,
      height: 1024,
      model: 'flux.1',
      num_images: 1,
    });

    return response.images[0];
  }

  // Generate character variation using base image
  async generateCharacterVariation(
    characterId: string,
    baseImageUrl: string,
    variationPrompt: string,
    pose?: string,
    emotion?: string
  ): Promise<string> {
    const fullPrompt = `${variationPrompt}

Keep the character's appearance consistent with the reference image.
${pose ? `Pose: ${pose}` : ''}
${emotion ? `Emotion: ${emotion}` : ''}`;

    const response = await this.modelslabClient.imageToImage({
      prompt: fullPrompt,
      init_image: baseImageUrl,
      strength: 0.7,
      guidance_scale: 7.5,
      model: 'flux.1',
    });

    return response.images[0];
  }

  // Generate character in different poses
  async generateCharacterPoses(
    characterId: string,
    baseImageUrl: string,
    poses: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const pose of poses) {
      const prompt = `Character in ${pose} pose. Keep character appearance consistent.`;
      const imageUrl = await this.generateCharacterVariation(
        characterId,
        baseImageUrl,
        prompt,
        pose
      );
      results[pose] = imageUrl;
    }

    return results;
  }

  // Generate character with different emotions
  async generateCharacterEmotions(
    characterId: string,
    baseImageUrl: string,
    emotions: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const emotion of emotions) {
      const prompt = `Character showing ${emotion} emotion. Keep character appearance consistent.`;
      const imageUrl = await this.generateCharacterVariation(
        characterId,
        baseImageUrl,
        prompt,
        undefined,
        emotion
      );
      results[emotion] = imageUrl;
    }

    return results;
  }

  // Generate character action shot
  async generateCharacterAction(
    characterId: string,
    baseImageUrl: string,
    action: string
  ): Promise<string> {
    const prompt = `Character performing action: ${action}. Keep character appearance consistent.`;
    return await this.generateCharacterVariation(
      characterId,
      baseImageUrl,
      prompt
    );
  }
}

export function getCharacterConsistencyService(): CharacterConsistencyService {
  return new CharacterConsistencyService();
}
```

### API Endpoints for Character Consistency

```typescript
// src/app/api/ai/character/generate-base/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCharacterConsistencyService } from '@/lib/character-consistency';

export async function POST(req: NextRequest) {
  try {
    const { character } = await req.json();

    if (!character) {
      return NextResponse.json({ error: 'Character data is required' }, { status: 400 });
    }

    const service = getCharacterConsistencyService();
    
    // Generate character prompt
    const prompt = await service.generateCharacterPrompt(character);
    
    // Generate base image
    const imageUrl = await service.generateBaseCharacterImage(character, prompt);

    return NextResponse.json({
      imageUrl,
      prompt,
    });

  } catch (error) {
    console.error('Character base generation error:', error);
    return NextResponse.json({ error: 'Failed to generate character base image' }, { status: 500 });
  }
}

// src/app/api/ai/character/generate-variation/route.ts

export async function POST(req: NextRequest) {
  try {
    const { characterId, baseImageUrl, variationPrompt, pose, emotion } = await req.json();

    if (!characterId || !baseImageUrl || !variationPrompt) {
      return NextResponse.json({ error: 'characterId, baseImageUrl, and variationPrompt are required' }, { status: 400 });
    }

    const service = getCharacterConsistencyService();
    const imageUrl = await service.generateCharacterVariation(
      characterId,
      baseImageUrl,
      variationPrompt,
      pose,
      emotion
    );

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Character variation generation error:', error);
    return NextResponse.json({ error: 'Failed to generate character variation' }, { status: 500 });
  }
}

// src/app/api/ai/character/generate-poses/route.ts

export async function POST(req: NextRequest) {
  try {
    const { characterId, baseImageUrl, poses } = await req.json();

    if (!characterId || !baseImageUrl || !poses) {
      return NextResponse.json({ error: 'characterId, baseImageUrl, and poses are required' }, { status: 400 });
    }

    const service = getCharacterConsistencyService();
    const poseImages = await service.generateCharacterPoses(
      characterId,
      baseImageUrl,
      poses
    );

    return NextResponse.json({ poseImages });

  } catch (error) {
    console.error('Character poses generation error:', error);
    return NextResponse.json({ error: 'Failed to generate character poses' }, { status: 500 });
  }
}
```

---

# 🌍 UNIVERSE CONSISTENCY SYSTEM

## Overview

Universe consistency ensures that the world/environment looks consistent across all generated images and videos.

### Implementation Strategy

1. **Universe Reference Images** - Store base environment images
2. **World Style Prompts** - Generate detailed world descriptions
3. **Image-to-Image** - Use reference to generate consistent environments
4. **Scene Templates** - Pre-defined scene layouts for consistency

### Database Schema

```sql
-- Universe reference images
CREATE TABLE universe_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL, -- 'environment', 'location', 'building', 'landscape'
  location_name VARCHAR(100),
  description TEXT,
  style_prompt TEXT,
  embedding VECTOR(512),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(universe_id, image_type, location_name)
);

-- Universe consistency settings
CREATE TABLE universe_consistency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE UNIQUE,
  base_environment_id UUID REFERENCES universe_reference_images(id),
  style_strength DECIMAL(3,2) DEFAULT 0.8,
  color_palette TEXT[], -- Array of hex colors
  lighting_style VARCHAR(50),
  atmosphere VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Universe Consistency Service

```typescript
// src/lib/universe-consistency.ts

interface UniverseData {
  id: string;
  name: string;
  period: string;
  era: string;
  location: string;
  environment: string;
  society: string;
  government: string;
  economy: string;
  culture: string;
}

interface UniverseStylePrompt {
  base: string;
  visualStyle: string;
  colorPalette: string[];
  lighting: string;
  atmosphere: string;
}

export class UniverseConsistencyService {
  private modelslabClient: ModelslabClient;
  private openRouterClient: OpenRouterClient;

  constructor() {
    this.modelslabClient = getModelslabClient();
    this.openRouterClient = getOpenRouterClient();
  }

  // Generate universe style prompt from universe data
  async generateUniverseStylePrompt(universe: UniverseData): Promise<UniverseStylePrompt> {
    const prompt = `Generate a detailed visual style description for this universe:

UNIVERSE NAME: ${universe.name}
PERIOD: ${universe.period}
ERA: ${universe.era}
LOCATION: ${universe.location}
ENVIRONMENT: ${universe.environment || 'Not specified'}
SOCIETY: ${universe.society || 'Not specified'}
GOVERNMENT: ${universe.government || 'Not specified'}
ECONOMY: ${universe.economy || 'Not specified'}
CULTURE: ${universe.culture || 'Not specified'}

Generate:
1. Base description (overall world appearance)
2. Visual style (art style, architecture, technology level)
3. Color palette (5-7 hex codes)
4. Lighting style (natural, artificial, dramatic, etc.)
5. Atmosphere (mood, feeling, tone)

Return as JSON:
{
  "base": "detailed world description...",
  "visualStyle": "art style, architecture details...",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "lighting": "lighting style description...",
  "atmosphere": "atmosphere description..."
}`;

    const response = await this.openRouterClient.generateWithModel(
      prompt,
      'google/gemini-2.5-flash',
      { temperature: 0.7 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse universe style prompt');
    }

    return JSON.parse(jsonMatch[0]);
  }

  // Generate base environment image
  async generateBaseEnvironment(
    universe: UniverseData,
    stylePrompt: UniverseStylePrompt
  ): Promise<string> {
    const fullPrompt = `${stylePrompt.base}

${stylePrompt.visualStyle}

Colors: ${stylePrompt.colorPalette.join(', ')}
Lighting: ${stylePrompt.lighting}
Atmosphere: ${stylePrompt.atmosphere}

Universe: ${universe.name}, ${universe.period}, ${universe.era}
Style: Professional concept art, high quality, detailed`;

    const response = await this.modelslabClient.textToImage({
      prompt: fullPrompt,
      negative_prompt: 'blurry, distorted, low quality, bad composition',
      width: 1920,
      height: 1080,
      model: 'flux.1',
      num_images: 1,
    });

    return response.images[0];
  }

  // Generate location variation
  async generateLocationVariation(
    universeId: string,
    baseImageUrl: string,
    locationPrompt: string
  ): Promise<string> {
    const fullPrompt = `${locationPrompt}

Keep the world style and atmosphere consistent with the reference image.
Maintain the same color palette and lighting style.`;

    const response = await this.modelslabClient.imageToImage({
      prompt: fullPrompt,
      init_image: baseImageUrl,
      strength: 0.8,
      guidance_scale: 7.5,
      model: 'flux.1',
    });

    return response.images[0];
  }

  // Generate scene with character
  async generateSceneWithCharacter(
    universeId: string,
    baseEnvironmentUrl: string,
    characterImageUrl: string,
    scenePrompt: string
  ): Promise<string> {
    const fullPrompt = `${scenePrompt}

Include the character from the reference image in this environment.
Keep both character and environment consistent with their reference images.
Seamless integration of character and background.`;

    // Combine images (would need image composition service)
    // For now, use image-to-image with environment as base
    const response = await this.modelslabClient.imageToImage({
      prompt: fullPrompt,
      init_image: baseEnvironmentUrl,
      strength: 0.6,
      guidance_scale: 7.5,
      model: 'flux.1',
    });

    return response.images[0];
  }
}

export function getUniverseConsistencyService(): UniverseConsistencyService {
  return new UniverseConsistencyService();
}
```

### API Endpoints for Universe Consistency

```typescript
// src/app/api/ai/universe/generate-base/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUniverseConsistencyService } from '@/lib/universe-consistency';

export async function POST(req: NextRequest) {
  try {
    const { universe } = await req.json();

    if (!universe) {
      return NextResponse.json({ error: 'Universe data is required' }, { status: 400 });
    }

    const service = getUniverseConsistencyService();
    
    // Generate universe style prompt
    const stylePrompt = await service.generateUniverseStylePrompt(universe);
    
    // Generate base environment
    const imageUrl = await service.generateBaseEnvironment(universe, stylePrompt);

    return NextResponse.json({
      imageUrl,
      stylePrompt,
    });

  } catch (error) {
    console.error('Universe base generation error:', error);
    return NextResponse.json({ error: 'Failed to generate universe base environment' }, { status: 500 });
  }
}

// src/app/api/ai/universe/generate-location/route.ts

export async function POST(req: NextRequest) {
  try {
    const { universeId, baseImageUrl, locationPrompt } = await req.json();

    if (!universeId || !baseImageUrl || !locationPrompt) {
      return NextResponse.json({ error: 'universeId, baseImageUrl, and locationPrompt are required' }, { status: 400 });
    }

    const service = getUniverseConsistencyService();
    const imageUrl = await service.generateLocationVariation(
      universeId,
      baseImageUrl,
      locationPrompt
    );

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Universe location generation error:', error);
    return NextResponse.json({ error: 'Failed to generate universe location' }, { status: 500 });
  }
}
```

---

# 🎬 MOODBOARD & ANIMATION WITH CONSISTENCY

## Moodboard Generation with Character & Universe Consistency

```typescript
// src/lib/moodboard-consistency.ts

export class MoodboardConsistencyService {
  private characterService: CharacterConsistencyService;
  private universeService: UniverseConsistencyService;
  private modelslabClient: ModelslabClient;
  private openRouterClient: OpenRouterClient;

  constructor() {
    this.characterService = getCharacterConsistencyService();
    this.universeService = getUniverseConsistencyService();
    this.modelslabClient = getModelslabClient();
    this.openRouterClient = getOpenRouterClient();
  }

  // Generate moodboard image for a beat with character and universe consistency
  async generateMoodboardImage(
    beatName: string,
    beatDescription: string,
    characters: Array<{ name: string; baseImageUrl: string }>,
    universe: { name: string; baseImageUrl: string; stylePrompt: any },
    genre: string,
    tone: string,
    animationStyle: string
  ): Promise<string> {
    // Generate prompt
    const prompt = await this.generateMoodboardPrompt({
      beatName,
      beatDescription,
      characters,
      universe,
      genre,
      tone,
      animationStyle,
    });

    // Use universe base image as reference
    const response = await this.modelslabClient.imageToImage({
      prompt,
      init_image: universe.baseImageUrl,
      strength: 0.7,
      guidance_scale: 7.5,
      model: 'flux.1',
    });

    return response.images[0];
  }

  // Generate moodboard prompt
  async generateMoodboardPrompt(params: any): Promise<string> {
    const { beatName, beatDescription, characters, universe, genre, tone, animationStyle } = params;

    const prompt = `Generate a moodboard image for this story beat:

BEAT: ${beatName}
DESCRIPTION: ${beatDescription}

CHARACTERS IN SCENE:
${characters.map(c => `- ${c.name} (use reference image for consistency)`).join('\n')}

UNIVERSE: ${universe.name}
Style: ${universe.stylePrompt.visualStyle}
Colors: ${universe.stylePrompt.colorPalette.join(', ')}

GENRE: ${genre}
TONE: ${tone}
ANIMATION STYLE: ${animationStyle}

Create a cinematic, high-quality moodboard image that captures the essence of this beat.
Include the characters in the scene with consistent appearances.
Maintain the universe's visual style and atmosphere.
Use the specified animation style for the overall look and feel.`;

    return prompt;
  }
}
```

## Animation Generation with Consistency

```typescript
// src/lib/animation-consistency.ts

export class AnimationConsistencyService {
  private modelslabClient: ModelslabClient;
  private openRouterClient: OpenRouterClient;

  constructor() {
    this.modelslabClient = getModelslabClient();
    this.openRouterClient = getOpenRouterClient();
  }

  // Generate animation from moodboard image (image-to-video)
  async generateAnimationFromMoodboard(
    moodboardImageUrl: string,
    animationPrompt: string,
    duration: number,
    fps: number
  ): Promise<string> {
    const response = await this.modelslabClient.imageToVideo({
      init_image: moodboardImageUrl,
      motion_bucket_id: 127,
      fps: fps || 24,
      num_frames: duration * (fps || 24),
      model: 'animatediff',
    });

    return response.video;
  }

  // Generate animation from text (text-to-video)
  async generateAnimationFromText(
    animationPrompt: string,
    duration: number,
    fps: number
  ): Promise<string> {
    const response = await this.modelslabClient.textToVideo({
      prompt: animationPrompt,
      fps: fps || 24,
      num_frames: duration * (fps || 24),
      model: 'stable-video',
    });

    return response.video;
  }
}
```

---

# 📦 ENVIRONMENT VARIABLES

```bash
# .env

# OpenRouter API (Text AI)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Modelslab API (Image & Video AI)
MODELSLAB_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Override default models
DEFAULT_TEXT_MODEL=google/gemini-2.5-flash
DEFAULT_IMAGE_MODEL=flux.1
DEFAULT_VIDEO_MODEL=animatediff
```

---

# 📊 CREDIT SYSTEM INTEGRATION

### Credit Costs

| Service | Model | Credits | Notes |
|---------|-------|---------|-------|
| Text Generation | Gemini 2.5 Flash | 1 | Per 1K tokens |
| Text Generation | Gemini 3 Pro | 15 | Per 1K tokens |
| Text-to-Image | SDXL | 5 | Per image |
| Text-to-Image | FLUX.1 | 15 | Per image |
| Image-to-Image | SDXL | 5 | Per image |
| Image-to-Image | FLUX.1 | 15 | Per image |
| Image-to-Video | AnimateDiff | 20 | Per 2s video |
| Text-to-Video | Stable Video | 25 | Per 4s video |
| Character Base | FLUX.1 | 20 | Per character |
| Character Variation | FLUX.1 | 15 | Per variation |
| Universe Base | FLUX.1 | 30 | Per universe |
| Universe Location | FLUX.1 | 20 | Per location |

---

# 📋 IMPLEMENTATION CHECKLIST

## Phase 1: Core AI Integration
- [ ] Set up OpenRouter client
- [ ] Set up Modelslab client
- [ ] Create text generation API endpoint
- [ ] Create image generation API endpoint
- [ ] Create image-to-image API endpoint
- [ ] Create image-to-video API endpoint
- [ ] Create text-to-video API endpoint

## Phase 2: Character Consistency
- [ ] Create character reference images table
- [ ] Create character consistency settings table
- [ ] Implement CharacterConsistencyService
- [ ] Create character base generation API
- [ ] Create character variation API
- [ ] Create character poses API
- [ ] Create character emotions API

## Phase 3: Universe Consistency
- [ ] Create universe reference images table
- [ ] Create universe consistency settings table
- [ ] Implement UniverseConsistencyService
- [ ] Create universe base generation API
- [ ] Create universe location API

## Phase 4: Moodboard & Animation
- [ ] Implement MoodboardConsistencyService
- [ ] Implement AnimationConsistencyService
- [ ] Create moodboard generation API with consistency
- [ ] Create animation generation API
- [ ] Integrate with existing studio tabs

## Phase 5: Frontend Integration
- [ ] Update Character Formula tab with consistency features
- [ ] Update Universe Formula tab with consistency features
- [ ] Update Moodboard tab with consistency features
- [ ] Update Animate tab with consistency features
- [ ] Add character reference image upload
- [ ] Add universe reference image upload

---

# 📅 DOCUMENT INFO

**Created:** December 2025  
**Version:** 1.0  
**API Providers:** OpenRouter + Modelslab  
**Author:** Architecture Analysis  
**Status:** Ready for Implementation
