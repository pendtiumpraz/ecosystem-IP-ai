# Moodboard V2 Enhancement - Implementation Plan

## Overview
Comprehensive enhancement for MoodboardStudioV2 component including improved UI/UX, version control for images, batch generation, and credit management.

---

## Phase 1: Settings & UI Cleanup 🔧

### 1.1 Remove Reference Images from Settings
- **File**: `MoodboardStudioV2.tsx`
- **Action**: Remove `AssetGallery` from Settings Dialog
- **Reason**: Reference images now come from character's active image version

### 1.2 Add Aspect Ratio Setting
- **Location**: Settings Dialog
- **Options**: 
  - `1:1` (Square)
  - `16:9` (Landscape/Cinematic)
  - `9:16` (Portrait/Vertical)
  - `4:3` (Classic)
  - `3:4` (Portrait)
  - `21:9` (Ultra-wide)
- **Database**: Add `aspect_ratio` column to `moodboards` table
- **Flow**: Pass aspect ratio to image generation API

### 1.3 Fix Image Display to Match Aspect Ratio
- **Current Issue**: Images cropped at 1:1 even if generated differently
- **Solution**: Dynamic aspect ratio CSS based on moodboard setting
- **Implementation**: `aspect-[16/9]`, `aspect-square`, etc.

---

## Phase 2: Image Detail & Info Modal 📸

### 2.1 Image Info Button (i)
- **Location**: Overlay on each key action image (like CharacterDeck)
- **Content**:
  - Full image preview
  - Generation timestamp
  - Model used
  - Prompt used
  - Credit cost
  - Version number

### 2.2 Simplified Key Action Card UI
- **Current**: Shows characters, universe, prompt inline
- **New**: Compact card with "View Details" button
- **Modal Contents**:
  - Key Action Description (editable)
  - Characters Involved (chips/tags)
  - Universe Level
  - Image Prompt (YAML, editable)
  - Negative Prompt

---

## Phase 3: Batch Generation with Progress 🚀

### 3.1 Per-Beat Image Generation
- **Trigger**: "Generate Images" button per beat collapsible
- **Flow**:
  1. User clicks "Generate All Images" for Beat X
  2. Modal shows progress: "Generating 1/7..."
  3. Each image generates sequentially
  4. UI updates as each completes
  5. Error handling per image (continue on error)

### 3.2 Progress UI Component
```tsx
<GenerationProgressModal>
  <ProgressBar value={current/total} />
  <Text>Generating {beatLabel} - Image {current}/{total}</Text>
  <ImagePreview src={lastGenerated} />
  <Button>Cancel</Button>
</GenerationProgressModal>
```

---

## Phase 4: Image Version Control 🔄

### 4.1 Database Schema
```sql
CREATE TABLE moodboard_item_image_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_item_id UUID REFERENCES moodboard_items(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drive_file_id TEXT,
  is_active BOOLEAN DEFAULT false,
  
  -- Generation info
  prompt_used TEXT,
  model_used VARCHAR(100),
  credit_cost INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  aspect_ratio VARCHAR(20),
  
  -- Source
  source_type VARCHAR(50) DEFAULT 'generated', -- generated, uploaded_drive, uploaded_url
  
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- soft delete for restore
);
```

### 4.2 Version Selector Modal
- **Trigger**: Click on key action image
- **UI**: Gallery grid showing all versions
- **Actions**:
  - Set as Active (checkbox/radio)
  - Delete version (soft delete)
  - Restore deleted version
  - View full size

### 4.3 API Endpoints
- `GET /api/moodboard-item-versions?itemId=xxx`
- `POST /api/moodboard-item-versions` (create new)
- `PUT /api/moodboard-item-versions/:id/activate`
- `DELETE /api/moodboard-item-versions/:id`
- `PUT /api/moodboard-item-versions/:id/restore`

---

## Phase 5: Image Upload 📤

### 5.1 Upload from Google Drive
- **UI**: Button "Upload from Drive" in version modal
- **Flow**:
  1. User selects file from Google Drive picker OR pastes Drive URL
  2. System converts to thumbnail URL
  3. Creates new version with `source_type: 'uploaded_drive'`

### 5.2 Upload from URL
- **UI**: Input field "Paste image URL"
- **Validation**: Check if URL is accessible image
- **Flow**:
  1. User pastes external URL
  2. System validates and (optionally) re-uploads to Drive
  3. Creates new version with `source_type: 'uploaded_url'`

---

## Phase 6: Credit Management 💳

### 6.1 Credit Check on Load
- **API**: `GET /api/users/:id/credits`
- **Store**: User's available credits in component state
- **Cost Reference**: Image generation cost (e.g., 5 credits/image)

### 6.2 Disabled State for Insufficient Credits
- **Affected Buttons**:
  - "Generate Image" per key action
  - "Generate All Images" per beat
  - "Generate All Prompts"
  - "Generate All Key Actions"
