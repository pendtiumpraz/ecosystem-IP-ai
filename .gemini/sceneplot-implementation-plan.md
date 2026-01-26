# Sceneplot Integration - Implementation Plan

## 📋 Overview

Mengintegrasikan **Scene Plot** ke dalam workflow yang sudah ada, bukan sebagai fitur terpisah, tapi sebagai bagian dari **Animation Clips**. Scene Plot akan digunakan untuk menginformasikan camera angle, shot type, dan movement ke dalam animation prompt generation.

---

## 🎯 Goals

1. **Scene Plot per Key Action** - Setiap key action/animation clip memiliki scene plot sendiri
2. **Stored in Animation Clips** - Data disimpan di `animation_clips.scene_plot` (JSONB)
3. **Generate All in Story Formula** - Bulk generate scene plots (45 sekaligus)
4. **Generate per Beat in Animate** - Generate scene plots & prompts per beat (3 sekaligus)
5. **Inform Animation Prompt** - Scene plot data masuk ke prompt generation

---

## 📊 Data Relationship

```
Story Version
└── Beat 1: Opening Image
    ├── Key Action 1 → Moodboard Image 1 → Animation Clip 1 → Scene Plot 1
    ├── Key Action 2 → Moodboard Image 2 → Animation Clip 2 → Scene Plot 2
    └── Key Action 3 → Moodboard Image 3 → Animation Clip 3 → Scene Plot 3
└── Beat 2: Theme Stated
    ├── Key Action 1 → Moodboard Image 1 → Animation Clip 4 → Scene Plot 4
    ├── Key Action 2 → Moodboard Image 2 → Animation Clip 5 → Scene Plot 5
    └── Key Action 3 → Moodboard Image 3 → Animation Clip 6 → Scene Plot 6
└── ... (15 beats × 3 key actions = 45 clips/scene plots)
```

**Key Relationship:**
- **1 Key Action = 1 Moodboard Image = 1 Animation Clip = 1 Scene Plot** ✅

---

## 📊 Data Structure

### Scene Plot JSONB Format (in animation_clips.scene_plot)
```json
{
  "shots": [
    {
      "shotNumber": 1,
      "shotType": "establishing",
      "shotAngle": "eye-level",
      "cameraMovement": "static",
      "durationSeconds": 4,
      "shotDescription": "Wide shot rumah tua di pinggir hutan",
      "action": "Angin bertiup, daun berjatuhan"
    },
    {
      "shotNumber": 2,
      "shotType": "medium",
      "shotAngle": "low",
      "cameraMovement": "dolly-in",
      "durationSeconds": 3,
      "shotDescription": "Maya berdiri di depan pintu",
      "action": "Maya ragu-ragu sebelum membuka pintu"
    }
  ],
  "preference": "Film festival Cannes standard",
  "generatedAt": "2026-01-26T12:00:00Z"
}
```

---

## 🔄 Generation Flow

### Option 1: Story Formula > Scene Plot View (Bulk)
```
[Generate All Scene Plots]
├── Progress Modal: Generating 1/45... 2/45... 45/45
├── Generates scene plot for ALL key actions
└── Updates: animation_clips.scene_plot for all clips
```

### Option 2: Animate Tab (Per Beat)
```
Beat 1: Opening Image (3 key actions)

[Generate Scene Plots for Beat]
├── Progress Modal: Generating 1/3... 2/3... 3/3
└── Updates: animation_clips.scene_plot for this beat's clips

[Generate Prompts for Beat]
├── Uses scene_plot data (camera, angle, movement)
├── Progress Modal: Generating 1/3... 2/3... 3/3
└── Updates: animation_clips.video_prompt for this beat's clips

[Generate Animations for Beat]
├── Uses image + prompt
├── Progress Modal: Generating 1/3... 2/3... 3/3
└── Updates: animation_clips.video_url for this beat's clips
```

---

## 🔨 Implementation Steps

