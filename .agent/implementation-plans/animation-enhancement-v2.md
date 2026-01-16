# Animation Enhancement V2 - Implementation Plan

## Overview
Enhancement for the Animation module to integrate with Moodboard key actions, enabling image-to-video generation using ModelsLab's LTX-2-Pro model. The goal is to transform static moodboard images into animated video clips organized by beats.

---

## Current State Analysis

### Existing Animation Module
- **Component**: `Animation.tsx` - Basic scene management
- **Schema**: `animations` table tied to project, not moodboard
- **Features**: Create scenes manually, generate prompts from story, move scenes
- **Missing**: Connection to moodboard, beat-based view, video generation API

### Existing EditMix Module
- **Component**: `EditMixStudio.tsx` - Timeline-based video editor
- **Features**: Timeline clips, TTS generation, export
- **Useful for**: Final video assembly after individual clips are generated

---

## Phase 1: Database Schema Enhancement 🗄️

### 1.1 New Table: `animation_versions`
```sql
CREATE TABLE animation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(255),
  
  -- Settings
  default_duration INTEGER DEFAULT 6, -- seconds per clip
  default_fps INTEGER DEFAULT 25,
  default_resolution VARCHAR(20) DEFAULT '1920x1080',
  generate_audio BOOLEAN DEFAULT false,
  
  -- Transition settings
  transition_type VARCHAR(50) DEFAULT 'fade', -- fade, dissolve, wipe, zoom, slide
  transition_duration DECIMAL DEFAULT 0.5,
  
  -- Effect presets
  effect_preset JSONB, -- {cameraMotion: 'orbit', style: 'cinematic', etc.}
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, generating, completed
  total_clips INTEGER DEFAULT 0,
  completed_clips INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- soft delete
);
```

### 1.2 New Table: `animation_clips`
```sql
CREATE TABLE animation_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_version_id UUID REFERENCES animation_versions(id) ON DELETE CASCADE,
  moodboard_item_id UUID REFERENCES moodboard_items(id) ON DELETE CASCADE,
  
  -- Beat/Order info
  beat_key VARCHAR(100),
  clip_order INTEGER NOT NULL,
  
  -- Source image
  source_image_url TEXT NOT NULL,
  
  -- Video prompt (generated from key action + image)
  video_prompt TEXT,
  negative_prompt TEXT,
  
  -- Video settings
  duration INTEGER DEFAULT 6,
  fps INTEGER DEFAULT 25,
  resolution VARCHAR(20) DEFAULT '1920x1080',
  
  -- Camera motion
  camera_motion VARCHAR(100), -- orbit, zoom_in, zoom_out, pan_left, pan_right, static
  camera_angle VARCHAR(100), -- eye_level, bird_eye, low_angle, dutch_angle
  
  -- Output
  video_url TEXT,
  thumbnail_url TEXT,
  preview_gif_url TEXT,
  
  -- ModelsLab job tracking
  job_id VARCHAR(255),
  eta_seconds INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, prompt_ready, queued, processing, completed, failed
  error_message TEXT,
  generation_cost INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Add Indexes
```sql
CREATE INDEX idx_animation_versions_moodboard ON animation_versions(moodboard_id);
CREATE INDEX idx_animation_clips_version ON animation_clips(animation_version_id);
CREATE INDEX idx_animation_clips_item ON animation_clips(moodboard_item_id);
```

---

## Phase 2: Animation Version Management 🎬

### 2.1 Create AnimationStudioV2 Component
- **Location**: `src/components/studio/AnimationStudioV2.tsx`
- **Features**:
  - Moodboard version selector (searchable dropdown)
  - Animation version selector with create/delete/restore
  - Beat-based clip view (like moodboard but for videos)
  - Settings panel for default options

### 2.2 UI Layout
```
┌─────────────────────────────────────────────────────────┐
│ Animation Studio                                         │
├─────────────────────────────────────────────────────────┤
│ Moodboard: [v1 - Main Storyline ▼]  Animation: [v1 ▼]   │
│ [+ New Version] [Settings] [Export All]                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────── Beat 1: Opening Hook ─────────────────┐    │
│ │ [Gen Prompts] [Gen Videos]                       │    │
│ │ ┌──────┐ ┌──────┐ ┌──────┐                      │    │
│ │ │ Img  │ │ Img  │ │ Img  │                      │    │
│ │ │ ▶    │ │ ▶    │ │ ⏳   │  <- Status icons    │    │
│ │ └──────┘ └──────┘ └──────┘                      │    │
│ └─────────────────────────────────────────────────┘    │
│ ┌─────────── Beat 2: Theme Stated ─────────────────┐   │
│ │ ...                                              │    │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Searchable Dropdowns
- Lazy-load moodboard versions
- Lazy-load animation versions
- Show deleted versions with restore option
- Same pattern as `SearchableMoodboardDropdown`

