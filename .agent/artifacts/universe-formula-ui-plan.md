# Universe Formula UI Revamp Plan

## Overview
Revamp the Universe Formula component with:
1. **Radial/clock UI** - 8 levels around central Identity, counter-clockwise from right
2. **Universe Version Control** - Each Story Version has its own Universe
3. **AI Generation** - Based on character ethnicity, story setting, project description
4. **Editable fields** - All 18 fields can be edited manually

---

## Universe Version Control

### Relationship:
```
Project
  └── Story Versions (1:N)
        └── Universe (1:1 per story version)
```

**Each Story Version has ONE Universe.** When user switches story version, the universe also switches.

### Database Schema:

#### New Table: `universe_versions`
```sql
CREATE TABLE universe_versions (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  story_version_id VARCHAR(255) NOT NULL REFERENCES story_versions(id),
  project_id VARCHAR(255) NOT NULL,
  
  -- Identity (Center)
  universe_name TEXT,
  period TEXT,
  
  -- Level 1: Private Interior
  room_cave TEXT,
  house_castle TEXT,
  private_interior TEXT,
  
  -- Level 2: Family
  family_inner_circle TEXT,
  
  -- Level 3: Neighborhood
  neighborhood_environment TEXT,
  
  -- Level 4: City
  town_district_city TEXT,
  working_office_school TEXT,
  
  -- Level 5: Government
  country TEXT,
  government_system TEXT,
  
  -- Level 6: Law & Rules
  labor_law TEXT,
  rules_of_work TEXT,
  
  -- Level 7: Culture
  society_and_system TEXT,
  sociocultural_system TEXT,
  
  -- Level 8: World
  environment_landscape TEXT,
  sociopolitic_economy TEXT,
  kingdom_tribe_communal TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_universe_story_version ON universe_versions(story_version_id);
CREATE INDEX idx_universe_project ON universe_versions(project_id);
```

### UI Flow:
1. User opens Universe Formula tab
2. Shows story version selector (same as in Story tab)
3. Loads universe for active story version
4. If no universe exists for that story version, show empty + "Generate" button
5. User can switch story versions to see different universes

### API Endpoints:
- `GET /api/creator/projects/[id]/stories/[versionId]/universe` - Get universe for story version
- `PUT /api/creator/projects/[id]/stories/[versionId]/universe` - Save/update universe
- `POST /api/creator/projects/[id]/stories/[versionId]/universe/generate` - AI generate universe

---

## Current State

### Existing Fields (18 total):
| Field Key | Label |
|-----------|-------|
| `universeName` | Universe Name |
| `period` | Period |
| `workingOfficeSchool` | Working Office / School |
| `townDistrictCity` | Town / District / City |
| `neighborhoodEnvironment` | Neighborhood / Environment |
| `rulesOfWork` | Rules of Work |
| `laborLaw` | Labor Law |
| `country` | Country |
| `governmentSystem` | Government System |
| `environmentLandscape` | Environment / Landscape |
| `societyAndSystem` | Society & System |
| `privateInterior` | Private / Interior |
| `sociopoliticEconomy` | Sociopolitic & Economy |
| `socioculturalSystem` | Sociocultural System |
| `houseCastle` | House / Castle |
| `roomCave` | Room / Cave |
| `familyInnerCircle` | Family / Inner Circle |
| `kingdomTribeCommunal` | Kingdom / Tribe / Communal |

### Current UI:
- Simple grid layout (3 columns)
- All fields displayed as textareas
- No visual hierarchy
- Basic form-based input

---

## New Design: Radial Clock Layout

### Structure:
```
                    Level 4 (atas)
               Level 5        Level 3
           Level 6               Level 2
      
           Level 7   [IDENTITY]   Level 1 ← START
      
           Level 8               
```

### Position Mapping (Counter-clockwise from 3 o'clock):