### Phase 1: Database Migration

#### Task 1.1: Add scene_plot column to animation_clips
```sql
ALTER TABLE animation_clips 
ADD COLUMN IF NOT EXISTS scene_plot JSONB;

-- Index for querying
CREATE INDEX IF NOT EXISTS idx_animation_clips_scene_plot 
ON animation_clips USING GIN (scene_plot);
```

**Files:**
- `scripts/migrate-sceneplot-to-clips.ts` - NEW

**Effort:** Small
**Status:** ⏳ TODO

---

### Phase 2: Story Formula - Key Action View

#### Task 2.1: Create KeyActionView component
Komponen untuk menampilkan dan generate ALL key actions sekaligus di Story Formula.

**Features:**
- List semua beats dengan key action count
- Status: Complete / Incomplete per beat
- Button "Generate All Key Actions" 
- Progress modal saat generate (1/15, 2/15... per beat)
- Preference input untuk style guidance

**Files:**
- `src/components/studio/KeyActionView.tsx` - NEW
- `src/app/api/ai/generate-all-key-actions/route.ts` - NEW

**Effort:** Medium
**Status:** ⏳ TODO

#### Task 2.2: Add Key Action View to StoryArcStudio
Integrate KeyActionView ke dalam view mode selector.

**Files:**
- `src/components/studio/StoryArcStudio.tsx` - MODIFY
  - Add 'keyactions' to ViewMode type ✅ DONE
  - Add tab button for Key Actions view
  - Render KeyActionView when mode = 'keyactions'

**Effort:** Small
**Status:** ⏳ TODO

---

### Phase 3: Story Formula - Scene Plot View

#### Task 3.1: Update ScenePlotStudio component
Refactor komponen yang sudah dibuat untuk:
- Accept key action data instead of beat data
- Show ALL key actions dengan scene plot status
- Generate ALL scene plots sekaligus
- Save to animation_clips.scene_plot

**Features:**
- List key actions grouped by beat
- Status: Has Scene Plot / No Scene Plot
- Button "Generate All Scene Plots"
- Progress modal (1/45, 2/45... per key action)
- Preference input global + per key action
- Require: Key Actions must be complete
- Require: Animation Version must exist (show create modal if not)

**Files:**
- `src/components/studio/ScenePlotStudio.tsx` - MODIFY (major refactor)

**Effort:** Large
**Status:** ⏳ TODO

#### Task 3.2: Create Animation Version Check Modal
Modal untuk create animation version jika belum ada.

**Files:**
- `src/components/studio/CreateAnimationVersionModal.tsx` - NEW (or reuse existing)

**Effort:** Small
**Status:** ⏳ TODO

#### Task 3.3: Add Scene Plot View to StoryArcStudio
Integrate ScenePlotStudio ke dalam view mode selector.

**Files:**
- `src/components/studio/StoryArcStudio.tsx` - MODIFY
  - Add 'sceneplot' to ViewMode type ✅ DONE
  - Add tab button for Scene Plot view
  - Render ScenePlotStudio when mode = 'sceneplot'
  - Check if animation version exists, show create modal if not

**Effort:** Small
**Status:** ⏳ TODO

---

### Phase 4: Animate Tab - Per Beat Generation

#### Task 4.1: Create ScenePlotCard component
Komponen kecil untuk menampilkan scene plot per key action di Animate tab.

**Features:**
- Compact card showing shots list
- Shot type, angle, movement icons
- Duration total
- Edit button → opens editor modal
- Regenerate button (individual)

**Files:**
- `src/components/studio/ScenePlotCard.tsx` - NEW

**Effort:** Small
**Status:** ⏳ TODO

