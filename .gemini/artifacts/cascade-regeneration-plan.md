# Implementation Plan: Cascade Regeneration on Tension Graph Change

## Overview

Ketika user mengubah tension level pada graph di Beat View:
1. Perubahan di-track locally (belum save)
2. User bisa ubah **multiple beats** sekaligus
3. Klik **Save Tension** button untuk menyimpan
4. **Warning modal** muncul dengan info beat mana yang akan di-regenerate
5. User confirm → **Cascade regeneration** untuk beats yang berubah saja
6. Auto-save setiap step ke database
7. Progress modal selama proses

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TENSION GRAPH (Arc View)                                                    │
│                                                                             │
│    5 │                    ●──────●                                          │
│    4 │              ●────●        ●                                         │
│    3 │        ●────●                ●────●                                  │
│    2 │  ●────●                            ●                                 │
│    1 │ ●                                    ●                               │
│      └──────────────────────────────────────────────                        │
│        Setup  Debate  B.I.2  Midpoint  All Lost  Finale                    │
│                                                                             │
│        ⬤ Unsaved changes: Midpoint (2→4), All Lost (4→2)                   │
│                                                                             │
│        [💾 Save Tension Levels]                              [↩️ Reset]     │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼ Click Save
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Confirm Regeneration                                               [×]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Anda akan menyimpan perubahan tension level berikut:                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⬆️ Midpoint       2 → 4  (More Dramatic)                            │   │
│  │ ⬇️ All Is Lost    4 → 2  (Less Intense)                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ⚠️ PERHATIAN: Ini akan REGENERATE konten berikut:                         │
│                                                                             │
│  • Beat Content      (2 beats)                                              │
│  • Key Actions       (2 beats)                                              │
│  • Scene Plots       (5 scenes terkait)                                     │
│  • Scripts           (5 scripts terkait)                                    │
│                                                                             │
│  💳 Estimasi Credit: ~40 credits                                            │
│                                                                             │
│  Konten lama akan diganti dengan konten baru sesuai tension level.          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                            [Batal]    [🔄 Regenerate & Save]                │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼ Click Regenerate
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔄 Regenerating 2 Beats...                                             [×]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Beat 1/2: Midpoint (2 → 4)                                                 │
│  ├── ✅ Beat Content    Regenerated                                         │
│  ├── ✅ Key Action      Regenerated                                         │
│  ├── ✅ Scene Plot 5    Regenerated                                         │
│  ├── ⏳ Scene Plot 6    Generating...                                       │
│  └── ⏹️ Script 5-6      Pending                                             │
│                                                                             │
│  Beat 2/2: All Is Lost (4 → 2)                                              │
│  └── ⏹️ Pending                                                             │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  35%                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  💳 Credits used: 12 / ~40                                                  │
│                                              [Cancel Process]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema Review & Updates

### 1.1 Current Schema Status

| Table | Versioning | Notes |
|-------|------------|-------|
| `story_versions` | ✅ Main version table | Contains beats, tension_levels |
| `scene_plots` | ✅ `story_version_id` + `beat_key` | Linked to story version and beat |
| `scene_shots` | ⚠️ `scene_plot_id` | Linked to scene_plot |

### 1.2 Tasks
- [ ] Verify `scene_plots.beat_key` column exists for linking scenes to beats
- [ ] Check how scripts are stored (in scene_plots or separate table)

---

## Phase 2: Backend API

### 2.1 New API Endpoint: `/api/ai/regenerate-beats-cascade/route.ts`

**Purpose:** Handle cascade regeneration for MULTIPLE beats at once

**Method:** POST (with streaming response for progress updates)

**Request Body:**
```typescript
{
  projectId: string;
  storyVersionId: string;
  changes: Array<{
    beatKey: string;           // e.g. "midpoint", "allIsLost"
    beatLabel: string;         // e.g. "Midpoint", "All Is Lost"
    previousTension: number;   // 1-5
    newTension: number;        // 1-5
    prevBeatTension?: number;  // Beat sebelumnya untuk context
    nextBeatTension?: number;  // Beat sesudahnya untuk context
  }>;
  structureType: string;     // "hero", "cat", "harmon"
  userId: string;
}
```