| Clock Position | Angle | Level | Name | Fields |
|---------------|-------|-------|------|--------|
| **Center** | - | Identity | Universe Core | `universeName`, `period` |
| 3:00 (Right) | 0° | Level 1 | Private Interior | `roomCave`, `houseCastle`, `privateInterior` |
| 1:30 (Upper-Right) | 45° | Level 2 | Family & Home | `familyInnerCircle` |
| 12:00 (Top) | 90° | Level 3 | Neighborhood | `neighborhoodEnvironment` |
| 10:30 (Upper-Left) | 135° | Level 4 | City & Town | `townDistrictCity`, `workingOfficeSchool` |
| 9:00 (Left) | 180° | Level 5 | Government | `country`, `governmentSystem` |
| 7:30 (Lower-Left) | 225° | Level 6 | Law & Rules | `laborLaw`, `rulesOfWork` |
| 6:00 (Bottom) | 270° | Level 7 | Society & Culture | `societyAndSystem`, `socioculturalSystem` |
| 4:30 (Lower-Right) | 315° | Level 8 | World & System | `environmentLandscape`, `sociopoliticEconomy`, `kingdomTribeCommunal` |

---

## UI Views (3 Modes)

### 1. Radial View (Default)
- SVG-based circular layout
- Center shows Universe Identity (name + period)
- 8 segments around center, each clickable
- Segments show level name + fill status
- Click segment to expand/edit
- Counter-clockwise numbering from right

### 2. Level Cards View
- Vertical scrollable list
- Each level as expandable card
- Shows all fields within level
- Similar to Story beats cards

### 3. Form Grid View
- Traditional grid layout (existing)
- All 18 fields visible
- Good for bulk editing

---

## Visual Design

### Color Palette:
- **Center (Identity)**: Deep purple gradient (`#7C3AED` to `#9333EA`)
- **Level 1-2 (Private)**: Warm orange (`#F97316`)
- **Level 3-4 (Local)**: Amber (`#F59E0B`)
- **Level 5-6 (National)**: Blue (`#3B82F6`)
- **Level 7-8 (Universal)**: Indigo (`#6366F1`)

### Radial Segment Design:
```
    ┌─────────────────┐
    │   Level Name    │  ← Header with icon
    │   ● ○ ○          │  ← Fill indicator (dots)
    │   [Edit]        │  ← Click to expand
    └─────────────────┘
```

### Center Identity Design:
```
    ╭─────────────────╮
    │     🌌          │
    │  Universe Name  │
    │    "Astina"     │
    │   Period: 1200  │
    ╰─────────────────╯
```

---

## Technical Implementation

### Component Structure:
```
UniverseFormulaStudio/
├── UniverseFormulaStudio.tsx    (Main component)
├── RadialView.tsx               (SVG radial layout)
├── LevelCard.tsx                (Expandable level card)
├── CenterIdentity.tsx           (Center circle component)
└── types.ts                     (TypeScript interfaces)
```

### Key Props:
```tsx
interface UniverseFormulaStudioProps {
  universe: UniverseData;
  characters?: Character[];        // For ethnicity context
  story?: StoryData;              // For story setting context
  projectDescription?: string;    // For AI generation context
  onUpdate: (updates: Partial<UniverseData>) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}
```

### SVG Radial Calculation:
```tsx
const LEVELS = 8;
const ANGLE_PER_LEVEL = 360 / LEVELS; // 45° per level
const START_ANGLE = 0; // 3 o'clock position (right)

// Counter-clockwise: use negative angle
const getSegmentAngle = (levelIndex: number) => {
  return START_ANGLE - (levelIndex * ANGLE_PER_LEVEL);
};

const getSegmentPosition = (levelIndex: number, radius: number) => {
  const angle = getSegmentAngle(levelIndex) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY - radius * Math.sin(angle), // Negative for SVG Y-axis
  };
};
```

---

## AI Generation

### ⚠️ CRITICAL: ALL 18 FIELDS MUST BE GENERATED
- No field should be empty or skipped
- Token limit: 12000+ to ensure complete JSON output
- Validate response: check all 18 keys exist and have content
- If any field missing: retry generation or show warning

### Context Sources:
1. **Project Description** - Overall setting
2. **Characters** - Ethnicity, nationality, background, culture
3. **Story** - Premise, genre, theme, setting implied

