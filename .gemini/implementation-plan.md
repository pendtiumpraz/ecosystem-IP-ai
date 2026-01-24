# 📋 MODO Studio Apps - Implementation Plan
## Story Formula Enhancement

**Berdasarkan: MODO Conceptual Deck (Slide 9-11) + Current Codebase Analysis**

---

## 🔍 Detailed Gap Analysis

### Slide 9: Premise, Synopsis & Global Synopsis

#### Current Implementation:
```
┌─────────────────────────────────────────────────┐
│ Premise/Logline                     [Generate]  │
│ ┌─────────────────────────────────────────────┐ │
│ │ (single textarea)                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Synopsis                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ (single textarea)                           │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

- Hanya Premise dan Synopsis
- Tidak ada "Global Synopsis" 
- Tidak ada preference input sebelum generate
- Tidak ada edit button (hanya generate)
```

#### Deck Requirement (Slide 9):
```
┌─────────────────────────────────────────────────────────────────┐
│ PREMISE                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (textarea)                                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                   [generate][edit]│
│                                                                  │
│ SYNOPSIS                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (textarea - multiple lines)                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                   [generate][edit]│
│ ┌────────────────────────────────────────────────────────────── │
│ │ preference input                                              │ │
│ │ "saya ingin synopsis untuk standar film festival cannes      │ │
│ │  tetapi dengan sentuhan lokal, buat endingnya bittersweet    │ │
│ │  dan twisted"                                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ GLOBAL SYNOPSIS ⭐ (NEW!)                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (textarea - larger, for series/franchise overview)          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                   [generate][edit]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ preference input                                              │ │
│ │ "tuliskan dengan lebih dramatis dan dark seperti            │ │
│ │  cliffhanger, referensi film The God Father, jangan terlalu │ │
│ │  kaku untuk market bioskop indonesia"                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Gap Summary Slide 9:
| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Premise dengan generate+edit | ✅ Generate saja | Generate + Edit | 🔄 Enhance |
| Synopsis dengan generate+edit+preference | ❌ Basic | Full | 🔄 Enhance |
| Global Synopsis | ❌ Tidak ada | Ada dengan preference | ❌ New |
| Preference input per field | ❌ Tidak ada | Ada untuk synopsis & global | ❌ New |

---

### Slide 10: Want/Need Matrix & Ending Type

#### Current Implementation:
```typescript
// StoryArcStudio.tsx - Line 51-56
wantNeedMatrix?: {
    want?: { external?: string; known?: string; specific?: string; achieved?: string };
    need?: { internal?: string; unknown?: string; universal?: string; achieved?: string };
};