#### Task 4.2: Add Per-Beat Generation Buttons
Tambahkan tombol generate per beat dengan progress modal.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ANIMATE TAB - Beat 1: Opening Image                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ KEY ACTIONS (3)                                             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 1. Maya arrives at the old house        [Scene Plot ✅]    │ │
│ │    └── Shots: 3 | Duration: 9s | Prompt: ✅ | Animation: ❌ │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 2. She hesitates at the door            [Scene Plot ❌]    │ │
│ │    └── Shots: - | Duration: - | Prompt: ❌ | Animation: ❌  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 3. Maya opens the creaky door           [Scene Plot ❌]    │ │
│ │    └── Shots: - | Duration: - | Prompt: ❌ | Animation: ❌  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ PER-BEAT ACTIONS:                                           │ │
│ │ [Generate Scene Plots for Beat] → Progress 1/3, 2/3, 3/3   │ │
│ │ [Generate Prompts for Beat]     → Progress 1/3, 2/3, 3/3   │ │
│ │ [Generate Animations for Beat]  → Progress 1/3, 2/3, 3/3   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Files:**
- `src/components/studio/AnimateStudio.tsx` or `AnimateBeatSection.tsx` - MODIFY

**Effort:** Medium
**Status:** ⏳ TODO

#### Task 4.3: Integrate Scene Plot to AnimateKeyAction
Tambahkan ScenePlotCard ke setiap key action di Animate tab.

**Layout per Key Action:**
```
┌─────────────────────────────────────────────────────────────────┐
│ KEY ACTION 1: Maya membuka pintu rumah tua                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌─────────────────────────────────────────────┐│
│ │  [Image]     │ │ SCENE PLOT                                  ││
│ │              │ │ Shot 1: establishing | eye-level | static   ││
│ │              │ │ Shot 2: medium | low | dolly-in             ││
│ │              │ │ Shot 3: close-up | eye-level | static       ││
│ │              │ │                                             ││
│ │              │ │ [Regenerate] [Edit]                         ││
│ └──────────────┘ └─────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│ PROMPT: [textarea for animation prompt]                         │
│ [Generate Prompt] [Generate Animation]                          │
└─────────────────────────────────────────────────────────────────┘
```

**Files:**
- `src/components/studio/AnimateKeyActionCard.tsx` or similar - MODIFY

**Effort:** Medium
**Status:** ⏳ TODO

---

### Phase 5: Scene Plot → Animation Prompt Integration

#### Task 5.1: Update Animation Prompt Generation
Modify prompt generation untuk include scene plot data.

**Current prompt input:**
- Key action description
- Characters involved
- Image reference

**New prompt input (with scene plot):**
```json
{
  "keyActionDescription": "Maya membuka pintu rumah tua",
  "charactersInvolved": ["Maya"],
  "imageUrl": "https://...",
  "scenePlot": {
    "shots": [
      { "shotType": "medium", "shotAngle": "low", "cameraMovement": "dolly-in", ... }
    ]
  }
}
```

**Output prompt enhancement:**
```
"Maya opens the door of the old house. 
CAMERA: Medium shot, low angle, dolly-in movement. 
Duration: 4 seconds. 
The camera slowly moves toward Maya as she hesitates..."
```

**Files:**
- `src/lib/ai/prompts.ts` - MODIFY (add ANIMATION_PROMPT_WITH_SCENEPLOT)
- `src/app/api/ai/generate/route.ts` - MODIFY (use scene plot in prompt)

**Effort:** Medium
**Status:** ⏳ TODO

#### Task 5.2: Create API for Scene Plot Operations
API endpoints untuk CRUD scene plots dalam animation_clips.

**Endpoints:**
- `GET /api/animation-clips/[id]/scene-plot` - Get scene plot for a clip
- `PUT /api/animation-clips/[id]/scene-plot` - Update scene plot for a clip
- `POST /api/animation-clips/generate-scene-plots` - Generate scene plots for multiple clips
- `POST /api/animation-clips/generate-prompts` - Generate prompts using scene plot data

**Files:**
- `src/app/api/animation-clips/[id]/scene-plot/route.ts` - NEW
- `src/app/api/animation-clips/generate-scene-plots/route.ts` - NEW
- `src/app/api/animation-clips/generate-prompts/route.ts` - NEW

