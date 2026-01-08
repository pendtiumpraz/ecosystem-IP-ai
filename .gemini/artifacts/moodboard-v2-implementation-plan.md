# Moodboard V2 Implementation Plan (Updated)

## Overview
Moodboard yang terintegrasi dengan Story Structure dengan **character consistency** menggunakan AI Image Edit (input character images + prompt).

---

## User Clarifications ✅

| Item | Decision |
|------|----------|
| Key action count | **Configurable** (default 7, user can set 3-10) |
| Image generation | **Separate step** (not auto after prompt) |
| Image Edit | **AI Image Edit** dengan input character images + prompt |
| Art style | **Per moodboard** |
| Auto-save | ✅ After generate prompt, generate image, edit image |
| Character consistency | Input: Character A image + Character B image + Prompt |

---

## Core Concepts

### Image Generation Flow
```
1. Generate Key Actions (AI Text) → Auto-save
2. Generate Prompts per Key Action (AI Text) → Auto-save
3. Generate Images (LATER - separate step):
   - Input: Character images yang terlibat di key action
   - Input: Image prompt + Art style
   - Output: Group of character melakukan aksi
4. Edit Image:
   - Input: Existing image + Edit prompt
   - Output: Compare before/after → Accept to overwrite → Auto-save
```

### Data Structure
```
Story Version → Moodboard (1:1)
├── Settings
│   ├── art_style: 'realistic' | 'anime' | 'ghibli' | etc.
│   └── key_action_count: 7 (configurable 3-10)
├── Beat 1 (e.g., "Ordinary World")
│   ├── Key Action 1
│   │   ├── description: "Protagonis bangun tidur di kamar sempit"
│   │   ├── characters_involved: [char_A_id, char_B_id]
│   │   ├── universe_level: "room_cave"
│   │   ├── prompt: "A young man waking up in a small cramped room..."
│   │   └── image_url: "https://..."
│   ├── Key Action 2...
│   └── Key Action 7...
└── Beat 2...
```

---

## Phase 1: Database Schema

### Table: `moodboards`
```sql
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  story_version_id UUID REFERENCES story_versions(id) ON DELETE CASCADE,
  art_style VARCHAR(50) DEFAULT 'realistic',
  key_action_count INTEGER DEFAULT 7 CHECK (key_action_count >= 3 AND key_action_count <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(story_version_id)
);
```

### Table: `moodboard_items`
```sql
CREATE TABLE moodboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  
  -- Beat info
  beat_key VARCHAR(100) NOT NULL,
  beat_label VARCHAR(255) NOT NULL,
  beat_content TEXT,
  
  -- Key action (1 to key_action_count)
  key_action_index INTEGER NOT NULL,
  key_action_description TEXT,
  
  -- Characters & Universe
  characters_involved UUID[],  -- Character IDs involved in this action
  universe_level VARCHAR(100), -- room_cave, house_castle, village_kingdom, etc.
  
  -- Image generation
  prompt TEXT,
  image_url TEXT,
  
  -- Edit history (for undo/compare)
  previous_image_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'empty', -- empty, has_description, has_prompt, has_image
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(moodboard_id, beat_key, key_action_index)
);

CREATE INDEX idx_moodboard_items_moodboard ON moodboard_items(moodboard_id);
CREATE INDEX idx_moodboard_items_status ON moodboard_items(status);
```

---

## Phase 2: API Endpoints

### Moodboard CRUD

#### GET `/api/creator/projects/[id]/moodboard?storyVersionId=xxx`
Returns moodboard with all items grouped by beat

#### POST `/api/creator/projects/[id]/moodboard`
```json
{
  "storyVersionId": "uuid",
  "artStyle": "realistic",
  "keyActionCount": 7
}
```
**Prerequisites check:**
- ✅ Universe Formula exists (check `universe` fields in project)
- ✅ Story Formula exists (check story version has beats)
- ✅ Characters linked (check story version has characterIds)

