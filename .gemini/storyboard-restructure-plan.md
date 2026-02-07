# Storyboard Restructure Implementation Plan

## Overview

Restructure the Animate/Storyboard system to be a comprehensive pre-production pipeline:
- Scene Plot generation from Story Formula
- Shot List per scene (multiple shots per scene)
- Storyboard image generation using I2I with character & universe references
- Script generation from Scene Plot & Shot List

## Current vs New Architecture

### Current Architecture (Animate Tab)
```
📁 Animate Tab
├── Moodboard-based prompts
├── Video generation from moodboard
└── Views: Clips | Sequential | Storyboard (minimal)
```

### New Architecture

```
📁 Story Formula Tab (GENERATION & EDITING HUB)
├── [Existing] Premise, Synopsis
├── [Existing] Story Structure (Beats/Key Actions)
│
├── 🆕 Scene Plot View [EDITABLE]
│   ├── Scene Grid with all scenes
│   ├── Generate Scene Distribution button
│   ├── Generate All Scene Plots button
│   ├── Each scene editable inline or via modal
│   └── Characters & Location auto-linked
│
├── 🆕 Shot List View [EDITABLE]
│   ├── Scene selector (dropdown/tabs)
│   ├── Shot table per scene
│   ├── Generate Shots button per scene
│   ├── Add/Edit/Delete shots manually
│   └── Camera settings, durations, blocking
│
└── 🆕 Script View [EDITABLE]
    ├── Scene selector
    ├── Screenplay format editor
    ├── Generate Script button per scene/batch
    └── Word count, dialogue count stats

📁 Storyboard Tab [READ-ONLY VISUAL]
├── � Storyboard View [DEFAULT]
│   ├── Scene Grid (visual cards)
│   ├── Each card shows: thumbnail, title, shot count
│   ├── Click → View-only detail modal
│   └── Generate Image buttons (triggers I2I)
│
├── 🎞️ Sequential View
│   └── Horizontal timeline of all storyboard images
│
└── 🎥 Clips View (future)
    └── Animation/video generation from storyboard
```

### UX Flow Summary
```
User Journey:

1. Story Formula → Create synopsis + story beats
                                ↓
2. Story Formula → Scene Plot View → [Generate Distribution] → [Generate All Plots]
                                ↓ (auto or manual)
3. Story Formula → Shot List View → [Generate Shots] per scene
                                ↓ (auto or manual)
4. Story Formula → Script View → [Generate Script] per scene/batch
                                ↓
5. Storyboard Tab → View visual storyboard (read-only)
                  → [Generate Images] for each scene (I2I)
                  → Sequential View for review
                                ↓
6. Future: Storyboard Tab → Clips View → Generate animations
```

---

## Database Schema Changes

### New Table: `scene_plots`
```sql
CREATE TABLE scene_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    
    -- Scene Identity
    scene_number INTEGER NOT NULL,
    title VARCHAR(200),
    
    -- Scene Content
    synopsis TEXT,                          -- What happens in this scene
    emotional_beat VARCHAR(100),            -- Rising tension, comic relief, etc
    
    -- Context Links
    story_beat_id UUID,                     -- Which key action this belongs to
    story_beat_name VARCHAR(200),           -- Cached beat name
    
    -- Location (from Universe)
    location VARCHAR(200),                  -- Location name
    location_description TEXT,              -- Cached description
    location_image_url TEXT,                -- Reference image from universe
    time_of_day VARCHAR(50) DEFAULT 'day',  -- day, night, dawn, dusk
    weather VARCHAR(100),
    
    -- Characters
    characters_involved JSONB DEFAULT '[]', -- Array of {id, name, imageUrl}
    props JSONB DEFAULT '[]',               -- Important objects
    
    -- Generated Content
    storyboard_image_url TEXT,
    storyboard_prompt TEXT,                 -- Prompt used
    animation_prompt TEXT,
    
    -- Script
    script_content TEXT,                    -- Screenplay format
    dialogue_count INTEGER DEFAULT 0,
    
    -- Meta
    estimated_duration INTEGER DEFAULT 60,  -- Seconds
    status VARCHAR(50) DEFAULT 'empty',     -- empty, plotted, shot_listed, storyboarded, scripted
    generation_metadata JSONB DEFAULT '{}', -- Provider, credits, etc
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(project_id, scene_number)
);

CREATE INDEX idx_scene_plots_project ON scene_plots(project_id, scene_number);
CREATE INDEX idx_scene_plots_story ON scene_plots(story_id);
CREATE INDEX idx_scene_plots_status ON scene_plots(status);
```

### New Table: `scene_shots`
```sql
CREATE TABLE scene_shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Shot Identity
    shot_number INTEGER NOT NULL,
    
    -- Camera Technical
    camera_type VARCHAR(50) DEFAULT 'medium',       -- wide, medium, close-up, extreme-close-up, pov, over-shoulder
    camera_angle VARCHAR(50) DEFAULT 'eye-level',   -- eye-level, low-angle, high-angle, dutch, birds-eye, worms-eye
    camera_movement VARCHAR(50) DEFAULT 'static',   -- static, pan, tilt, dolly, tracking, crane, handheld, zoom
    lens VARCHAR(50),                               -- wide, normal, telephoto
    
    -- Timing
    duration INTEGER DEFAULT 5,                     -- Seconds
    
    -- Content
    framing TEXT,                                   -- What's in frame description
    action TEXT,                                    -- What happens in this shot
    blocking TEXT,                                  -- Character positions/movements
    
    -- Technical Notes
    lighting TEXT,
    audio TEXT,                                     -- Sound effects, music notes
    notes TEXT,                                     -- Director's notes
    
    -- Visual
    storyboard_image_url TEXT,
    storyboard_prompt TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                   -- Soft delete support
    
    UNIQUE(scene_id, shot_number)
);

CREATE INDEX idx_scene_shots_scene ON scene_shots(scene_id, shot_number);
CREATE INDEX idx_scene_shots_active ON scene_shots(scene_id) WHERE deleted_at IS NULL;
```