**Effort:** Medium
**Status:** ⏳ TODO

---

### Phase 6: Cleanup & Testing

#### Task 6.1: Remove/Archive Unused Tables
The `scene_plots` and `scene_shots` tables created earlier are no longer needed.
Keep them for now, mark as deprecated.

**Files:**
- No file changes, just documentation

**Effort:** Small
**Status:** ⏳ TODO

#### Task 6.2: Update Implementation Plan
Mark tasks as complete, document final architecture.

**Files:**
- `.gemini/implementation-plan.md` - MODIFY

**Effort:** Small
**Status:** ⏳ TODO

---

## 📅 Sprint Plan

### Sprint 3A: Scene Plot Foundation ✅ COMPLETE
| Task | Description | Effort | Status |
|------|-------------|--------|--------|
| 1.1 | Add scene_plot column to animation_clips | S | ✅ |
| 5.2 | Create Scene Plot API endpoints | M | ✅ |

### Sprint 3B: Story Formula Views
| Task | Description | Effort | Status |
|------|-------------|--------|--------|
| 2.1 | Create KeyActionView component | M | ⏳ |
| 2.2 | Add Key Action View to StoryArcStudio | S | ⏳ |
| 3.1 | Update ScenePlotStudio component | L | ⏳ |
| 3.2 | Create Animation Version Check Modal | S | ⏳ |
| 3.3 | Add Scene Plot View to StoryArcStudio | S | ⏳ |

### Sprint 3C: Animate Tab Integration
| Task | Description | Effort | Status |
|------|-------------|--------|--------|
| 4.1 | Create ScenePlotCard component | S | ⏳ |
| 4.2 | Add Per-Beat Generation Buttons | M | ⏳ |
| 4.3 | Integrate Scene Plot to AnimateKeyAction | M | ⏳ |
| 5.1 | Update Animation Prompt Generation | M | ⏳ |

### Sprint 3D: Polish & Testing
| Task | Description | Effort | Status |
|------|-------------|--------|--------|
| 6.1 | Remove/Archive Unused Tables | S | ⏳ |
| 6.2 | Update Implementation Plan | S | ⏳ |

---

## 📝 UI/UX Flow Summary

### Story Formula Tab
```
┌─────────────────────────────────────────────────────────────────┐
│ STORY ARC STUDIO                                                │
├─────────────────────────────────────────────────────────────────┤
│ [Arc] [Beats] [Script] [Key Actions] [Scene Plot]               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ KEY ACTIONS VIEW:                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Beat 1: Opening Image      [3/3 key actions] ✅              │ │
│ │ Beat 2: Theme Stated       [2/3 key actions] ⚠️              │ │
│ │ Beat 3: Setup              [0/3 key actions] ❌              │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Generate All Key Actions]   Preference: [____________]         │
│                                                                 │
│─────────────────────────────────────────────────────────────────│
│                                                                 │
│ SCENE PLOT VIEW:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Beat 1 > Key Action 1      [Scene Plot ✅]                   │ │
│ │ Beat 1 > Key Action 2      [Scene Plot ✅]                   │ │
│ │ Beat 1 > Key Action 3      [Scene Plot ❌]                   │ │
│ │ Beat 2 > Key Action 1      [Scene Plot ❌]                   │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⚠️ Requires: Key Actions complete + Animation Version exists    │
│ [Generate All Scene Plots]   Preference: [____________]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Animate Tab (per Key Action)
```
┌─────────────────────────────────────────────────────────────────┐
│ KEY ACTION: Maya membuka pintu rumah tua                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌───────────────────────────────────────────┐ │
│ │              │  │ 📹 SCENE PLOT                             │ │
│ │   [IMAGE]    │  │ Shot 1: establishing | static | 4s        │ │
│ │              │  │ Shot 2: medium | dolly-in | 3s            │ │
│ │              │  │ Shot 3: close-up | static | 2s            │ │
│ └──────────────┘  │                    [Edit] [Regenerate]    │ │
│                   └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ 📝 ANIMATION PROMPT:                                            │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Maya slowly opens the creaky door of the old house.       │   │
│ │ Camera: Medium shot with low angle, dolly-in movement...  │   │
│ └───────────────────────────────────────────────────────────┘   │
│ [Generate Prompt (from Scene Plot)]                             │
├─────────────────────────────────────────────────────────────────┤
│ 🎬 ANIMATION:                                                   │
│ [Generate Animation] [View Animation]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Dependencies