- **UI**:
  - `disabled` state
  - Tooltip: "Insufficient credits (need X, have Y)"
  - CTA: "Top up credits" link

### 6.3 Credit Warning Component
```tsx
{userCredits < requiredCredits && (
  <Alert variant="warning">
    <AlertTitle>Insufficient Credits</AlertTitle>
    <AlertDescription>
      You need {requiredCredits} credits but have {userCredits}.
      <Button variant="link">Top up now</Button>
    </AlertDescription>
  </Alert>
)}
```

---

## Phase 7: Additional Suggestions 💡

### 7.1 Drag & Drop Reorder Key Actions
- Allow reordering key actions within a beat
- Persist order to database

### 7.2 Copy/Duplicate Key Action
- Duplicate a key action with its image to another position

### 7.3 Export Moodboard
- Export as PDF with all images and descriptions
- Export as image grid (collage)

### 7.4 Collaborative Comments
- Add comments/notes per key action
- Useful for team feedback

### 7.5 Comparison View
- Side-by-side view of two image versions
- Useful for choosing between versions

---

## Implementation Order

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 High | 1.2 Aspect Ratio | Medium | High |
| 🔴 High | 1.3 Fix Image Display | Low | High |
| 🔴 High | 3.1 Batch Generation | Medium | High |
| 🔴 High | 6.2 Credit Disabled State | Low | High |
| 🟡 Medium | 2.2 Modal for Details | Medium | Medium |
| 🟡 Medium | 4 Version Control | High | High |
| 🟡 Medium | 5 Image Upload | Medium | Medium |
| 🟢 Low | 1.1 Remove Ref Images | Low | Low |
| 🟢 Low | 2.1 Image Info Button | Low | Medium |
| 🟢 Low | 7 Additional | Varies | Varies |

---

## Estimated Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours  
- **Phase 3**: 4-5 hours
- **Phase 4**: 6-8 hours (includes DB migration)
- **Phase 5**: 3-4 hours
- **Phase 6**: 2-3 hours
- **Phase 7**: Optional, as needed

**Total**: ~20-27 hours of development

---

## Files to Modify

1. `src/components/studio/MoodboardStudioV2.tsx` - Main component
2. `src/db/schema/moodboard-item-versions.ts` - New schema
3. `src/app/api/moodboard-item-versions/route.ts` - New API
4. `src/app/api/creator/projects/[id]/moodboard/route.ts` - Add aspect_ratio
5. `src/lib/ai-media-generation.ts` - Pass aspect ratio
6. `drizzle/migrations/xxx_moodboard_item_versions.sql` - Migration

---

## Questions - RESOLVED ✅

| Question | Decision |
|----------|----------|
| Version limit | **No limit** - let users create freely |
| Aspect ratio | **Global per moodboard version** |
| Auto cleanup | **No cleanup** - images stored in Google Drive/external |

---

## Phase 8: Additional Features 🌟

### 8.1 Drag & Drop Reorder Key Actions
- **UI**: Drag handle on each key action card
- **Library**: `@dnd-kit/core` or `react-beautiful-dnd`
- **Database**: Update `key_action_index` on reorder
- **Scope**: Within same beat only

### 8.2 Export Moodboard
- **Format Options**:
  - PDF (with beat labels, descriptions, images)
  - Image Grid (collage of all images)
  - ZIP (all images as files)
- **Library**: `jspdf` + `html2canvas` for PDF, `canvas` for grid
- **UI**: Export button in header with dropdown

### 8.3 Collaborative Comments
- **Location**: Per key action (in detail modal)
- **Database Schema**:
```sql
CREATE TABLE moodboard_comments (
  id UUID PRIMARY KEY,
  moodboard_item_id UUID REFERENCES moodboard_items(id),
  user_id VARCHAR(36),
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```
- **UI**: Comment thread in key action detail modal
- **Features**: Add, edit, delete comments

### 8.4 Comparison View
- **Trigger**: Select 2 versions in version gallery
- **UI**: Side-by-side modal with:
  - Both images
  - Prompts used
  - Generation date
  - "Use this" button for each

---

## Updated Priority Order

| Priority | Phase | Feature | Effort |
|----------|-------|---------|--------|
| 1️⃣ | 1.2 | Aspect Ratio Setting | Medium |
| 2️⃣ | 1.3 | Fix Image Display | Low |
| 3️⃣ | 6.2 | Credit Disabled State | Low |
| 4️⃣ | 3.1 | Batch Generation Progress | Medium |
| 5️⃣ | 2.2 | Modal for Key Action Details | Medium |
| 6️⃣ | 2.1 | Image Info Button (i) | Low |
| 7️⃣ | 4 | Version Control (DB + UI) | High |
| 8️⃣ | 5 | Upload from Drive/URL | Medium |
| 9️⃣ | 1.1 | Remove Reference Images | Low |
| 🔟 | 8.1 | Drag & Drop Reorder | Medium |
| 1️⃣1️⃣ | 8.2 | Export Moodboard | Medium |
| 1️⃣2️⃣ | 8.3 | Collaborative Comments | Medium |
| 1️⃣3️⃣ | 8.4 | Comparison View | Low |

