"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Briefcase, Share2, User, Film, Book, Image as ImageIcon, 
  Video, Edit3, FileText, Save, Download, Plus, ChevronRight,
  Wand2, Trash2, Upload, Play, Settings, Sparkles, Globe,
  Volume2, Music, SkipForward, Palette, Users, FolderOpen
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/context";

// Import all dropdown options
import {
  GENDER_OPTIONS, AGE_RANGE_OPTIONS, ETHNICITY_OPTIONS, SKIN_TONE_OPTIONS,
  FACE_SHAPE_OPTIONS, EYE_SHAPE_OPTIONS, EYE_COLOR_OPTIONS, NOSE_SHAPE_OPTIONS,
  LIPS_SHAPE_OPTIONS, HAIR_STYLE_OPTIONS, HAIR_COLOR_OPTIONS, HIJAB_OPTIONS,
  BODY_TYPE_OPTIONS, HEIGHT_OPTIONS, CLOTHING_STYLE_OPTIONS, ACCESSORIES_OPTIONS,
  PROPS_OPTIONS, CHARACTER_ROLE_OPTIONS, PERSONALITY_TRAITS_OPTIONS,
  GENRE_OPTIONS, FORMAT_OPTIONS, TARGET_AUDIENCE_OPTIONS, TONE_OPTIONS,
  STORY_STRUCTURE_OPTIONS, CONFLICT_TYPE_OPTIONS, THEME_OPTIONS,
  SETTING_ERA_OPTIONS, SETTING_LOCATION_OPTIONS, WORLD_TYPE_OPTIONS,
  TECHNOLOGY_LEVEL_OPTIONS, MAGIC_SYSTEM_OPTIONS,
  VISUAL_STYLE_OPTIONS, COLOR_PALETTE_OPTIONS, LIGHTING_OPTIONS, CAMERA_ANGLE_OPTIONS
} from "@/lib/studio-options";

// Types
interface Character {
  id: string;
  name: string;
  role: string;
  age: string;
  castReference: string;
  imageUrl: string;
  imagePoses: Record<string, string>;
  physiological: {
    gender: string;
    ethnicity: string;
    skinTone: string;
    faceShape: string;
    eyeShape: string;
    eyeColor: string;
    noseShape: string;
    lipsShape: string;
    hairStyle: string;
    hairColor: string;
    hijab: string;
    bodyType: string;
    height: string;
    uniqueness: string;
  };
  psychological: {
    archetype: string;
    fears: string;
    wants: string;
    needs: string;
    alterEgo: string;
    traumatic: string;
    personalityType: string;
  };
  emotional: {
    logos: string;
    ethos: string;
    pathos: string;
    tone: string;
    style: string;
    mode: string;
  };
  family: {
    spouse: string;
    children: string;
    parents: string;
  };
  sociocultural: {
    affiliation: string;
    groupRelationshipLevel: string;
    cultureTradition: string;
    language: string;
    tribe: string;
    economicClass: string;
  };
  coreBeliefs: {
    faith: string;
    religionSpirituality: string;
    trustworthy: string;
    willingness: string;
    vulnerability: string;
    commitments: string;
    integrity: string;
  };
  educational: {
    graduate: string;
    achievement: string;
    fellowship: string;
  };
  sociopolitics: {
    partyId: string;
    nationalism: string;
    citizenship: string;
  };
  swot: {
    strength: string;
    weakness: string;
    opportunity: string;
    threat: string;
  };
  clothingStyle: string;
  accessories: string[];
  props: string;
  personalityTraits: string[];
}

interface Story {
  premise: string;
  synopsis: string;
  globalSynopsis: string;
  genre: string;
  subGenre: string;
  format: string;
  duration: string;
  tone: string;
  theme: string;
  conflict: string;
  targetAudience: string;
  structure: string;
  structureBeats: Record<string, string>;
  keyActions: Record<string, Record<string, string>>;
  wantNeedMatrix: {
    want: { external: string; known: string; specific: string; achieved: string };
    need: { internal: string; unknown: string; universal: string; achieved: string };
  };
  endingType: string;
  generatedScript: string;
}

interface Universe {
  name: string;
  period: string;
  era: string;
  location: string;
  worldType: string;
  technologyLevel: string;
  magicSystem: string;
  environment: string;
  society: string;
  privateLife: string;
  government: string;
  economy: string;
  culture: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  studioName: string;
  logoUrl: string;
  ipOwner: string;
  productionDate: string;
  brandColors: string[];
  brandLogos: string[];
  team: Record<string, any>;
}

// Create empty character
const createEmptyCharacter = (): Omit<Character, 'id'> => ({
  name: "",
  role: "supporting",
  age: "",
  castReference: "",
  imageUrl: "",
  imagePoses: {},
  physiological: {
    gender: "", ethnicity: "", skinTone: "", faceShape: "",
    eyeShape: "", eyeColor: "", noseShape: "", lipsShape: "",
    hairStyle: "", hairColor: "", hijab: "none", bodyType: "",
    height: "", uniqueness: ""
  },
  psychological: {
    archetype: "", fears: "", wants: "", needs: "",
    alterEgo: "", traumatic: "", personalityType: ""
  },
  emotional: {
    logos: "", ethos: "", pathos: "", tone: "", style: "", mode: ""
  },
  family: { spouse: "", children: "", parents: "" },
  sociocultural: {
    affiliation: "", groupRelationshipLevel: "", cultureTradition: "",
    language: "", tribe: "", economicClass: ""
  },
  coreBeliefs: {
    faith: "", religionSpirituality: "", trustworthy: "",
    willingness: "", vulnerability: "", commitments: "", integrity: ""
  },
  educational: { graduate: "", achievement: "", fellowship: "" },
  sociopolitics: { partyId: "", nationalism: "", citizenship: "" },
  swot: { strength: "", weakness: "", opportunity: "", threat: "" },
  clothingStyle: "",
  accessories: [],
  props: "",
  personalityTraits: []
});