### New Table: `scene_script_versions`
```sql
CREATE TABLE scene_script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    
    -- Script content
    script_content TEXT NOT NULL,           -- Screenplay format content
    word_count INTEGER DEFAULT 0,
    dialogue_count INTEGER DEFAULT 0,
    
    -- Context snapshot (what was used to generate this version)
    context_snapshot JSONB DEFAULT '{}',    -- { scenePlotHash, shotListHash, beatId }
    
    -- Generation metadata
    provider VARCHAR(100),
    credit_cost INTEGER DEFAULT 0,
    prompt TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                   -- Soft delete support
    
    UNIQUE(scene_id, version_number)
);

CREATE INDEX idx_scene_script_versions_scene ON scene_script_versions(scene_id, version_number);
CREATE INDEX idx_scene_script_versions_active ON scene_script_versions(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
```

### Modify: `projects` table
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS 
    storyboard_config JSONB DEFAULT '{
        "totalScenes": 0,
        "scenesPerMinute": 1,
        "generationStatus": "not_started",
        "lastGeneratedAt": null
    }';
```

---

## API Routes

### Scene Plots API
```
GET    /api/scene-plots?projectId={id}           - List all scenes
GET    /api/scene-plots/{id}                     - Get single scene with shots
POST   /api/scene-plots                          - Create scene (manual)
PATCH  /api/scene-plots/{id}                     - Update scene
DELETE /api/scene-plots/{id}                     - Soft delete scene

POST   /api/scene-plots/generate-distribution    - Step 1: Generate scene distribution
POST   /api/scene-plots/generate-batch           - Step 2: Generate scene plots (batch)
POST   /api/scene-plots/{id}/generate-shots      - Step 3: Generate shot list for scene
POST   /api/scene-plots/{id}/generate-image      - Step 4: Generate storyboard image
POST   /api/scene-plots/{id}/generate-script     - Step 5: Generate script
```

### Batch Generation API
```
POST   /api/scene-plots/generate-all             - Full pipeline (queued)
       Body: { projectId, steps: ['distribution', 'plots', 'shots', 'images', 'scripts'] }
       
GET    /api/scene-plots/generation-status?projectId={id}  - Check progress
```

---

## Generation Pipeline Detail

### Step 1: Scene Distribution (1 API call)

**Input:**
```json
{
  "projectId": "xxx",
  "duration": 60,                    // Total minutes
  "storyBeats": [
    { "id": "beat1", "name": "Opening", "description": "..." },
    { "id": "beat2", "name": "Call to Adventure", "description": "..." }
  ],
  "synopsis": "Full story synopsis..."
}
```

**AI Prompt:**
```
You are a professional screenwriter. Given a story with {duration} minutes total runtime and the following story beats/key actions, distribute scenes across the story.

Story Synopsis: {synopsis}

Story Beats:
1. {beat1.name} - {beat1.description}
2. {beat2.name} - {beat2.description}
...

Rules:
- Total scenes must equal {duration} (1 scene ≈ 1 minute)
- Action/tension beats get more scenes
- Setup/transition beats get fewer scenes
- Each scene should advance the story

Return JSON array:
[
  { "beatId": "beat1", "beatName": "Opening", "sceneNumbers": [1, 2, 3, 4, 5], "sceneCount": 5 },
  { "beatId": "beat2", "beatName": "Call to Adventure", "sceneNumbers": [6, 7, 8, 9, 10, 11], "sceneCount": 6 },
  ...
]
```

**Output:** Scene distribution plan

---

### Step 2: Scene Plot Generation (Batched, 10 scenes per call)

**Input per batch:**
```json
{
  "projectId": "xxx",
  "batchScenes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "context": {
    "synopsis": "...",
    "previousScenes": [...],        // Summary of prior scenes
    "characters": [...],            // All characters for reference
    "locations": [...],             // All universe locations
    "storyBeats": {
      "1-5": { "beatName": "Opening", "description": "..." },
      "6-10": { "beatName": "Call to Adventure", "description": "..." }
    }
  }
}
```

**AI Prompt:**
```
Generate detailed scene plots for scenes {batchStart} to {batchEnd}.

Context:
- Full Synopsis: {synopsis}
- Previous Scenes Summary: {previousSummary}
- Story Beats for these scenes: {relevantBeats}

Available Characters:
{characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}

Available Locations (from universe):
{locations.map(l => `- ${l.name}: ${l.description}`).join('\n')}

For each scene, provide:
1. title: Brief scene title (5-7 words)
2. synopsis: What happens (2-3 sentences)
3. emotionalBeat: The emotional tone (tension, humor, sadness, triumph, etc)
4. location: Which location from the list (or "NEW: description" if new)
5. timeOfDay: day, night, dawn, or dusk
6. charactersInvolved: Array of character names present
7. estimatedDuration: Seconds (aim for ~60 per scene)

Return JSON array of 10 scene objects.
```

**Output:** 10 scene plots with all fields

---

### Step 3: Shot List Generation (Per scene or batched)

**Input:**
```json
{
  "sceneId": "xxx",
  "scenePlot": {
    "title": "Nana Discovers the Crystal",
    "synopsis": "Nana finds a glowing crystal...",
    "location": "Crystal Cave",
    "charactersInvolved": ["Nana", "Ree"],
    "emotionalBeat": "wonder"
  },
  "projectStyle": {
    "genre": "Fantasy",
    "tone": "Magical, Adventurous",
    "visualStyle": "cinematic anime"
  }
}
```

**AI Prompt:**
```
You are a professional cinematographer. Create a shot list for this scene.

