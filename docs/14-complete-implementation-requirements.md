# 📋 IMPLEMENTATION REQUIREMENTS - AI-Series-Studio Reference
## Complete Feature List for ecosystem-IP-ai to Match 100%

**Date:** December 2025  
**Reference:** D:\AI\AI-Series-Studio  
**Goal:** Make ecosystem-IP-ai 100% feature-identical to AI-Series-Studio

---

# 📊 EXECUTIVE SUMMARY

Based on analysis of AI-Series-Studio source code, ecosystem-IP-ai needs to implement the following to achieve 100% feature parity:

| Module | Current Status | Target Status | Gap |
|--------|---------------|--------------|-----|
| IP Project | 100% | 100% | ✅ Complete |
| Strategic Plan | 0% | 100% | ❌ Missing |
| Story Formula | 80% | 100% | ⚠️ Partial |
| Character Formula | 100% | 100% | ✅ Complete |
| Universe Formula | 90% | 100% | ⚠️ Partial |
| Moodboard | 100% | 100% | ✅ Complete |
| Animate | 20% | 100% | ❌ Minimal |
| Edit & Mix | 0% | 100% | ❌ Missing |
| IP Bible | 70% | 100% | ⚠️ Partial |
| Performance Analysis | 0% | 100% | ❌ Missing |
| Canva Integration | 0% | 100% | ❌ Missing |
| Asset Library | 0% | 100% | ❌ Missing |
| Modo Community Integration | 0% | 100% | ❌ Missing |

---

# 🎯 DETAILED IMPLEMENTATION REQUIREMENTS

## 1. STRATEGIC PLAN TAB

### Current State (ecosystem-IP-ai)
- ❌ Tab exists in UI but completely non-functional
- ❌ No state variables for strategy data
- ❌ No save/load functionality
- ❌ No AI generation

### Reference Implementation (AI-Series-Studio)
```typescript
// State Variables (lines 61-93)
const [strategyData, setStrategyData] = useState({
  keyCreator: "",
  licensableValues: "",
  segmentation: "",
  keyPartners: "",
  brandPositioning: "",
  coreMedium: "",
  keyActivities: "",
  ipFoundation: "",
  derivativesProduct: "",
  costStructure: "",
  revenueStreams: "",
});
```

### Required Implementation

#### 1.1 State Management
```typescript
// Add to src/app/(dashboard)/projects/[id]/page.tsx

interface StrategyData {
  keyCreator: string;
  licensableValues: string;
  segmentation: string;
  keyPartners: string;
  brandPositioning: string;
  coreMedium: string;
  keyActivities: string;
  ipFoundation: string;
  derivativesProduct: string;
  costStructure: string;
  revenueStreams: string;
}

const [strategyData, setStrategyData] = useState<StrategyData>({
  keyCreator: "",
  licensableValues: "",
  segmentation: "",
  keyPartners: "",
  brandPositioning: "",
  coreMedium: "",
  keyActivities: "",
  ipFoundation: "",
  derivativesProduct: "",
  costStructure: "",
  revenueStreams: "",
});
```

#### 1.2 UI Components (Replace existing non-functional tab)

```tsx
<TabsContent value="strategy" className="flex-1 overflow-auto mt-4">
  <Card>
    <CardHeader>
      <CardTitle>Strategic Plan - IP Business Model Canvas</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "keyCreator", label: "Key Creator/Owner", color: "bg-blue-50 border-blue-200" },
          { key: "licensableValues", label: "Licensable & Unique Values", color: "bg-purple-50 border-purple-200" },
          { key: "segmentation", label: "Segmentation", color: "bg-green-50 border-green-200" },
          { key: "keyPartners", label: "Key Partners", color: "bg-orange-50 border-orange-200" },
          { key: "brandPositioning", label: "Brand Positioning/Archetype", color: "bg-pink-50 border-pink-200" },
          { key: "coreMedium", label: "Core Medium/Franchise", color: "bg-cyan-50 border-cyan-200" },
          { key: "keyActivities", label: "Key Activities", color: "bg-yellow-50 border-yellow-200" },
          { key: "ipFoundation", label: "IP Foundation", color: "bg-red-50 border-red-200" },
          { key: "derivativesProduct", label: "Derivatives Product", color: "bg-indigo-50 border-indigo-200" },
          { key: "costStructure", label: "Cost Structure", color: "bg-gray-50 border-gray-200" },
          { key: "revenueStreams", label: "Revenue Streams", color: "bg-emerald-50 border-emerald-200" },
        ].map(field => (
          <div key={field.key} className={`p-3 rounded-lg border ${field.color}`}>
            <Label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
              {field.label}
            </Label>
            <Textarea 
              className="min-h-[80px] resize-none bg-white"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={strategyData[field.key as keyof StrategyData]}
              onChange={(e) => setStrategyData(prev => ({
                ...prev,
                [field.key]: e.target.value
              }))}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={handleGenerateStrategy}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

#### 1.3 AI Generation Endpoint

```typescript
// Create: src/app/api/ai/generate-strategy/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { premise, synopsis, genre, tone, theme } = await req.json();
    
    if (!premise) {
      return NextResponse.json({ error: "Premise is required" }, { status: 400 });
    }

    const prompt = `Based on the following IP concept, generate a complete Strategic Plan using the Business Model Canvas format:

PREMISE: ${premise}
SYNOPSIS: ${synopsis || "Not provided"}
GENRE: ${genre || "Not specified"}
TONE: ${tone || "Not specified"}
THEME: ${theme || "Not specified"}

Generate content for ALL 9 sections of the Business Model Canvas:
1. Key Creator/Owner - Who is creating this IP?
2. Licensable & Unique Values - What makes this IP unique and licensable?
3. Segmentation - Who is the target audience and market segments?
4. Key Partners - Who are potential partners (distributors, platforms, etc.)?
5. Brand Positioning/Archetype - What is the brand personality and market position?
6. Core Medium/Franchise - What is the primary format and potential derivatives?
7. Key Activities - What are the main activities to create and distribute this IP?
8. IP Foundation - What are the core elements that form the IP foundation?
9. Derivatives Product - What derivative products can be created (merch, games, etc.)?
10. Cost Structure - What are the main cost categories?
11. Revenue Streams - How can this IP generate revenue?

Return as JSON with this exact structure:
{
  "keyCreator": "...",
  "licensableValues": "...",
  "segmentation": "...",
  "keyPartners": "...",
  "brandPositioning": "...",
  "coreMedium": "...",
  "keyActivities": "...",
  "ipFoundation": "...",
  "derivativesProduct": "...",
  "costStructure": "...",
  "revenueStreams": "..."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const strategyData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(strategyData);

  } catch (error) {
    console.error('Strategy generation error:', error);
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
```

#### 1.4 Save/Load Integration

```typescript
// Update autoSaveProject function to include strategy
const autoSaveProject = async (updatedStory?: typeof story, updatedUniverse?: typeof universe) => {
  try {
    const payload = {
      ...project,
      story: updatedStory || story,
      universe: updatedUniverse || universe,
      moodboardPrompts,
      moodboardImages,
      animationPrompts,
      animationPreviews,
      strategyData, // ADD THIS
    };
    
    const res = await fetch(`/api/creator/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error("Auto-save API error:", error);
    } else {
      console.log("Auto-save success!");
    }
  } catch (e) {
    console.error("Auto-save failed:", e);
  }
};
```

#### 1.5 Database Schema Update

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategy_data JSONB;
```

