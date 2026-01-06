# Implementation Plan: Story Version Control & Multi-Story Support

## Overview
Implement a comprehensive story versioning system that allows users to:
1. Create multiple stories within a single project
2. Generate different story structures (Save the Cat, Hero's Journey, Dan Harmon) as separate stories
3. Track version history of each story
4. Switch between stories and versions easily

---

## User Requirements (dari request)

1. **Story History** - Setiap kali generate story, hasilnya tersimpan sebagai record baru
2. **New Story Button** - Bisa buat story baru dari premise yang sama atau berbeda
3. **Story Selector** - Dropdown untuk pilih story mana yang sedang aktif
4. **Version Control** - Setiap story punya history versi-nya sendiri
5. **Structure Independence** - Generate Cat Story, lalu generate Dan Harmon dari premise yang sama = 2 story terpisah

---

## Database Schema Changes

### Option A: Story Versions Table (Recommended)
```sql
-- stories table remains as is (one per project)
-- Add new table for story versions

CREATE TABLE story_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Version info
  version_number INTEGER NOT NULL DEFAULT 1,
  version_name VARCHAR(255), -- e.g., "Save the Cat v1", "Hero's Journey Draft"
  is_active BOOLEAN DEFAULT FALSE, -- Currently selected version
  
  -- Story data (same as current stories table)
  premise TEXT,
  synopsis TEXT,
  global_synopsis TEXT,
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  format VARCHAR(100),
  duration VARCHAR(100),
  tone VARCHAR(100),
  theme VARCHAR(255),
  conflict TEXT,
  target_audience VARCHAR(255),
  ending_type VARCHAR(100),
  structure VARCHAR(100), -- 'Save the Cat', 'The Hero\'s Journey', 'Dan Harmon Story Circle'
  
  -- Beat data (JSONB)
  cat_beats JSONB DEFAULT '{}',
  hero_beats JSONB DEFAULT '{}',
  harmon_beats JSONB DEFAULT '{}',
  
  -- Additional data
  tension_levels JSONB DEFAULT '{}',
  want_need_matrix JSONB DEFAULT '{}',
  beat_characters JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(story_id, version_number)
);

-- Index for fast queries
CREATE INDEX idx_story_versions_story ON story_versions(story_id);
CREATE INDEX idx_story_versions_project ON story_versions(project_id);
CREATE INDEX idx_story_versions_active ON story_versions(story_id, is_active);
```

### Option B: Add version columns to stories table
```sql
ALTER TABLE stories ADD COLUMN parent_story_id UUID REFERENCES stories(id);
ALTER TABLE stories ADD COLUMN version_number INTEGER DEFAULT 1;
ALTER TABLE stories ADD COLUMN version_name VARCHAR(255);
ALTER TABLE stories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

**Recommendation**: Option A is cleaner and allows multiple stories per project with proper versioning.

---

## API Changes

### 1. GET /api/creator/projects/[id] - Modified
**Response should include:**
```json
{
  "project": { ... },
  "stories": [
    { "id": "...", "name": "Save the Cat v1", "structure": "Save the Cat", "isActive": true, "createdAt": "..." },
    { "id": "...", "name": "Hero's Journey Draft", "structure": "The Hero's Journey", "isActive": false, "createdAt": "..." }
  ],
  "activeStory": { ... full story data ... }
}
```

### 2. POST /api/creator/projects/[id]/stories - New
**Create new story/version**
```json
// Request
{
  "name": "Hero's Journey Draft",
  "structure": "The Hero's Journey",
  "copyFrom": "story-id-to-copy-premise-from" // optional
}

// Response
{
  "story": { ... new story data ... }
}
```

### 3. PATCH /api/creator/projects/[id]/stories/[storyId] - New
**Update specific story version**
```json
{
  "premise": "...",
  "synopsis": "...",
  "heroBeats": { ... }
}
```

### 4. POST /api/creator/projects/[id]/stories/[storyId]/activate - New
**Set story as active**
```json
// Response
{ "success": true }
```

### 5. DELETE /api/creator/projects/[id]/stories/[storyId] - New
**Delete a story version**

---

## Frontend Changes

### 1. StoryArcStudio Component Updates

#### A. Add Story Selector to Header
```tsx
// In toolbar area
<div className="flex items-center gap-2">
  {/* Story Selector */}
  <Select value={activeStoryId} onValueChange={handleSwitchStory}>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Select Story" />
    </SelectTrigger>
    <SelectContent>
      {stories.map(s => (
        <SelectItem key={s.id} value={s.id}>
          {s.name} ({s.structure})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  
  {/* New Story Button */}
  <Button variant="outline" size="sm" onClick={handleNewStory}>
    <Plus className="h-3 w-3 mr-1" />
    New Story
  </Button>
</div>
```

#### B. New Story Dialog
```tsx
<Dialog open={showNewStoryDialog} onOpenChange={setShowNewStoryDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Story</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>Story Name</Label>
        <Input 
          value={newStoryName}
          onChange={(e) => setNewStoryName(e.target.value)}
          placeholder="e.g., Hero's Journey Draft"
        />
      </div>
      
      <div>
        <Label>Story Structure</Label>
        <Select value={newStoryStructure} onValueChange={setNewStoryStructure}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Save the Cat">Save the Cat (15 beats)</SelectItem>
            <SelectItem value="The Hero's Journey">Hero's Journey (12 beats)</SelectItem>
            <SelectItem value="Dan Harmon Story Circle">Dan Harmon (8 beats)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Copy Premise From</Label>
        <Select value={copyFromStory} onValueChange={setCopyFromStory}>
          <SelectTrigger><SelectValue placeholder="Start fresh" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Start fresh (empty)</SelectItem>
            {stories.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowNewStoryDialog(false)}>Cancel</Button>
      <Button onClick={handleCreateNewStory}>Create Story</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### C. Story History Panel (Optional - Phase 2)
```tsx
{/* Story History Sidebar */}
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="sm">
      <History className="h-4 w-4" />
      History
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Story History</SheetTitle>
    </SheetHeader>
    <div className="space-y-2 mt-4">
      {stories.map(s => (
        <div 
          key={s.id} 
          className={`p-3 rounded-lg border cursor-pointer ${s.isActive ? 'bg-orange-50 border-orange-200' : ''}`}
          onClick={() => handleSwitchStory(s.id)}
        >
          <div className="font-medium">{s.name}</div>
          <div className="text-xs text-gray-500">{s.structure}</div>
          <div className="text-xs text-gray-400">{formatDate(s.createdAt)}</div>
        </div>
      ))}
    </div>
  </SheetContent>
</Sheet>
```

### 2. Props Changes

```tsx
interface StoryArcStudioProps {
  story: Story;
  stories: StoryListItem[]; // NEW: All stories for this project
  activeStoryId: string; // NEW: Currently active story ID
  onSwitchStory: (storyId: string) => void; // NEW
  onCreateStory: (name: string, structure: string, copyFrom?: string) => Promise<void>; // NEW
  onDeleteStory?: (storyId: string) => void; // NEW
  // ... existing props
}

interface StoryListItem {
  id: string;
  name: string;
  structure: string;
  isActive: boolean;
  createdAt: string;
}
```

### 3. Project Page Updates

```tsx
// In projects/[id]/page.tsx

// State
const [stories, setStories] = useState<StoryListItem[]>([]);
const [activeStoryId, setActiveStoryId] = useState<string>('');

// Load all stories on mount
useEffect(() => {
  // Fetch stories list from API
}, []);

// Switch story handler
const handleSwitchStory = async (storyId: string) => {
  // 1. Save current story if dirty
  // 2. Call API to set new active story
  // 3. Load new story data
  // 4. Update state
};

// Create new story handler
const handleCreateStory = async (name: string, structure: string, copyFrom?: string) => {
  // 1. Call API to create new story
  // 2. If copyFrom, copy premise/synopsis
  // 3. Set as active story
  // 4. Refresh stories list
};

// Generate story handler (modified)
const handleGenerateSynopsis = async () => {
  // Generate story as before
  // But save to current active story version
  // Also auto-create new version if structure changed
};
```

---

## Implementation Phases

### Phase 1: Database & API (2-3 hours)
1. [ ] Create migration file for story_versions table
2. [ ] Run migration  
3. [ ] Modify GET /api/creator/projects/[id] to return stories list
4. [ ] Create POST /api/creator/projects/[id]/stories endpoint
5. [ ] Create PATCH /api/creator/projects/[id]/stories/[storyId] endpoint
6. [ ] Create POST .../activate endpoint
7. [ ] Test API with Postman/curl

### Phase 2: Frontend Basic (2-3 hours)
1. [ ] Add stories list state to project page
2. [ ] Add Story Selector dropdown to StoryArcStudio toolbar
3. [ ] Implement handleSwitchStory function
4. [ ] Add New Story button
5. [ ] Create NewStoryDialog component
6. [ ] Implement handleCreateStory function
7. [ ] Test basic flow: create story, switch, generate

### Phase 3: Generate Flow (1-2 hours)
1. [ ] Modify handleGenerateSynopsis to work with story versions
2. [ ] Auto-create new version when re-generating for same structure
3. [ ] OR: Ask user "Create new version or overwrite?"
4. [ ] Update UI to show generation saves to current version

### Phase 4: History & Polish (1-2 hours) - Optional
1. [ ] Add Story History sidebar/panel
2. [ ] Add delete story functionality
3. [ ] Add rename story functionality
4. [ ] Add timestamp display
5. [ ] Add "Compare versions" feature (future)

---

## Migration Script

```sql
-- File: scripts/migrate-story-versions.sql

-- Create story_versions table
CREATE TABLE IF NOT EXISTS story_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  project_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  version_name VARCHAR(255),
  is_active BOOLEAN DEFAULT FALSE,
  
  premise TEXT,
  synopsis TEXT,
  global_synopsis TEXT,
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  format VARCHAR(100),
  duration VARCHAR(100),
  tone VARCHAR(100),
  theme VARCHAR(255),
  conflict TEXT,
  target_audience VARCHAR(255),
  ending_type VARCHAR(100),
  structure VARCHAR(100),
  
  cat_beats JSONB DEFAULT '{}',
  hero_beats JSONB DEFAULT '{}',
  harmon_beats JSONB DEFAULT '{}',
  tension_levels JSONB DEFAULT '{}',
  want_need_matrix JSONB DEFAULT '{}',
  beat_characters JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Migrate existing stories data to story_versions
INSERT INTO story_versions (
  story_id, project_id, version_number, version_name, is_active,
  premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
  tone, theme, conflict, target_audience, ending_type, structure,
  cat_beats, hero_beats, harmon_beats, tension_levels, want_need_matrix, beat_characters,
  created_at, updated_at
)
SELECT 
  id, project_id, 1, 
  COALESCE(structure, 'Save the Cat') || ' v1' AS version_name,
  TRUE,
  premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
  tone, theme, conflict, target_audience, ending_type, structure,
  COALESCE(cat_beats, '{}'), COALESCE(hero_beats, '{}'), COALESCE(harmon_beats, '{}'),
  COALESCE(tension_levels, '{}'), COALESCE(want_need_matrix, '{}'), COALESCE(beat_characters, '{}'),
  created_at, updated_at
FROM stories
WHERE deleted_at IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_story_versions_story ON story_versions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_versions_project ON story_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_story_versions_active ON story_versions(story_id, is_active);
```

---

## Files to Create/Modify

### New Files
1. `scripts/migrate-story-versions.sql` - Database migration
2. `src/app/api/creator/projects/[id]/stories/route.ts` - Stories CRUD API
3. `src/app/api/creator/projects/[id]/stories/[storyId]/route.ts` - Single story API
4. `src/components/studio/NewStoryDialog.tsx` - Dialog component

### Modified Files
1. `src/app/api/creator/projects/[id]/route.ts` - Return stories list
2. `src/components/studio/StoryArcStudio.tsx` - Add story selector & handlers
3. `src/app/(dashboard)/projects/[id]/page.tsx` - Manage stories state
4. `src/types/project.ts` - Add StoryVersion type

---

## Estimated Total Time
- **Phase 1 (DB & API)**: 2-3 hours
- **Phase 2 (Frontend Basic)**: 2-3 hours
- **Phase 3 (Generate Flow)**: 1-2 hours
- **Phase 4 (Polish)**: 1-2 hours (optional)

**Total**: ~6-10 hours for full implementation

---

## Dependencies & Risks

1. **Data Migration**: Existing stories need to be migrated to story_versions
2. **API Compatibility**: Need to ensure backwards compatibility with existing code
3. **UI Complexity**: Story selector adds complexity to already busy toolbar
4. **Auto-save**: Need to ensure auto-save works correctly with versioning

---

## Questions to Confirm

1. Should re-generating story for SAME structure create a new version or overwrite?
2. Should version names be auto-generated or user-provided?
3. Is delete story functionality needed immediately?
4. Do we need "duplicate story" feature?
