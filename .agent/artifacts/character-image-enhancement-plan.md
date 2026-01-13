# Character Image Generation Enhancement Plan

## 📋 Requirements

### 1. Auto-Save After Generation ⚡
- Setelah image di-generate, otomatis save character ke database
- Update `imageUrl` dan `imagePoses` langsung ke API

### 2. Visual Portrait Version System 🖼️
- Setiap generated image = 1 version
- Save selected version ke database
- Load last viewed version saat reload
- UI untuk switch antar versions

### 3. Enhanced Generation Modal 🎨
Modal dengan opsi lengkap:
- **Image Size**: 1:1, 4:3, 3:4, 16:9, 9:16
- **Art Styles**: Realistic, Ghibli, Anime, Disney, Cyberpunk, dll
- **Templates**:
  - Single Portrait
  - 3x3 Expression Sheet (9 expressions)
  - Full Body Poses (action poses untuk film)
- **Character Reference**: Upload/URL reference image
- **Background Reference**: Upload/URL background image
- **Additional Description**: Free text input

---

## 🗂️ Database Schema Updates

### character_image_versions
```sql
CREATE TABLE character_image_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Version info
  version_name VARCHAR(255) NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,  -- Currently displayed version
  
  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drive_file_id TEXT,
  
  -- Generation params (for regeneration)
  art_style VARCHAR(50),
  template_type VARCHAR(50),  -- 'portrait', 'expression_sheet', 'full_body', 'action_pose'
  aspect_ratio VARCHAR(20),
  prompt_used TEXT,
  character_ref_url TEXT,
  background_ref_url TEXT,
  additional_description TEXT,
  
  -- Metadata
  credit_cost INTEGER DEFAULT 0,
  model_used VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_char_versions_char_id ON character_image_versions(character_id);
CREATE INDEX idx_char_versions_active ON character_image_versions(character_id, is_active);
```

---

## 📁 File Changes

### 1. New/Updated Files

```
src/
├── components/
│   └── studio/
│       ├── GenerateCharacterImageModal.tsx  -- ENHANCE
│       ├── CharacterImageVersions.tsx       -- EXISTS, ENHANCE
│       └── CharacterDeck.tsx                -- UPDATE
├── app/
│   └── api/
│       └── generate/
│           └── character-image/
│               └── route.ts                 -- UPDATE
├── lib/
│   └── ai-media-generation.ts               -- UPDATE
└── db/
    └── schema/
        └── character-image-versions.ts      -- NEW
```

---

## 🎨 Modal UI Design

```
┌──────────────────────────────────────────────────────────────────┐
│  ✨ Generate Character Image                              [X]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Version Name: [Realistic Portrait v1.........................]  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ TEMPLATE                                                    │ │
│  │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         │ │
│  │ │Portrait│ │Express│ │Full   │ │Action │ │Custom │         │ │
│  │ │ ✓     │ │Sheet  │ │Body   │ │Pose   │ │       │         │ │
│  │ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ART STYLE                                                   │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │
│  │ │Cinematic│ │ Anime  │ │ Ghibli │ │  Pixar │            │ │
│  │ │Realistic│ │        │ │        │ │   3D   │            │ │
│  │ │   ✓    │ │        │ │        │ │        │            │ │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ IMAGE SIZE                                                  │ │
│  │  ○ 1:1 Square   ○ 4:3 Landscape   ○ 3:4 Portrait           │ │
│  │  ○ 16:9 Widescreen   ○ 9:16 Vertical                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ REFERENCES (Optional)                                       │ │
│  │                                                             │ │
│  │  Character Reference:                                       │ │
│  │  ┌─────────────────────────────────────────────────┐       │ │
│  │  │  [📷 Upload] or [🔗 Paste URL]                  │       │ │
│  │  └─────────────────────────────────────────────────┘       │ │
│  │                                                             │ │
│  │  Background Reference:                                      │ │
│  │  ┌─────────────────────────────────────────────────┐       │ │
│  │  │  [📷 Upload] or [🔗 Paste URL]                  │       │ │
│  │  └─────────────────────────────────────────────────┘       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Additional Description:                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ wearing battle armor, standing in a dramatic sunset...     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────┐                             │
│  │   💰 Credit Cost: 12 credits   │                             │
│  └────────────────────────────────┘                             │
│                                                                  │
│              [Cancel]  [✨ Generate New Version]                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Templates for Film Production

### Portrait Templates
- Headshot (close up face)
- Medium Shot (torso up)
- Full Body Standing
- Over the Shoulder

### Expression Sheet (3x3)
- Happy, Sad, Angry
- Surprised, Fear, Disgust
- Neutral, Smirk, Laugh

### Action Poses
- Walking
- Running
- Fighting Stance
- Sitting
- Jumping
- Falling
- Kneeling
- Pointing
- Arms Crossed

### Scene-Specific
- Hero Shot (low angle, dramatic)
- Villain Reveal
- Emotional Breakdown
- Victory Pose
- Defeated/Exhausted

---

## 📊 Implementation Order

### Phase 1: Auto-Save (Quick Win)
1. ✅ Update `handleGenerateCharacterImage` to call save API after success
2. Create/update character save endpoint

### Phase 2: Version System
1. Create `character_image_versions` table
2. Update generation to save versions
3. Add version selector UI
4. Persist selected version

### Phase 3: Enhanced Modal
1. Update `GenerateCharacterImageModal.tsx` with new UI
2. Add template selection
3. Add art style selection
4. Add size selection
5. Add reference inputs
6. Connect to image-to-image API for references

---

## 🔄 API Flow with Versions

```
User clicks "Generate"
        │
        ▼
GenerateCharacterImageModal opens
        │
        ├─► Select template (portrait/expression/action)
        ├─► Select art style (realistic/anime/ghibli)
        ├─► Select size (1:1, 16:9, etc)
        ├─► Upload character reference (optional)
        ├─► Upload background reference (optional)
        └─► Add description (optional)
        │
        ▼
POST /api/generate/character-image
        │
        ├─► If reference uploaded → use image-to-image API
        └─► Else → use text-to-image API
        │
        ▼
Save to character_image_versions table
        │
        ▼
Set as active version
        │
        ▼
Auto-save character with new imageUrl
        │
        ▼
Return success → UI updates
```

---

*Created: 2026-01-14*
