# AI Image & Video APIs - Requirements & Research (Updated)

## Overview
Dokumen ini berisi research tentang AI Image/Video APIs untuk Moodboard dengan **character consistency** dan high-volume generation.

---

## 📊 USAGE ESTIMATE per Story

| Item | Count | Description |
|------|-------|-------------|
| **Moodboard Images** | 50-100 | 7 key actions × 8-15 beats |
| **Videos** | 100+ | Animate moodboard scenes |
| **Total per project** | 150-200+ generations |

---

## 🏆 RECOMMENDED: ModelsLab Unlimited

### **$199/month - UNLIMITED EVERYTHING**

Dengan volume 50-100 images + 100 videos per story, **ModelsLab adalah pilihan paling cost-effective**.

### Features
| Feature | Included |
|---------|----------|
| **Image Generation** | ✅ Unlimited (Stable Diffusion, Flux, SDXL, Imagen) |
| **Video Generation** | ✅ Unlimited (Seedance, Wan, Veo) |
| **Audio Generation** | ✅ Unlimited (TTS, Music, SFX) |
| **3D Generation** | ✅ Unlimited (Text-to-3D, Image-to-3D) |
| **LLM** | ✅ Unlimited (Chat completions) |
| **Parallel Generations** | 15 concurrent |
| **Third-Party Models** | Free $95 credit |
| **Support** | 24/7 |

### API Endpoints
```
Base URL: https://modelslab.com/api

Image Generation:
POST /api/v8/images/text-to-image
POST /api/v8/images/image-to-image
POST /api/v8/images/{model}

Video Generation:
POST /api/v7/video-fusion/text-to-video
POST /api/v7/video-fusion/image-to-video

Audio:
POST /api/v7/voice/text-to-speech
POST /api/v7/voice/music-gen

Fetch Result:
POST /api/v8/images/fetch/{id}
POST /api/v7/video-fusion/fetch/{id}
```

### Sample API Call - Image Generation
```python
import requests

url = "https://modelslab.com/api/v8/images/text-to-image"

headers = {
    "Content-Type": "application/json"
}

payload = {
    "key": "YOUR_MODELSLAB_API_KEY",
    "model_id": "flux",  # or "sdxl", "realistic-vision", etc.
    "prompt": "A warrior woman with red hair standing in a forest, anime style",
    "negative_prompt": "blurry, low quality",
    "width": 1024,
    "height": 1024,
    "samples": 1,
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "webhook": None,
    "track_id": None
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
# Returns: { "status": "processing", "id": "xxx", "output": [...] }
```

### Sample API Call - Image-to-Image with Character Reference
```python
payload = {
    "key": "YOUR_MODELSLAB_API_KEY",
    "model_id": "realistic-vision",
    "prompt": "Same character walking in a village market, sunny day",
    "init_image": "https://example.com/character_reference.jpg",
    "strength": 0.5,  # How much to preserve original
    "width": 1024,
    "height": 1024,
    "samples": 7,  # Generate 7 images for key actions
}
```

### Sample API Call - Video Generation
```python
url = "https://modelslab.com/api/v7/video-fusion/image-to-video"

payload = {
    "key": "YOUR_MODELSLAB_API_KEY",
    "model_id": "seedance-1.5-pro",  # or "wan", "veo"
    "init_image": "https://example.com/moodboard_scene.jpg",
    "prompt": "The character walks slowly through the forest",
    "height": 720,
    "width": 1280,
    "num_frames": 60,  # ~4 seconds at 15fps
}
```

### Cost Analysis
| Volume | Individual APIs | ModelsLab |
|--------|-----------------|-----------|
| 50 images ($0.03 each) | $1.50 | $199 (unlimited) |
| 100 images | $3.00 | $199 |
| 100 videos ($0.20 each) | $20.00 | $199 |
| **1 story total** | **~$24.50** | **$0** (after subscription) |
| **10 stories/month** | **~$245** | **$199** |
| **20 stories/month** | **~$490** | **$199** |

**Break-even: ~8 stories per month**

---

## Alternative: Individual APIs (Pay Per Use)

### For Low Volume or Testing

### 1. Seedream 4.5 Sequential (Character Consistency Images)
| Provider | Pricing |
|----------|---------|
| WaveSpeedAI | ~$0.02-0.05/image |
| Kie.ai | ~$0.03/image |
| CometAPI | ~$0.02-0.04/image |

### 2. Seedance 1.5 Pro (Video with Character Consistency)
| Provider | Pricing |
|----------|---------|
| WaveSpeedAI | ~$0.10-0.30/video |
| Kie.ai | ~$0.15-0.25/video |

### 3. Nano Banana (Google Gemini - Image Edit)
| Resolution | Pricing |
|------------|---------|
| Standard | ~$0.02-0.03/image |
| 4K | ~$0.24/image |

---

## 📊 FULL COMPARISON MATRIX

| Feature | ModelsLab | Seedream 4.5 | Seedance 1.5 | Nano Banana |
|---------|-----------|--------------|--------------|-------------|
| **Pricing** | $199/mo unlimited | $0.02-0.05/img | $0.10-0.30/vid | $0.02-0.24/img |
| **Image Generation** | ✅ | ✅ | ❌ | ✅ |
| **Video Generation** | ✅ | ❌ | ✅ | ❌ |
| **Character Consistency** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Multi-Image Batch** | ✅ | ✅ 15 | ❌ | ✅ 4 |
| **Best For** | High volume | Low volume images | Low volume video | Image editing |

---

## 🎯 FINAL RECOMMENDATION

