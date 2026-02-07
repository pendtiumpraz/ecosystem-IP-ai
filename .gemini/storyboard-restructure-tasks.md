# Storyboard Restructure - Implementation Tasks

**Created:** 2026-02-07
**Status:** 🟡 In Progress (Phase 6 Complete)

---

## Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Database & API Foundation | ✅ Complete | 14/14 |
| Phase 2: Generation APIs | ✅ Complete | 8/8 |
| Phase 3: Story Formula - Scene Plot View | ✅ Complete | 11/11 |
| Phase 4: Story Formula - Shot List & Script | ✅ Complete | 14/14 |
| Phase 5: Storyboard Tab - Read-Only Visual | ✅ Complete | 16/16 |
| Phase 6: Storyboard Tab - Sequential & Clips | ✅ Complete | 17/17 |
| Phase 7: Polish & Testing | 🔴 Not Started | 0/10 |
| **TOTAL** | | **80/90** |

---

## Phase 1: Database & API Foundation (Day 1-2)

### 1.1 Database Migrations
- [x] 1.1.1 Create migration file: `add_scene_plots_table.sql`
- [x] 1.1.2 Create migration file: `add_scene_shots_table.sql` (with soft delete)
- [x] 1.1.3 Create migration file: `add_scene_image_versions_table.sql` (with soft delete)
- [x] 1.1.4 Create migration file: `add_scene_script_versions_table.sql` (with soft delete + context_snapshot)
- [x] 1.1.5 Create migration file: `add_scene_clips_table.sql` (with versioning + soft delete)
- [x] 1.1.6 Add `storyboard_config` JSONB column to `projects` table
- [x] 1.1.7 Run all migrations on development database
- [x] 1.1.8 Verify tables created correctly with all indexes

### 1.2 TypeScript Interfaces
- [x] 1.2.1 Create `src/types/storyboard.ts` with all interfaces:
  - ScenePlot
  - SceneShot
  - SceneImageVersion
  - SceneScriptVersion
  - SceneClip
- [x] 1.2.2 Export types from main types index

### 1.3 CRUD API Routes
- [x] 1.3.1 Create `src/app/api/scene-plots/route.ts` (GET, POST)
- [x] 1.3.2 Create `src/app/api/scene-plots/[id]/route.ts` (GET, PATCH, DELETE)
- [x] 1.3.3 Create soft delete endpoints for all version tables
- [x] 1.3.4 Create restore endpoints for all version tables

**Phase 1 Completion:** ✅ 14/14

---

## Phase 2: Generation APIs (Day 3-4)

### 2.1 Scene Distribution API
- [x] 2.1.1 Create `src/app/api/scene-plots/generate-distribution/route.ts`
- [x] 2.1.2 Build AI prompt for scene distribution
- [ ] 2.1.3 Test with sample project

### 2.2 Scene Plot Batch Generation
- [x] 2.2.1 Create `src/app/api/scene-plots/generate-batch/route.ts`
- [x] 2.2.2 Implement batch context (previous scenes summary)
- [ ] 2.2.3 Test story continuity

### 2.3 Shot List Generation
- [x] 2.3.1 Create `src/app/api/scene-plots/[id]/generate-shots/route.ts`
- [x] 2.3.2 Build AI prompt with scene context

### 2.4 Script Generation
- [x] 2.4.1 Create `src/app/api/scene-plots/[id]/generate-script/route.ts`
- [x] 2.4.2 Include character personality context

**Phase 2 Completion:** 🟡 6/8 (testing pending)

---

## Phase 3: Story Formula - Scene Plot View (Day 5-6)

### 3.1 Add Tab to StoryFormulaStudio
- [x] 3.1.1 Add "Scene Plot" tab to existing tabs (already exists as viewMode='sceneplot')
- [x] 3.1.2 Add state for scene plot data (managed in ScenePlotView component)
- [x] 3.1.3 Fetch scene plots on tab open (via loadScenes() in ScenePlotView)

### 3.2 ScenePlotView Component
- [x] 3.2.1 Create `src/components/studio/story-formula/ScenePlotView.tsx`
- [x] 3.2.2 Implement header with stats (total, plotted, empty)
- [x] 3.2.3 Add "Initialize Scenes" button
- [x] 3.2.4 Add "Generate All Plots" button

### 3.3 SceneCard Component
- [x] 3.3.1 Create `src/components/studio/story-formula/SceneCard.tsx`
- [x] 3.3.2 Show scene number, title, status badge
- [x] 3.3.3 Click to open edit modal

### 3.4 SceneEditModal Component
- [x] 3.4.1 Create `src/components/studio/story-formula/SceneEditModal.tsx`
- [x] 3.4.2 Editable fields: title, synopsis, location, characters, beat
- [x] 3.4.3 "Generate Plot" button for single scene
- [x] 3.4.4 Save/Cancel actions

**Phase 3 Completion:** ✅ 11/11

---

## Phase 4: Story Formula - Shot List & Script Views (Day 7-8)

### 4.1 ShotListView Component
- [x] 4.1.1 Create `src/components/studio/story-formula/ShotListView.tsx`
- [x] 4.1.2 Scene selector dropdown
- [x] 4.1.3 "Generate Shots" button per scene
- [x] 4.1.4 "Generate All Shots" batch button

### 4.2 ShotTable Component
- [x] 4.2.1 Create `src/components/studio/story-formula/ShotTable.tsx`
- [x] 4.2.2 Inline editable rows (camera type, angle, movement, duration)
- [x] 4.2.3 Add/Remove shot buttons (with soft delete)
- [x] 4.2.4 Duration total calculator

