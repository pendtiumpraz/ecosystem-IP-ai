# Image Generation Documentation

## Overview

Sistem ini menggunakan **ModelsLab v7 API** untuk text-to-image dan image-to-image generation dengan model **Seedream 4.5**.

---

## 🔧 Provider Configuration

File: `src/lib/ai-providers.ts`

### ModelsLab Provider Config

```typescript
modelslab: {
  name: "modelslab",
  displayName: "ModelsLab",
  types: ["image"],
  baseUrl: "https://modelslab.com/api/v7",
  endpoints: {
    image: "/images/text-to-image",
    "image-to-image": "/images/image-to-image",
  },
  // ...
}
```

---

## 🎨 Text-to-Image API

### Endpoint
```
POST https://modelslab.com/api/v7/images/text-to-image
```

### Request Body
```json
{
  "key": "YOUR_API_KEY",
  "model_id": "seedream-4.5",
  "prompt": "A beautiful landscape with mountains...",
  "aspect_ratio": "1:1"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | ✅ Yes | API Key dari ModelsLab |
| `model_id` | string | ✅ Yes | Model ID: `seedream-4.5` |
| `prompt` | string | ✅ Yes | Deskripsi gambar yang ingin di-generate |
| `aspect_ratio` | string | No | Aspect ratio: `1:1`, `4:3`, `3:4`, `16:9`, `9:16` |

### Response
```json
{
  "status": "success",
  "generationTime": 1.5,
  "id": 1234567,
  "output": [
    "https://pub-xxx.r2.dev/generations/xxx.png"
  ],
  "meta": { ... }
}
```

---

## 🖼️ Image-to-Image API

### Endpoint
```
POST https://modelslab.com/api/v7/images/image-to-image
```

### Request Body
```json
{
  "key": "YOUR_API_KEY",
  "model_id": "seedream-4.5-i2i",
  "prompt": "Transform this image into a painting style...",
  "init_image": [
    "https://example.com/reference-image.png"
  ],
  "aspect_ratio": "1:1"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | ✅ Yes | API Key dari ModelsLab |
| `model_id` | string | ✅ Yes | Model ID: `seedream-4.5-i2i` (BEDA dari text2img!) |
| `prompt` | string | ✅ Yes | Deskripsi transformasi |
| `init_image` | array | ✅ Yes | Array of image URLs sebagai reference |
| `aspect_ratio` | string | No | Aspect ratio output |

### Response
```json
{
  "status": "success",
  "generationTime": 2.1,
  "id": 1234568,
  "output": [
    "https://pub-xxx.r2.dev/generations/xxx.png"
  ],
  "meta": { ... }
}
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── ai-providers.ts          # Provider configs (ModelsLab, etc)
│   ├── ai-media-generation.ts   # Character image generation logic
│   └── ai-generation.ts         # General AI generation
├── app/
│   └── api/
│       └── generate/
│           └── character-image/
│               └── route.ts     # API endpoint for character images
└── components/
    └── studio/
        └── CharacterStudio.tsx  # UI for character image generation
```

---

## 🔄 Flow: Character Image Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARACTER IMAGE GENERATION                    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Generate" on CharacterStudio                    │
│    └─► characterId, style, pose                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. page.tsx: handleGenerateCharacterImage(characterId, pose)    │
│    └─► Calls generateWithAI("character_image", {...})           │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. POST /api/ai/generate                                        │
│    └─► ai-generation.ts: generateWithAI()                       │
│    └─► Checks credits, gets tier, calls callAI()                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ai-providers.ts: callAI("image", prompt, options)            │
│    └─► getActiveModelForTier("image", tier)                     │
│    └─► Uses PROVIDER_CONFIGS.modelslab                          │
│    └─► POST to ModelsLab v7 API                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Response: { output: ["https://...png"] }                     │
│    └─► URL is returned to frontend                              │
│    └─► Optionally uploaded to Google Drive                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. page.tsx: Update character.imageUrl & characters state       │
│    └─► Visual Portrait now shows the generated image            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Adding New Features

### 1. Add New Style Templates

Edit `src/components/studio/GenerateCharacterImageModal.tsx`:

```typescript
const ART_STYLES = [
  { id: 'realistic', label: 'Cinematic Realistic', ... },
  { id: 'anime', label: 'Anime', ... },
  // ADD NEW STYLE HERE:
  { id: 'watercolor', label: 'Watercolor Art', icon: Brush, desc: 'Soft watercolor style', cost: 12 },
];
```

### 2. Add Image Reference Support

Edit `src/lib/ai-media-generation.ts` → `generateCharacterImage()`:

```typescript
// In buildRequest for image-to-image
if (referenceAssetId) {
  // Fetch reference image URL from database
  const refImage = await getAssetUrl(referenceAssetId);
  
  // Use image-to-image instead of text-to-image
  const aiType = "image-to-image";
  const aiResult = await callAI(aiType, prompt, {
    ...options,
    referenceImage: refImage  // Will be put in init_image array
  });
}
```

### 3. Add New Image Provider

Edit `src/lib/ai-providers.ts`:

```typescript
PROVIDER_CONFIGS.newprovider = {
  name: "newprovider",
  displayName: "New Provider Name",
  types: ["image"],
  baseUrl: "https://api.newprovider.com",
  authHeader: (apiKey) => ({
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }),
  endpoints: {
    image: "/v1/generate",
    "image-to-image": "/v1/transform",
  },
  buildRequest: {
    image: (model, prompt, options = {}) => ({
      model: model,
      prompt: prompt,
      // ... other params based on API docs
    }),
  },
  parseResponse: {
    image: (data) => {
      return data.images?.[0]?.url || "";
    },
  },
};
```

Then add provider to database via Admin Panel or SQL:
```sql
INSERT INTO ai_providers (slug, name, api_base_url, is_active)
VALUES ('newprovider', 'New Provider', 'https://api.newprovider.com', true);
```

---

## 📊 Database Tables

### ai_active_models
Stores which model is active for each subcategory (set via Admin Panel):
```sql
SELECT * FROM ai_active_models WHERE subcategory = 'text-to-image';
```

### generated_media
Stores all generated images:
```sql
SELECT * FROM generated_media 
WHERE entity_type = 'character' 
AND entity_id = 'character-uuid';
```

### platform_api_keys
Stores API keys for providers:
```sql
SELECT provider_id, is_active, encrypted_key 
FROM platform_api_keys;
```

---

## 🔑 Environment Variables

Tidak perlu env variable untuk API key - API key disimpan di database:
- Table: `platform_api_keys`
- Column: `encrypted_key`
- Set via: Admin Panel → AI Providers → Edit Provider

---

## 📝 Notes

1. **URL Temporary**: Output URL dari ModelsLab (`pub-*.r2.dev`) bersifat temporary (beberapa hari/minggu). Sistem sekarang:
   - Menyimpan URL langsung ke database sebagai fallback
   - Mencoba upload ke Google Drive jika tersedia
   
2. **Model ID Berbeda**: 
   - Text-to-Image: `seedream-4.5`
   - Image-to-Image: `seedream-4.5-i2i`

3. **Credit Cost**: Default 12 credits per image (configurable di admin per model)

---

## 🛠️ Troubleshooting

### "Empty response from AI"
- Cek console log untuk `[ModelsLab v7] Raw response:`
- Pastikan model_id benar (`seedream-4.5` atau `seedream-4.5-i2i`)
- Pastikan API key valid di database

### "API key not set"
- Cek `platform_api_keys` table untuk provider `modelslab`
- Pastikan `is_active = true`

### Image tidak muncul di Visual Portrait
- Cek apakah `handleGenerateCharacterImage` dipanggil dengan benar
- Cek console untuk error dari API
- Pastikan `character.imageUrl` di-update setelah generate

---

*Last Updated: 2026-01-14*