---

## Phase 3: Video Prompt Generation 📝

### 3.1 API: Generate Video Prompts
- **Endpoint**: `POST /api/generate/animation-prompt`
- **Input**: Moodboard item (image URL + key action description)
- **Output**: Video prompt optimized for image-to-video

### 3.2 Prompt Template
```
Based on this image and key action, generate a cinematic video prompt:

Key Action: {keyActionDescription}
Characters: {charactersInvolved}
Scene: {beatLabel}
Art Style: {artStyle}

Generate a prompt that:
1. Describes the motion/action to apply to this image
2. Specifies camera movement (orbit, zoom, pan, etc.)
3. Maintains character consistency
4. Creates cinematic feel
5. Duration: {duration} seconds

Output JSON:
{
  "videoPrompt": "...",
  "cameraMotion": "orbit|zoom_in|pan_left|...",
  "cameraAngle": "eye_level|bird_eye|...",
  "suggestedDuration": 6
}
```

### 3.3 Generation Modes
- **Per Beat**: Generate prompts for all key actions in a beat
- **Per Key Action**: Generate single prompt
- **All Beats**: Batch generate for entire moodboard

---

## Phase 4: Video Generation API Integration 🎥

### 4.1 ModelsLab LTX-2-Pro Integration
- **Endpoint**: `https://modelslab.com/api/v7/video-fusion/image-to-video`
- **Model**: `ltx-2-pro-i2v`

### 4.2 API Route: Generate Video
- **Endpoint**: `POST /api/generate/animation-video`
- **Features**:
  - Takes clip ID and generates video
  - Handles async job with webhook
  - Updates clip status and stores video URL
  - Credit deduction

### 4.3 Webhook Handler
- **Endpoint**: `POST /api/webhooks/modelslab`
- Receives job completion
- Updates clip with video URL
- Sends notification to user

### 4.4 Job Status Polling
- Fallback for webhook failures
- Check job status periodically
- Update UI in real-time

---

## Phase 5: Settings & Effects ⚙️

### 5.1 Default Settings Dialog
```
┌─────────────── Animation Settings ───────────────┐
│                                                   │
│ Video Settings                                    │
│ ├─ Resolution: [1920x1080 ▼] [2560x1440] [4K]   │
│ ├─ Duration: [6s ▼] per clip                    │
│ ├─ FPS: [25 ▼]                                  │
│ └─ Generate Audio: [✓]                          │
│                                                   │
│ Transition Effects                                │
│ ├─ Type: [Fade ▼] [Dissolve] [Wipe] [Zoom]     │
│ ├─ Duration: [0.5s ▼]                           │
│ └─ Easing: [Ease-in-out ▼]                      │
│                                                   │
│ Camera Motion Presets                             │
│ ├─ [✓] Cinematic Orbit (360° smooth rotation)   │
│ ├─ [ ] Slow Zoom In (dramatic focus)            │
│ ├─ [ ] Ken Burns (slow pan + zoom)              │
│ ├─ [ ] Parallax 3D (depth simulation)           │
│ └─ [ ] Custom per clip                          │
│                                                   │
│ Visual Effects                                    │
│ ├─ [ ] Depth of Field                           │
│ ├─ [ ] Film Grain                               │
│ ├─ [ ] Color Grading (cinematic LUT)            │
│ └─ [ ] Motion Blur                              │
│                                                   │
│                     [Cancel] [Save Settings]      │
└───────────────────────────────────────────────────┘
```

### 5.2 Effect Presets
| Preset | Camera | Effects | Best For |
|--------|--------|---------|----------|
| Cinematic | Slow orbit | DoF, Film grain | Action scenes |
| Dramatic | Zoom in | Color grade, vignette | Emotional moments |
| Documentary | Static/Ken Burns | Natural colors | Narration |
| Music Video | Fast cuts, dynamic | High contrast | Energetic |
| Dream | Slow, floaty | Soft focus, glow | Fantasy |

---

## Phase 6: Clip Detail Modal 🖼️

### 6.1 Features
- Full video preview player
- Edit video prompt
- Regenerate with different settings
- Download video
- Version history of regenerations