#### PATCH `/api/creator/projects/[id]/moodboard/[moodboardId]`
Update settings (art_style, key_action_count)

### Generation Endpoints

#### POST `/api/creator/projects/[id]/moodboard/[moodboardId]/generate-key-actions`
```json
{
  "beatKey": "ordinary_world" // optional, if null = generate all
}
```
Generates key actions (7 per beat) using AI → Auto-save

#### POST `/api/creator/projects/[id]/moodboard/[moodboardId]/generate-prompts`
```json
{
  "itemId": "uuid" // optional, if null = generate all pending
}
```
Generates image prompt for key action → Auto-save

#### POST `/api/creator/projects/[id]/moodboard/[moodboardId]/generate-image`
```json
{
  "itemId": "uuid",
  "characterImageUrls": ["char_a_image.jpg", "char_b_image.jpg"]
}
```
**Input to AI Image Edit:**
- Character images (from character.imageUrl)
- Prompt (from moodboard_item.prompt)
- Art style (from moodboard.art_style)

→ Output: Generated image → Auto-save

#### POST `/api/creator/projects/[id]/moodboard/[moodboardId]/edit-image`
```json
{
  "itemId": "uuid",
  "editPrompt": "Make the character smile more"
}
```
**Input to AI Image Edit:**
- Current image (moodboard_item.image_url)
- Edit prompt

→ Returns: `{ editedImageUrl, originalImageUrl }`
→ Frontend shows comparison modal
→ On Accept: PATCH to save new image

### Clear Endpoint

#### DELETE `/api/creator/projects/[id]/moodboard/[moodboardId]/clear`
```json
{
  "type": "all" | "prompts" | "images"
}
```
Clears generated content based on type

---

## Phase 3: AI Prompts

### Key Action Generation Prompt
```
SYSTEM: Kamu adalah ahli visual storytelling cinematik.

Berdasarkan story beat berikut, breakdown menjadi {key_action_count} key actions visual yang filmik.

PROJECT: {project_title}
STORY SYNOPSIS: {story_synopsis}

BEAT: {beat_label}
BEAT DESCRIPTION: {beat_content}

AVAILABLE CHARACTERS:
{for each character linked to story}
- {name} ({role}): {archetype}, {brief_description}
{end for}

UNIVERSE LOCATIONS (pilih yang sesuai untuk setiap aksi):
- room_cave: Ruangan privat karakter
- house_castle: Rumah/tempat tinggal utama
- private_interior: Interior ruangan
- private_exterior: Halaman/exterior privat
- village_kingdom: Area publik lingkungan
- city_galaxy: Kota/dunia luas
- nature_cosmos: Alam bebas/kosmos

Setiap key action harus:
1. Spesifik dan visual (bisa dijadikan gambar)
2. Melibatkan minimal 1 karakter dari list
3. Sesuai dengan universe location
4. Meneruskan alur beat secara dramatis

Output JSON:
{
  "keyActions": [
    {
      "index": 1,
      "description": "Aksi visual spesifik dalam 1-2 kalimat bahasa Indonesia",
      "characterIds": ["uuid1", "uuid2"],
      "universeLevel": "room_cave"
    },
    // ... {key_action_count} total
  ]
}
```

### Image Prompt Generation Prompt
```
SYSTEM: Kamu adalah visual development artist profesional.

Buat image generation prompt DALAM BAHASA INGGRIS untuk AI image generation.

KEY ACTION: {key_action_description}

CHARACTERS INVOLVED:
{for each character}
- {name}: {gender}, {ethnicity}, {hair_style} {hair_color} hair, {eye_color} eyes, 
  {body_type} build, wearing {clothing_style}. {uniqueness}
{end for}

SETTING: {universe_level_description from universe formula}

ART STYLE: {art_style} 
(realistic = cinematic movie still, anime = Japanese animation style, 
 ghibli = Studio Ghibli watercolor, disney = 3D Pixar style, etc.)

IMPORTANT:
- Focus on the ACTION and EMOTION
- Include character appearance details for consistency
- Describe lighting, camera angle, and mood
- Keep prompt under 200 words

Output JSON:
{
  "prompt": "A detailed image generation prompt in English...",
  "negativePrompt": "blurry, low quality, distorted...",
  "suggestedAspectRatio": "16:9"
}
```