Scene: {scene.title}
Synopsis: {scene.synopsis}
Location: {scene.location}
Characters: {scene.charactersInvolved}
Emotional Beat: {scene.emotionalBeat}
Genre/Style: {projectStyle}

Create 3-5 shots that:
1. Establish the location (if new)
2. Show character actions and reactions
3. Build the emotional beat
4. Maintain visual interest through varied shot types

For each shot provide:
- shotNumber: 1, 2, 3...
- cameraType: wide / medium / close-up / extreme-close-up / pov / over-shoulder
- cameraAngle: eye-level / low-angle / high-angle / dutch / birds-eye
- cameraMovement: static / pan / tilt / dolly / tracking / crane / handheld
- duration: seconds (total should = scene duration)
- framing: What's visible in frame
- action: What happens during this shot
- blocking: Character positions and movements
- notes: Any special instructions

Return JSON array of shots.
```

**Output:** 3-5 shots with full technical details

---

### Step 4: Storyboard Image Generation (I2I with references)

**For each scene/shot:**

**1. Collect References:**
```javascript
const references = [];

// Add character images (protagonists first)
const involvedChars = scene.charactersInvolved
  .map(name => characters.find(c => c.name === name))
  .filter(Boolean)
  .sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

for (const char of involvedChars.slice(0, 3)) { // Max 3 character refs
  const imageUrl = char.activeImageVersion?.imageUrl || char.imageUrl;
  if (imageUrl) references.push(imageUrl);
}

// Add location image
if (scene.locationImageUrl) {
  references.push(scene.locationImageUrl);
}
```

**2. Build Prompt:**
```javascript
const prompt = buildStoryboardPrompt({
  scene,
  shot,
  characters: involvedChars,
  style: project.visualStyle || 'cinematic anime'
});

// Example output:
// "cinematic anime style, wide establishing shot, Crystal Cave interior,
//  Nana (young girl, green eyes, black hair) standing in center looking up in wonder,
//  Ree (young boy, blue hair) behind her pointing at glowing crystal,
//  magical blue lighting from crystal, stone walls with crystals embedded,
//  fantasy movie screenshot, high quality, detailed"
```

**3. Call I2I:**
```javascript
await callAI('image-to-image', prompt, {
  referenceImageUrl: references[0],        // Primary character
  referenceImageUrls: references,          // All references
  aspectRatio: '16:9',                     // Cinematic
  strength: 0.6
});
```

---

### Step 5: Script Generation (Batched, 10 scenes per call)

**Input:**
```json
{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "...",
      "synopsis": "...",
      "location": "...",
      "timeOfDay": "...",
      "charactersInvolved": [...],
      "shots": [...],
      "emotionalBeat": "..."
    }
  ],
  "projectContext": {
    "title": "...",
    "genre": "...",
    "tone": "...",
    "characterDetails": {...}  // For voice/personality
  }
}
```

**AI Prompt:**
```
You are a professional screenwriter. Write screenplay format scripts for these scenes.

Project: {project.title}
Genre: {project.genre}
Tone: {project.tone}

Character Voices:
{characters.map(c => `- ${c.name}: ${c.personality}, speaks ${c.speechStyle}`)}

For each scene, write in standard screenplay format:
- Scene heading: INT./EXT. LOCATION - TIME
- Action lines: Present tense, visual descriptions
- Character names: CAPS before dialogue
- Dialogue: Natural, character-appropriate
- Parentheticals: Minimal, only when necessary

Each scene should be approximately 1 page (250-300 words, 50-60 lines).
Include 5-8 dialogue exchanges per scene average.

Return JSON array with:
[
  {
    "sceneNumber": 1,
    "scriptContent": "SCENE 1 - INT. CRYSTAL CAVE - DAY\n\n...",
    "dialogueCount": 6,
    "wordCount": 280
  }
]
```

---

## Frontend Components

### New/Modified Components

```
📁 components/studio/
│
├── StoryFormulaStudio.tsx        [MAJOR MODIFICATION - GENERATION HUB]
│   ├── [Existing] PremiseSynopsisView
│   ├── [Existing] StoryStructureView (Beats/Key Actions)
│   │
│   ├── 🆕 ScenePlotView.tsx        [EDITABLE + GENERATE]
│   │   ├── SceneGrid.tsx           - Grid of all scenes
│   │   ├── SceneCard.tsx           - Individual scene (editable)
│   │   ├── SceneEditModal.tsx      - Full scene editor
│   │   └── GenerationControls      - Distribute + Generate All buttons
│   │
│   ├── 🆕 ShotListView.tsx         [EDITABLE + GENERATE]
│   │   ├── SceneSelector           - Dropdown to pick scene
│   │   ├── ShotTable.tsx           - Editable table of shots
│   │   ├── ShotEditRow.tsx         - Inline edit for each shot
│   │   └── GenerationControls      - Generate Shots button
│   │
│   └── 🆕 ScriptView.tsx           [EDITABLE + GENERATE]
│       ├── SceneSelector           - Dropdown/tabs for scenes
│       ├── ScreenplayEditor.tsx    - Monospace text editor
│       ├── ScriptStats.tsx         - Word count, dialogue count
│       └── GenerationControls      - Generate Script button
│
├── StoryboardStudio.tsx          [RESTRUCTURE - READ-ONLY VISUAL]
│   ├── StoryboardView.tsx        [DEFAULT - Read-only grid]
│   │   ├── SceneCardReadOnly.tsx - Visual card with image
│   │   └── ScenePreviewModal.tsx - View-only detail
│   │       ├── Image preview
│   │       ├── Shot list preview (read-only)
│   │       └── Script preview (read-only)
│   │       └── [Generate Image] button only
│   │
│   ├── SequentialView.tsx        [READ-ONLY - Timeline]
│   │   └── Horizontal scroll of storyboard images
│   │
│   └── ClipsView.tsx             [FUTURE - Animation]
│       └── Video generation from storyboard
│
└── shared/
    ├── GenerationProgressModal.tsx  [NEW - Batch progress UI]
    └── SceneStatusBadge.tsx         [NEW - empty/plotted/complete]