// Display: Simple grid showing text values
// Ending types: ['Happy', 'Tragic', 'Open'] - basic buttons (StoryFormulaTab.tsx)
```

**Current UI (display only, not interactive):**
- Want: External | Known | Specific | Achieved (text display)
- Need: Internal | Unknown | Universal | Achieved (text display)
- Ending: Happy | Tragic | Open (3 buttons)

#### Deck Requirement (Slide 10):
```
┌────────────────────────────────────────────────────────────────────────┐
│                         WANT (4 Stages)                                 │
│ ┌────────────┬────────────┬────────────┬────────────┐                  │
│ │Menginginkan│Memastikan  │Mengejar    │Tercapai    │  → ending type   │
│ │(textarea)  │(textarea)  │(textarea)  │(textarea)  │                  │
│ └────────────┴────────────┴────────────┴────────────┘  ┌────────────┐  │
│                                                         │ Thematic   │  │
│                         NEED (4 Stages)                 ├────────────┤  │
│ ┌────────────┬────────────┬────────────┬────────────┐  │ Classical  │  │
│ │Merasakan   │Menyadari   │Menerima    │Terpenuhi   │  ├────────────┤  │
│ │(textarea)  │(textarea)  │(textarea)  │(textarea)  │  │ Hollow     │  │
│ └────────────┴────────────┴────────────┴────────────┘  ├────────────┤  │
│                                                         │ Tragic     │  │
│                              ↓                          ├────────────┤  │
│                   ┌─────────────────────┐              │Transcendent│  │
│                   │ ENDING TYPE MATRIX  │              ├────────────┤  │
│                   └─────────────────────┘              │ Ambiguous  │  │
│                                                         └────────────┘  │
│ ┌──────────────────────────────────────────────────────────────────────┐
│ │           THE MATRIX CALCULATION                                     │
│ ├──────┬──────┬────────────────┬─────────────────────────┐             │
│ │ WANT │ NEED │ Tipe Ending    │ Rasa                    │             │
│ ├──────┼──────┼────────────────┼─────────────────────────┤             │
│ │  ✓   │  ✓   │ Thematic       │ Pahit-manis/Bitter Sweet│             │
│ │  ✓   │  ✓   │ Classical      │ Puas/Happy Ending       │             │
│ │  ✓   │  ✗   │ Hollow         │ Gelisah                 │             │
│ │  ✗   │  ✗   │ Tragic         │ Muram                   │             │
│ │Dilepas│ ✓   │ Transcendental │ Tenang                  │             │
│ │  ✗   │  ✓   │ Ambiguous      │ Reflektif               │             │
│ └──────┴──────┴────────────────┴─────────────────────────┘             │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ preference: "Saya ingin film ini ditujukan penonton indonesia      ││
│ │             di bioskop"                                             ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                    [preference][generate]│
└────────────────────────────────────────────────────────────────────────┘
```

### Gap Summary Slide 10:
| Feature | Current | Required | Status |
|---------|---------|----------|--------|
| Want stages (4 stage progression) | ❌ Format salah | Menginginkan→Memastikan→Mengejar→Tercapai | ❌ Redesign |
| Need stages (4 stage progression) | ❌ Format salah | Merasakan→Menyadari→Menerima→Terpenuhi | ❌ Redesign |
| Want/Need sebagai text per stage | ❌ Label saja | Textarea per stage | ❌ Redesign |
| 5 Ending Types | ⚠️ 3 basic | Classical/Hollow/Tragic/Transcendent/Ambiguous | 🔄 Enhance |
| Matrix calculation (Want✓/✗ + Need✓/✗) | ❌ Tidak ada | Auto-calculate ending dari matrix | ❌ New |
| Rasa/Feeling output | ❌ Tidak ada | Pahit-manis, Muram, Gelisah, dll | ❌ New |
| Preference input | ❌ Tidak ada | Ada untuk target audience | ❌ New |

---

### Slide 11: Story Structure/Beats & Sceneplot

#### Current Implementation:
- Story Structure: Save the Cat, Hero's Journey, Dan Harmon ✅
- Missing: Three Act, Freytag's Pyramid, Custom
- Key Actions: Per beat dalam moodboard (baru diintegrate ke story)
- Sceneplot: ❌ Tidak ada

#### Deck Requirement:
```
┌───────────────────────────────────────────────────────────────────────┐
│ STORY STRUCTURE/BEATS                                                  │
│ ┌──────────┬──────────────────┬─────────────────┐                      │
│ │Save The  │ Three Act        │                 │                      │
│ │Cat       │                  │                 │  [generate]          │
│ ├──────────┼──────────────────┼─────────────────┤                      │
│ │Heroes    │ Freytag's        │                 │                      │
│ │Journey   │ Pyramid          │                 │  [edit]              │
│ ├──────────┼──────────────────┼─────────────────┤                      │
│ │Dan       │ Custom           │                 │                      │
│ │Harmon    │                  │                 │                      │
│ └──────────┴──────────────────┴─────────────────┘                      │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ (Beat content textarea)                                              ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ KEY ACTION 1 ┌────────────────────────────────────────────────────────┐│
│              │                                                         ││
│ KEY ACTION 2 ├────────────────────────────────────────────────────────┤│
│              │                                                         ││
│ KEY ACTION 3 ├────────────────────────────────────────────────────────┤│
│              │                                                         ││
│              └────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────┘

                              ↓