**Response (Streaming - each line is JSON):**
```typescript
// Step indicators
{ type: "start", totalBeats: 2, estimatedCredits: 40 }

// Per-beat progress
{ type: "beat_start", beatIndex: 0, beatKey: "midpoint", beatLabel: "Midpoint" }
{ type: "step", beatIndex: 0, step: "beatContent", status: "generating" }
{ type: "step", beatIndex: 0, step: "beatContent", status: "complete", result: "..." }
{ type: "step", beatIndex: 0, step: "keyAction", status: "generating" }
{ type: "step", beatIndex: 0, step: "keyAction", status: "complete", result: "..." }
{ type: "step", beatIndex: 0, step: "scenePlots", status: "generating", progress: { current: 1, total: 3 } }
{ type: "step", beatIndex: 0, step: "scenePlots", status: "complete", scenes: [...] }
{ type: "step", beatIndex: 0, step: "scripts", status: "generating", progress: { current: 1, total: 3 } }
{ type: "step", beatIndex: 0, step: "scripts", status: "complete" }
{ type: "beat_complete", beatIndex: 0 }

{ type: "beat_start", beatIndex: 1, beatKey: "allIsLost", beatLabel: "All Is Lost" }
// ... repeat for next beat

{ type: "done", totalCreditsUsed: 38, beatsRegenerated: 2 }
// or
{ type: "error", error: "...", beatIndex?: number }
```

### 2.2 API Implementation Flow

```
POST /api/ai/regenerate-beats-cascade
│
├── 1. Validate request
│   ├── Check all required fields
│   ├── Validate projectId, storyVersionId
│   └── Check user credits
│
├── 2. Get current data
│   ├── Get story version (synopsis, genre, tone, current beats)
│   ├── Get scene_plots grouped by beat_key
│   └── Calculate total credit cost
│
├── 3. Stream: Start
│   └── Send { type: "start", totalBeats, estimatedCredits }
│
├── 4. For each beat in changes:
│   │
│   ├── 4a. Send { type: "beat_start", beatIndex, beatKey, beatLabel }
│   │
│   ├── 4b. Regenerate Beat Content
│   │   ├── Send { step: "beatContent", status: "generating" }
│   │   ├── Call AI with tension context
│   │   ├── Save to story_versions.{structure}_beats
│   │   └── Send { step: "beatContent", status: "complete" }
│   │
│   ├── 4c. Regenerate Key Action
│   │   ├── Send { step: "keyAction", status: "generating" }
│   │   ├── Call AI
│   │   ├── Save to story_versions.{structure}_key_actions
│   │   └── Send { step: "keyAction", status: "complete" }
│   │
│   ├── 4d. Regenerate Scene Plots for this beat
│   │   ├── Get scene_plots WHERE beat_key = this beat
│   │   ├── For each scene:
│   │   │   ├── Send progress update
│   │   │   ├── Call AI
│   │   │   └── Save to scene_plots
│   │   └── Send { step: "scenePlots", status: "complete" }
│   │
│   ├── 4e. Regenerate Scripts for scenes
│   │   ├── For each scene:
│   │   │   ├── Send progress update
│   │   │   ├── Call AI
│   │   │   └── Save to scene_plots.script or scene_scripts
│   │   └── Send { step: "scripts", status: "complete" }
│   │
│   └── 4f. Send { type: "beat_complete", beatIndex }
│
├── 5. Save updated tension_levels to DB
│
├── 6. Deduct credits
│
└── 7. Send { type: "done", totalCreditsUsed, beatsRegenerated }
```

### 2.3 AI Prompts

**File:** `src/lib/ai/prompts/regenerate-beat.ts`

```typescript
export function getRegenerateBeatPrompt(params: {
  beatKey: string;
  beatLabel: string;
  previousContent: string;
  previousTension: number;
  newTension: number;
  prevBeatTension?: number;
  nextBeatTension?: number;
  synopsis: string;
  genre: string;
  tone: string;
}): string {
  const direction = params.newTension > params.previousTension ? 'RISING' : 'FALLING';
  const diff = Math.abs(params.newTension - params.previousTension);
  
  return `
Kamu adalah penulis skenario profesional. Tugas: REGENERATE beat "${params.beatLabel}" dengan TENSION LEVEL BARU.

STORY SYNOPSIS:
${params.synopsis}

GENRE: ${params.genre}
TONE: ${params.tone}

PERUBAHAN TENSION:
- Level sebelumnya: ${params.previousTension}/5
- Level BARU: ${params.newTension}/5
- Arah: ${direction} (perubahan ${diff} level)

${direction === 'RISING' ? `
INSTRUKSI RISING TENSION (lebih intens):
- Buat beat LEBIH DRAMATIS
- STAKES lebih tinggi
- KONFLIK lebih tajam
- Dialog lebih URGENT
- Pacing lebih CEPAT
- Emosi lebih KUAT
` : `
INSTRUKSI FALLING TENSION (lebih tenang):
- Buat beat LEBIH REFLEKTIF
- Momen INTROSPEKSI karakter
- Dialog lebih SUBTLE
- Pacing lebih LAMBAT
- "Breathing room" untuk penonton
- Emosi lebih DALAM tapi tidak eksplosif
`}