```

### StoryFormulaStudio - New View Tabs
```tsx
// Add to existing tabs in StoryFormulaStudio:
const viewTabs = [
  { id: 'premise', label: 'Premise & Synopsis' },
  { id: 'structure', label: 'Story Structure' },
  { id: 'scene-plot', label: '🆕 Scene Plot', badge: '60 scenes' },
  { id: 'shot-list', label: '🆕 Shot List', badge: '180 shots' },
  { id: 'script', label: '🆕 Script', badge: '60 pages' },
];
```

### ScenePlotView (In Story Formula - EDITABLE)
```tsx
interface ScenePlotViewProps {
  projectId: string;
  scenes: ScenePlot[];
  characters: Character[];
  locations: UniverseLocation[];
  storyBeats: StoryBeat[];
  duration: number;           // Total minutes from project
  onScenesUpdate: (scenes: ScenePlot[]) => void;
}

// Layout:
// ┌─────────────────────────────────────────────────────────────────────┐
// │ SCENE PLOT                                                         │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ Total: 60 scenes | Plotted: 45 | Empty: 15                      ││
// │ │ [Initialize Scenes] [Generate All Plots] [Generate Selected]   ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │                                                                     │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ Filter: [All ▼] [Beat: Opening ▼]              🔍 Search       ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │                                                                     │
// │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
// │ │  1  │ │  2  │ │  3  │ │  4  │ │  5  │ │  6  │ │  7  │ │  8  │  │
// │ │ ──  │ │ ──  │ │ ☑️  │ │ ☑️  │ │ ☑️  │ │ ──  │ │ ──  │ │ ──  │  │
// │ │empty│ │empty│ │done │ │done │ │done │ │empty│ │empty│ │empty│  │
// │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
// │                                                                     │
// │ [Click any scene to edit]                                          │
// └─────────────────────────────────────────────────────────────────────┘

// Features:
// - Grid view with scene numbers
// - Status badges (empty, plotted, complete)
// - Click to open SceneEditModal
// - Multi-select for batch operations
// - Filter by story beat
// - Generate distribution (creates empty scene slots)
// - Generate all plots (batch AI call)
```

### SceneEditModal (In Story Formula - EDITABLE)
```tsx
interface SceneEditModalProps {
  scene: ScenePlot;
  characters: Character[];
  locations: UniverseLocation[];
  onSave: (scene: ScenePlot) => void;
  onGeneratePlot: () => void;
  onClose: () => void;
}

// Layout:
// ┌─────────────────────────────────────────────────────────────────┐
// │ Edit Scene 15                                      [X] Close    │
// ├─────────────────────────────────────────────────────────────────┤
// │                                                                 │
// │ Title:     [Nana Discovers the Crystal.....................]   │
// │                                                                 │
// │ Synopsis:  ┌─────────────────────────────────────────────────┐ │
// │            │ Nana enters the crystal cave and discovers a    │ │
// │            │ glowing blue crystal that seems to call to her. │ │
// │            │ Ree follows behind, equally amazed.             │ │
// │            └─────────────────────────────────────────────────┘ │
// │                                                                 │
// │ Story Beat:    [Opening - Setup ▼]                             │
// │ Location:      [Crystal Cave ▼]        [+ New Location]        │
// │ Time of Day:   [Day ▼]                                         │
// │ Weather:       [Clear ▼]                                       │
// │                                                                 │
// │ Characters:    [☑ Nana] [☑ Ree] [☐ Oxy] [☐ Phi] [☐ Frozz]     │
// │                                                                 │
// │ Emotional Beat: [Wonder / Amazement ▼]                         │
// │                                                                 │
// │ Duration:      [60] seconds                                    │
// │                                                                 │
// │ ┌───────────────────────────────────────────────────────────┐ │
// │ │ [🤖 Generate Plot from Context]                           │ │
// │ │ Uses: Synopsis + Story Beat + Characters + Location       │ │
// │ └───────────────────────────────────────────────────────────┘ │
// │                                                                 │
// │                           [Cancel]  [Save Scene]               │
// └─────────────────────────────────────────────────────────────────┘
```

### ShotListView (In Story Formula - EDITABLE)
```tsx
interface ShotListViewProps {
  projectId: string;
  scenes: ScenePlot[];
  onShotsUpdate: (sceneId: string, shots: Shot[]) => void;
}

