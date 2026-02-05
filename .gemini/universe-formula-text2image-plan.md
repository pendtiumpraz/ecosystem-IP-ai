# Universe Formula Text2Image Implementation Plan

## Overview
Menambahkan fitur Text2Image generation untuk setiap field di Universe Formula dengan image versioning, enhanced prompts, dan UI lengkap. Implementasi mengikuti pattern existing dari:
- `cover-versions` API (versioning dengan soft delete)
- `character-image-versions` API (versioning per entity)
- `ai-media-generation.ts` (image generation dengan callAI)
- `ai-providers.ts` (callAI function)

---

## 1. Database Schema

### New Table: `universe_field_images`
```sql
CREATE TABLE universe_field_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL, -- e.g., 'roomCave', 'houseCastle', etc.
  level_number INTEGER NOT NULL, -- 1-8
  version_number INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  thumbnail_url TEXT,
  enhanced_prompt TEXT, -- Enhanced JSON prompt
  original_description TEXT, -- Original field description used
  style VARCHAR(100),
  model_used VARCHAR(100),
  provider VARCHAR(100),
  credit_cost INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  UNIQUE(project_id, story_id, field_key, version_number)
);

CREATE INDEX idx_universe_images_project ON universe_field_images(project_id);
CREATE INDEX idx_universe_images_story ON universe_field_images(story_id);
CREATE INDEX idx_universe_images_field ON universe_field_images(field_key);
CREATE INDEX idx_universe_images_active ON universe_field_images(is_active) WHERE is_active = true;
```

---

## 2. API Routes (Following existing patterns)

### 2.1 `POST /api/ai/generate-universe-prompt`
Generate enhanced JSON prompt using callAI (text model)

### 2.2 `POST /api/ai/generate-universe-image`  
Generate image using callAI (image model), save version to DB, follow `ai-media-generation.ts` pattern

### 2.3 `GET /api/universe-images`
Get images with versioning, following `cover-versions` pattern:
- Support `includeDeleted`, `onlyDeleted` params
- Return images grouped by fieldKey

### 2.4 `PATCH /api/universe-images`
Set active version, following `cover-versions` pattern

### 2.5 `DELETE /api/universe-images`
Soft delete/restore, following `cover-versions` pattern with `action=restore`

---

## 3. Implementation Steps

### Phase 1: Database
1. [x] Create migration SQL for `universe_field_images` table

### Phase 2: API Routes
2. [ ] Create `POST /api/ai/generate-universe-prompt/route.ts`
3. [ ] Create `POST /api/ai/generate-universe-image/route.ts`
4. [ ] Create `GET/PATCH/DELETE /api/universe-images/route.ts`

### Phase 3: UI - Visual View
5. [ ] Add "Visual" view mode to UniverseFormulaStudio
6. [ ] Create UniverseVisualView component with per-field image cards
7. [ ] Add version dropdown per field (lazy load, delete/restore)
8. [ ] Add generate buttons (per field, per level, all)
9. [ ] Add SweetAlert confirmations
10. [ ] Add ProgressModal for batch generation
11. [ ] Add Toast notifications

### Phase 4: State Management
12. [ ] Add universe images state to page.tsx
13. [ ] Wire up handlers and props

---

## 4. Key Patterns to Follow

### From `ai-providers.ts`:
```typescript
import { callAI, getActiveModelForTier, type SubscriptionTier } from "@/lib/ai-providers";
// For text (prompt enhancement)
const result = await callAI("text", prompt, { tier: userTier, userId });
// For image generation
const result = await callAI("image", prompt, { tier: userTier, userId });
```

### From `ai-media-generation.ts`:
- Check credits before generation
- Deduct credits
- Call AI
- Save to database
- Refund on error

### From `cover-versions/route.ts`:
- Soft delete with `deleted_at` column
- `includeDeleted` and `onlyDeleted` query params
- `action=restore` for DELETE to restore
- Auto-activate next version when active is deleted

---

## 5. Enhanced Prompt Structure

```json
{
  "scene": "Main scene description based on field content",
  "setting": "Time of day, weather, season",
  "lighting": "Light sources, shadows, mood lighting",
  "camera": "Wide establishing shot, eye-level perspective",
  "atmosphere": "Mood, feeling, ambiance",
  "elements": ["Key visual elements as array"],
  "colorPalette": "Primary colors and tones",
  "style": "Cinematic, matte painting, concept art",
  "mood": "Emotional tone",
  "details": "8K, ultra detailed, masterpiece"
}
```

---

Ready to start implementation!
