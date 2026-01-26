# MODO Creator Verse - User Guide

> **Complete Documentation for IP Development Platform**  
> Last Updated: 2026-01-27

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Application Flow](#application-flow)
3. [Character Formula](#character-formula)
4. [Story Formula](#story-formula)
5. [Story Structures](#story-structures)
6. [Moodboard](#moodboard)
7. [Animation Studio](#animation-studio)
8. [IP Bible](#ip-bible)
9. [Versioning System](#versioning-system)
10. [AI Generation Features](#ai-generation-features)
11. [Custom Story Structure](#custom-story-structure)

---

## Overview

**MODO Creator Verse** adalah platform pengembangan IP (Intellectual Property) berbasis AI yang membantu kreator mengembangkan karakter, cerita, dan konten visual secara terstruktur.

### Fitur Utama:
- 🎭 **Character Formula** - Pembuatan dan pengembangan karakter
- 📖 **Story Formula** - Struktur cerita dengan berbagai framework
- 🎨 **Moodboard** - Visual development untuk setiap beat
- 🎬 **Animation Studio** - Pembuatan clip animasi
- 📚 **IP Bible** - Dokumentasi lengkap IP

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CREATE PROJECT                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CHARACTER FORMULA                            │
│  • Create characters with detailed profiles                      │
│  • Assign roles (Protagonist, Antagonist, etc.)                 │
│  • Generate character images                                     │
│  • Create character versions                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       STORY FORMULA                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Story       │  │ Multiple    │  │ Custom      │              │
│  │ Versions    │──│ Structures  │──│ Structure   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────┐                │
│  │                                              │                │
│  │  Views:                                      │                │
│  │  • Arc View (Tension Graph)                  │                │
│  │  • Beats View (Beat-by-beat editing)         │                │
│  │  • Key Actions View                          │                │
│  │  • Sceneplot View (Shot planning)            │                │
│  │                                              │                │
│  └──────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MOODBOARD                                │
│  • Create moodboard versions                                     │
│  • Key Actions per beat (3 actions × N beats)                   │
│  • Generate visual prompts                                       │
│  • Generate moodboard images                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ANIMATION STUDIO                            │
│  • Create animation versions                                     │
│  • Sceneplot per key action                                      │
│  • Generate animation prompts                                    │
│  • Generate animation clips                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          IP BIBLE                                │
│  • Compile all assets                                            │
│  • Export documentation                                          │
│  • Share with team                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Character Formula

### Membuat Karakter

1. **Buka tab "Character Formula"**
2. **Klik "+ New Character"**
3. **Isi detail karakter:**

#### Core Information
| Field | Description |
|-------|-------------|
| Name | Nama lengkap karakter |
| Role | Protagonist, Antagonist, Sidekick, Mentor, Love Interest, Comic Relief, Supporting, Extra |
| Age Group | Child, Teen, Young Adult, Adult, Middle-aged, Elderly |
| Gender | Male, Female, Non-binary |

#### Physical Attributes
| Field | Options |
|-------|---------|
| Ethnicity | Asian-East, Asian-Southeast, Asian-South, Middle-Eastern, African, Caucasian, Latino, Mixed, Fantasy |
| Skin Tone | Very Fair → Dark |
| Face Shape | Oval, Round, Square, Heart, Oblong, Diamond |
| Hair Style | 20+ options |
| Body Type | Slim, Athletic, Average, Muscular, Curvy, Plus-size |

#### Psychological Profile
| Field | Description |
|-------|-------------|
| Personality Type | MBTI (16 types) |
| Archetype | Hero, Mentor, Shadow, Trickster, etc. |
| Fears | Ketakutan terbesar |
| Wants | Keinginan eksternal |
| Needs | Kebutuhan internal |
| Strength/Weakness | SWOT analysis |

### Character Versions

Setiap karakter dapat memiliki multiple versions dengan:
- **Base Character** - Definisi karakter utama
- **Character Versions** - Variasi visual (kostum, pose, expresi)
- **Character Images** - Generated images per version

---

## Story Formula

### Membuat Story/Episode

1. **Klik "+ New Story" di Story Formula**
2. **Pilih Story Structure** (tidak bisa diubah setelah dibuat)
3. **Pilih Characters** yang akan digunakan
4. **Pilih Story Theme** (optional)

### Views dalam Story Formula

#### 1. Arc View (Tension Graph)
- Visualisasi tension level per beat
- Drag untuk adjust tension
- Warna menunjukkan act (Act 1: Blue, Act 2: Orange, Act 3: Green)

#### 2. Beats View
- Edit content per beat
- AI Generate per beat
- Character assignment per beat
- Tension level slider

#### 3. Key Actions View
- 3 key actions per beat
- Description dan characters involved
- Link ke moodboard

#### 4. Sceneplot View
- Shot-by-shot planning
- Camera angles dan movement
- Scene breakdown per beat

---

## Story Structures

### 6 Struktur yang Didukung

| Structure | Beats | Description |
|-----------|-------|-------------|
| **Save the Cat** | 15 | Framework Hollywood populer by Blake Snyder |
| **Hero's Journey** | 12 | Monomyth by Joseph Campbell |
| **Dan Harmon** | 8 | Story Circle - simplified structure |
| **Three Act** | 8 | Klasik Setup-Confrontation-Resolution |
| **Freytag's Pyramid** | 5 | Dramatis klasik untuk tragedy |
| **Custom** | User-defined | Buat struktur sendiri |

### Detail Beat per Structure

#### Save the Cat (15 Beats)
```
ACT 1 (Setup):
1. Opening Image - Snapshot dunia hero sebelum petualangan
2. Theme Stated - Tema cerita dinyatakan
3. Set-up - Expand dunia "sebelum"
4. Catalyst - Event yang mengubah segalanya
5. Debate - Hero menolak panggilan

ACT 2 (Confrontation):
6. Break into 2 - Hero masuk dunia baru
7. B Story - Subplot (biasanya love story)
8. Fun and Games - Promise of the premise
9. Midpoint - False victory/defeat
10. Bad Guys Close In - Stakes naik
11. All is Lost - Rock bottom
12. Dark Night of the Soul - Refleksi

ACT 3 (Resolution):
13. Break into 3 - Solusi ditemukan
14. Finale - Showdown final
15. Final Image - Perubahan terjadi
```

#### Hero's Journey (12 Beats)
```
ACT 1:
1. Ordinary World - Kehidupan normal hero
2. Call to Adventure - Tantangan muncul
3. Refusal of Call - Hero ragu
4. Meeting the Mentor - Bertemu pembimbing

ACT 2:
5. Crossing Threshold - Commit ke petualangan
6. Tests, Allies, Enemies - Tantangan & teman
7. Approach to Inmost Cave - Persiapan bahaya utama
8. The Ordeal - Krisis utama
9. Reward - Mendapat sesuatu

ACT 3:
10. The Road Back - Kembali pulang
11. Resurrection - Transformasi final
12. Return with Elixir - Pulang dengan wisdom
```

#### Three Act Structure (8 Beats)
```
ACT 1 (Setup):
1. Setup - Introduce world & characters
2. Inciting Incident - Story dimulai
3. Plot Point 1 - Turning point ke Act 2

ACT 2 (Confrontation):
4. Rising Action - Konflik escalate
5. Midpoint - Major revelation
6. Plot Point 2 - Crisis point ke Act 3

ACT 3 (Resolution):
7. Climax - Highest tension
8. Resolution - Loose ends tied up
```

#### Freytag's Pyramid (5 Beats)
```
1. Exposition - Background & characters introduced
2. Rising Action - Events build toward climax
3. Climax - Turning point, highest intensity
4. Falling Action - Events after climax
5. Denouement - Final resolution
```

---

## Custom Story Structure

### Membuat Custom Structure

1. **Pilih "Custom Structure" saat create story**
2. **Klik tombol ⚙️ (Settings) di toolbar**
3. **Define beats:**
   - **Label** - Nama beat
   - **Description** - Penjelasan beat
   - **Act** - 1, 2, atau 3
4. **Gunakan preset templates:**
   - Blank (mulai dari kosong)
   - Simple 3-Beat
   - Seven Point Structure
   - Kishotenketsu (Japanese)

### Fitur Custom Structure Editor
- ➕ Add beats
- 🗑️ Remove beats (minimum 1)
- ⬆️⬇️ Reorder beats
- 📝 Edit label, description, act
- 💾 Save structure

---

## Moodboard

### Flow Moodboard

```
Story → Create Moodboard Version → Key Actions → Generate Prompts → Generate Images
```

### Moodboard Version
- Setiap story bisa punya multiple moodboard versions
- Pilih art style (Cinematic, Anime, Painterly, etc.)

### Key Actions
- 3 key actions per beat
- Total: 3 × jumlah_beats (e.g., 45 untuk 15-beat structure)
- Setiap action punya:
  - Description
  - Characters involved
  - Generated prompt
  - Generated image

---

## Animation Studio

### Flow Animation

```
Moodboard → Create Animation Version → Sceneplot → Animation Prompts → Animation Clips
```

### Animation Version
- Based on moodboard version
- Contains animation clips per key action

### Sceneplot
Breakdown shot-by-shot untuk setiap key action:

```json
{
  "scenes": [
    {
      "sceneTitle": "Scene title",
      "sceneLocation": "INT/EXT - Location",
      "shots": [
        {
          "shotType": "establishing|wide|medium|close-up|etc",
          "shotAngle": "eye-level|high|low|dutch|birds-eye",
          "cameraMovement": "static|pan|dolly|tracking|etc",
          "durationSeconds": 3,
          "shotDescription": "Visual description"
        }
      ]
    }
  ]
}
```

### Shot Types Available
| Type | Description |
|------|-------------|
| establishing | Wide view to set location |
| wide | Full scene with environment |
| full | Full body of subject |
| medium | Waist up |
| medium-close | Chest up |
| close-up | Face or detail |
| extreme-close-up | Part of face |
| over-shoulder | From behind character |
| two-shot | Two characters |
| group | Multiple characters |
| pov | Point of view |
| insert | Detail or reaction |

---

## IP Bible

### Contents
IP Bible mengkompilasi semua elemen IP:

1. **Project Overview**
   - Title, Genre, Format
   - Logline, Synopsis
   - Target Audience

2. **Characters**
   - All character profiles
   - Visual references
   - Character relationships

3. **Story Structure**
   - Beat sheet lengkap
   - Want/Need Matrix
   - Ending type & Rasa

4. **Universe/World**
   - Setting details
   - Time period
   - Social structure
   - Environment

5. **Visual Development**
   - Moodboard images
   - Art style guide
   - Color palette

6. **Animation Assets**
   - Scene plots
   - Animation clips
   - Shot breakdowns

---

## Versioning System

### Hierarchy Versioning

```
PROJECT
├── Characters
│   ├── Character 1
│   │   ├── Base Profile
│   │   └── Character Versions (visual variants)
│   └── Character 2
│       └── ...
│
├── Story Versions (Episodes)
│   ├── Story 1 (e.g., Episode 1)
│   │   ├── Structure: Save the Cat
│   │   ├── Beats: 15 beats with content
│   │   └── Want/Need Matrix
│   └── Story 2 (e.g., Episode 2)
│       └── ...
│
├── Moodboard Versions
│   ├── Moodboard V1 (linked to Story 1)
│   │   ├── Art Style: Cinematic
│   │   └── Key Actions: 45 actions with images
│   └── Moodboard V2
│       └── ...
│
└── Animation Versions
    ├── Animation V1 (linked to Moodboard V1)
    │   ├── Scene Plots
    │   └── Animation Clips
    └── Animation V2
        └── ...
```

### Version Dependencies

```
Story Version ──┬──> Moodboard Version ──> Animation Version
                │
                └──> Story Version 2 ──> Moodboard Version 2 ──> ...
```

---

## AI Generation Features

### Generation Types & Credit Costs

| Type | Credits | Description |
|------|---------|-------------|
| Premise | 2 | Generate logline from project |
| Synopsis | 3 | Generate full synopsis |
| Story Structure | 10 | Generate all beats + Want/Need |
| Character Profile | 8 | Generate character details |
| Character Image | 12 | Generate character visual |
| Moodboard Prompt | 3 | Generate image prompt |
| Moodboard Image | 12 | Generate moodboard visual |
| Animation Prompt | 10 | Generate all animation prompts |
| Animation Preview | 50 | Generate animation clip |
| Sceneplot | 5 | Generate scene/shot breakdown |

### AI Providers Supported

| Type | Providers |
|------|-----------|
| Text | OpenAI (GPT-4o), Google (Gemini), Anthropic (Claude) |
| Image | OpenAI (DALL-E 3), FAL.ai (Flux), Replicate |
| Video | FAL.ai (Kling) |

### System Prompts

Setiap generation type memiliki system prompt khusus:

- **Synopsis**: Generates premise, synopsis, genre, tone, theme, conflict, want/need stages
- **Story Structure**: Generates beats sesuai struktur yang dipilih + Want/Need Matrix V2
- **Moodboard Prompts**: Generates visual prompts untuk setiap beat
- **Animation Prompts**: Generates animation prompts dengan camera movement

---

## Recent Updates (2026-01-27)

### Custom Story Structure Feature

**Files Modified:**
1. ✅ `CustomStructureEditor.tsx` - New component for creating/editing custom beats
2. ✅ `StoryArcStudio.tsx` - Integrated custom structure support
3. ✅ `CreateStoryModal.tsx` - Added 3 new structure options
4. ✅ `EditStoryModal.tsx` - Updated display names
5. ✅ `/api/ai/generate-story-all/route.ts` - Support for 6 structures
6. ✅ `/api/ai/generate-structure/route.ts` - Extended valid structures
7. ✅ `/lib/ai/prompts.ts` - Added threeAct, freytag, custom prompts
8. ✅ `/lib/ai-generation.ts` - Dynamic moodboard & animation prompts

**New Structure Support:**
- Three Act Structure (8 beats)
- Freytag's Pyramid (5 beats)
- Custom Structure (user-defined)

**Custom Structure Features:**
- Define custom beats with labels, descriptions, acts
- Preset templates (Blank, Simple 3-Beat, Seven Point, Kishotenketsu)
- Reorder beats with up/down buttons
- Validation before save

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save current work |
| `Ctrl + G` | Generate with AI |
| `Esc` | Close modal |

---

## Troubleshooting

### Common Issues

**Q: Story structure cannot be changed**
> A: Structure is locked at creation. Create a new story to use different structure.

**Q: Moodboard not showing key actions**
> A: Complete beat content first in Story Formula, then create moodboard.

**Q: Animation version not available**
> A: Create moodboard version first with key actions populated.

**Q: AI generation failed**
> A: Check credit balance. Some generations require more credits.

---

## Contact & Support

For technical support or feature requests, please contact the development team.

---

*Document Version: 1.0*  
*Last Updated: 2026-01-27 04:50 WIB*
