# 📋 REVISION PLAN - Ecosystem IP AI

**Created:** 2026-02-01  
**Last Updated:** 2026-02-01  
**Status:** Planning Phase

---

## 📑 Table of Contents

1. [IP Project Tab](#-tab-1-ip-project)
2. [Story Formula Tab](#-tab-2-story-formula)
3. [Character Tab](#-tab-3-character)
4. [Universe Formula Tab](#-tab-4-universe-formula)
5. [Moodboard Tab](#-tab-5-moodboard)
6. [Storyboard Tab (formerly Animate)](#-tab-6-storyboard-formerly-animate)
7. [IP Bible Tab](#-tab-7-ip-bible)
8. [General / Cross-Cutting](#%EF%B8%8F-general--cross-cutting)
9. [Priority Matrix](#-priority-matrix)
10. [New Files to Create](#-new-files-to-create)

---

## 🏠 TAB 1: IP PROJECT

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 14 | Story Structure Selection | Pindahkan pemilihan story structure dari Story Formula ke IP Project. User pilih sekali saat create project | Medium | ⬜ Todo |
| 27 | Lock Story Structure | Story structure tidak bisa di-edit setelah dipilih. Kalau mau beda, create new project | Low | ⬜ Todo |
| 24a | Remove Visual Identity | Hapus section Visual Identity dari IP Project | Low | ⬜ Todo |
| 24b | Add Content Type & Duration | Tambah field: Type of Content (Film/Series/Short), Duration setting | Medium | ⬜ Todo |
| 24c | Add Genre/Theme/Tone | Pindahkan Genre, Sub-Genre, Theme, Tone, Core Conflict dari Story Formula ke IP Project dengan dropdown choices | Medium | ⬜ Todo |
| 24d | Invite User to Comment | Add fitur invite user lain untuk comment (bukan edit) + notification system | High | ⬜ Todo |
| 33 | Episode Management | IP Project menentukan jumlah episode (1-13). Lebih dari 13 = new season, new project | Medium | ⬜ Todo |
| 28 | Cover Generator | Add cover generator dengan text2image dan image2image support | High | ⬜ Todo |
| 29 | Teaser Generator | Ubah "Edit-Mix" menjadi "Teaser Generator" | Medium | ⬜ Todo |

### Files to Modify

```
src/app/(dashboard)/projects/[id]/page.tsx
src/components/studio/CreateStoryModal.tsx
src/components/studio/EditStoryModal.tsx
src/app/api/creator/projects/route.ts
src/app/api/creator/projects/[id]/route.ts
```

### Notes

- Story structure options: Save the Cat, Hero's Journey, Dan Harmon Story Circle
- Episode limit: 1-13 per project/season
- Content Types: Feature Film, Short Film, Series (Episodic), Series (Serial), Limited Series, Web Series, Anime, Documentary

---

## 📖 TAB 2: STORY FORMULA

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 3 | Rename Arc to Intention | Change label "Arc" menjadi "Intention" di UI | Low | ⬜ Todo |
| 4a | Dramatic Equalizer | Tambah 3-step equalizer untuk adjust dramatic intensity (1-3 level, bukan 0-100) | High | ⬜ Todo |
| 4b | Re-generate on Equalizer Change | Saat equalizer berubah, otomatis regenerate beat & key action | High | ⬜ Todo |
| 5 | Remove Ending Type Selector | Hapus emotion selector untuk ending type | Low | ⬜ Todo |
| 8 | Merge Key Action into Beat | Key action view dimasukkan ke dalam beat section (jadi 1 view) | Medium | ⬜ Todo |
| 9a | Key Action Edit in Story | Di Story Formula: bisa view DAN edit key action | Medium | ⬜ Todo |
| 9b | Key Action Generate in Story | Generate key action hanya dari Story Formula | Medium | ⬜ Todo |
| 10 | Scene Plot Generate in Story | Scene plot hanya bisa di-generate dari Story Formula | Medium | ⬜ Todo |
| 11 | Story Idea Section | Tambah section "Story Idea" sebagai starting point | Medium | ⬜ Todo |
| 15 | Pipeline Flow | Implement: Idea → Beat → Scene Plot → Script → Shot List | High | ⬜ Todo |
| 17a | Key Action = Focus Character | Key action fokus pada character dalam scene | Low | ⬜ Todo |
| 17b | Scene Plot = Complete | Scene plot lengkap, 1 scene = 1 page (setting dari IP Project) | Medium | ⬜ Todo |
| 17c | Script = 1 page = 1 minute | Script berdasarkan durasi, 60-105 pages for feature film | High | ⬜ Todo |
| 18 | Equalizer → Script Draft | Perubahan beat via equalizer creates new script draft | High | ⬜ Todo |
| 19 | Script Page Management | Support script sampai 60-105 pages (1 page = 1 minute standard) | Medium | ⬜ Todo |
| 25 | Script Doctoring | Add analyze/doctoring feature untuk script | High | ⬜ Todo |

### Files to Modify

```
src/components/studio/StoryFormula.tsx
src/components/studio/StoryBeatsEditor.tsx
src/components/studio/ScenePlotGenerator.tsx (NEW)
src/components/studio/ScriptEditor.tsx (NEW)
src/components/studio/DramaticEqualizer.tsx (NEW)
src/components/studio/StoryIdeaSection.tsx (NEW)
src/components/studio/ShotListGenerator.tsx (NEW)
```

### Pipeline Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Story Idea │ →  │    Beats    │ →  │ Scene Plot  │ →  │   Script    │ →  │  Shot List  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          ↑
                   ┌──────┴──────┐
                   │  Dramatic   │
                   │  Equalizer  │
                   │   (1-3)     │
                   └─────────────┘
```

### Dramatic Equalizer Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Low Intensity | Subtle conflict, slow burn |
| 2 | Medium Intensity | Balanced drama |
| 3 | High Intensity | Maximum tension, high stakes |

---

## 👤 TAB 3: CHARACTER

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 1 | Fix Character Image Generation | Fix image generation error (ERR_CONNECTION_CLOSED) | Medium | ✅ Done |
| 21 | Dropdown UI for Character Details | Semua info character pakai dropdown choice standar. Hasil generate muncul sebagai selected option | High | ⬜ Todo |
| 22 | 12 Archetype Options | Implement 12 archetype pilihan dari IP Formula | Medium | ⬜ Todo |
| 23 | Generate Character Button | Saat klik "New Character", modal harus ada tombol "Generate Character" | Low | ⬜ Todo |

### Files to Modify

```
src/components/studio/CharacterEditor.tsx
src/components/studio/CharacterForm.tsx
src/components/studio/CharacterCard.tsx
src/components/studio/GenerateCharacterImageModalV2.tsx
src/lib/archetype-data.ts (NEW)
```

### 12 Archetypes (IP Formula)

1. **Hero** - Protagonist yang mengejar tujuan
2. **Mentor** - Pembimbing/guru bagi hero
3. **Threshold Guardian** - Penghalang yang menguji hero
4. **Herald** - Pembawa kabar/catalyst perubahan
5. **Shapeshifter** - Karakter yang loyalitasnya unclear
6. **Shadow** - Antagonist/dark reflection of hero
7. **Trickster** - Comic relief/chaos agent
8. **Ally** - Pendukung setia hero
9. **Mother Figure** - Nurturing/protective presence
10. **Father Figure** - Authority/discipline presence
11. **Child/Innocent** - Pure, naive character
12. **Ruler** - Leader, authority figure

### Character Dropdown Fields (Standardized)

```typescript
// Gender
const GENDERS = ['male', 'female', 'non_binary', 'other'];

// Body Type
const BODY_TYPES = ['slim', 'athletic', 'average', 'muscular', 'curvy', 'plus_size'];

// Height
const HEIGHTS = ['short', 'below_average', 'average', 'above_average', 'tall', 'very_tall'];

// Skin Tone
const SKIN_TONES = ['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark', 'ebony'];

// Hair Style
const HAIR_STYLES = ['bald', 'buzz_cut', 'short', 'medium', 'long', 'very_long', 'braided', 'dreadlocks', 'afro', 'ponytail', 'bun'];

// Eye Color
const EYE_COLORS = ['brown', 'dark_brown', 'black', 'hazel', 'green', 'blue', 'gray', 'amber'];

// MBTI Types
const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
```

---

## 🌍 TAB 4: UNIVERSE FORMULA

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 26 | Director/Producer Treatment | Add preferensi/treatment field. Comment feature untuk invited users (director/producer/penulis lain) - view & comment only | High | ⬜ Todo |
| 35 | Universe Image Generator | Add image generator di Universe Formula. Images juga tampil di IP Bible | High | ⬜ Todo |

### Files to Modify

```
src/components/studio/UniverseFormula.tsx
src/components/studio/UniverseImageGenerator.tsx (NEW)
src/components/studio/TreatmentComments.tsx (NEW)
src/app/api/creator/projects/[id]/universe/images/route.ts (NEW)
```

### Treatment/Comment System

```typescript
interface Treatment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: 'director' | 'producer' | 'writer' | 'other';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎨 TAB 5: MOODBOARD

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 2 | Fix Key Action View Design | Perbaiki tampilan/design key action view | Medium | ⬜ Todo |
| 9c | Moodboard = View Only | Di Moodboard: key action hanya bisa VIEW, tidak bisa generate | Medium | ⬜ Todo |
| 30a | Moodboard = Per Key Action | Moodboard images organized per key action | Low | ⬜ Todo |

### Files to Modify

```
src/components/studio/MoodboardStudioV2.tsx
src/components/studio/KeyActionView.tsx
```

### Key Differences: Moodboard vs Storyboard

| Aspect | Moodboard | Storyboard |
|--------|-----------|------------|
| Organized by | Key Action | Shot List |
| Content | Images | Images + Optional Animation |
| Quantity | Fewer (per key action) | More (per shot) |
| Purpose | Visual mood reference | Production planning |
| Cost | Standard | Premium (animation optional) |

---

## 🎬 TAB 6: STORYBOARD (formerly Animate)

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 30b | Rename Animate to Storyboard | Change nama "Animate" menjadi "Storyboard" di seluruh app | Medium | ⬜ Todo |
| 30c | Storyboard = Per Shot List | Storyboard organized per shot list (lebih banyak dari moodboard) | High | ⬜ Todo |
| 30d | Optional Animation | Animation opsional, cherry pick per shot list (mahal) | Medium | ⬜ Todo |
| 7 | Fix Scene Plot View | Fix tampilan scene plot di Storyboard | Medium | ⬜ Todo |
| 10b | Storyboard = View Only | Scene plot di Storyboard hanya VIEW, tidak bisa generate | Medium | ⬜ Todo |

### Files to Modify

```
src/components/studio/AnimationStudioV2.tsx → StoryboardStudio.tsx (RENAME)
src/components/studio/ClipDetailModal.tsx
src/app/(dashboard)/projects/[id]/page.tsx (navigation update)
```

### Storyboard Structure

```typescript
interface StoryboardShot {
  id: string;
  shotNumber: number;
  sceneNumber: number;
  beatKey: string;
  description: string;
  cameraAngle: string;
  cameraMovement: string;
  imageUrl?: string;
  animationUrl?: string; // Optional, premium feature
  duration: number;
  notes: string;
}
```

---

## 📚 TAB 7: IP BIBLE

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 20 | Remove Animate from IP Bible | Hapus section Animate dari IP Bible | Low | ⬜ Todo |
| 31 | Remove Animate Dropdown | Hapus dropdown Animate dari IP Bible | Low | ⬜ Todo |
| 35b | Show Universe Images | Tampilkan images dari Universe Formula di IP Bible | Medium | ⬜ Todo |

### Files to Modify

```
src/components/studio/IPBibleStudio.tsx
src/components/bible/BibleSection.tsx
```

---

## ⚙️ GENERAL / CROSS-CUTTING

### Changes Required

| # | Task | Description | Complexity | Status |
|---|------|-------------|------------|--------|
| 12a | Sharing: Edit Only | Shared users hanya bisa edit, tidak bisa delete | Medium | ⬜ Todo |
| 12b | Modified By | Tampilkan "Modified by [username]" pada perubahan | Medium | ⬜ Todo |
| 12c | Creator Only Generate | Hanya creator yang bisa generate, user lain hanya comment | Medium | ⬜ Todo |
| 13 | Show/Hide Sidebar | Tambah button untuk show/hide sidebar | Low | ⬜ Todo |
| 16 | PDF Export (1 Credit) | Export PDF A4 untuk: Idea, Beat, Scene Plot, Script, Shot List. 1 credit per successful download | High | ⬜ Todo |
| 32 | Warning on Generate | Tampilkan warning setiap kali user akan generate (credit usage) | Low | ⬜ Todo |
| 34 | New Season Character Import | New season bisa import existing characters dari project sebelumnya | Medium | ⬜ Todo |

### Files to Modify

```
src/components/layout/Sidebar.tsx
src/components/layout/ProjectLayout.tsx
src/components/common/ShareProjectModal.tsx
src/components/common/GenerateWarningModal.tsx (NEW)
src/lib/pdf-export.ts (NEW)
src/app/api/export/pdf/route.ts (NEW)
```

### PDF Export Items

| Document | Pages | Credit Cost |
|----------|-------|-------------|
| Story Idea | 1-2 | 1 credit |
| Beat Sheet | 3-5 | 1 credit |
| Scene Plot | Variable | 1 credit |
| Script | 60-105 | 1 credit |
| Shot List | Variable | 1 credit |

### Permission Matrix

| Action | Creator | Shared User (Edit) | Shared User (Comment) |
|--------|---------|--------------------|-----------------------|
| View | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Generate (AI) | ✅ | ❌ | ❌ |
| Comment | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ✅ |

---

## 📊 PRIORITY MATRIX

### Phase 1: Critical (Week 1-2)

- [x] Fix Character Image Generation (DONE)
- [ ] IP Project restructure (14, 24, 27)
- [ ] Story Structure lock + move to IP Project
- [ ] Remove Visual Identity
- [ ] Dramatic Equalizer basic implementation

### Phase 2: High Priority (Week 3-4)

- [ ] Rename Animate → Storyboard
- [ ] Merge Key Action into Beat view
- [ ] Pipeline: Idea → Beat → Scene Plot → Script → Shot List
- [ ] Character dropdown UI standardization
- [ ] Sharing/collaboration restrictions

### Phase 3: Medium Priority (Week 5-6)

- [ ] Universe Image Generator
- [ ] Cover Generator
- [ ] Teaser Generator
- [ ] PDF Export system
- [ ] Show/hide sidebar

### Phase 4: Enhancement (Week 7-8)

- [ ] Script Doctoring
- [ ] Episode Management
- [ ] Comment system for invited users
- [ ] Credit warning system
- [ ] Polish & bug fixes

---

## 📁 NEW FILES TO CREATE

### Components

```
src/components/studio/
├── DramaticEqualizer.tsx          # 3-step intensity equalizer
├── ScenePlotGenerator.tsx         # Scene plot generation  
├── ScriptEditor.tsx               # Full script editor
├── ShotListGenerator.tsx          # Shot list from script
├── StoryboardStudio.tsx           # Renamed from AnimationStudioV2
├── UniverseImageGenerator.tsx     # Image gen for universe
├── CoverGenerator.tsx             # Cover image generator
├── TeaserGenerator.tsx            # Teaser video generator
├── StoryIdeaSection.tsx           # Story idea starting point
├── PDFExportButton.tsx            # PDF export with credit
├── GenerateWarningModal.tsx       # Warning before generate
└── TreatmentComments.tsx          # Director/producer comments
```

### Libraries

```
src/lib/
├── pdf-export.ts                  # PDF generation logic
├── archetype-data.ts              # 12 archetype definitions
└── character-options.ts           # Standardized dropdown options
```

### API Routes

```
src/app/api/
├── export/
│   └── pdf/
│       └── route.ts              # PDF export endpoint
├── creator/projects/[id]/
│   ├── universe/
│   │   └── images/
│   │       └── route.ts          # Universe images
│   ├── treatments/
│   │   └── route.ts              # Treatment comments
│   └── storyboard/
│       └── route.ts              # Storyboard data
```

---

## 📝 CHANGELOG

### 2026-02-01
- Initial revision plan created
- 35 items documented and organized by tab
- Priority matrix defined
- File structure planned

---

## 🔗 RELATED DOCUMENTS

- [Database Schema](./database-schema.md)
- [API Documentation](./api-docs.md)
- [UI/UX Guidelines](./ui-guidelines.md)