---

## 2. STORY FORMULA - COMPLETING MISSING FEATURES

### Current State
- ✅ Premise, Synopsis, Genre, Tone, Theme - WORKING
- ✅ Story Structure (3 types) - WORKING
- ✅ Want/Need Matrix - WORKING
- ❌ Script Generation - NOT IMPLEMENTED
- ❌ Key Actions per character - NOT CONNECTED TO AI

### Required Implementation

#### 2.1 Script Generation

```typescript
// Add state variable
const [script, setScript] = useState("");
const [isGeneratingScript, setIsGeneratingScript] = useState(false);

// Add handler function
const handleGenerateScript = async () => {
  if (!story.premise || !story.synopsis) {
    alert("Please enter premise and synopsis first");
    return;
  }
  
  setIsGeneratingScript(true);
  
  try {
    const response = await fetch("/api/ai/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        premise: story.premise,
        synopsis: story.synopsis,
        globalSynopsis: story.globalSynopsis,
        genre: story.genre,
        tone: story.tone,
        duration: story.duration,
        format: story.format,
        structure: story.structure,
        structureBeats: getCurrentBeats(),
        keyActions: getCurrentKeyActions(),
        wantNeedMatrix: story.wantNeedMatrix,
        endingType: story.endingType,
        characters: characters.map(c => ({ 
          name: c.name, 
          role: c.role 
        })),
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate script");
    }
    
    const data = await response.json();
    setScript(data.script);
    
    // Auto-save script
    await autoSaveProject();
  } catch (error) {
    console.error("Error generating script:", error);
    alert("Error generating script. Please try again.");
  } finally {
    setIsGeneratingScript(false);
  }
};
```

```typescript
// Create: src/app/api/ai/generate-script/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      premise, synopsis, globalSynopsis, genre, tone, duration, format,
      structure, structureBeats, keyActions, wantNeedMatrix, endingType, characters
    } = await req.json();
    
    const prompt = `Generate a complete screenplay/script based on the following story information:

PROJECT TITLE: ${premise.slice(0, 50)}
PREMISE: ${premise}
SYNOPSIS: ${synopsis}
GLOBAL SYNOPSIS: ${globalSynopsis}

GENRE: ${genre}
TONE: ${tone}
DURATION: ${duration || "90-120 minutes"}
FORMAT: ${format}

STORY STRUCTURE: ${structure}
${Object.entries(structureBeats || {}).map(([beat, desc]) => 
  `${beat}: ${desc}`
).join('\n')}

KEY ACTIONS PER BEAT:
${Object.entries(keyActions || {}).map(([beat, actions]) => 
  `${beat}: ${JSON.stringify(actions)}`
).join('\n')}

WANT/NEED MATRIX:
WANT - External: ${wantNeedMatrix?.want?.external || "N/A"}
WANT - Known: ${wantNeedMatrix?.want?.known || "N/A"}
WANT - Specific: ${wantNeedMatrix?.want?.specific || "N/A"}
WANT - Achieved: ${wantNeedMatrix?.want?.achieved || "N/A"}

NEED - Internal: ${wantNeedMatrix?.need?.internal || "N/A"}
NEED - Unknown: ${wantNeedMatrix?.need?.unknown || "N/A"}
NEED - Universal: ${wantNeedMatrix?.need?.universal || "N/A"}
NEED - Achieved: ${wantNeedMatrix?.need?.achieved || "N/A"}

ENDING TYPE: ${endingType}

CHARACTERS:
${characters.map(c => `- ${c.name} (${c.role})`).join('\n')}

REQUIREMENTS:
1. Write in standard screenplay format with scene headings
2. Include dialogue and action descriptions
3. Follow the story structure beats
4. Incorporate character key actions in appropriate scenes
5. Ensure the ending matches the specified type
6. Keep dialogue natural and character-consistent
7. Include proper scene transitions

Format the output as a complete screenplay with proper formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const script = data.choices[0].message.content;

    return NextResponse.json({ script });

  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
```

#### 2.2 Key Actions AI Generation

```typescript
// Update handleGenerateStructure to include key actions generation
const handleGenerateStructure = async () => {
  // ... existing code ...
  
  const result = await generateWithAI("story_structure", {
    prompt: `Generate ${structureName} story structure for the following story.

PREMISE: ${story.premise}
SYNOPSIS: ${story.synopsis}
GENRE: ${story.genre}
TONE: ${story.tone}

BEATS YANG HARUS DIISI (gunakan EXACT key names ini):
${beats.map(b => `- "${b}"`).join('\n')}

For EACH beat, generate key actions for ALL characters:
${characters.map(c => `- ${c.name} (${c.role})`).join('\n')}

Return as JSON:
{
  "beats": {
    "beat1": "description",
    "beat2": "description",
    ...
  },
  "keyActions": {
    "beat1": {
      "Character Name": "action description",
      "Character Name 2": "action description",
      ...
    },
    "beat2": {
      ...
    }
  }
}`,
    structure: story.structure,
    beats: beats,
    genre: story.genre,
    tone: story.tone,
    characters: characters.map(c => ({ name: c.name, role: c.role }))
  });
  
  if (result?.resultText) {
    try {
      const parsed = parseAIResponse(result.resultText);
      const updatedStory = {
        ...story,
        [beatsKey]: parsed.beats || {},
        [actionsKey]: parsed.keyActions || {},
      };
      setStory(updatedStory);
      await autoSaveProject(updatedStory);
    } catch (e) {
      console.warn("Could not parse structure:", e);
      alert("Gagal parse hasil AI. Coba generate ulang.");
    }
  }
};
```

---

## 3. UNIVERSE FORMULA - ADDING VISUAL REFERENCES

### Current State
- ✅ All text fields - WORKING
- ❌ Visual reference images - NOT IMPLEMENTED

### Required Implementation

#### 3.1 Visual Reference Upload

```typescript
// Add to universe state
interface Universe {
  // ... existing fields ...
  environmentImage?: string;
  societyImage?: string;
  privateLifeImage?: string;
  governmentImage?: string;
  economyImage?: string;
  cultureImage?: string;
}