// Story structure beats
const HERO_JOURNEY_BEATS = [
  "Ordinary World", "Call to Adventure", "Refusal of Call", "Meeting Mentor",
  "Crossing Threshold", "Tests & Allies", "Inmost Cave", "Ordeal",
  "Reward", "The Road Back", "Resurrection", "Return with Elixir"
];

const SAVE_THE_CAT_BEATS = [
  "Opening Image", "Theme Stated", "Set-Up", "Catalyst",
  "Debate", "Break into Two", "B Story", "Fun & Games",
  "Midpoint", "Bad Guys Close In", "All Is Lost", "Dark Night of Soul",
  "Break into Three", "Finale", "Final Image"
];

const DAN_HARMON_BEATS = [
  "You (Comfort)", "Need (Desire)", "Go (Unfamiliar)", "Search (Adapt)",
  "Find (Get it)", "Take (Pay Price)", "Return (Go Back)", "Change (Changed)"
];

export default function ProjectStudioPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  // Tab state
  const [activeTab, setActiveTab] = useState("ip-project");
  
  // Project state
  const [project, setProject] = useState<Project>({
    id: projectId,
    title: "",
    description: "",
    studioName: "",
    logoUrl: "",
    ipOwner: "",
    productionDate: "",
    brandColors: ["#9B87F5", "#33C3F0", "#F2C94C", "#F2994A", "#8B7355"],
    brandLogos: ["", "", ""],
    team: {}
  });

  // Characters state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Story state
  const [story, setStory] = useState<Story>({
    premise: "", synopsis: "", globalSynopsis: "",
    genre: "", subGenre: "", format: "", duration: "",
    tone: "", theme: "", conflict: "", targetAudience: "",
    structure: "hero",
    structureBeats: {},
    keyActions: {},
    wantNeedMatrix: {
      want: { external: "", known: "", specific: "", achieved: "" },
      need: { internal: "", unknown: "", universal: "", achieved: "" }
    },
    endingType: "",
    generatedScript: ""
  });

  // Universe state
  const [universe, setUniverse] = useState<Universe>({
    name: "", period: "", era: "", location: "",
    worldType: "", technologyLevel: "", magicSystem: "",
    environment: "", society: "", privateLife: "",
    government: "", economy: "", culture: ""
  });

  // Moodboard state
  const [moodboardPrompts, setMoodboardPrompts] = useState<Record<string, string>>({});
  const [moodboardImages, setMoodboardImages] = useState<Record<string, string>>({});
  const [animationStyle, setAnimationStyle] = useState("3d");

  // Animation state
  const [animationPrompts, setAnimationPrompts] = useState<Record<string, string>>({});
  const [animationPreviews, setAnimationPreviews] = useState<Record<string, string>>({});

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [generatingCountdown, setGeneratingCountdown] = useState<Record<string, number>>({});
  const [queuePosition, setQueuePosition] = useState<Record<string, { position: number; total: number; queueId: string }>>({});
  const [userTier, setUserTier] = useState<string>("trial");

  // Tier-based delays (in seconds) - for non-queued tiers
  const TIER_DELAYS: Record<string, number> = {
    trial: 0, // Trial uses queue system now
    creator: 5,
    studio: 0,
    enterprise: 0
  };

  // Load project data
  useEffect(() => {
    if (projectId && user) {
      loadProjectData();
    }
  }, [projectId, user]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user tier
      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserTier(profileData.subscriptionTier || "trial");
      }
      
      const res = await fetch(`/api/creator/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject({
          id: data.id,
          title: data.title || "",
          description: data.description || "",
          studioName: data.studioName || "",
          logoUrl: data.logoUrl || "",
          ipOwner: data.ipOwner || "",
          productionDate: data.productionDate || "",
          brandColors: data.brandColors || ["#9B87F5", "#33C3F0", "#F2C94C", "#F2994A", "#8B7355"],
          brandLogos: data.brandLogos || ["", "", ""],
          team: data.team || {}
        });
        if (data.characters) setCharacters(data.characters);
        if (data.story) setStory(data.story);
        if (data.universe) setUniverse(data.universe);
        if (data.moodboardPrompts) setMoodboardPrompts(data.moodboardPrompts);
        if (data.moodboardImages) setMoodboardImages(data.moodboardImages);
        if (data.animationPrompts) setAnimationPrompts(data.animationPrompts);
        if (data.animationPreviews) setAnimationPreviews(data.animationPreviews);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current structure beats
  const getStructureBeats = () => {
    switch (story.structure) {
      case "hero": return HERO_JOURNEY_BEATS;
      case "cat": return SAVE_THE_CAT_BEATS;
      case "harmon": return DAN_HARMON_BEATS;
      default: return HERO_JOURNEY_BEATS;
    }
  };

  // Poll queue status until completed
  const pollQueueStatus = async (queueId: string, type: string): Promise<any> => {
    const maxAttempts = 120; // 2 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
      
      try {
        const res = await fetch(`/api/ai/queue?queueId=${queueId}`);
        const data = await res.json();
        
        if (data.status === "completed") {
          setQueuePosition(prev => ({ ...prev, [type]: undefined as any }));
          return data.result;
        }
        
        if (data.status === "failed") {
          throw new Error(data.error || "Generation failed");
        }
        
        // Update queue position
        if (data.status === "queued") {
          setQueuePosition(prev => ({
            ...prev,
            [type]: { position: data.position, total: data.totalInQueue, queueId }
          }));
        } else if (data.status === "processing") {
          setQueuePosition(prev => ({
            ...prev,
            [type]: { position: 0, total: data.totalInQueue, queueId }
          }));
        }
      } catch (e) {
        console.error("Poll error:", e);
      }
    }
    
    throw new Error("Queue timeout - please try again");
  };

  // AI Generation functions with queue support for trial tier
  const generateWithAI = async (type: string, params: Record<string, any>) => {
    if (!user?.id) {
      alert("Please login first");
      return null;
    }
    
    setIsGenerating(prev => ({ ...prev, [type]: true }));
    
    // Start countdown timer for tier delay (non-queued tiers)
    const delay = TIER_DELAYS[userTier] || 0;
    if (delay > 0) {
      setGeneratingCountdown(prev => ({ ...prev, [type]: delay }));
      const countdownInterval = setInterval(() => {
        setGeneratingCountdown(prev => {
          const current = prev[type] || 0;
          if (current <= 1) {
            clearInterval(countdownInterval);
            return { ...prev, [type]: 0 };
          }
          return { ...prev, [type]: current - 1 };
        });
      }, 1000);
    }
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          generationType: type,
          projectId,
          projectName: project.title,
          ...params
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Generation failed");
      }
      
      const data = await res.json();
      
      // If queued, poll for result
      if (data.queued) {
        setQueuePosition(prev => ({
          ...prev,
          [type]: { position: data.position, total: data.totalInQueue, queueId: data.queueId }
        }));
        
        // Wait for queue processing
        const result = await pollQueueStatus(data.queueId, type);
        return result;
      }
      
      // Direct result (non-queued)
      return data;
    } catch (error: any) {
      console.error(`AI generation failed (${type}):`, error);
      alert(error.message || "Generation failed");
      return null;
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
      setGeneratingCountdown(prev => ({ ...prev, [type]: 0 }));
      setQueuePosition(prev => ({ ...prev, [type]: undefined as any }));
    }
  };

  // Auto-save project to database
  const autoSaveProject = async (updatedStory?: typeof story, updatedUniverse?: typeof universe) => {
    try {
      const payload = {
        ...project,
        story: updatedStory || story,
        universe: updatedUniverse || universe,
        moodboardPrompts,
        moodboardImages,
        animationPrompts,
        animationPreviews
      };
      console.log("Auto-saving project:", projectId, payload);
      
      const res = await fetch(`/api/creator/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Auto-save API error:", error);
        alert("Failed to save: " + (error.error || "Unknown error"));
      } else {
        console.log("Auto-save success!");
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
      alert("Failed to save project");
    }
  };

  // Helper: Parse JSON from AI response (handles markdown code blocks)
  const parseAIResponse = (text: string): any => {
    let jsonText = text;
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }
    return JSON.parse(jsonText);
  };

  // Generate Synopsis - auto-fill all story fields and auto-save
  const handleGenerateSynopsis = async () => {
    if (!story.premise) {
      alert("Please enter a premise first");
      return;
    }
    const result = await generateWithAI("synopsis", { 
      prompt: story.premise,
      genre: story.genre,
      tone: story.tone
    });
    if (result?.resultText) {
      try {
        const parsed = parseAIResponse(result.resultText);
        
        // Auto-fill all story fields from JSON response
        const updatedStory = {
          ...story,
          synopsis: parsed.synopsis || story.synopsis,
          globalSynopsis: parsed.globalSynopsis || story.globalSynopsis,
          genre: parsed.genre || story.genre,
          subGenre: parsed.subGenre || story.subGenre,
          tone: parsed.tone || story.tone,
          theme: parsed.theme || story.theme,
          conflict: parsed.conflict || story.conflict,
          targetAudience: parsed.targetAudience || story.targetAudience,
        };
        setStory(updatedStory);
        
        // Auto-save to database
        await autoSaveProject(updatedStory);
      } catch (e) {
        // Fallback: use as plain text synopsis
        console.warn("Could not parse JSON, using as plain text:", e);
        const updatedStory = { ...story, synopsis: result.resultText };
        setStory(updatedStory);
        await autoSaveProject(updatedStory);
      }
    }
  };

  // Generate Story Structure - auto-fill beats, key actions, and want/need matrix, auto-save
  const handleGenerateStructure = async () => {
    if (!story.premise || !story.synopsis) {
      alert("Please enter premise and synopsis first");
      return;
    }
    const result = await generateWithAI("story_structure", {
      prompt: `Generate ${story.structure} story structure for: ${story.premise}\n\nSynopsis: ${story.synopsis}\nGenre: ${story.genre}\nTone: ${story.tone}`,
      structure: story.structure,
      genre: story.genre,
      characters: characters.map(c => ({ name: c.name, role: c.role }))
    });
    if (result?.resultText) {
      try {
        const parsed = parseAIResponse(result.resultText);
        const updatedStory = {
          ...story,
          structureBeats: parsed.beats || {},
          keyActions: parsed.keyActions || {},
          wantNeedMatrix: parsed.wantNeedMatrix || story.wantNeedMatrix
        };
        setStory(updatedStory);
        await autoSaveProject(updatedStory);
      } catch (e) {
        console.warn("Could not parse structure:", e);
      }
    }
  };

  // Generate ALL moodboard prompts from story beats - auto-fill and auto-save
  const handleGenerateAllMoodboardPrompts = async () => {
    if (!story.synopsis || Object.keys(story.structureBeats).length === 0) {
      alert("Please generate synopsis and story structure first");
      return;
    }
    
    const beats = getStructureBeats();
    const newPrompts: Record<string, string> = {};
    
    for (const beat of beats) {
      const beatDescription = story.structureBeats[beat] || beat;
      const keyAction = story.keyActions[beat] || "";
      
      setIsGenerating(prev => ({ ...prev, [`prompt_${beat}`]: true }));
      
      const result = await generateWithAI("moodboard_prompt", {
        prompt: `Beat: ${beat}\nDescription: ${beatDescription}\nKey Action: ${keyAction}\nGenre: ${story.genre}\nTone: ${story.tone}\nSynopsis: ${story.synopsis}`,
        beat,
        genre: story.genre,
        tone: story.tone
      });
      
      if (result?.resultText) {
        try {
          const parsed = parseAIResponse(result.resultText);
          newPrompts[beat] = parsed.prompt || result.resultText;
        } catch {
          newPrompts[beat] = result.resultText;
        }
      }
      
      setIsGenerating(prev => ({ ...prev, [`prompt_${beat}`]: false }));
    }
    
    setMoodboardPrompts(prev => ({ ...prev, ...newPrompts }));
    
    // Auto-save
    await fetch(`/api/creator/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...project,
        story,
        universe,
        moodboardPrompts: { ...moodboardPrompts, ...newPrompts },
        moodboardImages,
        animationPrompts,
        animationPreviews
      })
    });
  };

  // Generate Character Image
  const handleGenerateCharacterImage = async (pose: string) => {
    if (!editingCharacter?.name) {
      alert("Please enter character name first");
      return;
    }
    
    const appearance = [
      editingCharacter.physiological.gender,
      editingCharacter.physiological.ethnicity,
      editingCharacter.physiological.skinTone,
      editingCharacter.physiological.faceShape,
      editingCharacter.physiological.hairStyle,
      editingCharacter.physiological.hairColor,
      editingCharacter.clothingStyle
    ].filter(Boolean).join(", ");

    const result = await generateWithAI("character_image", {
      prompt: `${editingCharacter.name}, ${editingCharacter.role}, ${appearance}, ${pose} pose`,
      pose,
      characterName: editingCharacter.name,
      castReference: editingCharacter.castReference,
      appearance
    });

    if (result?.resultUrl) {
      setEditingCharacter(prev => prev ? {
        ...prev,
        imagePoses: { ...prev.imagePoses, [pose]: result.resultUrl }
      } : prev);
    }
  };

  // Generate Moodboard Image
  const handleGenerateMoodboardImage = async (beat: string) => {
    const prompt = moodboardPrompts[beat];
    if (!prompt) {
      alert("Please add a prompt description first");
      return;
    }

    const result = await generateWithAI("moodboard_image", {
      prompt,
      beat,
      genre: story.genre,
      animationStyle
    });

    if (result?.resultUrl) {
      setMoodboardImages(prev => ({ ...prev, [beat]: result.resultUrl }));
    }
  };

  // Helper: Render generate button content with countdown and queue position
  const renderGenerateButton = (type: string, label: string) => {
    const generating = isGenerating[type];
    const countdown = generatingCountdown[type] || 0;
    const queue = queuePosition[type];
    
    if (!generating) return label;
    
    // Show queue position for trial tier
    if (queue) {
      if (queue.position === 0) {
        return (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing...
          </span>
        );
      }
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Queue #{queue.position}/{queue.total}
        </span>
      );
    }
    
    // Show countdown for paid tiers
    if (countdown > 0) {
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {countdown}s
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Processing...
      </span>
    );
  };

  // Save project
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...project,
        story,
        universe,
        moodboardPrompts,
        moodboardImages,
        animationPrompts,
        animationPreviews
      };
      console.log("Saving project:", projectId, payload);
      
      const res = await fetch(`/api/creator/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Save failed");
      }
      
      // Save characters separately
      for (const char of characters) {
        if (!char.id.startsWith("temp-")) {
          await fetch(`/api/creator/projects/${projectId}/characters/${char.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(char)
          });
        }
      }
      
      alert("Project saved successfully!");
    } catch (error: any) {
      console.error("Save failed:", error);
      alert("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Character management
  const handleNewCharacter = () => {
    setSelectedCharacterId(null);
    setEditingCharacter({
      id: `temp-${Date.now()}`,
      ...createEmptyCharacter()
    });
  };

  const handleSelectCharacter = (id: string) => {
    setSelectedCharacterId(id);
    const char = characters.find(c => c.id === id);
    if (char) setEditingCharacter({ ...char });
  };

  const handleSaveCharacter = async () => {
    if (!editingCharacter?.name) return;
    
    if (editingCharacter.id.startsWith("temp-")) {
      // Create new
      const res = await fetch(`/api/creator/projects/${projectId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCharacter)
      });
      if (res.ok) {
        const newChar = await res.json();
        setCharacters(prev => [...prev, newChar]);
        setEditingCharacter(newChar);
        setSelectedCharacterId(newChar.id);
      }
    } else {
      // Update existing
      const res = await fetch(`/api/creator/projects/${projectId}/characters/${editingCharacter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCharacter)
      });
      if (res.ok) {
        setCharacters(prev => prev.map(c => c.id === editingCharacter.id ? editingCharacter : c));
      }
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    
    const res = await fetch(`/api/creator/projects/${projectId}/characters/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      if (selectedCharacterId === id) {
        setSelectedCharacterId(null);
        setEditingCharacter(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: "ip-project", label: "Project", icon: Briefcase, color: "from-orange-500 to-amber-500" },
    { id: "characters", label: "Characters", icon: User, color: "from-blue-500 to-cyan-500" },
    { id: "story", label: "Story", icon: Book, color: "from-emerald-500 to-teal-500" },
    { id: "universe", label: "Universe", icon: Globe, color: "from-purple-500 to-pink-500" },
    { id: "moodboard", label: "Moodboard", icon: ImageIcon, color: "from-rose-500 to-orange-500" },
    { id: "animate", label: "Animate", icon: Video, color: "from-indigo-500 to-purple-500" },
    { id: "ip-bible", label: "IP Bible", icon: FileText, color: "from-slate-600 to-slate-800" },
  ];

  const currentNav = navItems.find(n => n.id === activeTab) || navItems[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="shadow-lg shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          {/* Left: Project Info */}
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${currentNav.color} flex items-center justify-center shadow-lg`}>
              <currentNav.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">{project.title || "Untitled Project"}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-saved
                </span>
                <span>•</span>
                <span>{currentNav.label}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 lg:px-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 pb-3 min-w-max">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id 
                    ? "text-white shadow-lg" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {activeTab === item.id && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`} />
                )}
                <item.icon className={`h-4 w-4 relative z-10 ${activeTab === item.id ? "text-white" : ""}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 lg:px-8 py-6 lg:py-8 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden" />

          {/* IP PROJECT TAB */}
          <TabsContent value="ip-project" className="p-4 lg:p-6">
            <div className="grid gap-6 max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IP Title</Label>
                      <Input
                        value={project.title}
                        onChange={(e) => setProject(p => ({ ...p, title: e.target.value }))}
                        placeholder="Enter IP title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Studio Name</Label>
                      <Input
                        value={project.studioName}
                        onChange={(e) => setProject(p => ({ ...p, studioName: e.target.value }))}
                        placeholder="Your studio name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => setProject(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief description of your IP"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IP Owner</Label>
                      <Input
                        value={project.ipOwner}
                        onChange={(e) => setProject(p => ({ ...p, ipOwner: e.target.value }))}
                        placeholder="Owner name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Production Date</Label>
                      <Input
                        type="date"
                        value={project.productionDate}
                        onChange={(e) => setProject(p => ({ ...p, productionDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Color Palette</Label>
                    <div className="flex gap-2">
                      {project.brandColors.map((color, i) => (
                        <input
                          key={i}
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...project.brandColors];
                            newColors[i] = e.target.value;
                            setProject(p => ({ ...p, brandColors: newColors }));
                          }}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Brand Logos</Label>
                    <div className="flex gap-4">
                      {project.brandLogos.map((logo, i) => (
                        <div
                          key={i}
                          className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary"
                        >
                          {logo ? (
                            <img src={logo} className="w-full h-full object-contain" />
                          ) : (
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* STRATEGY TAB */}
          <TabsContent value="strategy" className="flex-1 overflow-auto mt-4">
            <Card>
              <CardHeader>
                <CardTitle>IP Business Model Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "keyCreator", label: "Key Creator/Owner" },
                    { key: "licensableValues", label: "Licensable & Unique Values" },
                    { key: "segmentation", label: "Segmentation" },
                    { key: "keyPartners", label: "Key Partners" },
                    { key: "brandPositioning", label: "Brand Positioning/Archetype" },
                    { key: "coreMedium", label: "Core Medium/Franchise" },
                    { key: "keyActivities", label: "Key Activities" },
                    { key: "ipFoundation", label: "IP Foundation" },
                    { key: "derivatives", label: "Derivatives Product" },
                    { key: "costStructure", label: "Cost Structure" },
                    { key: "revenueStreams", label: "Revenue Streams" },
                  ].map(field => (
                    <div key={field.key} className="space-y-2 p-3 rounded-lg border">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        {field.label}
                      </Label>
                      <Textarea 
                        className="min-h-[80px] resize-none" 
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHARACTERS TAB */}
          <TabsContent value="characters" className="flex-1 overflow-hidden mt-4">
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Character List */}
              <div className="col-span-3 flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 border-b">
                    <Button onClick={handleNewCharacter} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> New Character
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                      {characters.map(char => (
                        <div
                          key={char.id}
                          onClick={() => handleSelectCharacter(char.id)}
                          className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                            selectedCharacterId === char.id 
                              ? "bg-primary/10 border border-primary/30" 
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                            {char.imageUrl || char.imagePoses?.portrait ? (
                              <img src={char.imageUrl || char.imagePoses.portrait} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-full w-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{char.name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground capitalize">{char.role}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {/* Character Form */}
              <div className="col-span-9 overflow-hidden">
                <Card className="h-full flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1">
                    {editingCharacter ? (
                      <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-4 gap-4">
                          <div className="row-span-2">
                            <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted cursor-pointer hover:border-primary overflow-hidden">
                              {editingCharacter.imageUrl || editingCharacter.imagePoses?.portrait ? (
                                <img 
                                  src={editingCharacter.imageUrl || editingCharacter.imagePoses.portrait} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Upload Image</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-3 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={editingCharacter.name}
                                  onChange={(e) => setEditingCharacter(c => c ? { ...c, name: e.target.value } : c)}
                                  placeholder="Character name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                  value={editingCharacter.role}
                                  onValueChange={(v) => setEditingCharacter(c => c ? { ...c, role: v } : c)}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {CHARACTER_ROLE_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Age</Label>
                                <Select
                                  value={editingCharacter.age}
                                  onValueChange={(v) => setEditingCharacter(c => c ? { ...c, age: v } : c)}
                                >
                                  <SelectTrigger><SelectValue placeholder="Select age range" /></SelectTrigger>
                                  <SelectContent>
                                    {AGE_RANGE_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Cast Reference</Label>
                                <Input
                                  value={editingCharacter.castReference}
                                  onChange={(e) => setEditingCharacter(c => c ? { ...c, castReference: e.target.value } : c)}
                                  placeholder="e.g., Tom Holland"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Character Image Generation */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> Generate Character Images
                          </h4>
                          <div className="grid grid-cols-4 gap-4">
                            {["portrait", "action", "emotional", "full-body"].map(pose => (
                              <div key={pose} className="space-y-2">
                                <div className="aspect-square rounded-lg bg-muted border flex items-center justify-center overflow-hidden">
                                  {editingCharacter.imagePoses?.[pose] ? (
                                    <img src={editingCharacter.imagePoses[pose]} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-2xl">
                                      {pose === "portrait" ? "👤" : pose === "action" ? "⚡" : pose === "emotional" ? "💫" : "🧍"}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs"
                                  disabled={isGenerating[`char_${pose}`] || !editingCharacter.name}
                                  onClick={() => handleGenerateCharacterImage(pose)}
                                >
                                  {!isGenerating[`char_${pose}`] && <Wand2 className="h-3 w-3 mr-1" />}
                                  {renderGenerateButton(`char_${pose}`, "Generate")}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Physiological */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-orange-500">PHYSIOLOGICAL</h4>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { key: "gender", label: "Gender", options: GENDER_OPTIONS },
                              { key: "ethnicity", label: "Ethnicity", options: ETHNICITY_OPTIONS },
                              { key: "skinTone", label: "Skin Tone", options: SKIN_TONE_OPTIONS },
                              { key: "faceShape", label: "Face Shape", options: FACE_SHAPE_OPTIONS },
                              { key: "eyeShape", label: "Eye Shape", options: EYE_SHAPE_OPTIONS },
                              { key: "eyeColor", label: "Eye Color", options: EYE_COLOR_OPTIONS },
                              { key: "noseShape", label: "Nose", options: NOSE_SHAPE_OPTIONS },
                              { key: "lipsShape", label: "Lips", options: LIPS_SHAPE_OPTIONS },
                              { key: "hairStyle", label: "Hair Style", options: HAIR_STYLE_OPTIONS },
                              { key: "hairColor", label: "Hair Color", options: HAIR_COLOR_OPTIONS },
                              { key: "hijab", label: "Hijab", options: HIJAB_OPTIONS },
                              { key: "bodyType", label: "Body Type", options: BODY_TYPE_OPTIONS },
                              { key: "height", label: "Height", options: HEIGHT_OPTIONS },
                            ].map(field => (
                              <div key={field.key} className="space-y-1">
                                <Label className="text-xs">{field.label}</Label>
                                <Select
                                  value={editingCharacter.physiological[field.key as keyof typeof editingCharacter.physiological]}
                                  onValueChange={(v) => setEditingCharacter(c => c ? {
                                    ...c,
                                    physiological: { ...c.physiological, [field.key]: v }
                                  } : c)}
                                >
                                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                  <SelectContent>
                                    {field.options.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                            <div className="space-y-1">
                              <Label className="text-xs">Uniqueness</Label>
                              <Input
                                className="h-8 text-xs"
                                placeholder="Scars, birthmarks..."
                                value={editingCharacter.physiological.uniqueness}
                                onChange={(e) => setEditingCharacter(c => c ? {
                                  ...c,
                                  physiological: { ...c.physiological, uniqueness: e.target.value }
                                } : c)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Psychological */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-blue-500">PSYCHOLOGICAL</h4>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { key: "archetype", label: "Archetype" },
                              { key: "fears", label: "Fears" },
                              { key: "wants", label: "Wants" },
                              { key: "needs", label: "Needs" },
                              { key: "alterEgo", label: "Alter Ego" },
                              { key: "traumatic", label: "Traumatic Event" },
                              { key: "personalityType", label: "MBTI Type" },
                            ].map(field => (
                              <div key={field.key} className="space-y-1">
                                <Label className="text-xs">{field.label}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={editingCharacter.psychological[field.key as keyof typeof editingCharacter.psychological]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    psychological: { ...c.psychological, [field.key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Emotional */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-pink-500">EMOTIONAL & GESTURE</h4>
                          <div className="grid grid-cols-6 gap-3">
                            {["logos", "ethos", "pathos", "tone", "style", "mode"].map(key => (
                              <div key={key} className="space-y-1">
                                <Label className="text-xs capitalize">{key}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={editingCharacter.emotional[key as keyof typeof editingCharacter.emotional]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    emotional: { ...c.emotional, [key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Family */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-orange-500">FAMILY</h4>
                          <div className="grid grid-cols-3 gap-3">
                            {["spouse", "children", "parents"].map(key => (
                              <div key={key} className="space-y-1">
                                <Label className="text-xs capitalize">{key}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={editingCharacter.family[key as keyof typeof editingCharacter.family]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    family: { ...c.family, [key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sociocultural */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-yellow-500">SOCIOCULTURAL & ECONOMY</h4>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { key: "affiliation", label: "Affiliation" },
                              { key: "groupRelationshipLevel", label: "Group Relationship" },
                              { key: "cultureTradition", label: "Culture/Tradition" },
                              { key: "language", label: "Language" },
                              { key: "tribe", label: "Tribe" },
                              { key: "economicClass", label: "Economic Class" },
                            ].map(field => (
                              <div key={field.key} className="space-y-1">
                                <Label className="text-xs">{field.label}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={editingCharacter.sociocultural[field.key as keyof typeof editingCharacter.sociocultural]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    sociocultural: { ...c.sociocultural, [field.key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Core Beliefs */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-emerald-500">CORE BELIEFS</h4>
                          <div className="grid grid-cols-4 gap-3">
                            {["faith", "religionSpirituality", "trustworthy", "willingness", "vulnerability", "commitments", "integrity"].map(key => (
                              <div key={key} className="space-y-1">
                                <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={editingCharacter.coreBeliefs[key as keyof typeof editingCharacter.coreBeliefs]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    coreBeliefs: { ...c.coreBeliefs, [key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Educational & Sociopolitics */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-cyan-500">EDUCATIONAL</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {["graduate", "achievement", "fellowship"].map(key => (
                                <div key={key} className="space-y-1">
                                  <Label className="text-xs capitalize">{key}</Label>
                                  <Input
                                    className="h-8 text-xs"
                                    value={editingCharacter.educational[key as keyof typeof editingCharacter.educational]}
                                    onChange={(e) => setEditingCharacter(c => c ? {
                                      ...c,
                                      educational: { ...c.educational, [key]: e.target.value }
                                    } : c)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-orange-500">SOCIOPOLITICS</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {["partyId", "nationalism", "citizenship"].map(key => (
                                <div key={key} className="space-y-1">
                                  <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                  <Input
                                    className="h-8 text-xs"
                                    value={editingCharacter.sociopolitics[key as keyof typeof editingCharacter.sociopolitics]}
                                    onChange={(e) => setEditingCharacter(c => c ? {
                                      ...c,
                                      sociopolitics: { ...c.sociopolitics, [key]: e.target.value }
                                    } : c)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SWOT */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-red-500">SWOT ANALYSIS</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: "strength", label: "Strengths", color: "bg-green-500/10 border-green-500/20" },
                              { key: "weakness", label: "Weaknesses", color: "bg-red-500/10 border-red-500/20" },
                              { key: "opportunity", label: "Opportunities", color: "bg-blue-500/10 border-blue-500/20" },
                              { key: "threat", label: "Threats", color: "bg-yellow-500/10 border-yellow-500/20" },
                            ].map(field => (
                              <div key={field.key} className={`space-y-1 p-3 rounded-lg border ${field.color}`}>
                                <Label className="text-xs font-bold">{field.label}</Label>
                                <Textarea
                                  className="h-16 text-xs resize-none bg-transparent border-0"
                                  value={editingCharacter.swot[field.key as keyof typeof editingCharacter.swot]}
                                  onChange={(e) => setEditingCharacter(c => c ? {
                                    ...c,
                                    swot: { ...c.swot, [field.key]: e.target.value }
                                  } : c)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-4">
                          {selectedCharacterId && (
                            <Button variant="destructive" onClick={() => handleDeleteCharacter(selectedCharacterId)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          )}
                          <div className="flex-1" />
                          <Button onClick={handleSaveCharacter} disabled={!editingCharacter.name}>
                            <Save className="h-4 w-4 mr-2" /> Save Character
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a character or create a new one</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* STORY TAB */}
          <TabsContent value="story" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6 max-w-5xl">
              <Card>
                <CardHeader>
                  <CardTitle>Story Formula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Story Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label>Premise (One-Line Concept)</Label>
                      <div className="flex gap-2">
                        <Textarea
                          value={story.premise}
                          onChange={(e) => setStory(s => ({ ...s, premise: e.target.value }))}
                          placeholder="A young orphan discovers they are destined to save the world from an ancient evil..."
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleGenerateSynopsis}
                          disabled={isGenerating.synopsis || !story.premise}
                        >
                          {!isGenerating.synopsis && <Wand2 className="h-4 w-4 mr-2" />}
                          {renderGenerateButton("synopsis", "Generate Synopsis")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Synopsis</Label>
                      <Textarea
                        value={story.synopsis}
                        onChange={(e) => setStory(s => ({ ...s, synopsis: e.target.value }))}
                        placeholder="Short synopsis..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Global Synopsis</Label>
                      <Textarea
                        value={story.globalSynopsis}
                        onChange={(e) => setStory(s => ({ ...s, globalSynopsis: e.target.value }))}
                        placeholder="Detailed synopsis..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Genre & Format */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select value={story.genre} onValueChange={(v) => setStory(s => ({ ...s, genre: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                        <SelectContent>
                          {GENRE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select value={story.format} onValueChange={(v) => setStory(s => ({ ...s, format: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                        <SelectContent>
                          {FORMAT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={story.tone} onValueChange={(v) => setStory(s => ({ ...s, tone: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={story.targetAudience} onValueChange={(v) => setStory(s => ({ ...s, targetAudience: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={story.theme} onValueChange={(v) => setStory(s => ({ ...s, theme: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conflict Type</Label>
                      <Select value={story.conflict} onValueChange={(v) => setStory(s => ({ ...s, conflict: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select conflict" /></SelectTrigger>
                        <SelectContent>
                          {CONFLICT_TYPE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ending Type</Label>
                      <Select value={story.endingType} onValueChange={(v) => setStory(s => ({ ...s, endingType: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select ending" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">Happy Ending</SelectItem>
                          <SelectItem value="tragic">Tragic Ending</SelectItem>
                          <SelectItem value="bittersweet">Bittersweet</SelectItem>
                          <SelectItem value="open">Open Ending</SelectItem>
                          <SelectItem value="twist">Twist Ending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Story Structure */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Label className="text-lg font-bold">Story Structure</Label>
                        <Select value={story.structure} onValueChange={(v) => setStory(s => ({ ...s, structure: v }))}>
                          <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hero">Hero's Journey (12 Steps)</SelectItem>
                            <SelectItem value="cat">Save the Cat (15 Beats)</SelectItem>
                            <SelectItem value="harmon">Dan Harmon Circle (8 Steps)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleGenerateStructure}
                        disabled={isGenerating.story_structure || !story.premise}
                      >
                        {!isGenerating.story_structure && <Wand2 className="h-4 w-4 mr-2" />}
                        {renderGenerateButton("story_structure", "Generate Structure")}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {getStructureBeats().map((beat, i) => (
                        <div key={beat} className="p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {i + 1}
                            </span>
                            <span className="text-sm font-bold uppercase">{beat}</span>
                          </div>
                          <Textarea
                            className="h-24 text-sm resize-none"
                            placeholder={`Describe ${beat}...`}
                            value={story.structureBeats[beat] || ""}
                            onChange={(e) => setStory(s => ({
                              ...s,
                              structureBeats: { ...s.structureBeats, [beat]: e.target.value }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Want/Need Matrix */}
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Want / Need Matrix</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-blue-500/10">
                        <h4 className="font-bold text-blue-500 mb-3">WANT (External)</h4>
                        <div className="space-y-2">
                          {["external", "known", "specific", "achieved"].map(key => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs capitalize">{key}</Label>
                              <Input
                                className="h-8 text-sm"
                                value={story.wantNeedMatrix.want[key as keyof typeof story.wantNeedMatrix.want]}
                                onChange={(e) => setStory(s => ({
                                  ...s,
                                  wantNeedMatrix: {
                                    ...s.wantNeedMatrix,
                                    want: { ...s.wantNeedMatrix.want, [key]: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-orange-500/10">
                        <h4 className="font-bold text-orange-500 mb-3">NEED (Internal)</h4>
                        <div className="space-y-2">
                          {["internal", "unknown", "universal", "achieved"].map(key => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs capitalize">{key}</Label>
                              <Input
                                className="h-8 text-sm"
                                value={story.wantNeedMatrix.need[key as keyof typeof story.wantNeedMatrix.need]}
                                onChange={(e) => setStory(s => ({
                                  ...s,
                                  wantNeedMatrix: {
                                    ...s.wantNeedMatrix,
                                    need: { ...s.wantNeedMatrix.need, [key]: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generated Script */}
                  {story.generatedScript && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-bold">Generated Script</Label>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{story.generatedScript}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UNIVERSE TAB */}
          <TabsContent value="universe" className="flex-1 overflow-auto mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Universe & World Building</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Universe Name</Label>
                    <Input
                      value={universe.name}
                      onChange={(e) => setUniverse(u => ({ ...u, name: e.target.value }))}
                      placeholder="e.g., Neo-Tokyo 2099"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Input
                      value={universe.period}
                      onChange={(e) => setUniverse(u => ({ ...u, period: e.target.value }))}
                      placeholder="e.g., 22nd Century"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Era</Label>
                    <Select value={universe.era} onValueChange={(v) => setUniverse(u => ({ ...u, era: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select era" /></SelectTrigger>
                      <SelectContent>
                        {SETTING_ERA_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={universe.location} onValueChange={(v) => setUniverse(u => ({ ...u, location: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent>
                        {SETTING_LOCATION_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>World Type</Label>
                    <Select value={universe.worldType} onValueChange={(v) => setUniverse(u => ({ ...u, worldType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select world type" /></SelectTrigger>
                      <SelectContent>
                        {WORLD_TYPE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Technology Level</Label>
                    <Select value={universe.technologyLevel} onValueChange={(v) => setUniverse(u => ({ ...u, technologyLevel: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select tech level" /></SelectTrigger>
                      <SelectContent>
                        {TECHNOLOGY_LEVEL_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Magic System</Label>
                  <Select value={universe.magicSystem} onValueChange={(v) => setUniverse(u => ({ ...u, magicSystem: v }))}>
                    <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select magic system" /></SelectTrigger>
                    <SelectContent>
                      {MAGIC_SYSTEM_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Textarea
                      value={universe.environment}
                      onChange={(e) => setUniverse(u => ({ ...u, environment: e.target.value }))}
                      placeholder="Describe the environment, landscape, climate..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Society & System</Label>
                    <Textarea
                      value={universe.society}
                      onChange={(e) => setUniverse(u => ({ ...u, society: e.target.value }))}
                      placeholder="Social structures, classes, hierarchies..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Private Life</Label>
                    <Textarea
                      value={universe.privateLife}
                      onChange={(e) => setUniverse(u => ({ ...u, privateLife: e.target.value }))}
                      placeholder="Family structures, daily life, homes..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Government</Label>
                    <Textarea
                      value={universe.government}
                      onChange={(e) => setUniverse(u => ({ ...u, government: e.target.value }))}
                      placeholder="Political system, leadership..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Economy</Label>
                    <Textarea
                      value={universe.economy}
                      onChange={(e) => setUniverse(u => ({ ...u, economy: e.target.value }))}
                      placeholder="Economic system, trade, currency..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Culture</Label>
                    <Textarea
                      value={universe.culture}
                      onChange={(e) => setUniverse(u => ({ ...u, culture: e.target.value }))}
                      placeholder="Traditions, religions, arts..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOODBOARD TAB */}
          <TabsContent value="moodboard" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold">Visual Moodboard</h3>
                  <Select value={animationStyle} onValueChange={setAnimationStyle}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VISUAL_STYLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Wand2 className="h-4 w-4 mr-2" /> Generate All Prompts
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getStructureBeats().map((beat, i) => (
                  <Card key={beat} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                      {moodboardImages[beat] ? (
                        <img src={moodboardImages[beat]} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white">
                        {i + 1}
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-bold uppercase truncate">{beat}</p>
                      <Textarea
                        className="h-16 text-xs resize-none"
                        placeholder={`Visual prompt for ${beat}...`}
                        value={moodboardPrompts[beat] || ""}
                        onChange={(e) => setMoodboardPrompts(p => ({ ...p, [beat]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => handleGenerateMoodboardImage(beat)}
                        disabled={isGenerating[`moodboard_${beat}`] || !moodboardPrompts[beat]}
                      >
                        {!isGenerating[`moodboard_${beat}`] && <Wand2 className="h-3 w-3 mr-1" />}
                        {renderGenerateButton(`moodboard_${beat}`, "Generate")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ANIMATE TAB */}
          <TabsContent value="animate" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Animation Studio</h3>
                <Button>
                  <Video className="h-4 w-4 mr-2" /> Generate All Scenes
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getStructureBeats().map((beat, i) => (
                  <Card key={beat} className="overflow-hidden">
                    <div className="aspect-video bg-black flex items-center justify-center relative">
                      {animationPreviews[beat] ? (
                        <img src={animationPreviews[beat]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white">
                        Scene {i + 1}
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
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <Wand2 className="h-3 w-3 mr-1" /> Generate Preview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* EDIT TAB */}
          <TabsContent value="edit" className="flex-1 overflow-hidden mt-4">
            <div className="h-full flex flex-col gap-4">
              {/* Preview */}
              <div className="flex-1 bg-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Film className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">No media selected</p>
                </div>
              </div>

              {/* Timeline */}
              <Card className="h-48">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="h-8 border-b bg-muted/30 flex items-center px-4 text-xs font-mono text-muted-foreground gap-12">
                    <span>00:00</span>
                    <span>00:15</span>
                    <span>00:30</span>
                    <span>00:45</span>
                    <span>01:00</span>
                  </div>
                  <div className="flex-1 p-2 space-y-2">
                    <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
                      <Film className="h-3 w-3 mr-2 text-blue-400" /> Video Track
                    </div>
                    <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
                      <Volume2 className="h-3 w-3 mr-2 text-green-400" /> Audio Track
                    </div>
                    <div className="h-10 bg-muted/30 rounded border flex items-center px-2 text-xs">
                      <Music className="h-3 w-3 mr-2 text-yellow-400" /> SFX Track
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IP BIBLE TAB */}
          <TabsContent value="ip-bible" className="flex-1 overflow-auto mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>IP Bible Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">Preview</Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-8 bg-white text-black min-h-[600px] space-y-8">
                  {/* Cover */}
                  <div className="text-center space-y-4 pb-8 border-b">
                    {project.logoUrl && (
                      <img src={project.logoUrl} className="h-20 mx-auto" />
                    )}
                    <h1 className="text-3xl font-bold">{project.title || "Untitled Project"}</h1>
                    <p className="text-gray-600">{project.studioName}</p>
                  </div>

                  {/* Synopsis */}
                  {story.synopsis && (
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold">Synopsis</h2>
                      <p className="text-gray-700">{story.synopsis}</p>
                    </div>
                  )}

                  {/* Characters */}
                  {characters.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold">Characters</h2>
                      <div className="grid grid-cols-3 gap-4">
                        {characters.map(char => (
                          <div key={char.id} className="border rounded p-3">
                            <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                              {char.imageUrl || char.imagePoses?.portrait ? (
                                <img src={char.imageUrl || char.imagePoses.portrait} className="h-full object-contain" />
                              ) : (
                                <User className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <p className="font-bold text-sm">{char.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{char.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* World */}
                  {universe.name && (
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold">Universe: {universe.name}</h2>
                      <p className="text-gray-700">{universe.environment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