// Layout:
// ┌─────────────────────────────────────────────────────────────────────┐
// │ SHOT LIST                                                          │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ Scene: [Scene 15: Nana Discovers Crystal ▼]  Total: 4 shots    ││
// │ │ [Generate Shots for This Scene] [Generate All Shots]           ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │                                                                     │
// │ ┌─────┬──────────┬──────────┬──────────┬──────┬─────────────────┐ │
// │ │ #   │ Type     │ Angle    │ Movement │ Dur  │ Action          │ │
// │ ├─────┼──────────┼──────────┼──────────┼──────┼─────────────────┤ │
// │ │ 1   │ [Wide ▼] │ [High ▼] │ [Crane▼] │ [8s] │ [Edit] [🗑️]    │ │
// │ │ 2   │ [Med ▼]  │ [Eye ▼]  │ [Static] │ [5s] │ [Edit] [🗑️]    │ │
// │ │ 3   │ [CU ▼]   │ [Low ▼]  │ [Dolly▼] │ [3s] │ [Edit] [🗑️]    │ │
// │ │ 4   │ [Med ▼]  │ [Eye ▼]  │ [Pan ▼]  │ [4s] │ [Edit] [🗑️]    │ │
// │ └─────┴──────────┴──────────┴──────────┴──────┴─────────────────┘ │
// │                                                                     │
// │ [+ Add Shot]                           Total Duration: 20s / 60s   │
// │                                                                     │
// │ ───────────────── Expanded Shot Edit ─────────────────            │
// │ Shot #2:                                                           │
// │ Camera Type: [Medium ▼]    Angle: [Eye Level ▼]                   │
// │ Movement: [Static ▼]       Lens: [Normal ▼]                       │
// │ Duration: [5] sec                                                  │
// │ Framing:  [Nana center frame, crystal glowing behind her]         │
// │ Action:   [Nana reaches out slowly toward the crystal]            │
// │ Blocking: [Nana steps forward from left, stops center]            │
// │ Lighting: [Blue glow from crystal, rim light on Nana]             │
// │ Audio:    [Mystical hum SFX, wind ambience]                       │
// │ Notes:    [Key emotional moment - hold on her expression]         │
// │                                              [Save] [Cancel]       │
// └─────────────────────────────────────────────────────────────────────┘
```

### ScriptView (In Story Formula - EDITABLE)
```tsx
interface ScriptViewProps {
  projectId: string;
  scenes: ScenePlot[];
  onScriptUpdate: (sceneId: string, script: string) => void;
}

// Layout:
// ┌─────────────────────────────────────────────────────────────────────┐
// │ SCRIPT                                                             │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ Scene: [Scene 15: Nana Discovers Crystal ▼]                    ││
// │ │ [Generate Script] [Generate All Scripts] [Export PDF] [Export]  ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │                                                                     │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ SCENE 15 - INT. CRYSTAL CAVE - DAY                              ││
// │ │                                                                  ││
// │ │ NANA (12) steps into the vast crystal cave, her eyes            ││
// │ │ widening at the sight before her. Thousands of crystals         ││
// │ │ line the walls, but one in the center glows with an             ││
// │ │ otherworldly blue light.                                        ││
// │ │                                                                  ││
// │ │                         NANA                                    ││
// │ │              (whispered)                                        ││
// │ │           It's... beautiful.                                    ││
// │ │                                                                  ││
// │ │ REE (10) rushes in behind her, nearly bumping into her.         ││
// │ │                                                                  ││
// │ │                         REE                                     ││
// │ │           Whoa! Is that... is that THE crystal?                 ││
// │ │                                                                  ││
// │ │ NANA nods slowly, transfixed.                                   ││
// │ │                                                                  ││
// │ │                         NANA                                    ││
// │ │           I think it's calling to me.                           ││
// │ │                                                                  ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │ Stats: 245 words | 8 dialogue lines | ~1:00 runtime               │
// │                                                                     │
// │                        [← Scene 14] [Scene 16 →]                   │
// └─────────────────────────────────────────────────────────────────────┘
```

### StoryboardView (In Storyboard Tab - READ-ONLY)
```tsx
interface StoryboardViewProps {
  projectId: string;
  scenes: ScenePlot[];
  // NO edit handlers - read only!
  onGenerateImage: (sceneId: string) => void;  // Only action allowed
}

// Layout:
// ┌─────────────────────────────────────────────────────────────────────┐
// │ STORYBOARD                                    [Generate All Images] │
// │ ┌─────────────────────────────────────────────────────────────────┐│
// │ │ 60 scenes | 45 with images | 15 pending                        ││
// │ └─────────────────────────────────────────────────────────────────┘│
// │                                                                     │
// │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
// │ │ [Image]   │ │ [Image]   │ │ [Image]   │ │  No Image │           │
// │ │           │ │           │ │           │ │  [Gen]    │           │
// │ │ Scene 1   │ │ Scene 2   │ │ Scene 3   │ │ Scene 4   │           │
// │ │ "Opening" │ │ "The Call"│ │ "Journey" │ │ "..."     │           │
// │ │ 4 shots   │ │ 3 shots   │ │ 5 shots   │ │ 0 shots   │           │
// │ └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
// │                                                                     │
// │ [Click card to preview - editing in Story Formula tab]            │
// └─────────────────────────────────────────────────────────────────────┘
```

### ScenePreviewModal (In Storyboard - READ-ONLY)
```tsx
// Read-only preview - for viewing, not editing
// Only action: Generate/Regenerate Image

