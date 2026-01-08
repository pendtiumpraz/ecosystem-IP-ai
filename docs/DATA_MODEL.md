# IP AI - Data Model Documentation

## Overview

This document describes the data relationships in the IP AI ecosystem platform.

## Entity Relationships

```
Project
  ├── Characters[]              # Multiple characters per project
  │
  └── StoryVersions[]           # Multiple story versions per project
        │
        ├── character_ids[]     # Selected characters for this story version
        │
        ├── Universe            # 1 Universe per story version
        │   └── Based on selected characters and story context
        │
        └── Moodboard           # 1 Moodboard per story version
            │
            └── Items[]         # Beats × Key Actions (e.g., 12 beats × 7 = 84 items)
                ├── Key Action Description
                ├── Characters Involved
                ├── Universe Level (location context)
                ├── Image Prompt (YAML format)
                └── Generated Image URL
```

## Story Structure Types

The system supports three story structure formats:

| Structure Type | DB Value | Beat Count |
|---------------|----------|------------|
| Dan Harmon Story Circle | `harmon`, `dan-harmon`, `story-circle` | 8 beats |
| Save the Cat | `savethecat`, `save_the_cat`, `save-the-cat` | 15 beats |
| Hero's Journey | `herosjourney`, `heros_journey`, `hero-journey` | 12 beats |

## Database Tables

### `projects`
- `id` (PK)
- `title`, `description`, `genre`
- `universe_formula_id` (deprecated - use universes table)

### `characters`
- `id` (PK)
- `project_id` (FK → projects)
- `name`, `role`, `backstory`, `image_url`
- `deleted_at` (soft delete)

### `story_versions`
- `id` (PK)
- `project_id` (FK → projects)
- `version_name`
- `structure_type` (harmon/hero-journey/save-the-cat)
- `hero_beats`, `cat_beats`, `harmon_beats` (JSONB)
- `character_ids[]` (selected characters)
- `deleted_at` (soft delete)

### `universe_versions`
- `id` (PK)
- `story_version_id` (FK → story_versions)
- `project_id` (FK → projects)
- `universe_name`, `period`
- `room_cave`, `house_castle`, `private_interior` (Level 1)
- `family_inner_circle` (Level 2)
- `neighborhood_environment` (Level 3)
- `town_district_city`, `working_office_school` (Level 4)
- `country`, `government_system` (Level 5)
- `labor_law`, `rules_of_work` (Level 6)
- `society_and_system`, `sociocultural_system` (Level 7)
- `environment_landscape`, `sociopolitic_economy`, `kingdom_tribe_communal` (Level 8)

### `moodboards`
- `id` (PK)
- `project_id` (FK → projects)
- `story_version_id` (FK → story_versions)
- `art_style` (realistic/anime/ghibli/disney/comic/noir)
- `key_action_count` (3-10, default 7)
- `deleted_at` (soft delete)

### `moodboard_items`
- `id` (PK)
- `moodboard_id` (FK → moodboards)
- `beat_key`, `beat_label`, `beat_content`
- `beat_index`, `key_action_index`
- `key_action_description`
- `characters_involved[]`
- `universe_level`
- `prompt`, `negative_prompt`
- `image_url`, `video_url`
- `status` (empty/has_description/has_prompt/has_image/has_video)

## Moodboard Workflow

1. **Select Story Version** - Choose which story version to create moodboard for
2. **Create Moodboard** - Initialize with art style and key action count
3. **Generate Key Actions** - AI generates descriptions for each beat's key actions
4. **Generate Prompts** - AI generates YAML image prompts from descriptions
5. **Generate Images** - Create images from prompts with character consistency
6. **Edit & Refine** - User can manually edit any field

## API Endpoints

### Moodboard
- `GET /api/creator/projects/[id]/moodboard?storyVersionId=xxx`
- `POST /api/creator/projects/[id]/moodboard` (create)
- `PATCH /api/creator/projects/[id]/moodboard` (update settings)
- `DELETE /api/creator/projects/[id]/moodboard?moodboardId=xxx`

### Moodboard Generation
- `POST /api/creator/projects/[id]/moodboard/generate` (key actions/prompts)
- `POST /api/creator/projects/[id]/moodboard/clear` (clear data)
- `GET /api/creator/projects/[id]/moodboard/prerequisites` (check requirements)

### Moodboard Items
- `PATCH /api/creator/projects/[id]/moodboard/items/[itemId]` (update item)