---

## Phase 4: Frontend Components

### Updated MoodboardStudio Props
```typescript
interface MoodboardStudioProps {
  // Story Version Selection
  storyVersions: StoryVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
  
  // Moodboard Data
  moodboard: Moodboard | null;
  moodboardItems: MoodboardItem[];
  
  // Linked Data
  characters: Character[];
  universe: Universe;
  storyBeats: StoryBeat[];
  
  // Settings
  artStyle: string;
  keyActionCount: number;
  onUpdateSettings: (settings: Partial<MoodboardSettings>) => void;
  
  // Prerequisites
  hasUniverse: boolean;
  hasStoryBeats: boolean;
  hasCharacters: boolean;
  
  // Generation
  onGenerateKeyActions: (beatKey?: string) => void; // null = all
  onGeneratePrompt: (itemId?: string) => void; // null = all pending
  onGenerateImage: (itemId: string) => void;
  onEditImage: (itemId: string, editPrompt: string) => void;
  onClearAll: (type: 'all' | 'prompts' | 'images') => void;
  
  // Loading States
  isGenerating: Record<string, boolean>;
  generationProgress: { current: number; total: number };
}
```

### UI Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [Story Version ▼]  [Art Style ▼]  [Key Actions: 7 ▼]               │
│ [Generate All Key Actions] [Generate All Prompts] [Clear All ▼]    │
├─────────────────────────────────────────────────────────────────────┤
│ Prerequisites: ✅ Universe  ✅ Story (8 beats)  ✅ Characters (5)   │
│ Progress: ████████░░░░ 45% (25/56 prompts generated)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ═══ BEAT 1: Ordinary World ═══════════════════════════════════════ │
│ Beat Description: Protagonis menjalani kehidupan sehari-hari...    │
│                                                                     │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│ │ [Image]   │ │ [Image]   │ │ [Image]   │ │ [Image]   │ ...       │
│ │           │ │           │ │           │ │           │            │
│ │ Key Act 1 │ │ Key Act 2 │ │ Key Act 3 │ │ Key Act 4 │           │
│ │ 👤A 👤B   │ │ 👤A       │ │ 👤B 👤C   │ │ 👤A       │           │
│ │ 🏠 Room   │ │ 🏠 Room   │ │ 🏘 Village│ │ 🌳 Nature │           │
│ │ [Gen Img] │ │ [Gen Img] │ │ [Gen Img] │ │ [Gen Img] │           │
│ │ [Edit]    │ │ [Edit]    │ │ [Edit]    │ │ [Edit]    │           │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
│                                                                     │
│ ═══ BEAT 2: Call to Adventure ════════════════════════════════════ │
│ ...                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Edit Image Modal
```
┌─────────────────────────────────────────────────────────────────────┐
│ Edit Image                                                    [X]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────┐    ┌─────────────────────┐                 │
│ │     BEFORE          │    │      AFTER          │                 │
│ │  [Current Image]    │ → │  [Edited Preview]   │                 │
│ │                     │    │                     │                 │
│ └─────────────────────┘    └─────────────────────┘                 │
│                                                                     │
│ Edit Prompt:                                                        │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Make the character smile more and add warmer lighting         │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                              [Regenerate]  [Accept]  [Cancel]       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: Protection Logic

### Universe Clear Protection
```typescript
// In universe clear API
const hasMoodboardContent = await sql`
  SELECT 1 FROM moodboards m
  JOIN moodboard_items mi ON m.id = mi.moodboard_id
  WHERE m.project_id = ${projectId}
  AND mi.status != 'empty'
  LIMIT 1
`;