┌───────────────────────────────────────────────────────────────────────┐
│ SCENEPLOT ⭐ (NEW!)                                                    │
│                                                                         │
│ ┌────────────────────────┬────────────────────────┐                    │
│ │      SCENE 01          │      SCENE 02          │                    │
│ ├────────────────────────┼────────────────────────┤                    │
│ │ Shot 1: ~~~~~~~~~~~~   │ Shot 1: ~~~~~~~~~~~~   │                    │
│ │         ~~~~~~~~~~~~   │         ~~~~~~~~~~~~   │                    │
│ ├────────────────────────┼────────────────────────┤                    │
│ │ Shot 2: ~~~~~~~~~~~~   │ Shot 2: ~~~~~~~~~~~~   │                    │
│ │         ~~~~~~~~~~~~   │         ~~~~~~~~~~~~   │                    │
│ ├────────────────────────┼────────────────────────┤                    │
│ │ Shot 3: ~~~~~~~~~~~~   │ Shot 3: ~~~~~~~~~~~~   │                    │
│ │         ~~~~~~~~~~~~   │         ~~~~~~~~~~~~   │                    │
│ └────────────────────────┴────────────────────────┘                    │
│                                                                         │
│                                                    [generate]   [edit]  │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ preference: "saya ingin shotnya untuk standar film festival cannes" ││
│ └─────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Implementation Plan - Detailed

### Phase 1: Premise, Synopsis & Global Synopsis Enhancement

#### 1.1 Database Schema Changes
**File: `scripts/add-story-formula-v2.sql`**

```sql
-- Add new columns to story_versions table
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS premise_preference TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS synopsis_preference TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis_preference TEXT;
```

#### 1.2 Interface Updates
**File: `src/components/studio/StoryArcStudio.tsx`**

Update `StoryData` interface:
```typescript
export interface StoryData {
    premise: string;
    premisePreference?: string; // NEW
    synopsis?: string;
    synopsisPreference?: string; // NEW
    globalSynopsis?: string; // NEW
    globalSynopsisPreference?: string; // NEW
    // ... rest
}
```

#### 1.3 UI Component - Story DNA Panel Enhancement
**File: `src/components/studio/StoryArcStudio.tsx`**

Redesign Story DNA Panel:
```tsx
{/* PREMISE SECTION */}
<div className="space-y-2">
    <div className="flex items-center justify-between">
        <Label>Premise / Logline</Label>
        <div className="flex gap-1">
            <Button onClick={onGeneratePremise}>
                <Sparkles /> Generate
            </Button>
            <Button variant="ghost" onClick={() => setEditingPremise(!editingPremise)}>
                <Edit3 /> Edit
            </Button>
        </div>
    </div>
    <Textarea 
        value={story.premise} 
        onChange={...} 
        disabled={!editingPremise}
    />
</div>

{/* SYNOPSIS SECTION */}
<div className="space-y-2">
    <div className="flex items-center justify-between">
        <Label>Synopsis</Label>
        <div className="flex gap-1">
            <Button onClick={() => handleGenerateSynopsis()}>
                <Sparkles /> Generate
            </Button>
            <Button variant="ghost">
                <Edit3 /> Edit
            </Button>
        </div>
    </div>
    <Textarea value={story.synopsis} onChange={...} />
    
    {/* Preference Input - NEW */}
    <div className="mt-2">
        <Label className="text-xs text-gray-500">Preference (opsional)</Label>
        <Textarea
            value={story.synopsisPreference || ''}
            onChange={(e) => onUpdate({ synopsisPreference: e.target.value })}
            placeholder="saya ingin synopsis untuk standar film festival cannes, tetapi dengan sentuhan lokal, buat endingnya bittersweet..."
            className="text-xs h-16"
        />
    </div>
</div>

{/* GLOBAL SYNOPSIS SECTION - NEW */}
<div className="space-y-2">
    <div className="flex items-center justify-between">
        <Label>Global Synopsis</Label>
        <div className="flex gap-1">
            <Button onClick={() => handleGenerateGlobalSynopsis()}>
                <Sparkles /> Generate
            </Button>
            <Button variant="ghost">
                <Edit3 /> Edit
            </Button>
        </div>
    </div>
    <Textarea 
        value={story.globalSynopsis || ''} 
        onChange={(e) => onUpdate({ globalSynopsis: e.target.value })}
        placeholder="Overview cerita untuk series/franchise..."
        className="min-h-[120px]"
    />
    
    {/* Preference Input */}
    <div className="mt-2">
        <Label className="text-xs text-gray-500">Preference (opsional)</Label>
        <Textarea
            value={story.globalSynopsisPreference || ''}
            onChange={(e) => onUpdate({ globalSynopsisPreference: e.target.value })}
            placeholder="tuliskan dengan lebih dramatis dan dark seperti cliffhanger, referensi film The God Father..."
            className="text-xs h-16"
        />
    </div>
</div>
```