// Layout:
// ┌─────────────────────────────────────────────────────────────────┐
// │ Scene 15: Nana Discovers the Crystal           [X] Close        │
// ├─────────────────────────────────────────────────────────────────┤
// │ ┌───────────────────────┐  ┌──────────────────────────────────┐ │
// │ │                       │  │ SCENE PLOT (read-only)           │ │
// │ │   STORYBOARD IMAGE    │  │ Synopsis: Nana enters the cave...│ │
// │ │   [Large Preview]     │  │ Location: Crystal Cave          │ │
// │ │                       │  │ Characters: Nana, Ree           │ │
// │ │ [Generate Image]      │  │ Beat: Wonder                    │ │
// │ │ [Regenerate]          │  │                                  │ │
// │ └───────────────────────┘  │ [Edit in Story Formula →]       │ │
// │                            └──────────────────────────────────┘ │
// │                                                                  │
// │ SHOT LIST (read-only table)                                     │
// │ #1 Wide | High | Crane | 8s | Establishing cave interior       │
// │ #2 Med  | Eye  | Static| 5s | Nana's reaction to crystal       │
// │                                                                  │
// │ SCRIPT (read-only preview, truncated)                           │
// │ "NANA steps into the cave, her eyes widening..."                │
// │ [View Full Script in Story Formula →]                           │
// │                                                                  │
// │                                          [← Prev] [Next →]      │
// └─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Database & API Foundation (Day 1-2)
- [ ] Create `scene_plots` table migration
- [ ] Create `scene_shots` table migration
- [ ] Create `scene_image_versions` table (like cover_versions) with version history
- [ ] Modify `projects` table for storyboard config
- [ ] Create CRUD API routes for scene_plots
- [ ] Create CRUD API routes for scene_shots
- [ ] Create CRUD API routes for scene_image_versions
- [ ] Write TypeScript interfaces for frontend

### Phase 2: Generation APIs (Day 3-4)
- [ ] Scene distribution API (Step 1)
- [ ] Scene plot batch generation API (Step 2)
- [ ] Shot list generation API (Step 3)
- [ ] Storyboard image generation with I2I (Step 4) - returns version
- [ ] Script batch generation API (Step 5)
- [ ] Generation queue/progress tracking

### Phase 3: Story Formula UI - Scene Plot View (Day 5-6)
- [ ] Add Scene Plot tab to StoryFormulaStudio
- [ ] Create ScenePlotView with scene grid
- [ ] Create SceneCard (editable)
- [ ] Create SceneEditModal
- [ ] Generation controls (Initialize + Generate All)

### Phase 4: Story Formula UI - Shot List & Script Views (Day 7-8)
- [ ] Create ShotListView with scene selector
- [ ] Create ShotTable (editable)
- [ ] Create ShotEditRow (inline edit)
- [ ] Create ScriptView with screenplay editor
- [ ] Batch generation controls for shots/scripts

### Phase 5: Storyboard Tab - Read-Only Visual (Day 9-10)
- [ ] Restructure StoryboardStudio.tsx
- [ ] Create StoryboardView (read-only grid)
- [ ] Create SceneCardReadOnly with image preview
- [ ] Create ScenePreviewModal (read-only + link to Story Formula)
- [ ] Image version selector per scene
- [ ] Generate Image button (creates new version)
- [ ] "Generate All Images" batch button

### Phase 6: Storyboard Tab - Sequential & Clips Views (Day 11-12)
- [ ] Create SequentialView (horizontal timeline of images)
- [ ] Create ClipsView (video generation)
- [ ] Integrate Seedance image2video for clips
- [ ] Per-scene video generation (optional, expensive)
- [ ] Video player for generated clips
- [ ] Export clips/download

### Phase 7: Polish & Testing (Day 13-14)
- [ ] Responsive design
- [ ] Generation progress UI
- [ ] Error handling & retries
- [ ] Export functionality (script to PDF/FDX)
- [ ] Performance optimization
- [ ] Cost warnings for expensive operations (clips)

---

## File Changes Summary

### New Files
```
src/app/api/scene-plots/
├── route.ts                    - CRUD endpoints
├── [id]/route.ts               - Single scene operations
├── generate-distribution/route.ts
├── generate-batch/route.ts
├── [id]/generate-shots/route.ts
├── [id]/generate-script/route.ts

src/app/api/scene-images/
├── route.ts                    - List/create scene image versions
├── [id]/route.ts               - Get/update/delete specific version
└── generate/route.ts           - Generate new image version

src/app/api/scene-clips/
├── route.ts                    - List/create scene clips
└── generate/route.ts           - Generate clip via Seedance i2v

src/components/studio/story-formula/
├── ScenePlotView.tsx           - Scene plot grid (editable)
├── SceneCard.tsx               - Individual scene card
├── SceneEditModal.tsx          - Full scene editor
├── ShotListView.tsx            - Shot list editor
├── ShotTable.tsx               - Editable shot table
├── ShotEditRow.tsx             - Inline shot editor
├── ScriptView.tsx              - Screenplay editor
└── GenerationControls.tsx      - Batch generation buttons

src/components/studio/storyboard/
├── StoryboardView.tsx          - Read-only scene grid
├── SceneCardReadOnly.tsx       - Visual card with image
├── ScenePreviewModal.tsx       - View-only detail
├── ImageVersionSelector.tsx    - Switch between image versions
├── SequentialView.tsx          - Horizontal timeline
├── ClipsView.tsx               - Video clips from images
└── ClipPlayer.tsx              - Video player component

src/components/shared/
├── GenerationProgressModal.tsx - Batch progress UI
└── SceneStatusBadge.tsx        - Status indicator

migrations/
├── add_scene_plots_table.sql
├── add_scene_shots_table.sql
└── add_scene_image_versions_table.sql
```

### Modified Files
```
src/components/studio/StoryFormulaStudio.tsx - Add 3 new tabs (Scene Plot, Shot List, Script)
src/components/studio/StoryboardStudio.tsx   - Restructure as read-only visual
src/lib/ai/prompts.ts                        - Add storyboard prompt builders
```

---

## UI Flow Summary

