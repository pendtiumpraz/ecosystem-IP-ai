# 🎨 Character Image Version Control - Implementation Plan

## Status: PLANNING

Tanggal: 13 Januari 2026

---

## 📋 Overview

Fitur untuk mengelola berbagai versi character image dengan:
1. **Expression Sheets** - Generate 3x3 grid ekspresi (Happy, Sad, Angry, Surprised, etc.)
2. **Style Variants** - Realistic, Anime, Ghibli, Disney/Pixar, Cyberpunk, dll
3. **Pose Variants** - Portrait, Full body, Action pose, Side view
4. **Version History** - Track semua generation dengan version number

---

## 🗄️ Database Schema Update

### Add columns to `generated_media`:

```sql
ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  variant_type VARCHAR(50) DEFAULT 'default';  -- 'default', 'expression', 'pose', 'style'

ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  variant_name VARCHAR(100);  -- 'Happy', 'Sad', 'Portrait', 'Full Body'

ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  style_used VARCHAR(100);  -- 'realistic', 'anime', 'ghibli', 'disney', 'cyberpunk'

ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  generation_version INTEGER DEFAULT 1;  -- Auto-increment per entity+style

ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  version_name VARCHAR(255);  -- User-defined name, editable (e.g., "Main Look v2", "Battle Armor")

ALTER TABLE generated_media ADD COLUMN IF NOT EXISTS
  is_primary_for_style BOOLEAN DEFAULT FALSE;  -- Primary per style
```

### Version Name Feature:
- **User can name before generate** - Optional input field
- **Auto-generate if empty** - Format: `{Style} v{N}` (e.g., "Ghibli v3")
- **Editable anytime** - Rename via API or inline edit
- **Search/filter by name** - Find specific versions quickly

### Enum Options:

```typescript
// Variant Types
type VariantType = 'default' | 'expression' | 'pose' | 'style' | 'animation';

// Expression Names
const EXPRESSIONS = [
  'Neutral', 'Happy', 'Sad', 'Angry', 
  'Surprised', 'Scared', 'Disgusted', 
  'Confused', 'Excited'
];

// Art Styles
const ART_STYLES = [
  { id: 'realistic', label: 'Cinematic Realistic', desc: 'Photorealistic, movie quality' },
  { id: 'anime', label: 'Anime', desc: 'Japanese animation style' },
  { id: 'ghibli', label: 'Studio Ghibli', desc: 'Miyazaki watercolor style' },
  { id: 'disney', label: 'Disney/Pixar', desc: '3D animated movie style' },
  { id: 'comic', label: 'Comic Book', desc: 'Bold lines, superhero style' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon, futuristic digital art' },
  { id: 'painterly', label: 'Oil Painting', desc: 'Classical painting style' },
];

// Pose Types
const POSES = [
  'Portrait', 'Full Body', 'Side View', 
  'Back View', 'Action Pose', 'Sitting', 
  'Walking', 'Running'
];
```

---

## 🎯 UI Components

### 1. CharacterImageGallery

Menampilkan semua image character dengan filter:

```
┌─────────────────────────────────────────────────────┐
│ Character Images                        [+ Generate] │
├─────────────────────────────────────────────────────┤
│ [All] [Realistic] [Anime] [Ghibli] [Disney]         │
├─────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│ │ v3  │ │ v2  │ │ v1  │ │ Exp │                     │
│ │ ★   │ │     │ │     │ │ 3x3 │                     │
│ └─────┘ └─────┘ └─────┘ └─────┘                     │
│ Realistic                                            │
│                                                      │
│ ┌─────┐ ┌─────┐                                     │
│ │ v1  │ │ Exp │                                     │
│ │     │ │ 3x3 │                                     │
│ └─────┘ └─────┘                                     │
│ Ghibli                                              │
└─────────────────────────────────────────────────────┘
```

### 2. GenerateImageModal

Modal untuk generate dengan options:

```
┌─────────────────────────────────────────────────────┐
│ Create New Character Image Version          [X]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Version Name: (optional)                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Battle Armor Look                               │ │
│ └─────────────────────────────────────────────────┘ │
│ Auto: "Realistic v4" if empty                       │
│                                                      │
│ Art Style:                                          │
│ [Realistic ▾]                                       │
│                                                      │
│ Generation Type:                                    │
│ ○ Single Portrait                                   │
│ ○ Expression Sheet (3x3)                            │
│ ○ Pose Variants                                     │
│                                                      │
│ Reference Image:                                    │
│ [Use Primary ▾] or [Upload New]                     │
│                                                      │
│ Additional Prompt:                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ wearing heavy battle armor, dramatic lighting   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Credit Cost: 12 credits (single) / 50 (expression)  │
│                                                      │
│            [Cancel]  [🚀 Generate New Version]       │
└─────────────────────────────────────────────────────┘
```

### 3. ExpressionSheetViewer

Modal untuk lihat expression sheet 3x3:

```
┌─────────────────────────────────────────────────────┐
│ Expression Sheet - Realistic v1              [X]    │
├─────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐                     │
│ │ Neutral │  Happy  │   Sad   │                     │
│ ├─────────┼─────────┼─────────┤                     │
│ │  Angry  │Surprised│ Scared  │                     │
│ ├─────────┼─────────┼─────────┤                     │
│ │Disgusted│Confused │ Excited │                     │
│ └─────────┴─────────┴─────────┘                     │
│                                                      │
│ [Set as Primary] [Download All] [Re-generate]       │
└─────────────────────────────────────────────────────┘
```

---

## 📦 API Endpoints

### POST /api/generate/character-variants

Generate character dengan options:

```typescript
interface GenerateVariantsRequest {
  userId: string;
  characterId: string;
  projectId?: string;
  
  // Generation options
  style: 'realistic' | 'anime' | 'ghibli' | 'disney' | 'comic' | 'cyberpunk';
  type: 'single' | 'expression_sheet' | 'pose_variants';
  
  // For single generation
  expression?: string;  // 'Happy', 'Sad', etc.
  pose?: string;        // 'Portrait', 'Full Body', etc.
  
  // Reference
  referenceAssetId?: string;
  additionalPrompt?: string;
}

interface GenerateVariantsResponse {
  success: boolean;
  mediaIds: string[];  // Array karena bisa 1 atau 9
  thumbnailUrls: string[];
  creditCost: number;
  error?: string;
}
```

### GET /api/assets/entity/character/[id]/variants

Get character images grouped by style:

```typescript
interface VariantsResponse {
  styles: {
    [styleName: string]: {
      primary?: GeneratedMedia;
      versions: GeneratedMedia[];
      expressionSheets: GeneratedMedia[];
    }
  }
}
```

---

## 🔄 Generation Flow

### Single Image:
```
1. User select style (Ghibli)
2. User select expression/pose (optional)
3. System gets character data + primary reference
4. Build prompt with style modifiers
5. Call AI (I2I if ref exists, T2I otherwise)
6. Save with style_used='ghibli', variant_type='single'
7. Auto-increment generation_version
```

### Expression Sheet (3x3):
```
1. User select style (Realistic)
2. System generates 9 images sequentially:
   - Same character data
   - Same style
   - Different expression prompts
3. Save all 9 with variant_type='expression'
4. Group display in UI
```

---

## 💡 Implementation Steps

### Phase 1: Database & Schema
- [ ] Add new columns to generated_media
- [ ] Create migration script
- [ ] Update Drizzle schema

### Phase 2: Backend
- [ ] Update ai-media-generation.ts with style support
- [ ] Create /api/generate/character-variants endpoint
- [ ] Create expression sheet generation logic
- [ ] Group assets by style in API response

### Phase 3: Frontend
- [ ] Create GenerateImageModal component
- [ ] Update CharacterDeck with style tabs
- [ ] Create ExpressionSheetViewer component
- [ ] Add style selector to toolbar

### Phase 4: Polish
- [ ] Version numbering logic
- [ ] Primary per style marking
- [ ] Download all in expression sheet
- [ ] Regenerate single expression

---

## 📊 Credit Costs (Suggested)

| Generation Type | Credit Cost |
|-----------------|-------------|
| Single Image | 12 credits |
| Expression Sheet (9 images) | 50 credits |
| Pose Variants (5 images) | 30 credits |
| Style Transfer (1 image, I2I) | 8 credits |

---

## 🎨 Style Prompt Modifiers

```typescript
const STYLE_PROMPTS: Record<string, string> = {
  realistic: 'photorealistic, cinematic lighting, 8k, detailed skin texture, professional photography',
  anime: 'anime style, vibrant colors, cel shading, detailed anime art, high quality anime',
  ghibli: 'studio ghibli style, miyazaki art, watercolor painting, soft colors, whimsical, hand-drawn',
  disney: 'disney pixar 3D, animated movie, illumination style, expressive cartoon, CGI rendering',
  comic: 'comic book style, bold outlines, dynamic shading, superhero art, ink drawing',
  cyberpunk: 'cyberpunk aesthetic, neon lighting, futuristic, digital art, synthwave colors',
  painterly: 'oil painting, classical art, renaissance style, brush strokes visible, museum quality',
};

const EXPRESSION_PROMPTS: Record<string, string> = {
  Neutral: 'neutral expression, calm face, relaxed',
  Happy: 'happy expression, smiling, joyful, bright eyes',
  Sad: 'sad expression, melancholic, tearful eyes, frown',
  Angry: 'angry expression, furrowed brows, intense eyes, scowling',
  Surprised: 'surprised expression, wide eyes, open mouth, shocked',
  Scared: 'scared expression, fear in eyes, worried, anxious',
  Disgusted: 'disgusted expression, wrinkled nose, disapproval',
  Confused: 'confused expression, raised eyebrow, puzzled look',
  Excited: 'excited expression, enthusiastic, energetic, beaming',
};
```

---

## Next: Start Implementation?

Setelah plan disetujui:
1. Run database migration
2. Update schema
3. Build API
4. Build UI components