KONTEN SEBELUMNYA (untuk referensi, JANGAN copy paste):
${params.previousContent}

${params.prevBeatTension ? `Context - Beat sebelumnya: tension ${params.prevBeatTension}/5` : ''}
${params.nextBeatTension ? `Context - Beat sesudahnya: tension ${params.nextBeatTension}/5` : ''}

OUTPUT FORMAT (JSON only, no markdown):
{
  "beatContent": "<konten beat 2-3 paragraf sesuai tension baru>",
  "keyAction": "<aksi kunci 1-2 kalimat yang menggambarkan beat>"
}
`;
}
```

---

## Phase 3: Frontend Components

### 3.1 Track Tension Changes in State

**In StoryArcStudio.tsx:**

```typescript
// State for tracking unsaved tension changes
const [pendingTensionChanges, setPendingTensionChanges] = useState<Map<string, {
  beatKey: string;
  beatLabel: string;
  previousTension: number;
  newTension: number;
}>>(new Map());

// Check if there are unsaved changes
const hasUnsavedTensionChanges = pendingTensionChanges.size > 0;

// Handle tension point drag
const handleTensionChange = (beatKey: string, newTension: number) => {
  const beatLabel = getBeatLabel(beatKey);
  const previousTension = tensionLevels[beatKey] || 3;
  
  if (previousTension !== newTension) {
    setPendingTensionChanges(prev => {
      const next = new Map(prev);
      next.set(beatKey, { beatKey, beatLabel, previousTension, newTension });
      return next;
    });
    // Update local display only
    setLocalTensionLevels(prev => ({ ...prev, [beatKey]: newTension }));
  }
};

// Reset changes
const handleResetTension = () => {
  setPendingTensionChanges(new Map());
  setLocalTensionLevels(tensionLevels); // Revert to saved
};
```

### 3.2 Save Button Component

```tsx
{/* Show only when there are unsaved changes */}
{hasUnsavedTensionChanges && (
  <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
    <AlertTriangle className="h-5 w-5 text-amber-500" />
    <span className="text-sm text-amber-700">
      {pendingTensionChanges.size} beat{pendingTensionChanges.size > 1 ? 's' : ''} dengan perubahan tension belum disimpan
    </span>
    <div className="ml-auto flex gap-2">
      <Button variant="ghost" size="sm" onClick={handleResetTension}>
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset
      </Button>
      <Button size="sm" onClick={() => setShowConfirmModal(true)}>
        <Save className="h-4 w-4 mr-1" />
        Save Tension Levels
      </Button>
    </div>
  </div>
)}
```

### 3.3 Confirmation Modal Component

**File:** `src/components/studio/modals/ConfirmRegenerationModal.tsx`

```tsx
interface ConfirmRegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: Array<{
    beatKey: string;
    beatLabel: string;
    previousTension: number;
    newTension: number;
  }>;
  affectedScenes: number; // Count of scenes that will be regenerated
  estimatedCredits: number;
  onConfirm: () => void;
}

export function ConfirmRegenerationModal(props: ConfirmRegenerationModalProps) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Regeneration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Anda akan menyimpan perubahan tension level berikut:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {props.changes.map(change => (
              <div key={change.beatKey} className="flex items-center gap-2 text-sm">
                {change.newTension > change.previousTension ? (
                  <ArrowUp className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-blue-500" />
                )}
                <span className="font-medium">{change.beatLabel}</span>
                <span className="text-gray-500">
                  {change.previousTension} → {change.newTension}
                </span>
                <span className="text-xs text-gray-400">
                  ({change.newTension > change.previousTension ? 'More Dramatic' : 'Less Intense'})
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-2">
              ⚠️ Ini akan REGENERATE:
            </p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Beat Content ({props.changes.length} beats)</li>
              <li>• Key Actions ({props.changes.length} beats)</li>
              <li>• Scene Plots ({props.affectedScenes} scenes)</li>
              <li>• Scripts ({props.affectedScenes} scripts)</li>
            </ul>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span>Estimasi credit: ~{props.estimatedCredits} credits</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Konten lama akan diganti dengan konten baru sesuai tension level.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={props.onClose}>
            Batal
          </Button>
          <Button onClick={props.onConfirm} className="bg-orange-500 hover:bg-orange-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.4 Progress Modal Component

**File:** `src/components/studio/modals/RegenerationProgressModal.tsx`

```tsx
interface BeatProgress {
  beatKey: string;
  beatLabel: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  steps: {
    beatContent: 'pending' | 'generating' | 'complete' | 'error';
    keyAction: 'pending' | 'generating' | 'complete' | 'error';
    scenePlots: { status: string; current: number; total: number };
    scripts: { status: string; current: number; total: number };
  };
}

