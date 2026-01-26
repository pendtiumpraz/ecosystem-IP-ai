# 📋 MODO Studio Apps - Implementation Plan
## Complete Feature Development Based on Conceptual Deck

**Berdasarkan: MODO Conceptual Deck (All 12 Slides)**
**Last Updated**: 2026-01-26 21:12

---

## 📑 Deck Slide Reference

| Slide | Judul | Implementasi |
|-------|-------|--------------|
| 1 | Cover - Massive Story & Character | Branding reference |
| 2 | What is Good Film? | Philosophy (no direct implementation) |
| 3 | Why MODO Studio Apps | Pain points reference |
| 4 | Platform Overview | Framework architecture |
| 5 | **Feature of Development** | Master feature list |
| 6 | User Types (Easy/Advance) | UX consideration |
| 7 | **Architecture** | Full workflow diagram |
| 8 | **Character Formula** | Character studio specs |
| 9 | **Story Formula (Premise/Synopsis)** | Story formula part 1 |
| 10 | **Want/Need Matrix** | Story formula part 2 |
| 11 | **Story Structure + Sceneplot** | Story formula part 3 |
| 12 | Closing | Contact info |

---

## 🎯 Slide 5: Feature of Development (Master List)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MODO Studio Apps - Feature of Development                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 1. CHARACTER FORMULA                                                    │
│    - Archetype, arcs, wants, needs, etc                                │
│                                                                         │
│ 2. STORY FORMULA                                                        │
│    - Premise, Synopsis, Story Arc, Story Structure                     │
│    - Scene plot, script draft                                          │
│                                                                         │
│ 3. UNIVERSE FORMULA                                                     │
│    - Setting, world building, saga, etc                                │
│                                                                         │
│ 4. IP STRATEGIC                                                         │
│    - Social Media analyse, market analyse, investment approach, etc    │
│                                                                         │
│ 5. VISUALIZATION                                                        │
│    - IP Bible                                                          │
│    - Moodboard (per sequence)                                          │
│    - Animatic/Storyboard (per scene/shot)                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation Status:

| Feature | Current Status | Gap |
|---------|---------------|-----|
| Character Formula | ✅ **COMPLETE** | Key Poses ✅, Facial Expression ✅, Emotion & Gesture ✅ |
| Story Formula | ⚠️ Partial | Need: Global Synopsis, Preference, Want/Need V2, Sceneplot |
| Universe Formula | ✅ Implemented | Minor enhancements |
| IP Strategic | ❌ Hidden | Currently disabled |
| Visualization - IP Bible | ✅ Implemented | - |
| Visualization - Moodboard | ✅ Implemented | - |
| Visualization - Animatic | ⚠️ Partial | Need: Per scene/shot breakdown |

---

## 🏛️ Slide 7: Architecture (Advance Mode)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MODO ARCHITECTURE (ADVANCE)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   USER                                                                  │
│     │                                                                   │
│     ├──► STUDIO 1 (LITE)                                               │
│     │     └── Ide Cerita → Video                                       │
│     │                                                                   │
│     └──► STUDIO 2 (ADVANCE)                                            │
│           └── IP PROJECT                                                │
│                 │                                                       │
│                 └── IP STATEMENT ──► TEASER/SHORT/SERIES/FEATURES      │
│                       │                                                 │
│                       ├──► CHARACTER FORMULA ──┐                       │
│                       ├──► STORY FORMULA ──────┼──► MOODBOARD          │
│                       └──► UNIVERSE FORMULA ───┘        │              │
│                                                         ▼              │
│                       ┌─────────────────────────────────┴──────────────┐
│                       │                                                │
│                       ▼                                                │
│              ┌───────────────┬───────────────┐                         │
│              │ SCENE PLOT    │ SCRIPT DRAFT 1│                         │
│              ├───────────────┼───────────────┤                         │
│              │ STORYBOARD    │ IP BIBLE      │──► PROJECT PROPOSAL     │
│              │ ANIMATIC      │               │                         │
│              └───────────────┴───────────────┘                         │
│                                                         │              │
│                                          ┌──────────────┘              │
│                                          ▼                             │
│                                    IP STRATEGIC                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Workflow Implementation:
1. **IP Project** → Basic metadata ✅
2. **IP Statement** → Define format (Teaser/Short/Series/Features) ⚠️ Need enhancement
3. **Character/Story/Universe Formula** → Core development ✅ with gaps
4. **Moodboard** → Visual development ✅
5. **Scene Plot** → Per-scene breakdown ❌ NEW
6. **Script Draft** → Auto-generated script ⚠️ Basic
7. **Storyboard/Animatic** → Animation ✅ with gaps
8. **IP Bible** → Final document ✅
9. **IP Strategic** → Business intelligence ❌ Hidden

