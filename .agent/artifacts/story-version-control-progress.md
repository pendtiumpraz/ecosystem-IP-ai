# Story Version Control - Progress Summary

## ✅ Completed

### Phase 1: Database & API
1. ✅ Created migration script: `scripts/migrate-story-versions.sql`
   - `story_versions` table with soft delete support
   - Migration from existing stories data
   - Proper indexes

2. ✅ Created API endpoints:
   - `GET /api/creator/projects/[id]/stories` - List all story versions
   - `POST /api/creator/projects/[id]/stories` - Create new story version
   - `GET /api/creator/projects/[id]/stories/[versionId]` - Get single version
   - `PATCH /api/creator/projects/[id]/stories/[versionId]` - Update version / Activate
   - `DELETE /api/creator/projects/[id]/stories/[versionId]` - Soft delete version

### Phase 2: Frontend Components
3. ✅ Created `NewStoryDialog.tsx` component
   - Structure selection
   - Copy from existing option
   - Duplicate toggle

4. ✅ Updated `StoryArcStudio.tsx`
   - Added `HARMON_BEATS` for Dan Harmon Story Circle
   - Fixed `getBeatsConfig()` to return correct beats for all structures
   - Fixed `getBeatsFieldName()` for heroBeats, harmonBeats, catBeats
   - Added Synopsis UI
   - Story selector already exists in toolbar
   - New Story button already exists

---

## 🔄 In Progress / Next Steps

### Phase 3: Project Page Integration (Next)

**Location:** `src/app/(dashboard)/projects/[id]/page.tsx`

**Tasks:**
1. Add state for story versions:
```tsx
const [storyVersions, setStoryVersions] = useState<StoryVersionListItem[]>([]);
const [activeVersionId, setActiveVersionId] = useState<string>('');
const [showNewStoryDialog, setShowNewStoryDialog] = useState(false);
const [isCreatingStory, setIsCreatingStory] = useState(false);
```

2. Add fetch for story versions in loadProject:
```tsx
// After loading project
const storiesRes = await fetch(`/api/creator/projects/${projectId}/stories`);
if (storiesRes.ok) {
  const storiesData = await storiesRes.json();
  setStoryVersions(storiesData.versions);
  if (storiesData.activeVersion) {
    setActiveVersionId(storiesData.activeVersion.id);
    setStory(mapVersionToLocalStory(storiesData.activeVersion));
  }
}
```

3. Add handlers:
```tsx
const handleSwitchStory = async (versionId: string) => {
  // Save current if dirty
  // Call PATCH to activate new version
  // Load new version data
};

const handleCreateNewStory = async (params) => {
  // Call POST to create new version
  // Set as active
  // Refresh list
};

const handleDeleteStory = async (versionId: string) => {
  // Call DELETE
  // Refresh list
};
```

4. Modify handleGenerateSynopsis to create new version:
```tsx
const handleGenerateSynopsis = async () => {
  // Create new version first (for version control)
  // Then generate and save to that version
};
```

5. Update StoryArcStudio props:
```tsx
<StoryArcStudio
  story={story}
  stories={storyVersions.map(v => ({ id: v.id, name: v.versionName }))}
  selectedStoryId={activeVersionId}
  onSelectStory={handleSwitchStory}
  onNewStory={() => setShowNewStoryDialog(true)}
  // ... other props
/>
```

6. Add NewStoryDialog:
```tsx
<NewStoryDialog
  open={showNewStoryDialog}
  onOpenChange={setShowNewStoryDialog}
  existingVersions={storyVersions}
  onCreateStory={handleCreateNewStory}
  isCreating={isCreatingStory}
/>
```

---

## 🔲 Future Phases

### Phase 4: Generate Flow (re-generate creates new version)
- Modify `handleGenerateSynopsis` to:
  1. Create new version automatically
  2. Generate content
  3. Save to new version
  4. Update UI

### Phase 5: History & Polish
- Story history sidebar
- Compare versions
- Restore deleted versions

---

## Database Migration Required

Before testing, run:
```bash
psql $DATABASE_URL < scripts/migrate-story-versions.sql
```

Or via Neon Console.

---

## Files Created/Modified

### New Files:
- `scripts/migrate-story-versions.sql`
- `src/app/api/creator/projects/[id]/stories/route.ts`
- `src/app/api/creator/projects/[id]/stories/[versionId]/route.ts`
- `src/components/studio/NewStoryDialog.tsx`

### Modified Files:
- `src/components/studio/StoryArcStudio.tsx` (HARMON_BEATS, Synopsis, fixes)
- `src/lib/ai-generation.ts` (maxTokens per type)

### Pending Modifications:
- `src/app/(dashboard)/projects/[id]/page.tsx` (story versions integration)