### Field List (18 fields - ALL REQUIRED):
```json
{
  "universeName": "...",
  "period": "...",
  "roomCave": "...",
  "houseCastle": "...",
  "privateInterior": "...",
  "familyInnerCircle": "...",
  "neighborhoodEnvironment": "...",
  "townDistrictCity": "...",
  "workingOfficeSchool": "...",
  "country": "...",
  "governmentSystem": "...",
  "laborLaw": "...",
  "rulesOfWork": "...",
  "societyAndSystem": "...",
  "socioculturalSystem": "...",
  "environmentLandscape": "...",
  "sociopoliticEconomy": "...",
  "kingdomTribeCommunal": "..."
}
```

### Prompt Template:
```
Generate universe worldbuilding based on:
- Project: {projectDescription}
- Characters: {characterSummary} (ethnicity: {ethnicity}, nationality: {nationality})
- Story: {storyPremise} (genre: {genre}, theme: {theme})

WAJIB ISI SEMUA 18 FIELDS. Jangan ada yang kosong!
Setiap field 1-3 kalimat dalam Bahasa Indonesia.

Output JSON dengan SEMUA 18 keys:
{fieldsList}
```

### Validation Logic:
```typescript
const REQUIRED_FIELDS = [
  'universeName', 'period', 'roomCave', 'houseCastle', 'privateInterior',
  'familyInnerCircle', 'neighborhoodEnvironment', 'townDistrictCity',
  'workingOfficeSchool', 'country', 'governmentSystem', 'laborLaw',
  'rulesOfWork', 'societyAndSystem', 'socioculturalSystem',
  'environmentLandscape', 'sociopoliticEconomy', 'kingdomTribeCommunal'
];

const validateResponse = (data: any) => {
  const missing = REQUIRED_FIELDS.filter(f => !data[f]?.trim());
  if (missing.length > 0) {
    console.warn('Missing fields:', missing);
    return false;
  }
  return true;
};
```

---

## Implementation Steps

### Phase 0: Database Migration
1. [ ] Create `scripts/run-universe-versions-migration.js`
2. [ ] Create `universe_versions` table
3. [ ] Migrate existing universe data (from `projects` or `universe` table if exists)
4. [ ] Run migration

### Phase 1: API Endpoints
5. [ ] Create `GET /api/creator/projects/[id]/stories/[versionId]/universe/route.ts`
6. [ ] Create `PUT` for save/update
7. [ ] Update AI generation endpoint to use story context

### Phase 2: Component Setup
8. [ ] Create `UniverseFormulaStudio.tsx` 
9. [ ] Define level groupings and types
10. [ ] Add story version selector (reuse from Story tab)
11. [ ] Create view mode state (radial/cards/grid)

### Phase 3: Radial View
12. [ ] Build SVG radial layout
13. [ ] Add center identity circle
14. [ ] Implement 8 clickable segments
15. [ ] Add counter-clockwise positioning
16. [ ] Add hover/active states

### Phase 4: Level Cards View
17. [ ] Create expandable level cards
18. [ ] Group fields by level
19. [ ] Add field inputs within cards

### Phase 5: AI Integration
20. [ ] Update generation to use character ethnicity
21. [ ] Use story premise, genre, theme as context
22. [ ] Ensure all 18 fields are generated

### Phase 6: Integration
23. [ ] Replace old UniverseFormula in project page
24. [ ] Link universe loading to active story version
25. [ ] Test data persistence
26. [ ] Polish animations and transitions

---

## File Locations

| File | Purpose |
|------|---------|
| `scripts/run-universe-versions-migration.js` | Database migration |
| `src/app/api/creator/projects/[id]/stories/[versionId]/universe/route.ts` | API endpoint |
| `src/components/studio/UniverseFormulaStudio.tsx` | New main component |
| `src/app/(dashboard)/projects/[id]/page.tsx` | Integration point |
| `src/app/api/ai/generate-universe/route.ts` | AI generation (update) |

---

## Dependencies
- No new packages required
- Uses existing: lucide-react, Radix UI, Tailwind

---

## Timeline Estimate
- Phase 0: ~30 min (Migration)
- Phase 1: ~1 hour (API)
- Phase 2-3: ~2 hours (Radial UI)
- Phase 4: ~1 hour (Cards)
- Phase 5-6: ~1.5 hours (AI + Integration)
- **Total: ~6 hours**