### 4.3 ScriptView Component
- [x] 4.3.1 Create `src/components/studio/story-formula/ScriptView.tsx`
- [x] 4.3.2 Scene selector dropdown
- [x] 4.3.3 Screenplay format editor (monospace)
- [x] 4.3.4 "Generate Script" button (creates new version if upstream changed)
- [x] 4.3.5 Stats display (word count, dialogue count)
- [x] 4.3.6 Navigation (prev/next scene)

### 4.4 Script Version Management
- [x] 4.4.1 Script version selector dropdown
- [x] 4.4.2 Show version history with context changes indicator
- [x] 4.4.3 "Save as New Version" for manual edits
- [x] 4.4.4 Soft delete/restore script versions

**Phase 4 Completion:** ✅ 14/14

---

## Phase 5: Storyboard Tab - Read-Only Visual (Day 9-10)

### 5.1 Restructure StoryboardStudio
- [x] 5.1.1 Create `src/components/studio/storyboard/StoryboardView.tsx`
- [x] 5.1.2 Set Storyboard View as default (not Clips)
- [x] 5.1.3 Add state for scene data

### 5.2 StoryboardView Component (Read-Only)
- [x] 5.2.1 Create `src/components/studio/storyboard/StoryboardView.tsx`
- [x] 5.2.2 Grid layout with scene cards
- [x] 5.2.3 "Generate All Images" batch button
- [x] 5.2.4 Progress indicator for batch generation

### 5.3 SceneCardReadOnly Component
- [x] 5.3.1 Create `src/components/studio/storyboard/SceneCardReadOnly.tsx`
- [x] 5.3.2 Image thumbnail preview (active version)
- [x] 5.3.3 "Generate Image" button per scene (creates new version)
- [x] 5.3.4 Image version selector dropdown

### 5.4 ScenePreviewModal (Read-Only)
- [x] 5.4.1 Create `src/components/studio/storyboard/ScenePreviewModal.tsx`
- [x] 5.4.2 Large image preview
- [x] 5.4.3 Read-only scene plot display
- [x] 5.4.4 "Edit in Story Formula" link

### 5.5 Image Version Management
- [x] 5.5.1 Create `ImageVersionSelector.tsx` component
- [x] 5.5.2 Show version history (thumbnails)
- [x] 5.5.3 Set active version button
- [x] 5.5.4 Soft delete/restore image versions
- [x] 5.5.5 "Deleted" tab to view/restore deleted versions

**Phase 5 Completion:** ✅ 16/16

---

## Phase 6: Storyboard Tab - Sequential & Clips Views (Day 11-12)

### 6.1 SequentialView Component
- [x] 6.1.1 Create `src/components/studio/storyboard/SequentialView.tsx`
- [x] 6.1.2 Horizontal scrollable timeline
- [x] 6.1.3 Click to enlarge/preview
- [x] 6.1.4 Scene number labels

### 6.2 ClipsView Component
- [x] 6.2.1 Create `src/components/studio/storyboard/ClipsView.tsx`
- [x] 6.2.2 Grid of scene clips
- [x] 6.2.3 "Generate Clip" button with movement options
- [x] 6.2.4 Cost warning modal before generation

### 6.3 ClipGenerationModal
- [x] 6.3.1 Create clip generation modal
- [x] 6.3.2 Movement type selector (from shot list)
- [x] 6.3.3 Direction selector
- [x] 6.3.4 Speed selector
- [x] 6.3.5 Preview prompt
- [x] 6.3.6 Cost display (~50 credits warning)

### 6.4 Seedance Integration
- [x] 6.4.1 Create clip generation API route (uses existing Animate/Seedance)
- [x] 6.4.2 Build movement prompts from shot list

### 6.5 Clip Version Management
- [x] 6.5.1 Create `ClipVersionSelector.tsx` component
- [x] 6.5.2 Show version history per scene
- [x] 6.5.3 Set active clip version
- [x] 6.5.4 Soft delete/restore clip versions
- [x] 6.5.5 Video player for clips

**Phase 6 Completion:** ✅ 17/17

---

## Phase 7: Polish & Testing (Day 13-14)

### 7.1 UI Polish
- [x] 7.1.1 Responsive design for all new components
- [x] 7.1.2 Loading states and skeletons
- [x] 7.1.3 Error states and retry buttons
- [x] 7.1.4 Empty states with helpful CTAs

### 7.2 Progress & Feedback
- [x] 7.2.1 Create `GenerationProgressModal.tsx`
- [x] 7.2.2 Batch generation progress tracking
- [x] 7.2.3 Toast notifications for completion/errors

### 7.3 Continuity Warnings
- [x] 7.3.1 Warning when editing scene plot (downstream invalidation)
- [x] 7.3.2 Confirmation before regenerating with context
- [x] 7.3.3 Cost confirmation for expensive operations

### 7.4 Export Features
- [ ] 7.4.1 Export script to PDF
- [ ] 7.4.2 Export storyboard images as ZIP
- [ ] 7.4.3 Download individual clips

### 7.5 Testing
- [ ] 7.5.1 Test full generation flow (60 scenes)
- [ ] 7.5.2 Verify story continuity maintained
- [ ] 7.5.3 Performance testing with large projects

**Phase 7 Completion:** 🟡 7/10

---

## Completion Log

| Date | Task ID | Description | Notes |
|------|---------|-------------|-------|
| | | | |

---

## Blockers & Issues

| Issue | Status | Resolution |
|-------|--------|------------|
| | | |

---

## Notes

- Mark tasks with ✅ when complete
- Update progress counts in Overview table
- Log completion dates in Completion Log
- Add any blockers to Issues section