const [universe, setUniverse] = useState<Universe>({
  // ... existing fields ...
  environmentImage: "",
  societyImage: "",
  privateLifeImage: "",
  governmentImage: "",
  economyImage: "",
  cultureImage: "",
});
```

```tsx
// Add image upload buttons to Universe tab
<TabsContent value="universe" className="flex-1 overflow-auto mt-4">
  {/* ... existing fields ... */}
  
  <Separator className="my-6" />
  
  <div className="space-y-4">
    <h3 className="font-bold text-lg">Visual References</h3>
    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { key: "environmentImage", label: "Environment" },
        { key: "societyImage", label: "Society & System" },
        { key: "privateLifeImage", label: "Private Life" },
        { key: "governmentImage", label: "Government" },
        { key: "economyImage", label: "Economy" },
        { key: "cultureImage", label: "Culture" },
      ].map(field => (
        <div key={field.key} className="space-y-2">
          <Label className="text-sm font-semibold">{field.label}</Label>
          <div className="aspect-video bg-black/10 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden relative group">
            {universe[field.key as keyof Universe] ? (
              <img 
                src={universe[field.key as keyof Universe]} 
                className="w-full h-full object-cover"
                alt={field.label}
              />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleUniverseImageUpload(field.key as keyof Universe, e)}
            />
            {universe[field.key as keyof Universe] && (
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setUniverse(prev => ({ ...prev, [field.key]: "" as any }))}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
</TabsContent>
```

```typescript
// Add handler
const handleUniverseImageUpload = async (field: keyof Universe, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("field", field);
  formData.append("projectId", projectId);
  
  try {
    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      setUniverse(prev => ({ ...prev, [field]: result.url }));
      await autoSaveProject();
    }
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload image");
  }
};
```

---

## 4. ANIMATE TAB - FULL VIDEO GENERATION

### Current State
- ✅ Prompt generation - WORKING
- ❌ Actual video generation - NOT IMPLEMENTED
- ❌ Video player - NOT IMPLEMENTED
- ❌ Status tracking - NOT IMPLEMENTED
- ❌ Download functionality - NOT IMPLEMENTED

### Required Implementation

#### 4.1 Video Generation State

```typescript
// Add to existing state
const [videoProvider, setVideoProvider] = useState("kling");
const [videoDuration, setVideoDuration] = useState(5);
const [videoStatus, setVideoStatus] = useState<Record<string, {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}>>({});

const [generatedVideos, setGeneratedVideos] = useState<Record<string, {
  url: string;
  thumbnail?: string;
  duration?: number;
  provider: string;
}>>({});
```

#### 4.2 Video Generation API

```typescript
// Create: src/app/api/ai/generate-video/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider, duration, style } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let videoUrl: string;
    let thumbnailUrl: string;

    // Kling AI
    if (provider === 'kling') {
      const response = await fetch('https://api.klingai.com/v1/videos/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.KLING_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration,
          aspect_ratio: '16:9',
          model: 'kling-v1',
        }),
      });

      const data = await response.json();
      videoUrl = data.data?.videos?.[0]?.url;
      thumbnailUrl = data.data?.videos?.[0]?.cover_image_url;
    }

    // Runway
    else if (provider === 'runway') {
      const response = await fetch('https://api.runwayml.com/v1/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`
        },
        body: JSON.stringify({
          prompt_text: prompt,
          model: 'gen3a_turbo',
          duration: duration,
          aspect_ratio: '1280x720',
        }),
      });

      const data = await response.json();
      videoUrl = data.output_url;
    }

    // Luma
    else if (provider === 'luma') {
      const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LUMA_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration,
        }),
      });

      const data = await response.json();
      videoUrl = data.assets?.video;
      thumbnailUrl = data.assets?.thumbnail;
    }

    return NextResponse.json({ 
      videoUrl, 
      thumbnailUrl,
      provider 
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Failed to generate video' }, { status: 500 });
  }
}
```

#### 4.3 Animate Tab UI

```tsx
<TabsContent value="animate" className="flex-1 overflow-auto mt-4">
  {/* Generate All Animation Prompts Header */}
  <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-1">
    <div className="bg-white/95 backdrop-blur rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Generate All Animation Prompts</h3>
            <p className="text-sm text-gray-500">AI akan membuat prompt animasi untuk setiap beat</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={animationStyle} onValueChange={setAnimationStyle}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VISUAL_STYLE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerateAnimatePrompts}
            disabled={isGenerating.animate_all_prompts || Object.keys(getCurrentBeats()).length === 0}
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
          >
            {isGenerating.animate_all_prompts ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Generating...
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate All Prompts
              </>
            )}
          </Button>
        </div>
      </div>
      {Object.keys(getCurrentBeats()).length === 0 && (
        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Generate Story Structure terlebih dahulu di tab Story
        </p>
      )}
    </div>
  </div>

  {/* Video Provider Selection */}
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-lg font-bold">Animation Studio</h3>
    <div className="flex items-center gap-4">
      <Label className="text-sm">Provider:</Label>
      <Select value={videoProvider} onValueChange={setVideoProvider}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="kling">Kling AI (Included)</SelectItem>
          <SelectItem value="runway">Runway Turbo (+20 credits)</SelectItem>
          <SelectItem value="luma">Luma Dream Machine (+15 credits)</SelectItem>
        </SelectContent>
      </Select>
      
      <Label className="text-sm">Duration:</Label>
      <Select value={String(videoDuration)} onValueChange={(v) => setVideoDuration(Number(v))}>
        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3 seconds</SelectItem>
          <SelectItem value="5">5 seconds</SelectItem>
          <SelectItem value="10">10 seconds</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Animation Grid */}
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold">
        Generated Videos ({Object.keys(generatedVideos).length}/{getStructureBeats().length})
      </h3>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {getStructureBeats().map((beat, i) => {
        const status = videoStatus[beat];
        const videoData = generatedVideos[beat];
        
        return (
          <Card key={beat} className="overflow-hidden">
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {videoData?.url ? (
                <video 
                  src={videoData.url} 
                  className="w-full h-full object-cover"
                  controls
                  poster={videoData.thumbnail}
                />
              ) : status?.status === "processing" ? (
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white mx-auto mb-4" />
                  <p>Generating...</p>
                  <p className="text-xs text-white/50">via {videoProvider}</p>
                </div>
              ) : status?.status === "completed" ? (
                <div className="text-center text-white">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                  <p>Completed</p>
                </div>
              ) : status?.status === "failed" ? (
                <div className="text-center text-white">
                  <XCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
                  <p>Failed</p>
                  <p className="text-xs text-red-300">{status.error}</p>
                </div>
              ) : (
                <div className="text-center text-white/50">
                  <Play className="h-12 w-12 mx-auto" />
                  <p>Not generated</p>
                </div>
              )}
              
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white">
                {i + 1}
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-bold uppercase truncate">{beat}</p>
              <Textarea
                className="h-16 text-xs resize-none"
                placeholder={`Animation prompt...`}
                value={animationPrompts[beat] || ""}
                onChange={(e) => setAnimationPrompts(p => ({ ...p, [beat]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => handleGenerateAnimationVideo(beat)}
                  disabled={status?.status === "processing" || !animationPrompts[beat]}
                >
                  {status?.status === "processing" ? (
                    <div className="animate-spin w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full" />
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
                {videoData?.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleDownloadVideo(beat, videoData.url)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
</TabsContent>
```

#### 4.4 Video Generation Handler

```typescript
const handleGenerateAnimationVideo = async (beat: string) => {
  const prompt = animationPrompts[beat];
  if (!prompt) {
    alert("Please add an animation prompt first or generate prompts");
    return;
  }
  
  setVideoStatus(prev => ({
    ...prev,
    [beat]: { status: "processing", progress: 0 }
  }));
  
  try {
    const response = await fetch("/api/ai/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        provider: videoProvider,
        duration: videoDuration,
        style: animationStyle,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate video");
    }
    
    const data = await response.json();
    
    setGeneratedVideos(prev => ({
      ...prev,
      [beat]: {
        url: data.videoUrl,
        thumbnail: data.thumbnailUrl,
        duration: videoDuration,
        provider: data.provider,
      }
    }));
    
    setVideoStatus(prev => ({
      ...prev,
      [beat]: { status: "completed", progress: 100 }
    }));
    
    // Auto-save
    await fetch(`/api/creator/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animationVideos: {
          ...animationVideos,
          [beat]: {
            url: data.videoUrl,
            thumbnail: data.thumbnailUrl,
            duration: videoDuration,
            provider: data.provider,
          }
        }
      }),
    });
  } catch (error) {
    console.error("Error generating animation video:", error);
    setVideoStatus(prev => ({
      ...prev,
      [beat]: { status: "failed", progress: 0, error: error.message }
    }));
    alert("Failed to generate video: " + error.message);
  }
};

const handleDownloadVideo = (beat: string, url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = `${beat.replace(/\s+/g, '_')}_video.mp4`;
  link.click();
};
```

---

## 5. EDIT & MIX TAB - FULL VIDEO EDITING

### Current State
- ❌ Only placeholder UI - timeline visualization
- ❌ No actual editing functionality

### Required Implementation

#### 5.1 Edit Tab State

```typescript
// Add state for video editing
interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'sfx';
  startTime: number;
  endTime: number;
  sourceUrl: string;
  volume?: number;
  muted?: boolean;
}

interface EditState {
  clips: TimelineClip[];
  selectedClipId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const [editState, setEditState] = useState<EditState>({
  clips: [],
  selectedClipId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
});
```

#### 5.2 Edit Tab UI

```tsx
<TabsContent value="edit" className="flex-1 overflow-hidden mt-4">
  <div className="h-full flex flex-col gap-4">
    {/* Video Preview */}
    <div className="flex-1 bg-black rounded-lg flex items-center justify-center relative">
      {editState.clips.length > 0 ? (
        <video 
          ref={videoRef}
          src={editState.clips[0]?.sourceUrl}
          className="w-full h-full"
          controls
          onTimeUpdate={(e) => setEditState(prev => ({ ...prev, currentTime: e.target.currentTime }))}
          onPlay={() => setEditState(prev => ({ ...prev, isPlaying: true }))}
          onPause={() => setEditState(prev => ({ ...prev, isPlaying: false }))}
        />
      ) : (
        <div className="text-center">
          <Film className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No media selected</p>
          <p className="text-white/30 text-sm">Upload or generate videos in Animate tab first</p>
        </div>
      )}
    </div>

    {/* Timeline */}
    <Card className="h-64">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="h-8 border-b bg-muted/30 flex items-center px-4 text-xs font-mono text-muted-foreground gap-12">
          <span>00:00</span>
          <span>00:15</span>
          <span>00:30</span>
          <span>00:45</span>
          <span>01:00</span>
        </div>
        <div className="flex-1 p-2 space-y-2 overflow-x-auto">
          {/* Video Track */}
          <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
            <Film className="h-3 w-3 mr-2 text-blue-400" /> Video Track
            {editState.clips.filter(c => c.type === 'video').map(clip => (
              <div 
                key={clip.id}
                className={`h-8 border-2 rounded cursor-pointer flex-shrink-0 ${
                  editState.selectedClipId === clip.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                style={{ 
                  left: `${(clip.startTime / editState.duration) * 100}%`,
                  width: `${((clip.endTime - clip.startTime) / editState.duration) * 100}%`
                }}
                onClick={() => setEditState(prev => ({ ...prev, selectedClipId: clip.id }))}
              >
                <span className="truncate px-2">{clip.id}</span>
              </div>
            ))}
          </div>
          
          {/* Audio Track */}
          <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
            <Volume2 className="h-3 w-3 mr-2 text-green-400" /> Audio Track
            {editState.clips.filter(c => c.type === 'audio').map(clip => (
              <div 
                key={clip.id}
                className={`h-8 border-2 rounded cursor-pointer flex-shrink-0 ${
                  editState.selectedClipId === clip.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                style={{ 
                  left: `${(clip.startTime / editState.duration) * 100}%`,
                  width: `${((clip.endTime - clip.startTime) / editState.duration) * 100}%`
                }}
                onClick={() => setEditState(prev => ({ ...prev, selectedClipId: clip.id }))}
              >
                <span className="truncate px-2">{clip.id}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={clip.volume || 100}
                  className="w-16 h-4"
                  onChange={(e) => handleVolumeChange(clip.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          
          {/* SFX Track */}
          <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
            <Music className="h-3 w-3 mr-2 text-yellow-400" /> SFX Track
            {editState.clips.filter(c => c.type === 'sfx').map(clip => (
              <div 
                key={clip.id}
                className={`h-8 border-2 rounded cursor-pointer flex-shrink-0 ${
                  editState.selectedClipId === clip.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                style={{ 
                  left: `${(clip.startTime / editState.duration) * 100}%`,
                  width: `${((clip.endTime - clip.startTime) / editState.duration) * 100}%`
                }}
                onClick={() => setEditState(prev => ({ ...prev, selectedClipId: clip.id }))}
              >
                <span className="truncate px-2">{clip.id}</span>
                <button
                  className="ml-auto text-red-400 hover:text-red-600"
                  onClick={() => handleDeleteClip(clip.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline Controls */}
        <div className="h-8 border-t flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleSeek(-5)}>
              <SkipBackward className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handlePlayPause}>
              {editState.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSeek(5)}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTime(editState.currentTime)} / {formatTime(editState.duration)}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
```

#### 5.3 Video Editing Functions

```typescript
const handleAddToTimeline = (beat: string, videoUrl: string) => {
  const duration = 5; // Assume 5 seconds per video
  const lastClip = editState.clips[editState.clips.length - 1];
  const startTime = lastClip ? lastClip.endTime : 0;
  const endTime = startTime + duration;
  
  const newClip: TimelineClip = {
    id: `clip-${Date.now()}`,
    type: 'video',
    startTime,
    endTime,
    sourceUrl: videoUrl,
    volume: 100,
    muted: false,
  };
  
  setEditState(prev => ({
    ...prev,
    clips: [...prev.clips, newClip],
    duration: endTime,
  }));
};

const handleVolumeChange = (clipId: string, volume: number) => {
  setEditState(prev => ({
    ...prev,
    clips: prev.clips.map(clip => 
      clip.id === clipId ? { ...clip, volume } : clip
    ),
  }));
};

const handleDeleteClip = (clipId: string) => {
  setEditState(prev => ({
    ...prev,
    clips: prev.clips.filter(clip => clip.id !== clipId),
  }));
};

const handlePlayPause = () => {
  setEditState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
};

const handleSeek = (seconds: number) => {
  if (videoRef.current) {
    videoRef.current.currentTime += seconds;
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

---

## 6. IP BIBLE TAB - PDF EXPORT

### Current State
- ✅ Preview works perfectly
- ❌ Export button exists but NO actual PDF generation
- ❌ No Canva integration

### Required Implementation

#### 6.1 PDF Generation

```bash
# Install dependencies
npm install jspdf html2canvas
npm install --save-dev @types/jspdf
```

```typescript
// Create: src/lib/generate-pdf.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateIPBiblePDF(projectData: any): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Cover Page
  pdf.setFillColor(245, 158, 11);
  pdf.rect(0, 0, 210, 297, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(projectData.title || "Untitled IP", 105, 100);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text("Series Bible & IP Documentation", 105, 120);
  pdf.text(`Version 1.0 | ${new Date().toLocaleDateString('id-ID')}`, 105, 135);
  if (projectData.studioName) {
    pdf.text(`Created by ${projectData.studioName}`, 105, 150);
  }
  if (projectData.ipOwner) {
    pdf.text(`IP Owner: ${projectData.ipOwner}`, 105, 165);
  }
  
  // Table of Contents
  pdf.addPage();
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, 210, 297, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Table of Contents", 20, 20);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const tocItems = [
    "1. Project Overview",
    "2. Story Formula",
    "3. Story Structure",
    "4. Character Profiles",
    "5. Universe & World-Building",
    "6. Visual Development",
    "7. Moodboard Gallery",
    "8. Animation & Motion",
  ];
  
  tocItems.forEach((item, i) => {
    pdf.text(`${i + 1}. ${item}`, 20, 40 + (i * 10));
  });
  
  // Project Overview
  pdf.addPage();
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("1. Project Overview", 20, 20);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let y = 40;
  
  const overviewData = [
    { label: "Genre", value: projectData.story?.genre || "-" },
    { label: "Sub-Genre", value: projectData.story?.subGenre || "-" },
    { label: "Format", value: projectData.story?.format || "-" },
    { label: "Duration", value: projectData.story?.duration || "-" },
    { label: "Tone", value: projectData.story?.tone || "-" },
    { label: "Theme", value: projectData.story?.theme || "-" },
    { label: "Conflict Type", value: projectData.story?.conflict || "-" },
    { label: "Target Audience", value: projectData.story?.targetAudience || "-" },
    { label: "Ending Type", value: projectData.story?.endingType || "-" },
  ];
  
  overviewData.forEach((item, i) => {
    if (i % 2 === 0) {
      pdf.text(`${item.label}:`, 20, y);
      pdf.text(item.value, 80, y);
    } else {
      pdf.text(`${item.label}:`, 120, y);
      pdf.text(item.value, 180, y);
    }
    y += 15;
  });
  
  // Story Formula
  pdf.addPage();
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("2. Story Formula", 20, 20);
  
  y = 40;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text("Premise:", 20, y);
  pdf.text(projectData.story?.premise || "Not provided", 50, y);
  y += 20;
  
  pdf.text("Synopsis:", 20, y);
  pdf.text(projectData.story?.synopsis || "Not provided", 50, y);
  y += 30;
  
  pdf.text("Global Synopsis:", 20, y);
  pdf.text(projectData.story?.globalSynopsis || "Not provided", 50, y);
  y += 40;
  
  // Story Structure
  if (projectData.story?.structureBeats && Object.keys(projectData.story.structureBeats).length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`3. Story Structure - ${projectData.story.structure === "hero" ? "Hero's Journey" : projectData.story.structure === "cat" ? "Save the Cat" : "Dan Harmon Circle"}`, 20, 20);
    
    y = 40;
    Object.entries(projectData.story.structureBeats).forEach(([beat, desc], idx) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${idx + 1}. ${beat}:`, 20, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(desc, 170, 10);
      pdf.text(lines[0], 20, y);
      y += 10;
      if (lines.length > 1) {
        pdf.text(lines[1], 20, y);
        y += 10;
      }
      y += 15;
    });
  }
  
  // Character Profiles
  if (projectData.characters && projectData.characters.length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("4. Character Profiles", 20, 20);
    
    projectData.characters.forEach((char: any, idx) => {
      if (idx > 0) pdf.addPage();
      
      y = 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${char.name} (${char.role})`, 20, y);
      y += 15;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Age: ${char.age || "N/A"}`, 20, y);
      y += 10;
      pdf.text(`Gender: ${char.physiological?.gender || "N/A"}`, 80, y);
      y += 10;
      pdf.text(`Archetype: ${char.psychological?.archetype || "N/A"}`, 140, y);
      y += 10;
      
      // Psychology
      y += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Psychology:", 20, y);
      y += 10;
      pdf.text(`Wants: ${char.psychological?.wants || "N/A"}`, 20, y);
      y += 10;
      pdf.text(`Needs: ${char.psychological?.needs || "N/A"}`, 100, y);
      y += 10;
      pdf.text(`Fears: ${char.psychological?.fears || "N/A"}`, 20, y);
      y += 15;
    });
  }
  
  // Universe
  if (projectData.universe) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("5. Universe & World-Building", 20, 20);
    
    y = 40;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Universe Name: ${projectData.universe.name || "N/A"}`, 20, y);
    y += 15;
    pdf.text(`Period: ${projectData.universe.period || "N/A"}`, 100, y);
    y += 15;
    pdf.text(`Era: ${projectData.universe.era || "N/A"}`, 20, y);
    y += 15;
    pdf.text(`Location: ${projectData.universe.location || "N/A"}`, 80, y);
    y += 15;
    
    if (projectData.universe.environment) {
      y += 10;
      pdf.text("Environment:", 20, y);
      y += 10;
      const lines = pdf.splitTextToSize(projectData.universe.environment, 170, 10);
      pdf.text(lines[0], 20, y);
      y += 10;
      if (lines.length > 1) {
        pdf.text(lines[1], 20, y);
        y += 10;
      }
    }
  }
  
  // Moodboard Gallery
  if (projectData.moodboardImages && Object.keys(projectData.moodboardImages).length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("6. Moodboard Gallery", 20, 20);
    
    const images = Object.entries(projectData.moodboardImages);
    images.forEach(([beat, url], idx) => {
      if (idx > 0 && idx % 2 === 0) pdf.addPage();
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${beat}:`, 20, 20);
      
      // Add image placeholder
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, 40, 170, 100, 'S');
      pdf.setFillColor(200, 200, 200);
      pdf.rect(22, 42, 166, 96, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("[Image]", 60, 80);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(url, 20, 150);
    });
  }
  
  // Animation Previews
  if (projectData.animationVideos && Object.keys(projectData.animationVideos).length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("7. Animation Previews", 20, 20);
    
    const videos = Object.entries(projectData.animationVideos);
    videos.forEach(([beat, data], idx) => {
      if (idx > 0 && idx % 2 === 0) pdf.addPage();
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${beat}:`, 20, 20);
      
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, 40, 170, 100, 'S');
      pdf.setFillColor(200, 200, 200);
      pdf.rect(22, 42, 166, 96, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("[Video Preview]", 60, 80);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Duration: ${data.duration}s`, 20, 150);
      pdf.text(`Provider: ${data.provider}`, 100, 150);
    });
  }
  
  // Footer
  pdf.addPage();
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`© ${new Date().getFullYear()} ${projectData.studioName || "MODO Studio"} - All Rights Reserved`, 20, 280);
  pdf.text("Generated with MODO Creator Verse", 20, 290);
  
  return pdf.output('blob');
}
```

```typescript
// Add export handler
const handleExportPDF = async () => {
  try {
    const pdfBlob = await generateIPBiblePDF({
      title: project.title,
      studioName: project.studioName,
      ipOwner: project.ipOwner,
      story,
      characters,
      universe,
      moodboardImages,
      animationVideos,
    });
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_IP_Bible.pdf`;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
```

#### 6.2 Canva Integration

```typescript
// Create: src/app/api/canva/route.ts

import { NextRequest, NextResponse } from 'next/server';

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID || '';
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET || '';
const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI || '';

export async function GET(req: NextRequest) {
  // Check configuration
  return NextResponse.json({
    configured: !!CANVA_CLIENT_ID && !!CANVA_CLIENT_SECRET,
    hasClientId: !!CANVA_CLIENT_ID,
    hasClientSecret: !!CANVA_CLIENT_SECRET,
    hasRedirectUri: !!CANVA_REDIRECT_URI,
  });
}

export async function POST(req: NextRequest) {
  const { action } = await req.json();
  
  // Get auth URL
  if (action === 'auth-url') {
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://www.canva.com/api/oauth/authorize?` +
      `client_id=${CANVA_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(CANVA_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=design:read+design:write+design:content:read+design:content:write` +
      `&state=${state}`;
    
    return NextResponse.json({ authUrl });
  }
  
  // Create design
  if (action === 'create-design') {
    const { title } = await req.json();
    
    const response = await fetch('https://api.canva.com/rest/v1/designs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('canva_access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'a4_document',
        title: title || 'IP Bible Document',
      }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  }
  
  // List designs
  if (action === 'list-designs') {
    const response = await fetch('https://api.canva.com/rest/v1/designs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('canva_access_token')}`,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  }
  
  // Export design
  if (action === 'export') {
    const { designId, format } = await req.json();
    
    const response = await fetch(`https://api.canva.com/rest/v1/designs/${designId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('canva_access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format: format || 'pdf' }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
```

---

## 7. PERFORMANCE ANALYSIS TAB

### Current State
- ❌ Distribution tab completely missing
- ❌ No performance factors
- ❌ No AI prediction
- ❌ No radar chart

### Required Implementation

#### 7.1 Performance Analysis State

```typescript
interface PerformanceData {
  cast: string;
  director: string;
  producer: string;
  executiveProducer: string;
  distributor: string;
  publisher: string;
  titleBrandPositioning: string;
  themeStated: string;
  uniqueSelling: string;
  storyValues: string;
  fansLoyalty: string;
  productionBudget: string;
  promotionBudget: string;
  socialMediaEngagements: string;
  teaserTrailerEngagements: string;
  genre: string;
}

interface PerformanceScores {
  name: string;
  score: number;
  competitor: number;
}

const [performanceData, setPerformanceData] = useState<PerformanceData>({
  cast: "",
  director: "",
  producer: "",
  executiveProducer: "",
  distributor: "",
  publisher: "",
  titleBrandPositioning: "",
  themeStated: "",
  uniqueSelling: "",
  storyValues: "",
  fansLoyalty: "",
  productionBudget: "",
  promotionBudget: "",
  socialMediaEngagements: "",
  teaserTrailerEngagements: "",
  genre: "",
});

const [performanceScores, setPerformanceScores] = useState<PerformanceScores[]>([]);
const [predictedAudience, setPredictedAudience] = useState<number | null>(null);
const [competitorAudience, setCompetitorAudience] = useState<number | null>(null);
const [isGeneratingPerformance, setIsGeneratingPerformance] = useState(false);
```

#### 7.2 Performance Analysis Tab

```tsx
<TabsContent value="distribution" className="flex-1 overflow-auto mt-4">
  <Card>
    <CardHeader>
      <CardTitle>Performance Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Generate Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleGeneratePerformance}
            disabled={isGeneratingPerformance}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            {isGeneratingPerformance ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Generating Analysis...
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Performance Prediction
              </>
            )}
          </Button>
        </div>

        {/* 15 Performance Factors */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { key: "cast", label: "Cast" },
            { key: "director", label: "Director" },
            { key: "producer", label: "Producer" },
            { key: "executiveProducer", label: "Executive Producer" },
            { key: "distributor", label: "Distributor" },
            { key: "publisher", label: "Publisher" },
            { key: "titleBrandPositioning", label: "Title Brand Positioning" },
            { key: "themeStated", label: "Theme Stated" },
            { key: "uniqueSelling", label: "Unique Selling Proposition" },
            { key: "storyValues", label: "Story Values" },
            { key: "fansLoyalty", label: "Fans Loyalty" },
            { key: "productionBudget", label: "Production Budget" },
            { key: "promotionBudget", label: "Promotion Budget" },
            { key: "socialMediaEngagements", label: "Social Media Engagements" },
            { key: "teaserTrailerEngagements", label: "Teaser Trailer Engagements" },
            { key: "genre", label: "Genre" },
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm font-semibold">{field.label}</Label>
              <Input 
                value={performanceData[field.key as keyof PerformanceData]}
                onChange={(e) => setPerformanceData(prev => ({
                  ...prev,
                  [field.key]: e.target.value
                }))}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>

        {/* Results Section */}
        {performanceScores.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Analysis Results</h3>
            
            {/* Radar Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceScores.map(s => ({
                  subject: s.name,
                  A: s.score,
                  B: s.competitor,
                  fullMark: 100,
                }))}>
                  <PolarGrid angle={0} angle={90} angle={180} angle={270} angle={360} />
                  <PolarRadius angle={0} angle={90} angle={180} angle={270} angle={360} domain={[0, 100]} />
                  <PolarRadius angle={90} angle={180} angle={270} angle={360} domain={[0, 100]} />
                  <PolarRadius angle={180} angle={270} angle={360} domain={[0, 100]} />
                  <PolarRadius angle={270} angle={360} domain={[0, 100]} />
                  <PolarRadius angle={360} angle={90} angle={180} angle={270} domain={[0, 100]} />
                  <PolarGrid angle={0} angle={90} angle={180} angle={270} angle={360} />
                  <PolarGrid angle={90} angle={180} angle={270} angle={360} />
                  <PolarGrid angle={180} angle={270} angle={360} />
                  <PolarGrid angle={270} angle={360} domain={[0, 100]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Predicted Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-center">
                    {predictedAudience?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    Estimated viewers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-center">
                    {competitorAudience?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    Similar projects
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Actionable Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {performanceScores.filter(s => s.score < 70).map(s => (
                    <li key={s.name} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        <strong>{s.name}:</strong> {getSuggestion(s.name, s.score)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

#### 7.3 Performance Prediction API

```typescript
// Create: src/app/api/ai/predict-performance/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const performanceData = await req.json();
    
    const prompt = `Analyze the market potential of this film/series project and provide performance predictions.

PROJECT INFORMATION:
${Object.entries(performanceData).map(([key, value]) => 
  `${key.toUpperCase().replace(/([A-Z])/g, ' $1')}: ${value || "N/A"}`
).join('\n')}

TASK:
1. Score each of the 15 factors from 0-100 based on market potential
2. Calculate overall performance score
3. Predict total audience reach
4. Compare with average competitor projects
5. Provide actionable suggestions for factors below 70

Return as JSON:
{
  "scores": [
    { "name": "Cast", "score": 85, "competitor": 72 },
    { "name": "Director", "score": 78, "competitor": 65 },
    { "name": "Producer", "score": 82, "competitor": 70 },
    { "name": "Executive Producer", "score": 75, "competitor": 68 },
    { "name": "Distributor", "score": 88, "competitor": 75 },
    { "name": "Publisher", "score": 80, "competitor": 72 },
    { "name": "Title Brand Positioning", "score": 83, "competitor": 70 },
    { "name": "Theme Stated", "score": 79, "competitor": 68 },
    { "name": "Unique Selling Proposition", "score": 86, "competitor": 74 },
    { "name": "Story Values", "score": 81, "competitor": 69 },
    { "name": "Fans Loyalty", "score": 77, "competitor": 65 },
    { "name": "Production Budget", "score": 76, "competitor": 70 },
    { "name": "Promotion Budget", "score": 74, "competitor": 68 },
    { "name": "Social Media Engagements", "score": 82, "competitor": 71 },
    { "name": "Teaser Trailer Engagements", "score": 80, "competitor": 73 },
    { "name": "Genre", "score": 78, "competitor": 70 }
  ],
  "predictedAudience": 1250000,
  "competitorAudience": 950000,
  "suggestions": [
    "Consider adding a well-known actor to boost Cast score",
    "Partner with a major distributor for wider reach",
    "Increase promotion budget for better Social Media score",
    "Refine the Unique Selling Proposition for better differentiation"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Performance prediction error:', error);
    return NextResponse.json({ error: 'Failed to predict performance' }, { status: 500 });
  }
}
```

---

## 8. ASSET LIBRARY

### Current State
- ❌ Not implemented

### Required Implementation

#### 8.1 Asset Library API

```typescript
// Create: src/app/api/assets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
await mkdir(UPLOAD_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}-${randomSuffix}${file.name.substring(file.name.lastIndexOf('.'))}`;

    const filePath = join(UPLOAD_DIR, filename);
    const arrayBuffer = await file.arrayBuffer();
    
    // Write file
    await writeFile(filePath, new Uint8Array(arrayBuffer));

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      mimetype: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const fs = await import('fs');
    const files = await fs.promises.readdir(UPLOAD_DIR);
    
    const assets = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => {
        const stats = fs.statSync(join(UPLOAD_DIR, file));
        return {
          url: `/uploads/${file}`,
          filename: file,
          size: stats.size,
          createdAt: stats.birthtimeMs,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(assets);

  } catch (error) {
    console.error('List assets error:', error);
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const filename = pathname.split('/').pop();
  
  try {
    const filePath = join(UPLOAD_DIR, filename);
    const fs = await import('fs');
    
    if (await fs.promises.access(filePath).then(() => true).catch(() => false)) {
      await fs.promises.unlink(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
```

#### 8.2 Asset Library UI Component

```tsx
// Add to project page
const [showAssetModal, setShowAssetModal] = useState(false);
const [assetSelectTarget, setAssetSelectTarget] = useState<string | null>(null);

const openAssetPicker = (target: string) => {
  setAssetSelectTarget(target);
  setShowAssetModal(true);
};

const handleAssetSelect = (url: string) => {
  if (!assetSelectTarget) return;
  
  if (assetSelectTarget === "character") {
    setEditingCharacter(prev => prev ? { ...prev, image: url } : prev);
  } else if (assetSelectTarget === "studio-logo") {
    setProject({ ...project, studioLogo: url });
  } else if (assetSelectTarget.startsWith("logo-")) {
    const index = parseInt(assetSelectTarget.split("-")[1]);
    const newLogos = [...project.brandIdentity.logos];
    newLogos[index] = url;
    setProject({ ...project, brandIdentity: { ...project.brandIdentity, logos: newLogos } });
  }
  
  setShowAssetModal(false);
  setAssetSelectTarget(null);
};

// Add Asset Picker Modal
{showAssetModal && (
  <Dialog open={showAssetModal} onOpenChange={setShowAssetModal}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Select Asset</DialogTitle>
        <DialogDescription>Choose an image from your asset library</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {assets.map(asset => (
            <div 
              key={asset.filename}
              className="cursor-pointer hover:ring-2 hover:ring-primary rounded-lg overflow-hidden border transition-all"
              onClick={() => handleAssetSelect(asset.url)}
            >
              <img 
                src={asset.url} 
                alt={asset.originalName}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-medium truncate">{asset.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {(asset.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowAssetModal(false)}>
          Cancel
        </Button>
        <Button onClick={() => document.getElementById('asset-upload-input')?.click()}>
          Upload New Asset
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

// Hidden file input
<input
  id="asset-upload-input"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleAssetUpload}
/>
```

---

## 9. MODO COMMUNITY INTEGRATION

### Current State
- ❌ Not implemented

### Required Implementation

#### 9.1 Modo Token Holder Selection

```typescript
// Update IP Project team to use Modo token holders
interface ModoMember {
  id: number;
  name: string;
  wallet: string;
  tokens: number;
}

const [modoMembers] = useState<ModoMember[]>([
  { id: 1, name: "Alex Wijaya", wallet: "0x1234...5678", tokens: 1500 },
  { id: 2, name: "Budi Santoso", wallet: "0x2345...6789", tokens: 2300 },
  { id: 3, name: "Citra Dewi", wallet: "0x3456...7890", tokens: 890 },
  { id: 4, name: "Dimas Prasetyo", wallet: "0x4567...8901", tokens: 3200 },
  { id: 5, name: "Eka Putri", wallet: "0x5678...9012", tokens: 1100 },
]);

const [showInviteModal, setShowInviteModal] = useState(false);
const [selectingRole, setSelectingRole] = useState<string | null>(null);
```

#### 9.2 Modo Team Selection UI

```tsx
{/* Project Team - All members must be Modo token holders */}
<div className="space-y-4">
  <div className="flex items-center justify-between border-b border-white/10 pb-2">
    <h3 className="font-bold text-lg">Project Team</h3>
    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
      Modo Token Holders Only
    </span>
  </div>
  <p className="text-xs text-muted-foreground">
    Semua anggota team harus memiliki token dan membership di Modo Community.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      { key: "ipProducer", label: "IP Producer" },
      { key: "headOfCreative", label: "Head of Creative" },
      { key: "headOfProduction", label: "Head of Production" },
      { key: "headOfBusiness", label: "Head of Business & Strategic" },
      { key: "storySupervisor", label: "Story Supervisor" },
      { key: "characterSupervisor", label: "Character Supervisor" },
    ].map(({ key, label }) => {
      const member = ipProject.team[key as keyof typeof ipProject.team] as ModoMember | null;
      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm text-muted-foreground">{label}</Label>
          {member ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-[10px] text-muted-foreground">{member.tokens.toLocaleString()} MODO</div>
                </div>
              </div>
              <button 
                className="text-white/50 hover:text-red-400 text-lg"
                onClick={() => setIpProject({
                  ...ipProject,
                  team: { ...ipProject.team, [key]: null }
                })}
              >
                ×
              </button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full justify-start border-dashed border-white/20 text-muted-foreground hover:border-primary hover:text-primary"
              onClick={() => { setSelectingRole(key); setShowInviteModal(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Pilih dari Modo Community
            </Button>
          )}
        </div>
      );
    })}
  </div>
</div>

{/* Invite Modal */}
{showInviteModal && (
  <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Modo Token Holder</DialogTitle>
        <DialogDescription>
          Pilih anggota Modo Community yang memiliki token untuk bergabung dalam project ini.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          <div>
            <Label>Role</Label>
            <Select value={selectingRole || ""} onValueChange={setSelectingRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ipProducer">IP Producer</SelectItem>
                <SelectItem value="headOfCreative">Head of Creative</SelectItem>
                <SelectItem value="headOfProduction">Head of Production</SelectItem>
                <SelectItem value="headOfBusiness">Head of Business & Strategic</SelectItem>
                <SelectItem value="storySupervisor">Story Supervisor</SelectItem>
                <SelectItem value="characterSupervisor">Character Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Modo Member</Label>
            <Select value="" onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {modoMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.tokens.toLocaleString()} MODO)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowInviteModal(false)}>
          Cancel
        </Button>
        <Button onClick={handleInviteModoMember}>
          Invite
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

---

# 📋 DATABASE SCHEMA UPDATES

## Required Tables & Columns

```sql
-- Add strategy data to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategy_data JSONB;

-- Add animation videos to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS animation_videos JSONB;

-- Add script to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS generated_script TEXT;

-- Add visual references to universes table
ALTER TABLE universes ADD COLUMN IF NOT EXISTS environment_image TEXT;
ALTER TABLE universes ADD COLUMN IF NOT EXISTS society_image TEXT;
ALTER TABLE universes ADD COLUMN IF NOT EXISTS private_life_image TEXT;
ALTER TABLE universes ADD COLUMN IF NOT EXISTS government_image TEXT;
ALTER TABLE universes ADD COLUMN IF EXISTS economy_image TEXT;
ALTER TABLE universes ADD COLUMN IF NOT EXISTS culture_image TEXT;

-- Add performance data to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS performance_data JSONB;

-- Add performance scores to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS performance_scores JSONB;

-- Add Modo member references
ALTER TABLE projects ADD COLUMN IF NOT EXISTS modo_team JSONB;

-- Add assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  size BIGINT NOT NULL,
  mimetype TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add canva session data
CREATE TABLE IF NOT EXISTS canva_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 📦 API ENDPOINTS TO CREATE

## New API Endpoints Required

```
/api/ai/generate-strategy          - POST
/api/ai/generate-script             - POST
/api/ai/generate-video              - POST
/api/ai/predict-performance       - POST
/api/canva/auth-url                - GET
/api/canva/callback                - GET
/api/canva/connection             - GET
/api/canva/disconnect            - POST
/api/canva/designs                - POST
/api/canva/designs                - GET
/api/canva/designs/:id            - GET
/api/canva/designs/:id/export      - POST
/api/canva/status                 - GET
/api/assets/upload                 - POST
/api/assets                       - GET
/api/assets/:filename              - DELETE
```

---

# 📦 DEPENDENCIES TO INSTALL

```bash
npm install jspdf html2canvas
npm install @types/jspdf
npm install recharts
```

---

# 📅 IMPLEMENTATION PRIORITY

## Phase 1: Core Studio Features (Week 1-2)

1. ✅ Strategic Plan Tab
   - [ ] Connect strategy fields to state
   - [ ] Implement save/load functionality
   - [ ] Add AI generation for each section
   - [ ] Integrate with IP Bible export
   - [ ] Add to database schema

2. ✅ Story Formula Completion
   - [ ] Implement Script Generation
   - [ ] Connect Key Actions to AI generation
   - [ ] Add script to IP Bible export

3. ✅ Universe Formula Enhancement
   - [ ] Add visual reference image uploads
   - [ ] Add 6 image fields to database
   - [ ] Update UI to show images

4. ✅ Animation Generation
   - [ ] Integrate Kling AI API
   - [ ] Integrate Runway API
   - [ ] Integrate Luma API
   - [ ] Implement video generation endpoint
   - [ ] Add video player component
   - [ ] Implement status tracking
   - [ ] Add download functionality
   - [ ] Add provider selection UI
   - [ ] Add duration selection UI

## Phase 2: IP Bible & Performance (Week 3-4)

5. ✅ IP Bible Export
   - [ ] Implement PDF generation with jsPDF
   - [ ] Add export button functionality
   - [ ] Implement Word export (optional)
   - [ ] Add print functionality

6. ✅ Canva Integration
   - [ ] Implement OAuth 2.0 flow
   - [ ] Implement design creation
   - [ ] Implement design listing
   - Implement design export

7. ✅ Performance Analysis
   - [ ] Create Performance Analysis tab
   - [ ] Add 15 performance factor inputs
   - [ ] Implement AI prediction API
   - [ ] Add radar chart visualization
   - [ ] Add competitor comparison
   - [ ] Add actionable suggestions

## Phase 3: Edit & Mix (Week 5-6)

8. ✅ Video Timeline Editor
   - [ ] Implement timeline UI component
   - [ ] Add video track support
   - [ ] Add audio track support
   - [ ] Add SFX track support
   - [ ] Implement drag-and-drop
   - [ ] Implement clip management
   - [ ] Add volume controls
   - [ ] Implement trim/cut functionality

## Phase 4: Supporting Features (Week 7-8)

9. ✅ Asset Library
   - [ ] Implement file upload API
   - [ ] Implement asset listing API
   - [ ] Implement delete functionality
   - [ ] Add Asset Library UI component
   - [ ] Integrate with character and project uploads

10. ✅ Modo Community Integration
   - [ ] Update team selection to use Modo token holders
   - [ ] Implement Modo member selection UI
   - [ ] Add invite modal
   - [ ] Add token display

---

# 📊 SUCCESS CRITERIA

## Definition of "100% Feature Parity"

ecosystem-IP-ai will be considered 100% feature-identical to AI-Series-Studio when:

### Core Studio Features
- [ ] Strategic Plan tab is fully functional with AI generation
- [ ] Story Formula includes script generation
- [ ] Character Formula is 100% complete (ALREADY DONE)
- [ ] Universe Formula includes visual references
- [ ] Moodboard is 100% complete (ALREADY DONE)
- [ ] Animation tab generates actual videos with multiple providers
- [ ] Edit & Mix tab has functional timeline editor
- [ ] IP Bible exports to PDF
- [ ] Performance Analysis tab works with AI prediction

### Integration Features
- [ ] Canva integration is fully functional
- [ ] Asset Library is implemented
- [ ] Modo Community integration works

### Data Persistence
- [ ] All data is saved to database
- [ ] Auto-save works for all tabs
- [ ] All features are accessible via API

### UI/UX
- [ ] All tabs match AI-Series-Studio layout
- [ ] All dropdowns and inputs match
- [ ] All AI generation buttons work
- [ ] All loading states are visible
- [ ] All error handling is implemented

---

# 📅 DOCUMENT INFO

**Created:** December 2025  
**Version:** 1.0  
**Reference:** D:\AI\AI-Series-Studio  
**Author:** Architecture Analysis  
**Status:** Ready for Implementation

---

# 📝 NOTES

1. This document is a comprehensive guide for making ecosystem-IP-ai 100% feature-identical to AI-Series-Studio
2. Each section includes code examples that can be directly copied and implemented
3. All API endpoints are specified with exact request/response formats
4. Database schema updates are provided as SQL statements
5. Dependencies are listed for installation
6. Implementation is prioritized by phase

7. The reference implementation uses React + Express + Vite, while ecosystem-IP-ai uses Next.js - adaptations may be needed for Next.js specific patterns

8. All state management should follow React best practices
9. All API calls should include proper error handling
10. All UI components should use the existing shadcn/ui library