if (hasMoodboardContent.length > 0) {
  return { 
    error: "Universe sudah digunakan di Moodboard. Hapus moodboard content terlebih dahulu.",
    hasMoodboardContent: true
  };
}
```

### Story Delete Protection
```typescript
// In story version delete API
const hasMoodboard = await sql`
  SELECT 1 FROM moodboards m
  JOIN moodboard_items mi ON m.id = mi.moodboard_id
  WHERE m.story_version_id = ${versionId}
  AND mi.status != 'empty'
  LIMIT 1
`;

if (hasMoodboard.length > 0) {
  return {
    error: "Story ini memiliki Moodboard. Clear moodboard terlebih dahulu.",
    hasMoodboard: true
  };
}
```

---

## Phase 6: Implementation Order

### Week 1: Foundation
1. ✅ Database migration
2. ✅ GET/POST/PATCH moodboard API
3. ✅ Prerequisites check logic
4. ✅ Basic frontend - story version selector

### Week 2: Key Action Generation
1. ✅ AI prompt for key actions
2. ✅ Generate key actions API
3. ✅ Frontend - display beats with key actions
4. ✅ Auto-save after generation

### Week 3: Prompt Generation
1. ✅ AI prompt for image prompts
2. ✅ Generate prompts API
3. ✅ Frontend - display prompts per key action
4. ✅ Character/universe level badges

### Week 4: Image Generation (LATER)
1. ⏸ AI Image Edit integration (Nano Banana / Seedance)
2. ⏸ Generate image API with character image inputs
3. ⏸ Frontend - image display with edit button
4. ⏸ Edit image modal with before/after comparison

### Week 5: Polish
1. ✅ Clear All functionality
2. ✅ Protection logic (universe/story delete)
3. ✅ Progress tracking
4. ✅ Loading states & error handling

---

## Estimated Effort (Revised)

| Phase | Items | Effort |
|-------|-------|--------|
| Database | Migration, index | 1 hour |
| API - CRUD | GET, POST, PATCH moodboard | 2 hours |
| API - Generation | Key actions, Prompts | 4 hours |
| API - Image | Generate, Edit (LATER) | 3 hours |
| AI Prompts | Key action, Image prompt | 2 hours |
| Frontend - Basic | Version selector, prerequisites, layout | 4 hours |
| Frontend - Generation | Generate buttons, progress | 3 hours |
| Frontend - Image Edit | Modal, comparison (LATER) | 3 hours |
| Protection Logic | Universe/Story delete blocks | 1 hour |
| Testing & Polish | All features | 3 hours |
| **TOTAL** | | **~26 hours** |

---

## Next Steps

### ✅ COMPLETED:
1. **Phase 1**: Database migration - `moodboards` and `moodboard_items` tables
2. **Phase 2**: API endpoints - CRUD, generate, clear, prerequisites
3. **Phase 3**: Frontend - MoodboardStudioV2 component

### ⏳ REMAINING:
4. **Phase 4**: Image Generation (ModelsLab integration)
   - Add ModelsLab API key
   - Create `lib/modelslab.ts`
   - Add generate image endpoint
   - Update frontend with image generation UI

### Files Created/Modified:
- `scripts/migrate-moodboard-v2.sql` - Database schema
- `scripts/run-moodboard-v2-migration.ts` - Migration runner
- `src/app/api/creator/projects/[id]/moodboard/route.ts` - Main CRUD API
- `src/app/api/creator/projects/[id]/moodboard/generate/route.ts` - Generation API
- `src/app/api/creator/projects/[id]/moodboard/items/[itemId]/route.ts` - Item API
- `src/app/api/creator/projects/[id]/moodboard/clear/route.ts` - Clear API
- `src/app/api/creator/projects/[id]/moodboard/prerequisites/route.ts` - Prereq check
- `src/components/studio/MoodboardStudioV2.tsx` - New V2 component
- `src/components/ui/collapsible.tsx` - Collapsible component
- `src/components/ui/tooltip.tsx` - Tooltip component
- `src/components/ui/alert.tsx` - Alert component