### 6.2 Per-Clip Settings Override
- Custom duration
- Custom camera motion
- Custom effects
- Audio toggle

---

## Phase 7: Batch Operations 🔄

### 7.1 Generate All Prompts
- For selected beat or entire moodboard
- Progress modal with status

### 7.2 Generate All Videos
- Queue system for multiple clips
- Real-time progress tracking
- Credit check before batch

### 7.3 Export Options
- **Export as ZIP**: All videos as separate files
- **Merge to Single Video**: Concatenate with transitions
- **Export Project**: For use in EditMix

---

## Phase 8: Additional Feature Ideas 💡

### 8.1 Timeline Preview
- See all clips in order
- Drag to reorder clips
- Preview entire sequence with transitions

### 8.2 Auto-Generate from Moodboard
- One-click generate all prompts + videos
- Intelligent pacing based on story beats

### 8.3 Character Consistency Check
- Verify character appearance across clips
- Flag inconsistencies for manual review

### 8.4 Background Music Integration
- Select music from library
- Auto-sync clip cuts to beat

### 8.5 Voiceover Generation
- TTS from key action descriptions
- Sync voiceover to clips

### 8.6 A/B Testing Clips
- Generate multiple variations
- Compare side-by-side
- Keep best version

### 8.7 Storyboard View
- Print-friendly storyboard layout
- Export as PDF with thumbnails + descriptions

### 8.8 Social Media Optimization
- Auto-crop for different platforms (TikTok, Instagram, YouTube)
- Generate thumbnails
- Add captions/subtitles

---

## Implementation Priority Order

| Priority | Phase | Feature | Effort | Impact |
|----------|-------|---------|--------|--------|
| 1️⃣ | 1 | Database Schema | Medium | Foundation |
| 2️⃣ | 2.1-2.2 | AnimationStudioV2 Basic UI | High | Core |
| 3️⃣ | 2.3 | Searchable Dropdowns | Medium | UX |
| 4️⃣ | 3 | Video Prompt Generation | Medium | Core |
| 5️⃣ | 4 | Video Generation API | High | Core |
| 6️⃣ | 5 | Settings & Effects | Medium | Polish |
| 7️⃣ | 6 | Clip Detail Modal | Medium | UX |
| 8️⃣ | 7 | Batch Operations | Medium | Efficiency |
| 🔜 | 8 | Additional Features | Varies | Enhancement |

---

## Estimated Timeline

| Phase | Hours |
|-------|-------|
| Phase 1 (Database) | 2-3h |
| Phase 2 (UI) | 6-8h |
| Phase 3 (Prompts) | 3-4h |
| Phase 4 (Video API) | 4-6h |
| Phase 5 (Settings) | 3-4h |
| Phase 6 (Modal) | 2-3h |
| Phase 7 (Batch) | 3-4h |
| **Total Core** | **23-32 hours** |
| Phase 8 (Extras) | As needed |

---

## Technical Notes

### ModelsLab API Reference
```javascript
const requestBody = {
    "init_image": "https://...", // Moodboard image URL
    "prompt": "...", // Generated video prompt
    "resolution": "2560x1440", // or "1920x1080", "3840x2160"
    "duration": "6", // seconds
    "generate_audio": true,
    "fps": "25",
    "model_id": "ltx-2-pro-i2v",
    "key": "API_KEY"
};
```

### Credit Costs (Estimated)
- Video Generation: ~50 credits per clip
- Prompt Generation: ~2 credits per prompt
- Audio Generation: ~5 credits extra

---

## Files to Create/Modify

### New Files
1. `src/db/schema/animation-versions.ts`
2. `src/app/api/animation-versions/route.ts`
3. `src/app/api/animation-clips/route.ts`
4. `src/app/api/generate/animation-prompt/route.ts`
5. `src/app/api/generate/animation-video/route.ts`
6. `src/app/api/webhooks/modelslab/route.ts`
7. `src/components/studio/AnimationStudioV2.tsx`
8. `src/components/studio/SearchableAnimationDropdown.tsx`
9. `drizzle/migrations/xxx_animation_versions.sql`

### Modify
1. `src/components/studio/Animation.tsx` → Deprecate or redirect to V2
2. `src/lib/ai-media-generation.ts` → Add video generation

---

## Next Steps 🚀

1. **Start with Phase 1**: Create database schema and migration
2. **Build AnimationStudioV2**: Basic UI with moodboard selection
3. **Implement Prompt Generation**: AI-powered video prompt creation
4. **Integrate ModelsLab**: Video generation with job tracking

Ready to proceed with implementation?