interface RegenerationProgressModalProps {
  isOpen: boolean;
  beats: BeatProgress[];
  currentBeatIndex: number;
  totalProgress: number; // 0-100
  creditsUsed: number;
  onCancel: () => void;
  error?: string;
}
```

---

## Phase 4: Integration

### 4.1 Main Flow in StoryArcStudio

```typescript
// When user clicks "Regenerate & Save" in confirm modal
const handleConfirmRegeneration = async () => {
  setShowConfirmModal(false);
  setShowProgressModal(true);
  
  const changes = Array.from(pendingTensionChanges.values()).map(change => ({
    ...change,
    prevBeatTension: getTensionForPrevBeat(change.beatKey),
    nextBeatTension: getTensionForNextBeat(change.beatKey),
  }));
  
  try {
    const response = await fetch('/api/ai/regenerate-beats-cascade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        storyVersionId: activeVersionId,
        changes,
        structureType: story.structure,
        userId,
      }),
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        const event = JSON.parse(line);
        handleProgressEvent(event);
      }
    }
    
    // Success
    setPendingTensionChanges(new Map());
    setTensionLevels(localTensionLevels);
    toast.success('Tension levels saved and content regenerated!');
    
  } catch (error) {
    toast.error('Failed to regenerate');
  } finally {
    setShowProgressModal(false);
  }
};

const handleProgressEvent = (event: any) => {
  switch (event.type) {
    case 'start':
      setTotalBeats(event.totalBeats);
      break;
    case 'beat_start':
      setCurrentBeatIndex(event.beatIndex);
      break;
    case 'step':
      updateBeatProgress(event.beatIndex, event.step, event.status, event.progress);
      break;
    case 'beat_complete':
      markBeatComplete(event.beatIndex);
      break;
    case 'done':
      setCreditsUsed(event.totalCreditsUsed);
      break;
    case 'error':
      setError(event.error);
      break;
  }
};
```

---

## Phase 5: Testing

### 5.1 Test Cases

1. **Single Beat Change**
   - Change 1 beat tension, save, verify regeneration

2. **Multiple Beat Changes**
   - Change 3 beats, save, verify all 3 regenerated in sequence

3. **Reset Before Save**
   - Change beats, click Reset, verify reverted

4. **Cancel During Regeneration**
   - Start regeneration, cancel at step 2
   - Verify step 1 changes saved, step 2+ not affected

5. **Error Handling**
   - Insufficient credits
   - AI API failure
   - Network error

6. **Credit Calculation**
   - Verify credit estimate matches actual usage

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/ai/regenerate-beats-cascade/route.ts` | CREATE | Main cascade API |
| `src/lib/ai/prompts/regenerate-beat.ts` | CREATE | AI prompts |
| `src/components/studio/modals/ConfirmRegenerationModal.tsx` | CREATE | Confirm dialog |
| `src/components/studio/modals/RegenerationProgressModal.tsx` | CREATE | Progress dialog |
| `src/components/studio/StoryArcStudio.tsx` | MODIFY | Add tracking & modals |

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: DB Check | 30 min | None |
| Phase 2: Backend API | 3-4 hours | Phase 1 |
| Phase 3: Frontend Components | 2-3 hours | None |
| Phase 4: Integration | 1-2 hours | Phase 2, 3 |
| Phase 5: Testing | 1 hour | Phase 4 |

**Total: ~8-10 hours**

---

## Credit Cost Formula

```
Per Beat:
- Beat Content: 3 credits
- Key Action: 2 credits
- Per Scene Plot: 3 credits
- Per Script: 4 credits

Example: 2 beats changed, 3 scenes per beat:
= 2 × (3 + 2 + 3×3 + 3×4)
= 2 × (3 + 2 + 9 + 12)
= 2 × 26
= 52 credits
```

---

## Success Criteria

- [ ] User can adjust multiple tension points
- [ ] Unsaved changes indicator appears
- [ ] Save button triggers confirmation modal
- [ ] Confirmation shows all affected beats and estimated credits
- [ ] Regeneration processes only changed beats
- [ ] Progress updates real-time
- [ ] Each step auto-saves to DB
- [ ] Cancel stops further processing but keeps completed saves
- [ ] Credits deducted correctly
- [ ] Local state updates after completion