```
User Journey:

1. Story Formula → Create synopsis + story beats (EXISTING)
                                ↓
2. Story Formula → Scene Plot View [EDITABLE]
   → [Initialize Scenes] creates empty scene slots based on duration
   → [Generate All Plots] batch generates scene plots
   → Click any scene → SceneEditModal (edit title, synopsis, location, characters)
   → Manual edit or regenerate individual scenes
                                ↓
3. Story Formula → Shot List View [EDITABLE]
   → Select scene from dropdown
   → [Generate Shots] creates 3-5 shots per scene
   → Edit camera type, angle, movement, duration, blocking
   → Add/remove shots manually
                                ↓
4. Story Formula → Script View [EDITABLE]
   → Select scene from dropdown
   → [Generate Script] creates screenplay format
   → Edit dialogue, action lines directly
   → View stats (word count, dialogue count)
                                ↓
5. Storyboard Tab → Storyboard View [READ-ONLY]
   → Visual grid of all scenes with thumbnails
   → Per-scene: [Generate Image] creates new version
   → [Generate All Images] batch with progress
   → Image version selector (switch between versions)
   → Click scene → ScenePreviewModal (read-only + "Edit in Story Formula" link)
                                ↓
6. Storyboard Tab → Sequential View [READ-ONLY]
   → Horizontal timeline of all storyboard images
   → Scroll through story visually
   → Quick navigation
                                ↓
7. Storyboard Tab → Clips View [OPTIONAL - EXPENSIVE]
   → Convert scene images to video clips via Seedance i2v
   → Per-scene video generation (user chooses which scenes)
   → Cost warning before generation
   → Video player for each clip
   → Export/download clips
```

---

## New Database Table: `scene_image_versions`

```sql
CREATE TABLE scene_image_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    
    -- Image
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    prompt TEXT,                    -- Prompt used to generate
    
    -- Generation metadata
    provider VARCHAR(100),
    credit_cost INTEGER DEFAULT 0,
    generation_mode VARCHAR(50) DEFAULT 'i2i',
    reference_images JSONB DEFAULT '[]',  -- Character/universe refs used
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(scene_id, version_number)
);

CREATE INDEX idx_scene_image_versions_scene ON scene_image_versions(scene_id, version_number);
CREATE INDEX idx_scene_image_versions_active ON scene_image_versions(scene_id, is_active) WHERE is_active = TRUE;
```

## New Database Table: `scene_clips` (Video Versions)

```sql
CREATE TABLE scene_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    shot_id UUID REFERENCES scene_shots(id),           -- Optional: specific shot being animated
    image_version_id UUID REFERENCES scene_image_versions(id),
    
    -- Version info (like other version tables)
    version_number INTEGER NOT NULL,
    
    -- Clip info
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,               -- Seconds
    
    -- Movement (from shot list or user override)
    camera_movement VARCHAR(50),    -- pan, tilt, dolly, zoom, static, etc
    movement_direction VARCHAR(50), -- left, right, up, down, in, out
    movement_speed VARCHAR(50),     -- slow, normal, fast
    
    -- Generation
    prompt TEXT,                    -- Full Seedance prompt including movement
    seed_prompt_data JSONB,         -- { sceneContext, shotContext, movementPrompt }
    provider VARCHAR(100) DEFAULT 'seedance',
    credit_cost INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, complete, failed
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                  -- Soft delete support
    
    UNIQUE(scene_id, version_number)
);

CREATE INDEX idx_scene_clips_scene ON scene_clips(scene_id, version_number);
CREATE INDEX idx_scene_clips_shot ON scene_clips(shot_id);
CREATE INDEX idx_scene_clips_active ON scene_clips(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
);

CREATE INDEX idx_scene_clips_scene ON scene_clips(scene_id);
CREATE INDEX idx_scene_clips_shot ON scene_clips(shot_id);
```

---

## Clip Generation Prompt Building

### Movement Options (from Shot List camera_movement)
```typescript
const MOVEMENT_PROMPTS = {
  // Camera movements
  'static': 'static shot, no camera movement',
  'pan': 'camera panning {direction}',           // left, right
  'tilt': 'camera tilting {direction}',          // up, down
  'dolly': 'camera dolly {direction}',           // in, out, forward, backward
  'tracking': 'camera tracking {direction}',     // following subject
  'crane': 'crane shot {direction}',             // up, down
  'handheld': 'handheld camera movement, organic shake',
  'zoom': 'camera zoom {direction}',             // in, out
  
  // Combined movements
  'pan-tilt': 'camera panning and tilting simultaneously',
  'dolly-zoom': 'dolly zoom effect (Vertigo effect)',
};

const SPEED_PROMPTS = {
  'slow': 'slow, deliberate movement',
  'normal': 'natural pace movement',
  'fast': 'quick, dynamic movement',
};
```

### Seedance Prompt Builder
```typescript
function buildClipPrompt(scene: ScenePlot, shot: Shot, options: ClipOptions) {
  const parts = [];
  
  // 1. Scene context
  parts.push(`Scene: ${scene.synopsis}`);
  
  // 2. Camera movement from shot list (or user override)
  const movement = options.movement || shot.camera_movement;
  const direction = options.direction || getDefaultDirection(movement);
  const speed = options.speed || 'normal';
  
  if (movement !== 'static') {
    const movementPrompt = MOVEMENT_PROMPTS[movement]
      .replace('{direction}', direction);
    parts.push(movementPrompt);
    parts.push(SPEED_PROMPTS[speed]);
  }
  
  // 3. Character action from shot
  if (shot.action) {
    parts.push(`Action: ${shot.action}`);
  }
  
  // 4. Visual style
  parts.push('cinematic, high quality, smooth motion');
  
  return parts.join(', ');
}
```

