# Implementation Plan: Character Detail Dropdowns with Gender-Conditional Options

## Overview
Update CharacterDeck.tsx to use dropdowns for character attributes that have predefined options, ensuring AI-generated values match dropdown options exactly.

## Current State
- CharacterDeck.tsx uses `MiniInput` (text input) for all character fields
- studio-options.ts already has dropdown options defined
- AI prompt (CHARACTER_PROMPT) is generic, doesn't specify valid options

## Tasks

### 1. Update studio-options.ts - Add Gender-Specific Hair Styles
**File:** `src/lib/studio-options.ts`

Add new exports:
```typescript
// Male-specific hair styles
export const MALE_HAIR_STYLE_OPTIONS = [
  { value: "short-buzz", label: "Buzz Cut" },
  { value: "short-crew", label: "Crew Cut" },
  { value: "short-fade", label: "Fade" },
  { value: "short-undercut", label: "Undercut" },
  { value: "medium-textured", label: "Textured Medium" },
  { value: "medium-slickback", label: "Slick Back" },
  { value: "long-straight", label: "Long Straight" },
  { value: "long-wavy", label: "Long Wavy" },
  { value: "curly-short", label: "Curly Short" },
  { value: "curly-medium", label: "Curly Medium" },
  { value: "afro", label: "Afro" },
  { value: "dreadlocks", label: "Dreadlocks" },
  { value: "mohawk", label: "Mohawk" },
  { value: "bald", label: "Bald" },
  { value: "receding", label: "Receding Hairline" },
];

// Female-specific hair styles
export const FEMALE_HAIR_STYLE_OPTIONS = [
  { value: "straight-short", label: "Straight Short" },
  { value: "straight-medium", label: "Straight Medium" },
  { value: "straight-long", label: "Straight Long" },
  { value: "wavy-short", label: "Wavy Short" },
  { value: "wavy-medium", label: "Wavy Medium" },
  { value: "wavy-long", label: "Wavy Long" },
  { value: "curly-short", label: "Curly Short" },
  { value: "curly-medium", label: "Curly Medium" },
  { value: "curly-long", label: "Curly Long" },
  { value: "pixie", label: "Pixie Cut" },
  { value: "bob", label: "Bob" },
  { value: "lob", label: "Lob (Long Bob)" },
  { value: "bun", label: "Bun" },
  { value: "ponytail", label: "Ponytail" },
  { value: "braids", label: "Braids" },
  { value: "afro", label: "Afro" },
];
```

### 2. Create MiniSelect Component in CharacterDeck.tsx
**File:** `src/components/studio/CharacterDeck.tsx`

Add MiniSelect component similar to MiniInput but with dropdown:
```typescript
const MiniSelect = ({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string; 
  value?: string; 
  onChange: (v: string) => void; 
  options: { value: string; label: string }[];
}) => (
  <div>
    <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold mb-1 block">{label}</Label>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="h-8 bg-white border-gray-200 text-gray-900 text-xs">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
```

### 3. Update Physiological Section with Dropdowns
**File:** `src/components/studio/CharacterDeck.tsx`

Replace MiniInput with MiniSelect for fields that have options:

| Field | Dropdown Options | Conditional |
|-------|-----------------|-------------|
| Gender | GENDER_OPTIONS | No |
| Ethnicity | ETHNICITY_OPTIONS | No |
| Skin Tone | SKIN_TONE_OPTIONS | No |
| Face Shape | FACE_SHAPE_OPTIONS | No |
| Eye Shape | EYE_SHAPE_OPTIONS | No |
| Eye Color | EYE_COLOR_OPTIONS | No |
| Nose Shape | NOSE_SHAPE_OPTIONS | No |
| Lips Shape | LIPS_SHAPE_OPTIONS | No |
| Hair Style | MALE/FEMALE_HAIR_STYLE_OPTIONS | Yes - based on gender |
| Hair Color | HAIR_COLOR_OPTIONS | No |
| Hijab | HIJAB_OPTIONS | Yes - only show if female |
| Body Type | BODY_TYPE_OPTIONS | No |
| Height | HEIGHT_OPTIONS | No |
| Uniqueness | Text Input (freeform) | No |

### 4. Update CHARACTER_PROMPT with Valid Options
**File:** `src/lib/ai/prompts.ts`

Update prompt to specify exact values AI should return:

```typescript
export const CHARACTER_PROMPT = `You are a character designer. Create a detailed character profile.

Character Name: {name}
Role: {role}
Story Context: {context}

Generate a comprehensive character profile in JSON format.

IMPORTANT: Use ONLY these exact values for each field:

Gender: "male", "female", "non-binary"
Ethnicity: "asian-east", "asian-southeast", "asian-south", "middle-eastern", "african", "caucasian", "latino", "mixed", "fantasy"
Skin Tone: "very-fair", "fair", "light", "medium", "tan", "olive", "brown", "dark-brown", "dark"
Face Shape: "oval", "round", "square", "heart", "oblong", "diamond", "triangle"
Eye Shape: "almond", "round", "monolid", "hooded", "upturned", "downturned", "wide-set", "close-set"
Eye Color: "brown", "dark-brown", "hazel", "green", "blue", "gray", "amber", "black", "heterochromia"
Nose Shape: "straight", "button", "roman", "wide", "narrow", "upturned", "flat"
Lips Shape: "full", "thin", "heart", "wide", "bow", "round"
Hair Color: "black", "dark-brown", "brown", "light-brown", "auburn", "red", "ginger", "blonde", "platinum", "gray", "white", "blue", "purple", "pink", "green", "ombre", "highlights"
Body Type: "slim", "athletic", "average", "muscular", "curvy", "plus-size", "petite", "tall"
Height: "very-short", "short", "average", "tall", "very-tall"
Hijab (for female only): "none", "simple", "pashmina", "turban", "khimar", "niqab", "sport"

Hair Style for MALE: "short-buzz", "short-crew", "short-fade", "short-undercut", "medium-textured", "medium-slickback", "long-straight", "long-wavy", "curly-short", "curly-medium", "afro", "dreadlocks", "mohawk", "bald", "receding"
Hair Style for FEMALE: "straight-short", "straight-medium", "straight-long", "wavy-short", "wavy-medium", "wavy-long", "curly-short", "curly-medium", "curly-long", "pixie", "bob", "lob", "bun", "ponytail", "braids", "afro"

Return JSON:
{
  "physiological": {
    "age": "25",
    "gender": "<exact value from list>",
    "ethnicity": "<exact value from list>",
    "skinTone": "<exact value from list>",
    "faceShape": "<exact value from list>",
    "eyeShape": "<exact value from list>",
    "eyeColor": "<exact value from list>",
    "noseShape": "<exact value from list>",
    "lipsShape": "<exact value from list>",
    "hairStyle": "<exact value from list based on gender>",
    "hairColor": "<exact value from list>",
    "hijab": "<exact value if female, omit if male>",
    "bodyType": "<exact value from list>",
    "height": "<exact value from list>",
    "uniqueness": "<free text describing unique features>"
  },
  "psychological": {
    "archetype": "<character archetype>",
    "personalityType": "<MBTI type>",
    "fears": "<main fear>",
    "wants": "<external desire>",
    "needs": "<internal need>",
    "alterEgo": "<hidden self>",
    "traumatic": "<past trauma>"
  },
  "swot": {
    "strength": "<main strength>",
    "weakness": "<main weakness>",
    "opportunity": "<growth opportunity>",
    "threat": "<main threat/vulnerability>"
  },
  "clothingStyle": "<casual, formal, traditional, etc>",
  "accessories": ["item1", "item2"],
  "personalityTraits": ["trait1", "trait2", "trait3"]
}`;
```

### 5. Fields Summary
| Field | Type | Options Source |
|-------|------|----------------|
| Gender | Dropdown | GENDER_OPTIONS |
| Age | Input | Freeform |
| Ethnicity | Dropdown | ETHNICITY_OPTIONS |
| Skin Tone | Dropdown | SKIN_TONE_OPTIONS |
| Face Shape | Dropdown | FACE_SHAPE_OPTIONS |
| Eye Shape | Dropdown | EYE_SHAPE_OPTIONS |
| Eye Color | Dropdown | EYE_COLOR_OPTIONS |
| Nose Shape | Dropdown | NOSE_SHAPE_OPTIONS |
| Lips Shape | Dropdown | LIPS_SHAPE_OPTIONS |
| Hair Style | Dropdown | MALE/FEMALE based on gender |
| Hair Color | Dropdown | HAIR_COLOR_OPTIONS |
| Hijab | Dropdown (female only) | HIJAB_OPTIONS |
| Body Type | Dropdown | BODY_TYPE_OPTIONS |
| Height | Dropdown | HEIGHT_OPTIONS |
| Uniqueness | Input | Freeform |
| Archetype | Dropdown | ARCHETYPE_OPTIONS (new) |
| Personality Type | Input | MBTI freeform |
| Fears/Wants/Needs | Input | Freeform |

### Execution Order
1. Update `studio-options.ts` with gender-specific hair styles
2. Update `prompts.ts` with exact value constraints
3. Update `CharacterDeck.tsx`:
   - Add MiniSelect component
   - Import all options from studio-options.ts
   - Replace MiniInput with MiniSelect for dropdown fields
   - Add conditional logic for gender-based options