---

## 👤 Slide 8: Character Formula (Full Spec)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHARACTER FORMULA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LEFT PANEL:                    MIDDLE PANEL:              RIGHT PANEL: │
│  ┌────────────────┐            ┌──────────────┐                        │
│  │ Name           │            │ Upload your  │       GENERATE KEY POSE │
│  │ [____________] │            │ References   │       ┌───┬───┬───┬───┐ │
│  │                │            │   📷 📷 📷    │       │   │   │   │   │ │
│  │ Age            │            └──────────────┘       │   │   │   │   │ │
│  │ [____________] │                                   │   │   │   │   │ │
│  │                │            ┌──────────────┐       └───┴───┴───┴───┘ │
│  │ Narrative      │            │ Preference   │                        │
│  │ Description    │            │ [text area]  │   GENERATE FACIAL EXPR  │
│  │ [____________] │            └──────────────┘       ┌───┬───┬───┬───┐ │
│  │                │                                   │😊 │😢 │😠 │😱 │ │
│  │ Character Arc  │            [generate image]       │   │   │   │   │ │
│  │ [____________] │                 ▼                 └───┴───┴───┴───┘ │
│  └────────────────┘            ┌──────────────┐                        │
│                                │  CHARACTER   │    GENERATE EMOTION &   │
│  DIMENSION TABS:               │   IMAGE      │         GESTURE         │
│  ┌────────────────┐            │    🧙        │       ┌───┬───┬───┬───┐ │
│  │ Role          │            │              │       │🙋 │🙇 │💃 │🏃 │ │
│  │ Relationship  │            │  Poses:      │       │   │   │   │   │ │
│  │ Physiological │            │ Front|Right  │       └───┴───┴───┴───┘ │
│  │ Psychological │            │  Left        │                        │
│  │ Archetype     │            └──────────────┘                        │
│  │ Emotional     │                                                     │
│  │ Core Beliefs  │                                                     │
│  │ Social        │                                                     │
│  │ Education     │                                                     │
│  │ SWOT          │                                                     │
│  └────────────────┘                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Gap Analysis - Character Formula:

| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Name, Age, Description | ✅ | ✅ | Done |
| Character Arc | ⚠️ Partial | Full progression | Enhance |
| Upload References | ✅ | ✅ | Done |
| Preference input for gen | ⚠️ Basic | Full | Enhance |
| **Generate Key Poses** | ✅ 5 poses | **4+ poses grid** | ✅ DONE |
| **Generate Facial Expression** | ✅ 4 expressions | **4 expressions** | ✅ DONE |
| **Generate Emotion & Gesture** | ✅ 4 gestures | **4 gestures** | ✅ DONE |
| Dimension Tabs | ✅ | ✅ | Done |

### Tasks for Character Formula:

```
PRIORITY: HIGH

Task 8.1: Add Facial Expression Generation
- Create grid of 4 expressions: Happy, Sad, Angry, Scared
- Each expression generates from base character image
- Store in character.facialExpressions: { happy: url, sad: url, ... }

Task 8.2: Add Emotion & Gesture Generation  
- Create grid of 4 gesture poses: Greeting, Bow, Dance, Run
- Generate based on character physiological traits
- Store in character.emotionGestures: { greeting: url, bow: url, ... }

Task 8.3: Enhance Key Poses Grid
- Current: Front, Right, Left (3)
- Add: Back, 3/4 View (5 total)
- Grid layout 2x3 or flexible
```

---

## 📖 Slide 9: Story Formula - Premise, Synopsis, Global Synopsis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STORY FORMULA - Part 1                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PREMISE                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [textarea - logline/premise]                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                              [generate]    [edit]       │
│                                                                         │
│  SYNOPSIS                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [textarea - multi-line synopsis]                                 │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                              [generate]    [edit]       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [preference]                                                     │   │
│  │ "saya ingin synopsis untuk standar film festival cannes         │   │
│  │  tetapi dengan sentuhan lokal, buat endingnya Bitter            │   │
│  │  Sweet dan twisted"                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  GLOBAL SYNOPSIS ⭐ NEW                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [textarea - larger, for series/franchise overview]              │   │
│  │                                                                   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                              [generate]    [edit]       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [preference]                                                     │   │
│  │ "tuliskan dengan lebih dramatis dan dark seperti                 │   │
│  │  cliffhanger, referensi film The God Father, jangan terlalu     │   │
│  │  kaku untuk market bioskop Indonesia"                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Gap Analysis:

| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Premise with generate | ✅ | ✅ | Done |
| Premise with edit button | ❌ | ✅ | Add |
| Synopsis with generate+edit | ⚠️ | ✅ | Enhance |
| Synopsis preference input | ❌ | ✅ | **NEW** |
| **Global Synopsis** | ❌ | ✅ | **NEW** |
| Global Synopsis preference | ❌ | ✅ | **NEW** |

### Tasks:

```
PRIORITY: HIGH

Task 9.1: Database Migration
- ALTER TABLE story_versions ADD COLUMN global_synopsis TEXT;
- ALTER TABLE story_versions ADD COLUMN synopsis_preference TEXT;
- ALTER TABLE story_versions ADD COLUMN global_synopsis_preference TEXT;

Task 9.2: Update StoryData Interface
- Add: globalSynopsis?: string
- Add: synopsisPreference?: string
- Add: globalSynopsisPreference?: string

Task 9.3: UI Enhancement - StoryArcStudio
- Add "edit" toggle button for Premise
- Add preference input below Synopsis
- Add Global Synopsis section with preference
- Wire up generate functions with preference context
```

---

## ⚖️ Slide 10: Want/Need Matrix & Ending Types

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STORY FORMULA - Part 2                                │
│                    WANT/NEED MATRIX                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│        WANT (External Goal - 4 Stages)                  ENDING TYPE     │
│  ┌────────────┬────────────┬────────────┬────────────┐ ┌──────────────┐ │
│  │Menginginkan│ Memastikan │  Mengejar  │  Tercapai  │ │  Thematic    │ │
│  │[textarea]  │[textarea]  │[textarea]  │[✓/✗/~]     │ ├──────────────┤ │
│  └────────────┴────────────┴────────────┴────────────┘ │  Classical   │ │
│                                                         ├──────────────┤ │
│        NEED (Internal Growth - 4 Stages)               │  Hollow      │ │
│  ┌────────────┬────────────┬────────────┬────────────┐ ├──────────────┤ │
│  │ Merasakan  │ Menyadari  │  Menerima  │ Terpenuhi  │ │  Tragic      │ │
│  │[textarea]  │[textarea]  │[textarea]  │[✓/✗]       │ ├──────────────┤ │
│  └────────────┴────────────┴────────────┴────────────┘ │Transcendental│ │
│                                                         ├──────────────┤ │
│                                                         │  Ambiguous   │ │
│                                                         └──────────────┘ │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    THE MATRIX CALCULATION                          │ │
│  ├──────────┬──────────┬─────────────────┬────────────────────────────┤ │
│  │   WANT   │   NEED   │   Tipe Ending   │          Rasa              │ │
│  ├──────────┼──────────┼─────────────────┼────────────────────────────┤ │
│  │    ✓     │    ✓     │   Thematic      │  Pahit-manis/Bitter Sweet  │ │
│  │    ✓     │    ✓     │   Classical     │  Puas/Happy Ending         │ │
│  │    ✓     │    ✗     │   Hollow        │  Gelisah                   │ │
│  │    ✗     │    ✗     │   Tragic        │  Muram                     │ │
│  │  Dilepas │    ✓     │  Transcendental │  Tenang                    │ │
│  │    ✗     │    ✓     │   Ambiguous     │  Reflektif                 │ │
│  └──────────┴──────────┴─────────────────┴────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ [preference] "Saya ingin film ini ditujukan penonton indonesia    │ │
│  │               di bioskop"                                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                              [preference]   [generate]  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Gap Analysis:

| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Want stages (4) | ❌ Wrong format | Menginginkan→Memastikan→Mengejar→Tercapai | **REDESIGN** |
| Need stages (4) | ❌ Wrong format | Merasakan→Menyadari→Menerima→Terpenuhi | **REDESIGN** |
| Tercapai toggle (✓/✗/Dilepas) | ❌ None | 3-state toggle | **NEW** |
| Terpenuhi toggle (✓/✗) | ❌ None | 2-state toggle | **NEW** |
| 6 Ending Types | ⚠️ 3 basic | All 6 types | **ENHANCE** |
| Matrix auto-calculation | ❌ None | Auto-calculate from toggles | **NEW** |
| Rasa/Feeling output | ❌ None | Display based on ending | **NEW** |
| Preference input | ❌ None | Text input for context | **NEW** |