---

## Estimated Total Timeline

| Phase | Hours |
|-------|-------|
| Phase 1 (Settings) | 2-3h |
| Phase 2 (Modals) | 3-4h |
| Phase 3 (Batch Gen) | 4-5h |
| Phase 4 (Versions) | 6-8h |
| Phase 5 (Upload) | 3-4h |
| Phase 6 (Credits) | 2-3h |
| Phase 8 (Additional) | 8-10h |
| **Total** | **28-37 hours** |

---

## Progress Tracking 📊

### ✅ COMPLETED

| Date | Phase | Feature | Status |
|------|-------|---------|--------|
| 2026-01-15 | 1.1 | Remove Reference Images | ✅ Done |
| 2026-01-15 | 1.2 | Aspect Ratio Setting | ✅ Done |
| 2026-01-15 | 1.3 | Fix Image Display | ✅ Done |
| 2026-01-15 | 6.2 | Credit Disabled State | ✅ Done |
| 2026-01-15 | 3.1 | Batch Generation Progress | ✅ Done |
| 2026-01-15 | NEW | Generation Mode Settings (All/Per Beat) | ✅ Done |
| 2026-01-15 | 2.2 | Item Detail Modal | ✅ Done |
| 2026-01-15 | 2.1 | Image Info Button (i) tooltip | ✅ Done |
| 2026-01-16 | 4 | **Version Control (DB + UI)** | ✅ Done |
| 2026-01-16 | 5 | **Upload from Drive/URL** | ✅ Done |
| 2026-01-16 | BUG | Fix duplicate modal during image gen | ✅ Done |
| 2026-01-16 | BUG | Fix modal not updating on version change | ✅ Done |

**Phase 4 Details (Version Control):**
- Database: `moodboard_item_image_versions` table
- Migration: Existing images migrated as v1
- API: GET, POST, PATCH, DELETE endpoints
- UI: Version gallery in modal with thumbnails
- Switch: Click version to activate, modal updates instantly

**Phase 5 Details (Upload):**
- File Upload: Choose File button uploads to Google Drive
- URL Input: Paste direct URL or Google Drive link
- Auto-convert Drive links to thumbnail format
- Preview before upload
- Creates new version with proper source_type

### ⏳ PENDING - Phase 8 (Additional Features)

| Priority | Phase | Feature | Effort | Status |
|----------|-------|---------|--------|--------|
| 1️⃣ | 8.1 | Drag & Drop Reorder | Medium | ✅ Done |
| 2️⃣ | 8.2 | Export Moodboard (ZIP/Grid) | Medium | ✅ Done |
| 3️⃣ | 8.3 | Collaborative Comments | Medium | ⏸️ Skipped |
| 4️⃣ | 8.4 | Comparison View (Side-by-side) | Low | ⏸️ Skipped |

---

## Phase 8 Implementation Details

### 8.1 Drag & Drop Reorder Key Actions ✅
- **Library**: `@dnd-kit/core` (recommended for React)
- **Scope**: Reorder within same beat only
- **UI**: Drag handle (⋮⋮) on each key action card
- **API**: Update `key_action_index` on drop
- **Status**: ✅ Completed

### 8.2 Export Moodboard ✅
- **Image Grid**: Collage of all images using `canvas`
- **ZIP Export**: All images as downloadable files using `jszip`
- **Image Proxy**: Server-side proxy to bypass CORS
- **UI**: Export button dropdown in header
- **Status**: ✅ Completed

### 8.3 Collaborative Comments ⏸️ SKIPPED
- **Reason**: Not needed at this time
- **Location**: Per key action in detail modal
- **Features**: Add, edit, delete comments with user attribution
- **Database**: New `moodboard_comments` table
- **Status**: ⏸️ Deferred for future implementation

### 8.4 Comparison View ⏸️ SKIPPED
- **Reason**: Not needed at this time
- **Trigger**: Select 2 versions in gallery
- **UI**: Side-by-side modal with prompts, dates, "Use this" buttons
- **Status**: ⏸️ Deferred for future implementation

---

## Summary

**Completed**: 14 features/fixes
- All Phase 1-6 features
- Phase 8.1: Drag & Drop Reorder
- Phase 8.2: Export Moodboard (ZIP + Image Grid)

**Skipped (Deferred)**:
- Phase 8.3: Collaborative Comments
- Phase 8.4: Comparison View

**Moodboard V2 Enhancement: ✅ COMPLETE**
