# Story-Character Linking Feature Plan

## Overview
Link stories with specific characters and lock structure type at creation time.

## Current Flow
- Create story version → only version name
- Can switch structure type (Hero's Journey / Save the Cat / Dan Harmon) anytime via dropdown
- No connection to characters

## New Flow
1. **Create New Story Modal**:
   - Story Name (required) - user names their story/episode
   - Select Characters (multi-select from project characters)
   - Select Structure Type (Hero's Journey / Save the Cat / Dan Harmon) - LOCKED after creation
   - Create button

2. **Story Display**:
   - Show story name prominently
   - Show selected characters as pills/badges
   - Structure type shown but NOT changeable (no dropdown)
   - To use different structure = create new story

3. **Episode Support**:
   - Each story is essentially an episode
   - Can create 100+ episodes per project
   - Each episode can have different characters and structure

## Database Changes

### story_versions table additions:
```sql
ALTER TABLE story_versions ADD COLUMN character_ids TEXT[] DEFAULT '{}';
ALTER TABLE story_versions ADD COLUMN episode_number INTEGER DEFAULT 1;
```

### Alternatively, create junction table:
```sql
CREATE TABLE story_version_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_version_id UUID REFERENCES story_versions(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    role TEXT, -- protagonist, antagonist, supporting
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(story_version_id, character_id)
);
```

## UI Changes

### 1. Create Story Modal (New)
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Story / Episode</DialogTitle>
    </DialogHeader>
    
    {/* Story Name */}
    <Input 
      placeholder="Episode 1: The Beginning..."
      value={storyName}
      onChange={(e) => setStoryName(e.target.value)}
    />
    
    {/* Character Multi-Select */}
    <div>
      <Label>Select Characters</Label>
      <div className="grid grid-cols-3 gap-2">
        {characters.map(char => (
          <Checkbox 
            key={char.id}
            checked={selectedCharacters.includes(char.id)}
            onCheckedChange={() => toggleCharacter(char.id)}
          >
            {char.name} ({char.role})
          </Checkbox>
        ))}
      </div>
    </div>
    
    {/* Structure Type - One-time selection */}
    <RadioGroup value={structureType} onValueChange={setStructureType}>
      <RadioGroupItem value="hero-journey">Hero's Journey (12 steps)</RadioGroupItem>
      <RadioGroupItem value="save-the-cat">Save the Cat (15 beats)</RadioGroupItem>
      <RadioGroupItem value="dan-harmon">Dan Harmon Story Circle (8 steps)</RadioGroupItem>
    </RadioGroup>
    
    <Button onClick={handleCreate}>Create Story</Button>
  </DialogContent>
</Dialog>
```

### 2. StoryArcStudio Changes
- Remove structure type dropdown (only show as label)
- Show selected characters at top
- AI generation uses the LOCKED structure type from story_versions.structure_type

### 3. Story Version Selector
- Shows: "Episode 1: The Beginning (Hero's Journey) - 3 characters"
- Clear indication of structure and character count

## API Changes

### POST /api/creator/projects/[id]/stories
Body now includes:
```json
{
  "versionName": "Episode 1: The Beginning",
  "structureType": "hero-journey",
  "characterIds": ["uuid1", "uuid2", "uuid3"]
}
```

### GET /api/creator/projects/[id]/stories
Returns:
```json
{
  "stories": [
    {
      "id": "...",
      "versionName": "Episode 1: The Beginning",
      "structureType": "hero-journey",
      "characterIds": ["uuid1", "uuid2"],
      "characters": [
        { "id": "uuid1", "name": "Gatotkaca", "role": "protagonist" },
        { "id": "uuid2", "name": "Antasena", "role": "antagonist" }
      ],
      ...
    }
  ]
}
```

## Implementation Steps

### Phase 1: Database Migration
1. Add `structure_type` column to story_versions (if not exists)
2. Add `character_ids` TEXT[] column to story_versions
3. Create migration script

### Phase 2: API Updates
1. Update POST stories to accept structureType and characterIds
2. Update GET stories to include character details
3. Ensure structure_type is immutable after creation

### Phase 3: UI - Create Story Modal
1. Create CreateStoryModal component
2. Character multi-select with search
3. Structure type radio buttons
4. Validation (name required, at least 1 character)

### Phase 4: UI - StoryArcStudio Updates
1. Remove structure type dropdown
2. Display structure type as badge/label
3. Show selected characters
4. Update generation to use story's structure_type

### Phase 5: Testing
1. Create story with characters
2. Verify structure locked
3. Verify AI generation uses correct structure
4. Test with 100+ characters

## Timeline Estimate
- Phase 1: 15 minutes
- Phase 2: 30 minutes  
- Phase 3: 45 minutes
- Phase 4: 30 minutes
- Phase 5: 15 minutes
- Total: ~2.5 hours

## Start?
Ready to implement? Say "yes" to begin with Phase 1.