### Primary: **ModelsLab Unlimited ($199/mo)**

**Reasons:**
1. ✅ **Unlimited images AND videos** - perfect for 50-100 images + 100 videos per story
2. ✅ **Multiple models** - can switch between Flux, SDXL, Seedance, etc.
3. ✅ **15 parallel generations** - fast batch processing
4. ✅ **Single API integration** - one API key for everything
5. ✅ **Cost effective** - pays for itself after ~8 stories/month

### Secondary: **Seedream 4.5** (for specific character consistency needs)
- Best character consistency for complex multi-character scenes
- Use when ModelsLab results don't meet quality requirements

### Tertiary: **Nano Banana** (for image editing)
- Use for "Edit Image" feature in moodboard
- Already integrated with Google API

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: ModelsLab Integration

```typescript
// lib/modelslab.ts

const MODELSLAB_API_KEY = process.env.MODELSLAB_API_KEY;
const MODELSLAB_BASE_URL = "https://modelslab.com/api";

interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  referenceImage?: string;  // For character consistency
  width?: number;
  height?: number;
  samples?: number;  // Number of images to generate (1-7)
  modelId?: string;
}

interface VideoGenerationRequest {
  initImage: string;  // Moodboard image as starting frame
  prompt: string;
  duration?: number;  // seconds
  modelId?: string;
}

// Generate moodboard images
export async function generateMoodboardImages(request: ImageGenerationRequest) {
  const response = await fetch(`${MODELSLAB_BASE_URL}/v8/images/text-to-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY,
      model_id: request.modelId || 'flux',
      prompt: request.prompt,
      negative_prompt: request.negativePrompt || 'blurry, low quality, distorted',
      init_image: request.referenceImage,
      width: request.width || 1024,
      height: request.height || 1024,
      samples: request.samples || 1,
      num_inference_steps: 30,
      guidance_scale: 7.5
    })
  });
  
  const data = await response.json();
  
  // If processing, poll for result
  if (data.status === 'processing') {
    return await pollForResult(data.id, 'images');
  }
  
  return data.output;  // Array of image URLs
}

// Generate video from moodboard image
export async function generateMoodboardVideo(request: VideoGenerationRequest) {
  const response = await fetch(`${MODELSLAB_BASE_URL}/v7/video-fusion/image-to-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY,
      model_id: request.modelId || 'seedance-1.5-pro',
      init_image: request.initImage,
      prompt: request.prompt,
      height: 720,
      width: 1280,
      num_frames: (request.duration || 4) * 15  // 15 fps
    })
  });
  
  const data = await response.json();
  
  if (data.status === 'processing') {
    return await pollForResult(data.id, 'video');
  }
  
  return data.output;  // Video URL
}

// Poll for async result
async function pollForResult(taskId: string, type: 'images' | 'video') {
  const endpoint = type === 'images' 
    ? `${MODELSLAB_BASE_URL}/v8/images/fetch/${taskId}`
    : `${MODELSLAB_BASE_URL}/v7/video-fusion/fetch/${taskId}`;
  
  let attempts = 0;
  const maxAttempts = 60;  // 5 minutes max
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000));  // Wait 5 seconds
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: MODELSLAB_API_KEY })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.output;
    } else if (data.status === 'failed') {
      throw new Error(`Generation failed: ${data.message}`);
    }
    
    attempts++;
  }
  
  throw new Error('Generation timed out');
}
```

### Phase 2: Moodboard Image Generation

```typescript
// In moodboard API
async function generateBeatImages(
  beat: StoryBeat,
  keyActions: KeyAction[],
  characters: Character[],
  artStyle: string
) {
  const results = [];
  
  // Get character reference image (first character's portrait)
  const referenceImage = characters[0]?.imageUrl;
  
  // Build style prompt based on art style
  const stylePrompt = getStylePrompt(artStyle);  // "anime style", "realistic cinematic", etc.
  
  for (const action of keyActions) {
    const prompt = `${action.description}. ${stylePrompt}. Characters: ${characters.map(c => c.name).join(', ')}`;
    
    const images = await generateMoodboardImages({
      prompt,
      referenceImage,
      samples: 1,
      modelId: artStyle === 'anime' ? 'anything-v5' : 'realistic-vision'
    });
    
    results.push({
      ...action,
      imageUrl: images[0]
    });
  }
  
  return results;
}
```

### Phase 3: Moodboard Video Generation (Later)

```typescript
// Convert moodboard image to video
async function animateMoodboardScene(
  moodboardItem: MoodboardItem,
  animationPrompt: string
) {
  const video = await generateMoodboardVideo({
    initImage: moodboardItem.imageUrl,
    prompt: animationPrompt,
    duration: 4,  // 4 seconds
    modelId: 'seedance-1.5-pro'
  });
  
  return {
    ...moodboardItem,
    videoUrl: video
  };
}
```

---

## 🔑 Environment Variables

```env
# ModelsLab (Primary - Unlimited)
MODELSLAB_API_KEY=xxx

# Fallback/Alternative APIs
WAVESPEED_API_KEY=xxx
KIE_AI_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx
```

---

## 📋 Next Steps

1. ✅ Subscribe to ModelsLab Unlimited ($199/mo)
2. ✅ Get API key from ModelsLab dashboard
3. ✅ Create `lib/modelslab.ts` integration
4. ✅ Add generate images endpoint to moodboard API
5. ✅ Test with character reference images
6. ⏸ (Later) Add video generation from moodboard scenes
7. ⏸ (Later) Add Seedream 4.5 as fallback for complex scenes