### UI: Clip Generation Modal
```
┌─────────────────────────────────────────────────────────────────────┐
│ Generate Clip for Scene 15                            [X] Close     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌───────────────────────────────────────┐                          │
│ │ [Storyboard Image Preview]            │  Shot: [Shot 2 ▼]        │
│ │                                       │                          │
│ └───────────────────────────────────────┘  Camera: Medium, Eye     │
│                                                                     │
│ ─────────────── Movement Settings ───────────────                  │
│                                                                     │
│ Type:      [Pan ▼]           (from shot list: Pan)                 │
│ Direction: [Left ▼] [Right ▼] [Up ▼] [Down ▼] [In ▼] [Out ▼]       │
│ Speed:     [○ Slow] [● Normal] [○ Fast]                            │
│                                                                     │
│ ─────────────── Preview Prompt ───────────────                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Scene: Nana discovers glowing crystal in cave, camera panning   ││
│ │ left, natural pace movement, Action: Nana reaches toward        ││
│ │ crystal, cinematic, high quality, smooth motion                 ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ⚠️ Cost: ~50 credits per clip                                      │
│                                                                     │
│                           [Cancel]  [Generate Clip]                │
└─────────────────────────────────────────────────────────────────────┘
```
7. Future: Clips View for animation generation from storyboard images
```

---

## Credits Cost Estimation (60-scene project)

| Step | Calls | Type | Est. Credits |
|------|-------|------|--------------|
| Scene Distribution | 1 | Text | 2 |
| Scene Plots (6 batches) | 6 | Text | 12 |
| Shot Lists (6-12 batches) | 10 | Text | 20 |
| Storyboard Images | 60 | Image | 720 |
| Scripts (6 batches) | 6 | Text | 12 |
| **TOTAL** | **83** | Mixed | **~766 credits** |

Consider: Add "Lite" option that skips image generation initially.

---

## Notes

1. **Dependency**: Story Formula MUST have at least synopsis and story beats before Storyboard can be initialized.

2. **Character/Universe Link**: Scene generation pulls character images and universe location images as I2I references automatically.

3. **Incremental Generation**: User can generate piece by piece, or "Generate All" for batch processing.

4. **Edit & Regenerate**: User can always edit any field manually and regenerate specific elements.

5. **Version Control**: Consider adding scene versioning for major changes.

6. **🔒 STORY CONTINUITY - CRITICAL**:
   - Scene plots MUST be generated **sequentially** (1→2→3...) to maintain story flow
   - Each batch generation includes **summary of previous scenes** as context
   - Regenerating a single scene includes context from **scene before AND after**
   - Scenes are **ordered by scene_number**, not by creation time
   - **No drag-reorder** allowed once story is established (would break continuity)
   - If user wants to insert a scene: 
     - Renumber subsequent scenes
     - Offer to regenerate affected scenes with new context

7. **Sequential Generation Context**:
   ```
   When generating Scene 15:
   
   Context provided to AI:
   - Full story synopsis
   - Story beat this scene belongs to
   - Summary of Scenes 1-14 (what has happened so far)
   - Scene 14 full details (immediate predecessor)
   - Scene 16 synopsis if exists (what comes next - for regeneration)
   ```

8. **Scene Lock**: Once a scene has shots/script/image, show warning before regenerating plot (would invalidate downstream content).

9. **Clips Cost Warning**: Video generation is expensive (~50 credits per clip). Always show cost confirmation before generating clips.

10. **🔒 SHOT LIST & SCRIPT CONSISTENCY**:
    - Shot list MUST follow the **scene plot synopsis** exactly
    - Script MUST follow **both scene plot AND shot list**
    - When generating shots/script, provide:
      - Scene plot (synopsis, characters, location, emotional beat)
      - Previous scene's ending (for continuity)
      - Next scene's opening (for smooth transition)
    - Script dialogue must match **character personalities** from Character Studio
    - If user edits scene plot → Show warning to regenerate shots/script
    - Prompt includes: "Do NOT deviate from the scene synopsis. The story must match exactly."

11. **Generation Dependency Chain**:
    ```
    Scene Plot → Shot List → Script → Storyboard Image → Clip
         ↓           ↓          ↓
    If edited: Warn to regenerate downstream content
    ```

12. **📚 VERSION MANAGEMENT**:
    - **Image Versions**: Each scene can have multiple storyboard image versions
    - **Script Versions**: Each scene can have multiple script versions
    - **Clip Versions**: Each scene can have multiple video clip versions
    - All versions have `is_active` flag - only ONE active per scene
    - Versions ordered by `version_number` (1, 2, 3...)
    - User can switch active version anytime

13. **🗑️ SOFT DELETE & RESTORE**:
    - All version tables have `deleted_at` column
    - Delete = set `deleted_at` timestamp (soft delete)
    - Restore = clear `deleted_at` back to NULL
    - Permanently delete = hard delete from DB (optional, admin only)
    - UI shows "Deleted" tab/filter to view & restore deleted versions
    - API endpoints:
      - DELETE `/api/scene-images/{id}` → soft delete
      - POST `/api/scene-images/{id}/restore` → restore
      - DELETE `/api/scene-images/{id}/permanent` → hard delete

14. **📝 SCRIPT VERSIONING LOGIC**:
    - First script generation = Version 1
    - If **any upstream changes** occur, next generation = new version:
      - Story beat/key action changed
      - Scene plot synopsis changed
      - Shot list changed
    - Version tracks `context_snapshot` = hash of upstream content
    - On generate:
      1. Calculate hash of current scene plot + shot list
      2. Compare with latest version's `context_snapshot`
      3. If different OR no existing script → create new version
      4. If same → warn "No changes detected, regenerate anyway?"
    - Manual edits do NOT create new version (edit in place)
    - User can always "Save as New Version" for manual edits

15. **🎬 CLIP VERSIONING (Uses Animate Integration)**:
    - Clips use existing Animate system (Seedance i2v)
    - Each clip is tied to specific `image_version_id`
    - Regenerating clip from different image = new version
    - Different movement settings = new version
    - Can have multiple clip versions per scene (different movements/takes)