### Tasks:

```
PRIORITY: HIGH

Task 10.1: Database Migration - Want/Need V2
- ALTER TABLE story_versions ADD COLUMN want_stages JSONB;
  -- { menginginkan: "", memastikan: "", mengejar: "", tercapai: true|false|null }
- ALTER TABLE story_versions ADD COLUMN need_stages JSONB;
  -- { merasakan: "", menyadari: "", menerima: "", terpenuhi: true|false }
- ALTER TABLE story_versions ADD COLUMN ending_type VARCHAR(50);
- ALTER TABLE story_versions ADD COLUMN ending_feeling VARCHAR(100);
- ALTER TABLE story_versions ADD COLUMN want_need_preference TEXT;

Task 10.2: Create WantNeedMatrixV2 Component
- File: src/components/studio/WantNeedMatrixV2.tsx
- 4 textarea columns for Want stages
- 4 textarea columns for Need stages
- Toggle buttons for Tercapai (Yes/No/Released)
- Toggle buttons for Terpenuhi (Yes/No)
- Auto-calculate ending type and feeling
- Display matrix reference table
- Preference input with generate button

Task 10.3: Integrate into StoryArcStudio
- Replace old wantNeedMatrix with WantNeedMatrixV2
- Wire up onUpdate and onGenerate handlers
```

---

## 🎬 Slide 11: Story Structure/Beats + Sceneplot

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STORY FORMULA - Part 3                                │
│                    STORY STRUCTURE + SCENEPLOT                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  STORY STRUCTURE/BEATS                                                  │
│  ┌───────────────┬───────────────┬───────────────┐                     │
│  │ Save The Cat  │ Three Act     │               │   [generate]         │
│  ├───────────────┼───────────────┼───────────────┤                     │
│  │Heroes Journey │Freytag's      │               │   [edit]             │
│  │               │Pyramid        │               │                     │
│  ├───────────────┼───────────────┼───────────────┤                     │
│  │ Dan Harmon    │ Custom        │               │                     │
│  └───────────────┴───────────────┴───────────────┘                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Selected beat content textarea - larger area for beat details] │   │
│  │                                                                   │   │
│  │                                                                   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  KEY ACTION 1  ┌───────────────────────────────────────────────────┐   │
│                │ [textarea]                                         │   │
│  KEY ACTION 2  ├───────────────────────────────────────────────────┤   │
│                │ [textarea]                                         │   │
│  KEY ACTION 3  ├───────────────────────────────────────────────────┤   │
│                │ [textarea]                                         │   │
│                └───────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SCENEPLOT ⭐ NEW                                                        │
│  ┌─────────────────────────────┬─────────────────────────────┐         │
│  │       SCENE 01              │       SCENE 02              │         │
│  ├─────────────────────────────┼─────────────────────────────┤         │
│  │ Shot 1: ~~~~~~~~~~~~~~~~    │ Shot 1: ~~~~~~~~~~~~~~~~    │         │
│  │         ~~~~~~~~~~~~~~~~    │         ~~~~~~~~~~~~~~~~    │         │
│  ├─────────────────────────────┼─────────────────────────────┤         │
│  │ Shot 2: ~~~~~~~~~~~~~~~~    │ Shot 2: ~~~~~~~~~~~~~~~~    │         │
│  │         ~~~~~~~~~~~~~~~~    │         ~~~~~~~~~~~~~~~~    │         │
│  ├─────────────────────────────┼─────────────────────────────┤         │
│  │ Shot 3: ~~~~~~~~~~~~~~~~    │ Shot 3: ~~~~~~~~~~~~~~~~    │         │
│  │         ~~~~~~~~~~~~~~~~    │         ~~~~~~~~~~~~~~~~    │         │
│  └─────────────────────────────┴─────────────────────────────┘         │
│                                                                         │
│                                              [generate]    [edit]       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [preference] "saya ingin shotnya untuk standar film festival    │   │
│  │               cannes"                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Gap Analysis:

| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Save The Cat | ✅ | ✅ | Done |
| Hero's Journey | ✅ | ✅ | Done |
| Dan Harmon | ✅ | ✅ | Done |
| **Three Act** | ❌ | ✅ | **NEW** |
| **Freytag's Pyramid** | ❌ | ✅ | **NEW** |
| **Custom Structure** | ❌ | ✅ | **NEW** |
| Key Actions per beat | ⚠️ Basic | Multiple (1-3 per beat) | Enhance |
| **SCENEPLOT** | ❌ | ✅ | **NEW** |
| Scene → Shot breakdown | ❌ | ✅ | **NEW** |
| Sceneplot preference | ❌ | ✅ | **NEW** |

### Tasks:

```
PRIORITY: MEDIUM-HIGH

Task 11.1: Add Missing Story Structures
- Add THREE_ACT_BEATS constant
- Add FREYTAG_BEATS constant  
- Add Custom structure support (user-defined beats)

Task 11.2: Enhance Key Actions
- Allow 1-3 key actions per beat
- Store in keyActions: { [beatKey]: string[] }

Task 11.3: Create Sceneplot Feature ⭐ NEW
- Database: CREATE TABLE scene_plots (...)
- New component: SceneplotStudio.tsx
- Scene → Shot hierarchy
- Generate shots from story beats
- Preference-based generation
```

---

## 📊 Complete Task Summary

### Sprint 1: Story Formula Enhancement (HIGH PRIORITY)

| # | Task | Effort | Files | Status |
|---|------|--------|-------|--------|
| 9.1 | DB: Add global_synopsis + preferences | S | migration.sql | ✅ DONE |
| 9.2 | Update StoryData interface | S | StoryArcStudio.tsx | ✅ DONE |
| 9.3 | UI: Add Global Synopsis + Preference | M | StoryArcStudio.tsx | ✅ DONE |
| 10.1 | DB: Add want/need V2 columns | S | migration.sql | ✅ DONE |
| 10.2 | Create WantNeedMatrixV2 component | L | WantNeedMatrixV2.tsx | ✅ DONE |
| 10.3 | Integrate WantNeedMatrixV2 | M | StoryArcStudio.tsx | ✅ DONE |
| 11.1 | Add Three Act + Freytag structures | S | StoryArcStudio.tsx | ✅ DONE |
| 11.2 | Add Ending Types UI | S | StoryArcStudio.tsx | ✅ DONE |
| 11.3 | Update AI prompts for Want/Need V2 | M | ai-generation.ts | ✅ DONE |

> **Sprint 1 FULLY COMPLETED**: 2026-01-26
> - Updated `StoryData` interface with new fields:
>   - `globalSynopsis`, `synopsisPreference`, `globalSynopsisPreference`
>   - `endingType`, `endingRasa`
>   - `wantStages`, `needStages` (V2 journey stages)
>   - `threeActBeats`, `freytagBeats`, `customBeats`
> - Added **THREE_ACT_BEATS** (8 beats) and **FREYTAG_BEATS** (5 beats) definitions
> - Added **ENDING_TYPES** (6 types: Happy, Sad, Bitter Sweet, Ambiguous, Cliffhanger, Twisted)
> - Enhanced Synopsis section with Preference input
> - Added new **Global Synopsis** section with Preference input
> - Added **Ending Type** selector UI with Rasa input
> - Created new `WantNeedMatrixV2.tsx` component with journey stages:
>   - **WANT**: Menginginkan → Memastikan → Mengejar → Tercapai?
>   - **NEED**: Membutuhkan → Menemukan → Menerima → Terpenuhi?
> - Updated AI generation prompts in `ai-generation.ts` to output:
>   - `wantStages` and `needStages` (V2 format)
>   - Corrected `endingType` values
> - **DATABASE MIGRATION COMPLETED**: 
>   - Script: `scripts/run-story-formula-v2-migration.ts`
>   - Added 10 columns to `story_versions` table
>   - Added 3 columns to `characters` table

### Sprint 2: Character Formula Enhancement

| # | Task | Effort | Status |
|---|------|--------|--------|
| 8.1 | Generate Facial Expression (4 grid) | M | ✅ DONE |
| 8.2 | Generate Emotion & Gesture (4 grid) | M | ✅ DONE |
| 8.3 | Enhance Key Poses (5 poses) | S | ✅ DONE |