#### 1.4 API Changes
**File: `src/app/api/creator/projects/[id]/stories/[versionId]/route.ts`**

Add support for new fields in PATCH:
```typescript
// Add to updateable fields
const {
    globalSynopsis,
    premisePreference,
    synopsisPreference,
    globalSynopsisPreference,
    // ...existing
} = body;
```

**File: `src/lib/ai-generation.ts`**

Add global synopsis generation with preference:
```typescript
export async function generateGlobalSynopsis(params: {
    premise: string;
    synopsis: string;
    characters: Character[];
    preference?: string; // User's preference for generation
}): Promise<string> {
    const prompt = `
    Generate a comprehensive global synopsis for a series/franchise.
    
    Premise: ${params.premise}
    Episode/Movie Synopsis: ${params.synopsis}
    Main Characters: ${params.characters.map(c => c.name).join(', ')}
    
    ${params.preference ? `User Preference: ${params.preference}` : ''}
    
    Write a compelling global synopsis that covers:
    1. The overarching story across multiple episodes/movies
    2. Character development arcs
    3. Major conflicts and resolutions
    4. Thematic elements
    `;
    
    return await generateText(prompt);
}
```

---

### Phase 2: Want/Need Matrix Redesign

#### 2.1 Database Schema Changes
**File: `scripts/add-want-need-matrix-v2.sql`**

```sql
-- New Want/Need Matrix structure
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

-- Ending type calculation
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_type VARCHAR(50);
-- Values: 'thematic', 'classical', 'hollow', 'tragic', 'transcendental', 'ambiguous'

ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_feeling VARCHAR(100);
-- Values: 'pahit-manis', 'puas-happy-ending', 'gelisah', 'muram', 'tenang', 'reflektif'

ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS want_need_preference TEXT;
```

#### 2.2 Interface Updates
**File: `src/components/studio/StoryArcStudio.tsx`**

```typescript
export interface StoryData {
    // ... existing
    
    // NEW Want/Need Matrix V2
    wantStages?: {
        menginginkan: string;  // What protagonist desires
        memastikan: string;    // How they confirm/validate
        mengejar: string;      // How they pursue
        tercapai: boolean | null; // Achieved? true/false/null(released)
    };
    needStages?: {
        merasakan: string;     // What they feel internally
        menyadari: string;     // What they realize
        menerima: string;      // What they accept
        terpenuhi: boolean | null; // Fulfilled? true/false/null
    };
    endingType?: 'thematic' | 'classical' | 'hollow' | 'tragic' | 'transcendental' | 'ambiguous';
    endingFeeling?: string;
    wantNeedPreference?: string;
}
```

#### 2.3 New Component - Want/Need Matrix V2
**File: `src/components/studio/WantNeedMatrixV2.tsx`** (NEW)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Check, X, Minus } from 'lucide-react';