1. **Animation Version must exist** before generating scene plots
2. **Key Actions must be complete** before generating scene plots
3. **Moodboard Version must exist** for key actions data
4. **Scene Plot should exist** before generating animation (optional but recommended)

---

## 🔄 Generation Flow

```
1. CREATE STORY STRUCTURE
   └── Fill beats content
   
2. GENERATE KEY ACTIONS (Story Formula > Key Action View)
   └── Input: beats content
   └── Output: moodboard_versions.key_actions
   
3. CREATE ANIMATION VERSION (if not exists)
   └── Links to moodboard_version
   
4. GENERATE SCENE PLOTS (Story Formula > Scene Plot View)
   └── Input: key_actions + preference
   └── Output: animation_versions.scene_plots
   
5. GENERATE MOODBOARD IMAGES (Moodboard Tab)
   └── Input: key_action + prompt
   └── Output: moodboard images
   
6. GENERATE ANIMATION PROMPT (Animate Tab)
   └── Input: key_action + scene_plot + image
   └── Output: animation prompt text
   
7. GENERATE ANIMATION (Animate Tab)
   └── Input: image + prompt
   └── Output: video animation
```

---

## 📁 Files Summary

### NEW Files:
- `scripts/migrate-sceneplot-to-clips.ts`
- `src/components/studio/KeyActionView.tsx`
- `src/components/studio/ScenePlotCard.tsx`
- `src/app/api/ai/generate-all-key-actions/route.ts`
- `src/app/api/animation-clips/[id]/scene-plot/route.ts`
- `src/app/api/animation-clips/generate-scene-plots/route.ts`
- `src/app/api/animation-clips/generate-prompts/route.ts`

### MODIFY Files:
- `src/components/studio/StoryArcStudio.tsx`
- `src/components/studio/ScenePlotStudio.tsx` (major refactor)
- `src/components/studio/AnimateStudio.tsx` or `AnimateBeatSection.tsx`
- `src/components/studio/AnimateKeyActionCard.tsx`
- `src/lib/ai/prompts.ts`
- `src/app/api/ai/generate/route.ts`
- `src/db/schema/animation-versions.ts` (add scene_plot column)

### ARCHIVE/DEPRECATED:
- `src/app/api/sceneplot/route.ts` (no longer needed)
- `scripts/run-sceneplot-migration.ts` (separate tables not used)
- DB tables: `scene_plots`, `scene_shots` (kept but unused)

---

## ✅ Acceptance Criteria

1. [ ] User can generate ALL key actions at once from Story Formula (Key Action View)
2. [ ] User can generate ALL scene plots at once from Story Formula (Scene Plot View)
3. [ ] User can generate scene plots PER BEAT from Animate tab with progress modal
4. [ ] User can generate prompts PER BEAT from Animate tab with progress modal
5. [ ] Scene plots are stored in `animation_clips.scene_plot` (JSONB)
6. [ ] Scene plots are displayed in Animate tab per key action
7. [ ] Animation prompt generation uses scene plot data (camera angle, shot type, movement)
8. [ ] Modal prompts to create animation version if not exists
9. [ ] Progress indicators show during all bulk generation operations
10. [ ] 1:1 relationship maintained: 1 Key Action = 1 Animation Clip = 1 Scene Plot