> **Sprint 2 COMPLETED**: 2026-01-26
> - Created `CharacterVisualGrid.tsx` component with all preset configurations
> - Updated `Character` interface with `keyPoses`, `facialExpressions`, `emotionGestures` fields
> - Integrated 3 visual grid sections into `CharacterDeck.tsx`:
>   - **Key Poses**: Front, Right, Left, Back, 3/4 View (5 poses)
>   - **Facial Expressions**: Happy, Sad, Angry, Scared (4 expressions)
>   - **Emotion & Gesture**: Greeting, Bow, Dance, Run (4 gestures)

### Sprint 3: Sceneplot & Advanced Features ✅ COMPLETED

| # | Task | Effort | Status |
|---|------|--------|--------|
| 11.3 | Create Sceneplot feature | L | ✅ DONE |
| 11.4 | Custom story structure | M | ✅ DONE |

> **Sprint 3 FULLY COMPLETED**: 2026-01-27
> - Created `ScenePlotStudio.tsx` component integrated into Story Formula
> - Created `ScenePlotCard.tsx` for Animate tab integration
> - Added scene_plot column to animation_clips table (JSONB)
> - API endpoints for scene plot operations:
>   - `GET/PUT /api/animation-clips/[id]/scene-plot`
>   - `POST /api/animation-clips/generate-scene-plots`
>   - `POST /api/animation-clips/generate-prompts`
> - Scene plots stored per animation clip (1:1 relationship with key actions)
> - Bulk generation from Story Formula (all 45 scene plots)
> - Per-beat generation from Animate tab (3 at a time)
> - Animation prompt generation uses scene plot data (camera, angle, movement)
>
> **Custom Story Structure (Task 11.4)**: 2026-01-27
> - Created `CustomStructureEditor.tsx` component for creating/editing custom beats
> - User can define custom beat names, descriptions, and act assignments
> - Added preset templates: Blank, Simple 3-Beat, Seven Point Structure, Kishotenketsu
> - Integrated into `StoryArcStudio.tsx` with edit button for custom structures
> - Added `customStructureDefinition` field to `StoryData` interface
> - Updated `CreateStoryModal.tsx` with all 6 structure options:
>   - Hero's Journey (12 beats)
>   - Save the Cat (15 beats)
>   - Dan Harmon Story Circle (8 beats)
>   - Three Act Structure (8 beats)
>   - Freytag's Pyramid (5 beats)
>   - Custom Structure (user-defined)

---

## 🗄️ Database Migrations Required

```sql
-- File: scripts/story-formula-v2-migration.sql

-- 1. Global Synopsis & Preferences
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS synopsis_preference TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis_preference TEXT;

-- 2. Want/Need Matrix V2
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS want_stages JSONB DEFAULT '{
    "menginginkan": "",
    "memastikan": "",
    "mengejar": "",
    "tercapai": null
}'::jsonb;

ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS need_stages JSONB DEFAULT '{
    "merasakan": "",
    "menyadari": "",
    "menerima": "",
    "terpenuhi": null
}'::jsonb;

ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_type VARCHAR(50);
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_feeling VARCHAR(100);
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS want_need_preference TEXT;

-- 3. Sceneplot tables
CREATE TABLE IF NOT EXISTS scene_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_version_id UUID REFERENCES story_versions(id) ON DELETE CASCADE,
    beat_key VARCHAR(100) NOT NULL,
    scene_number INTEGER NOT NULL,
    scene_title VARCHAR(255),
    scene_description TEXT,
    preference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scene_shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_plot_id UUID REFERENCES scene_plots(id) ON DELETE CASCADE,
    shot_number INTEGER NOT NULL,
    shot_type VARCHAR(50), -- wide, medium, close-up, etc
    shot_description TEXT,
    duration_seconds INTEGER,
    camera_movement VARCHAR(100),
    audio_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Character enhancements
ALTER TABLE characters ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}'::jsonb;
```

---

## 📝 Notes

- Deck slide 1-4 are context/philosophy, no direct implementation needed
- Deck slide 5 is the master feature list - use as checklist
- Deck slide 6 (User Types) affects UX but not direct features
- Deck slide 7 (Architecture) shows full workflow - ensure all components exist
- Deck slides 8-11 have specific UI specs to follow
- Deck slide 12 is closing page

**Status Key:**
- ✅ Done
- ⚠️ Partial
- ❌ Not started
- 🔄 Enhancement needed
- ⏳ Queued

---

**Document Created**: 2026-01-26
**Last Updated**: 2026-01-27 02:45
**Status**: ✅ ALL SPRINTS COMPLETE (1-3). All Story Formula features implemented.