interface WantNeedMatrixV2Props {
    wantStages: {
        menginginkan: string;
        memastikan: string;
        mengejar: string;
        tercapai: boolean | null;
    };
    needStages: {
        merasakan: string;
        menyadari: string;
        menerima: string;
        terpenuhi: boolean | null;
    };
    endingType?: string;
    endingFeeling?: string;
    preference?: string;
    onUpdate: (updates: any) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

const ENDING_MATRIX = [
    { want: true, need: true, type: 'thematic', feeling: 'Pahit-manis / Bittersweet' },
    { want: true, need: true, type: 'classical', feeling: 'Puas / Happy Ending' },
    { want: true, need: false, type: 'hollow', feeling: 'Gelisah' },
    { want: false, need: false, type: 'tragic', feeling: 'Muram' },
    { want: 'released', need: true, type: 'transcendental', feeling: 'Tenang' },
    { want: false, need: true, type: 'ambiguous', feeling: 'Reflektif' },
];

export function WantNeedMatrixV2({
    wantStages,
    needStages,
    endingType,
    endingFeeling,
    preference,
    onUpdate,
    onGenerate,
    isGenerating
}: WantNeedMatrixV2Props) {
    
    // Calculate ending type from matrix
    useEffect(() => {
        const wantAchieved = wantStages.tercapai;
        const needFulfilled = needStages.terpenuhi;
        
        let calculated = ENDING_MATRIX.find(m => {
            if (m.want === 'released') {
                return wantAchieved === null && m.need === needFulfilled;
            }
            return m.want === wantAchieved && m.need === needFulfilled;
        });
        
        if (calculated && calculated.type !== endingType) {
            onUpdate({ 
                endingType: calculated.type, 
                endingFeeling: calculated.feeling 
            });
        }
    }, [wantStages.tercapai, needStages.terpenuhi]);
    
    return (
        <div className="space-y-4">
            {/* WANT STAGES */}
            <Card className="p-4 border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500 rounded-lg">
                        <Target className="h-4 w-4 text-white" />
                    </div>
                    <Label className="text-sm font-bold text-blue-700">
                        WANT (External Goal)
                    </Label>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                    {/* Stage 1: Menginginkan */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-blue-600 font-semibold">
                            1. Menginginkan
                        </Label>
                        <Textarea
                            value={wantStages.menginginkan}
                            onChange={(e) => onUpdate({ 
                                wantStages: { ...wantStages, menginginkan: e.target.value } 
                            })}
                            placeholder="Apa yang diinginkan protagonis?"
                            className="h-20 text-xs"
                        />
                    </div>
                    
                    {/* Stage 2: Memastikan */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-blue-600 font-semibold">
                            2. Memastikan
                        </Label>
                        <Textarea
                            value={wantStages.memastikan}
                            onChange={(e) => onUpdate({ 
                                wantStages: { ...wantStages, memastikan: e.target.value } 
                            })}
                            placeholder="Bagaimana mereka memvalidasi keinginan?"
                            className="h-20 text-xs"
                        />
                    </div>
                    
                    {/* Stage 3: Mengejar */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-blue-600 font-semibold">
                            3. Mengejar
                        </Label>
                        <Textarea
                            value={wantStages.mengejar}
                            onChange={(e) => onUpdate({ 
                                wantStages: { ...wantStages, mengejar: e.target.value } 
                            })}
                            placeholder="Aksi apa yang dilakukan untuk mencapai?"
                            className="h-20 text-xs"
                        />
                    </div>
                    
                    {/* Stage 4: Tercapai? */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-blue-600 font-semibold">
                            4. Tercapai?
                        </Label>
                        <div className="flex flex-col gap-1">
                            <Button
                                size="sm"
                                variant={wantStages.tercapai === true ? 'default' : 'outline'}
                                onClick={() => onUpdate({ 
                                    wantStages: { ...wantStages, tercapai: true } 
                                })}
                                className="h-7 text-xs"
                            >
                                <Check className="h-3 w-3 mr-1" /> Ya
                            </Button>
                            <Button
                                size="sm"
                                variant={wantStages.tercapai === false ? 'destructive' : 'outline'}
                                onClick={() => onUpdate({ 
                                    wantStages: { ...wantStages, tercapai: false } 
                                })}
                                className="h-7 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" /> Tidak
                            </Button>
                            <Button
                                size="sm"
                                variant={wantStages.tercapai === null ? 'secondary' : 'outline'}
                                onClick={() => onUpdate({ 
                                    wantStages: { ...wantStages, tercapai: null } 
                                })}
                                className="h-7 text-xs"
                            >
                                <Minus className="h-3 w-3 mr-1" /> Dilepas
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            
            {/* NEED STAGES - Similar structure */}
            <Card className="p-4 border-orange-200 bg-orange-50/50">
                {/* ... same pattern for Need stages ... */}
            </Card>
            
            {/* ENDING TYPE RESULT */}
            {endingType && (
                <Card className="p-4 border-purple-200 bg-purple-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-xs text-purple-600">Ending Type</Label>
                            <p className="text-lg font-bold text-purple-700 capitalize">
                                {endingType}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-purple-600">Rasa/Feeling</Label>
                            <Badge className="bg-purple-100 text-purple-700">
                                {endingFeeling}
                            </Badge>
                        </div>
                    </div>
                </Card>
            )}
            
            {/* PREFERENCE INPUT */}
            <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                    Preference untuk target audience (opsional)
                </Label>
                <Textarea
                    value={preference || ''}
                    onChange={(e) => onUpdate({ wantNeedPreference: e.target.value })}
                    placeholder="Saya ingin film ini ditujukan penonton indonesia di bioskop..."
                    className="text-xs h-16"
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                        preference
                    </Button>
                    <Button 
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        generate
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

---

### Phase 3: Story Structure Enhancement

#### 3.1 Add New Structures
**File: `src/components/studio/StoryArcStudio.tsx`**

```typescript
// Add to constants at top of file:

const THREE_ACT_BEATS = [
    { key: 'setup', label: 'Setup', desc: 'Introduce characters, world, and conflict.', act: 1 },
    { key: 'confrontation', label: 'Confrontation', desc: 'Rising action, obstacles, character development.', act: 2 },
    { key: 'resolution', label: 'Resolution', desc: 'Climax and conclusion.', act: 3 },
];

const FREYTAG_BEATS = [
    { key: 'exposition', label: 'Exposition', desc: 'Introduction of setting and characters.', act: 1 },
    { key: 'risingAction', label: 'Rising Action', desc: 'Build up of events leading to climax.', act: 1 },
    { key: 'climax', label: 'Climax', desc: 'The turning point of the story.', act: 2 },
    { key: 'fallingAction', label: 'Falling Action', desc: 'Events after climax leading to resolution.', act: 3 },
    { key: 'denouement', label: 'Denouement', desc: 'Final resolution and closure.', act: 3 },
];

// Update getBeatsConfig function to include new structures
```

#### 3.2 Custom Structure Support
Create ability for users to define their own beat structure.

---

### Phase 4: Sceneplot Feature

See original plan - full scene/shot breakdown system.

---

## 📊 Summary - Task Breakdown

### High Priority (This Sprint)

| Task | Effort | Files |
|------|--------|-------|
| 1.1 Add global_synopsis to DB | Small | migration.sql |
| 1.2 Add preference fields to DB | Small | migration.sql |
| 1.3 Update StoryData interface | Small | StoryArcStudio.tsx |
| 1.4 Add Global Synopsis UI section | Medium | StoryArcStudio.tsx |
| 1.5 Add Preference input per field | Medium | StoryArcStudio.tsx |
| 1.6 Update API for new fields | Small | stories/[versionId]/route.ts |
| 2.1 Create WantNeedMatrixV2 component | Large | New file |
| 2.2 Add ending type matrix logic | Medium | WantNeedMatrixV2.tsx |
| 2.3 Integrate WantNeedMatrixV2 | Medium | StoryArcStudio.tsx |

### Medium Priority (Next Sprint)

| Task | Effort | Files |
|------|--------|-------|
| 3.1 Add Three Act structure | Small | StoryArcStudio.tsx |
| 3.2 Add Freytag's Pyramid structure | Small | StoryArcStudio.tsx |
| 3.3 Add Custom structure support | Medium | Multiple files |

### Lower Priority (Future)

| Task | Effort |
|------|--------|
| 4.x Sceneplot feature | Large |
| Character Expression/Gesture | Medium |
| Storyboard/Animatic | Very Large |

---

**Document Updated**: 2026-01-24
**Status**: Awaiting review dan koreksi
