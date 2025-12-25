"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase, Share2, User, Film, Book, Image as ImageIcon,
  Video, Edit3, FileText, Save, Download, Plus, ChevronRight,
  Wand2, Trash2, Upload, Play, Settings, Sparkles, Globe,
  Volume2, Music, SkipForward, Palette, Users, FolderOpen, Eye,
  AlertCircle, Shield, Layers, Users as UsersIcon, Folder as FolderIcon, FileText as FileTextIcon
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
import { UniverseFormula } from "@/components/studio/UniverseFormula";
import { StrategicPlan } from "@/components/studio/StrategicPlan";
import { ProjectTeam } from "@/components/studio/ProjectTeam";
import { ProjectMaterials } from "@/components/studio/ProjectMaterials";
import { EditMix } from "@/components/studio/EditMix";
import { Animation } from "@/components/studio/Animation";
import { CustomRoles } from "@/components/studio/CustomRoles";
import { ExportIPBible } from "@/components/studio/ExportIPBible";

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
  // All 3 structures saved separately
  heroBeats: Record<string, string>;
  catBeats: Record<string, string>;
  harmonBeats: Record<string, string>;
  heroKeyActions: Record<string, string>;
  catKeyActions: Record<string, string>;
  harmonKeyActions: Record<string, string>;
  wantNeedMatrix: {
    want: { external: string; known: string; specific: string; achieved: string };
    need: { internal: string; unknown: string; universal: string; achieved: string };
  };
  endingType: string;
  generatedScript: string;
  [key: string]: any; // For dynamic access
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

  // Story state - NOW SAVES ALL 3 STRUCTURES SEPARATELY
  const [story, setStory] = useState<Story>({
    premise: "", synopsis: "", globalSynopsis: "",
    genre: "", subGenre: "", format: "", duration: "",
    tone: "", theme: "", conflict: "", targetAudience: "",
    structure: "hero",
    // All 3 structures saved separately
    heroBeats: {},
    catBeats: {},
    harmonBeats: {},
    heroKeyActions: {},
    catKeyActions: {},
    harmonKeyActions: {},
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

  // Get beat NAMES for current structure
  const getStructureBeats = () => {
    switch (story.structure) {
      case "hero": return HERO_JOURNEY_BEATS;
      case "cat": return SAVE_THE_CAT_BEATS;
      case "harmon": return DAN_HARMON_BEATS;
      default: return HERO_JOURNEY_BEATS;
    }
  };

  // Get current structure's beat VALUES
  const getCurrentBeats = () => {
    switch (story.structure) {
      case "hero": return story.heroBeats || {};
      case "cat": return story.catBeats || {};
      case "harmon": return story.harmonBeats || {};
      default: return story.heroBeats || {};
    }
  };

  // Get current structure's key actions
  const getCurrentKeyActions = () => {
    switch (story.structure) {
      case "hero": return story.heroKeyActions || {};
      case "cat": return story.catKeyActions || {};
      case "harmon": return story.harmonKeyActions || {};
      default: return story.heroKeyActions || {};
    }
  };

  // Set beats for current structure
  const setCurrentBeats = (beats: Record<string, string>) => {
    setStory(s => ({
      ...s,
      ...(s.structure === "hero" ? { heroBeats: beats } : 
          s.structure === "cat" ? { catBeats: beats } : 
          { harmonBeats: beats })
    }));
  };

  // Set key actions for current structure
  const setCurrentKeyActions = (actions: Record<string, string>) => {
    setStory(s => ({
      ...s,
      ...(s.structure === "hero" ? { heroKeyActions: actions } : 
          s.structure === "cat" ? { catKeyActions: actions } : 
          { harmonKeyActions: actions })
    }));
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
        
        // Auto-fill ALL story fields from JSON response
        const updatedStory = {
          ...story,
          synopsis: parsed.synopsis || story.synopsis,
          globalSynopsis: parsed.globalSynopsis || story.globalSynopsis,
          genre: parsed.genre || story.genre,
          subGenre: parsed.subGenre || story.subGenre,
          format: parsed.format || story.format,
          duration: parsed.duration || story.duration,
          tone: parsed.tone || story.tone,
          theme: parsed.theme || story.theme,
          conflict: parsed.conflict || story.conflict,
          targetAudience: parsed.targetAudience || story.targetAudience,
          endingType: parsed.endingType || story.endingType,
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
    
    // Get beats for current structure
    const beats = getStructureBeats();
    const structureName = story.structure === "hero" ? "Hero's Journey" : 
                         story.structure === "cat" ? "Save the Cat" : "Dan Harmon Circle";
    
    const result = await generateWithAI("story_structure", {
      prompt: `Generate ${structureName} story structure untuk cerita berikut.

PREMISE: ${story.premise}
SYNOPSIS: ${story.synopsis}
GENRE: ${story.genre}
TONE: ${story.tone}

BEATS YANG HARUS DIISI (gunakan EXACT key names ini):
${beats.map(b => `- "${b}"`).join('\n')}

Isi SEMUA beats di atas dengan deskripsi detail dalam bahasa Indonesia.`,
      structure: story.structure,
      beats: beats,
      genre: story.genre,
      characters: characters.map(c => ({ name: c.name, role: c.role }))
    });
    if (result?.resultText) {
      try {
        const parsed = parseAIResponse(result.resultText);
        console.log("Parsed structure:", parsed);
        
        // Save to the CORRECT structure based on current selection
        const beatsKey = story.structure === "hero" ? "heroBeats" : 
                        story.structure === "cat" ? "catBeats" : "harmonBeats";
        const actionsKey = story.structure === "hero" ? "heroKeyActions" : 
                          story.structure === "cat" ? "catKeyActions" : "harmonKeyActions";
        
        const updatedStory = {
          ...story,
          [beatsKey]: parsed.beats || {},
          [actionsKey]: parsed.keyActions || {},
          wantNeedMatrix: parsed.wantNeedMatrix || story.wantNeedMatrix
        };
        console.log(`Updated story ${beatsKey}:`, updatedStory[beatsKey]);
        
        setStory(updatedStory);
        await autoSaveProject(updatedStory);
      } catch (e) {
        console.warn("Could not parse structure:", e);
        alert("Gagal parse hasil AI. Coba generate ulang.");
      }
    }
  };

  // Generate ALL moodboard prompts from story beats - auto-fill and auto-save
  const handleGenerateAllMoodboardPrompts = async () => {
    if (!story.synopsis || Object.keys(getCurrentBeats()).length === 0) {
      alert("Please generate synopsis and story structure first");
      return;
    }
    
    const beats = getStructureBeats();
    const newPrompts: Record<string, string> = {};
    
    for (const beat of beats) {
      const beatDescription = getCurrentBeats()[beat] || beat;
      const keyAction = getCurrentKeyActions()[beat] || "";
      
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

  // Generate characters from story
  const [numCharactersToGenerate, setNumCharactersToGenerate] = useState(3);
  
  const handleGenerateCharactersFromStory = async () => {
    if (!story.premise && !story.synopsis) {
      alert("Harap isi Premise atau Synopsis di tab Story terlebih dahulu");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, characters_from_story: true }));
    
    try {
      const result = await generateWithAI("characters_from_story", {
        prompt: `Berdasarkan cerita berikut, generate ${numCharactersToGenerate} karakter lengkap.

PREMISE: ${story.premise}
SYNOPSIS: ${story.synopsis}
GENRE: ${story.genre}
TONE: ${story.tone}
THEME: ${story.theme}
CONFLICT: ${story.conflict}`,
        numCharacters: numCharactersToGenerate,
        genre: story.genre,
        tone: story.tone
      });
      
      if (result?.resultText) {
        try {
          const parsed = parseAIResponse(result.resultText);
          const generatedChars = parsed.characters || [];
          
          // Create each character
          for (const charData of generatedChars) {
            const newChar = {
              id: `temp-${Date.now()}-${Math.random()}`,
              name: charData.name || "",
              role: charData.role || "protagonist",
              age: charData.age || "",
              castReference: charData.castReference || "",
              imageUrl: "",
              imagePoses: {},
              physiological: {
                gender: charData.gender || "",
                ethnicity: charData.ethnicity || "",
                skinTone: charData.skinTone || "",
                faceShape: charData.faceShape || "",
                eyeShape: charData.eyeShape || "",
                eyeColor: charData.eyeColor || "",
                noseShape: charData.noseShape || "",
                lipsShape: charData.lipsShape || "",
                hairStyle: charData.hairStyle || "",
                hairColor: charData.hairColor || "",
                hijab: charData.hijab || "none",
                bodyType: charData.bodyType || "",
                height: charData.height || "",
                uniqueness: charData.uniqueness || ""
              },
              psychological: {
                archetype: charData.archetype || "",
                fears: charData.fears || "",
                wants: charData.wants || "",
                needs: charData.needs || "",
                alterEgo: charData.alterEgo || "",
                traumatic: charData.traumatic || "",
                personalityType: charData.personalityType || ""
              },
              emotional: { 
                logos: charData.logos || "", 
                ethos: charData.ethos || "", 
                pathos: charData.pathos || "", 
                tone: charData.emotionalTone || "", 
                style: charData.emotionalStyle || "", 
                mode: charData.emotionalMode || "" 
              },
              family: { 
                spouse: charData.spouse || "", 
                children: charData.children || "", 
                parents: charData.parents || "" 
              },
              sociocultural: { 
                affiliation: charData.affiliation || "", 
                groupRelationshipLevel: charData.groupRelationshipLevel || "", 
                cultureTradition: charData.cultureTradition || "", 
                language: charData.language || "", 
                tribe: charData.tribe || "", 
                economicClass: charData.economicClass || "" 
              },
              coreBeliefs: { 
                faith: charData.faith || "", 
                religionSpirituality: charData.religionSpirituality || "", 
                trustworthy: charData.trustworthy || "", 
                willingness: charData.willingness || "", 
                vulnerability: charData.vulnerability || "", 
                commitments: charData.commitments || "", 
                integrity: charData.integrity || "" 
              },
              educational: { 
                graduate: charData.graduate || "", 
                achievement: charData.achievement || "", 
                fellowship: charData.fellowship || "" 
              },
              sociopolitics: { 
                partyId: charData.partyId || "", 
                nationalism: charData.nationalism || "", 
                citizenship: charData.citizenship || "" 
              },
              swot: { 
                strength: charData.strength || "", 
                weakness: charData.weakness || "", 
                opportunity: charData.opportunity || "", 
                threat: charData.threat || "" 
              },
              clothingStyle: charData.clothingStyle || "",
              accessories: [],
              props: "",
              personalityTraits: charData.personalityTraits || []
            };
            
            // Save to database
            const res = await fetch(`/api/creator/projects/${projectId}/characters`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newChar)
            });
            
            if (res.ok) {
              const savedChar = await res.json();
              setCharacters(prev => [...prev, savedChar]);
            }
          }
          
          alert(`${generatedChars.length} karakter berhasil digenerate!`);
        } catch (e) {
          console.error("Failed to parse characters:", e);
          alert("Gagal parse hasil AI");
        }
      }
    } catch (e) {
      console.error("Generate characters failed:", e);
      alert("Gagal generate karakter");
    } finally {
      setIsGenerating(prev => ({ ...prev, characters_from_story: false }));
    }
  };

  // Generate Universe from Story
  const handleGenerateUniverseFromStory = async () => {
    if (!story.premise && !story.synopsis) {
      alert("Harap isi Premise atau Synopsis di tab Story terlebih dahulu");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, universe_from_story: true }));
    
    try {
      const result = await generateWithAI("universe_from_story", {
        prompt: `Berdasarkan cerita berikut, bangun universe/setting detail.

PREMISE: ${story.premise}
SYNOPSIS: ${story.synopsis}
GENRE: ${story.genre}
TONE: ${story.tone}`
      });
      
      if (result?.resultText) {
        const parsed = parseAIResponse(result.resultText);
        setUniverse(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          period: parsed.period || prev.period,
          era: parsed.era || prev.era,
          location: parsed.location || prev.location,
          worldType: parsed.worldType || prev.worldType,
          technologyLevel: parsed.technologyLevel || prev.technologyLevel,
          magicSystem: parsed.magicSystem || prev.magicSystem,
          environment: parsed.environment || prev.environment,
          society: parsed.society || prev.society,
          government: parsed.government || prev.government,
          economy: parsed.economy || prev.economy,
          culture: parsed.culture || prev.culture,
          privateLife: parsed.privateLife || prev.privateLife,
        }));
        alert("Universe berhasil digenerate!");
      }
    } catch (e) {
      console.error("Generate universe failed:", e);
      alert("Gagal generate universe");
    } finally {
      setIsGenerating(prev => ({ ...prev, universe_from_story: false }));
    }
  };

  // Generate All Moodboard Prompts from Story
  const handleGenerateMoodboardPrompts = async () => {
    if (Object.keys(getCurrentBeats()).length === 0) {
      alert("Harap generate Story Structure terlebih dahulu di tab Story");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, moodboard_all_prompts: true }));
    
    try {
      const result = await generateWithAI("moodboard_all_prompts", {
        prompt: `Berdasarkan story structure berikut, generate image prompts untuk setiap beat.

PREMISE: ${story.premise}
GENRE: ${story.genre}
TONE: ${story.tone}

STORY STRUCTURE:
${Object.entries(getCurrentBeats()).map(([beat, desc]) => `${beat}: ${desc}`).join('\n')}`
      });
      
      if (result?.resultText) {
        const parsed = parseAIResponse(result.resultText);
        if (parsed.prompts) {
          setMoodboardPrompts(parsed.prompts);
          if (parsed.style) setAnimationStyle(parsed.style);
          alert("Moodboard prompts berhasil digenerate! Silakan save lalu generate image satu-satu.");
        }
      }
    } catch (e) {
      console.error("Generate moodboard prompts failed:", e);
      alert("Gagal generate moodboard prompts");
    } finally {
      setIsGenerating(prev => ({ ...prev, moodboard_all_prompts: false }));
    }
  };

  // Generate All Animation Prompts from Story
  const handleGenerateAnimatePrompts = async () => {
    if (Object.keys(getCurrentBeats()).length === 0) {
      alert("Harap generate Story Structure terlebih dahulu di tab Story");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, animate_all_prompts: true }));
    
    try {
      const result = await generateWithAI("animate_all_prompts", {
        prompt: `Berdasarkan story structure berikut, generate animation prompts untuk setiap beat.

PREMISE: ${story.premise}
GENRE: ${story.genre}
TONE: ${story.tone}

STORY STRUCTURE:
${Object.entries(getCurrentBeats()).map(([beat, desc]) => `${beat}: ${desc}`).join('\n')}`
      });
      
      if (result?.resultText) {
        const parsed = parseAIResponse(result.resultText);
        if (parsed.prompts) {
          setAnimationPrompts(parsed.prompts);
          alert("Animation prompts berhasil digenerate! Silakan save lalu generate video satu-satu.");
        }
      }
    } catch (e) {
      console.error("Generate animate prompts failed:", e);
      alert("Gagal generate animation prompts");
    } finally {
      setIsGenerating(prev => ({ ...prev, animate_all_prompts: false }));
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
    { id: "universe-formula", label: "Universe Formula", icon: Layers, color: "from-violet-500 to-fuchsia-500" },
    { id: "strategic-plan", label: "Strategic Plan", icon: Palette, color: "from-pink-500 to-rose-500" },
    { id: "moodboard", label: "Moodboard", icon: ImageIcon, color: "from-rose-500 to-orange-500" },
    { id: "animate", label: "Animate", icon: Video, color: "from-indigo-500 to-purple-500" },
    { id: "edit-mix", label: "Edit & Mix", icon: Edit3, color: "from-cyan-500 to-blue-500" },
    { id: "project-team", label: "Project Team", icon: UsersIcon, color: "from-teal-500 to-emerald-500" },
    { id: "project-materials", label: "Materials", icon: FolderIcon, color: "from-amber-500 to-orange-500" },
    { id: "custom-roles", label: "Custom Roles", icon: Shield, color: "from-indigo-500 to-purple-500" },
    { id: "ip-bible", label: "IP Bible", icon: FileTextIcon, color: "from-slate-600 to-slate-800" },
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
        
        {/* UNIVERSE FORMULA TAB */}
        <TabsContent value="universe-formula" className="flex-1 overflow-auto mt-4">
          <UniverseFormula projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* STRATEGIC PLAN TAB */}
        <TabsContent value="strategic-plan" className="flex-1 overflow-auto mt-4">
          <StrategicPlan projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* PROJECT TEAM TAB */}
        <TabsContent value="project-team" className="flex-1 overflow-auto mt-4">
          <ProjectTeam projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* PROJECT MATERIALS TAB */}
        <TabsContent value="project-materials" className="flex-1 overflow-auto mt-4">
          <ProjectMaterials projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* EDIT & MIX TAB */}
        <TabsContent value="edit-mix" className="flex-1 overflow-auto mt-4">
          <EditMix projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* ANIMATION TAB */}
        <TabsContent value="animate" className="flex-1 overflow-auto mt-4">
          <Animation projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* CUSTOM ROLES TAB */}
        <TabsContent value="custom-roles" className="flex-1 overflow-auto mt-4">
          <CustomRoles projectId={projectId} userId={user?.id || ''} />
        </TabsContent>
        
        {/* IP BIBLE TAB */}
        <TabsContent value="ip-bible" className="flex-1 overflow-auto mt-4">
          <ExportIPBible projectId={projectId} userId={user?.id || ''} projectTitle={project.title || "Untitled IP"} />
        </TabsContent>
        
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
          
          {/* CHARACTERS TAB */}
          <TabsContent value="characters" className="flex-1 overflow-hidden mt-4">
            {/* Generate Characters from Story - Header Card */}
            <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 p-1">
              <div className="bg-white/95 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Generate Characters dari Story</h3>
                      <p className="text-sm text-gray-500">AI akan membuat karakter lengkap berdasarkan ceritamu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Jumlah:</Label>
                      <Select value={String(numCharactersToGenerate)} onValueChange={(v) => setNumCharactersToGenerate(Number(v))}>
                        <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleGenerateCharactersFromStory}
                      disabled={isGenerating.characters_from_story || (!story.premise && !story.synopsis)}
                      className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white"
                    >
                      {isGenerating.characters_from_story ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          Generating...
                        </div>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate {numCharactersToGenerate} Characters
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {!story.premise && !story.synopsis && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Isi Premise atau Synopsis di tab Story terlebih dahulu
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 h-[calc(100%-100px)]">
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

          {/* STORY TAB - Redesigned */}
          <TabsContent value="story" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* SECTION 1: AI Generator - Gradient Blue Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wand2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">AI Story Generator</h3>
                      <p className="text-sm text-gray-500">Masukkan premise, AI akan generate seluruh story</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Premise <span className="text-blue-500">*</span>
                        <span className="text-xs font-normal text-gray-400 ml-2">One-line concept ceritamu</span>
                      </Label>
                      <Textarea
                        value={story.premise}
                        onChange={(e) => setStory(s => ({ ...s, premise: e.target.value }))}
                        placeholder="Contoh: Seorang guru muda di pedalaman Papua yang berjuang mengajarkan teknologi kepada anak-anak desa terpencil, sambil melawan korupsi yang menggerogoti dana pendidikan..."
                        rows={3}
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    
                    <Button
                      onClick={handleGenerateSynopsis}
                      disabled={isGenerating.synopsis || !story.premise}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                      size="lg"
                    >
                      {isGenerating.synopsis ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Complete Story dengan AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: AI Generated Results - Gradient Orange Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Synopsis</h3>
                      <p className="text-sm text-gray-500">Hasil AI - bisa diedit manual</p>
                    </div>
                    {story.synopsis && (
                      <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✓ Generated
                      </span>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Synopsis Singkat</Label>
                      <Textarea
                        value={story.synopsis}
                        onChange={(e) => setStory(s => ({ ...s, synopsis: e.target.value }))}
                        placeholder="Synopsis singkat akan muncul di sini setelah generate..."
                        rows={5}
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Global Synopsis (Detail)</Label>
                      <Textarea
                        value={story.globalSynopsis}
                        onChange={(e) => setStory(s => ({ ...s, globalSynopsis: e.target.value }))}
                        placeholder="Synopsis detail dengan konflik, perjalanan karakter, dan taruhan emosional..."
                        rows={5}
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Story Details - Gradient Purple Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Story Details</h3>
                      <p className="text-sm text-gray-500">Auto-filled oleh AI atau pilih manual</p>
                    </div>
                  </div>
                  
                  {/* Row 1: Genre, Format, Duration */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Genre</Label>
                      <Select value={story.genre} onValueChange={(v) => setStory(s => ({ ...s, genre: v }))}>
                        <SelectTrigger className={story.genre ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih genre" /></SelectTrigger>
                        <SelectContent>
                          {GENRE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Format</Label>
                      <Select value={story.format} onValueChange={(v) => setStory(s => ({ ...s, format: v }))}>
                        <SelectTrigger className={story.format ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih format" /></SelectTrigger>
                        <SelectContent>
                          {FORMAT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Tone</Label>
                      <Select value={story.tone} onValueChange={(v) => setStory(s => ({ ...s, tone: v }))}>
                        <SelectTrigger className={story.tone ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih tone" /></SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Target Audience</Label>
                      <Select value={story.targetAudience} onValueChange={(v) => setStory(s => ({ ...s, targetAudience: v }))}>
                        <SelectTrigger className={story.targetAudience ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih audience" /></SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Row 2: Theme, Conflict, Ending, Duration */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Theme</Label>
                      <Select value={story.theme} onValueChange={(v) => setStory(s => ({ ...s, theme: v }))}>
                        <SelectTrigger className={story.theme ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih theme" /></SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Conflict</Label>
                      <Select value={story.conflict} onValueChange={(v) => setStory(s => ({ ...s, conflict: v }))}>
                        <SelectTrigger className={story.conflict ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih conflict" /></SelectTrigger>
                        <SelectContent>
                          {CONFLICT_TYPE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Ending</Label>
                      <Select value={story.endingType} onValueChange={(v) => setStory(s => ({ ...s, endingType: v }))}>
                        <SelectTrigger className={story.endingType ? "border-green-300 bg-green-50" : ""}><SelectValue placeholder="Pilih ending" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">Happy Ending</SelectItem>
                          <SelectItem value="tragic">Tragic Ending</SelectItem>
                          <SelectItem value="bittersweet">Bittersweet</SelectItem>
                          <SelectItem value="open">Open Ending</SelectItem>
                          <SelectItem value="twist">Twist Ending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">Duration</Label>
                      <Input 
                        value={story.duration} 
                        onChange={(e) => setStory(s => ({ ...s, duration: e.target.value }))}
                        placeholder="90-120 menit"
                        className={story.duration ? "border-green-300 bg-green-50" : ""}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Story Structure - Gradient Emerald Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Book className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Story Structure</h3>
                        <p className="text-sm text-gray-500">Beat sheet untuk alur cerita</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={story.structure} onValueChange={(v) => setStory(s => ({ ...s, structure: v }))}>
                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero's Journey (12)</SelectItem>
                          <SelectItem value="cat">Save the Cat (15)</SelectItem>
                          <SelectItem value="harmon">Dan Harmon (8)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleGenerateStructure}
                        disabled={isGenerating.story_structure || !story.premise}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                      >
                        {isGenerating.story_structure ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {getStructureBeats().map((beat, i) => {
                      const currentBeats = getCurrentBeats();
                      return (
                        <div key={beat} className={`p-3 rounded-xl border-2 transition-all ${currentBeats[beat] ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentBeats[beat] ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                              {i + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-700 truncate">{beat}</span>
                          </div>
                          <Textarea
                            className="h-20 text-xs resize-none border-0 bg-white/50"
                            placeholder={`${beat}...`}
                            value={currentBeats[beat] || ""}
                            onChange={(e) => {
                              const newBeats = { ...currentBeats, [beat]: e.target.value };
                              setCurrentBeats(newBeats);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 5: Want/Need Matrix - Gradient Rose Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <Users className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Want vs Need Matrix</h3>
                      <p className="text-sm text-gray-500">Keinginan eksternal vs kebutuhan internal protagonis</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                      <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        WANT (Eksternal)
                      </h4>
                      <div className="space-y-3">
                        {["external", "known", "specific", "achieved"].map(key => (
                          <div key={key}>
                            <Label className="text-xs font-semibold text-blue-600 uppercase mb-1 block">{key}</Label>
                            <Input
                              className="h-9 text-sm border-blue-200 focus:border-blue-400"
                              placeholder={key === "external" ? "Tujuan yang terlihat" : key === "known" ? "Diketahui penonton" : key === "specific" ? "Spesifik & terukur" : "Cara mencapainya"}
                              value={story.wantNeedMatrix.want[key as keyof typeof story.wantNeedMatrix.want]}
                              onChange={(e) => setStory(s => ({
                                ...s,
                                wantNeedMatrix: { ...s.wantNeedMatrix, want: { ...s.wantNeedMatrix.want, [key]: e.target.value } }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                      <h4 className="font-bold text-rose-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        NEED (Internal)
                      </h4>
                      <div className="space-y-3">
                        {["internal", "unknown", "universal", "achieved"].map(key => (
                          <div key={key}>
                            <Label className="text-xs font-semibold text-rose-600 uppercase mb-1 block">{key}</Label>
                            <Input
                              className="h-9 text-sm border-rose-200 focus:border-rose-400"
                              placeholder={key === "internal" ? "Kebutuhan emosional" : key === "unknown" ? "Tidak disadari awalnya" : key === "universal" ? "Relatable & universal" : "Cara menyadarinya"}
                              value={story.wantNeedMatrix.need[key as keyof typeof story.wantNeedMatrix.need]}
                              onChange={(e) => setStory(s => ({
                                ...s,
                                wantNeedMatrix: { ...s.wantNeedMatrix, need: { ...s.wantNeedMatrix.need, [key]: e.target.value } }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* UNIVERSE TAB */}
          <TabsContent value="universe" className="flex-1 overflow-auto mt-4">
            {/* Generate from Story Header */}
            <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 p-1">
              <div className="bg-white/95 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Globe className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Generate Universe dari Story</h3>
                      <p className="text-sm text-gray-500">AI akan membangun world setting berdasarkan ceritamu</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleGenerateUniverseFromStory}
                    disabled={isGenerating.universe_from_story || (!story.premise && !story.synopsis)}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                  >
                    {isGenerating.universe_from_story ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Universe
                      </>
                    )}
                  </Button>
                </div>
                {!story.premise && !story.synopsis && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Isi Premise atau Synopsis di tab Story terlebih dahulu
                  </p>
                )}
              </div>
            </div>

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
            {/* Generate All Prompts Header */}
            <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 p-1">
              <div className="bg-white/95 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <Palette className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Generate All Moodboard Prompts</h3>
                      <p className="text-sm text-gray-500">AI akan membuat prompt gambar untuk setiap beat</p>
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
                      onClick={handleGenerateMoodboardPrompts}
                      disabled={isGenerating.moodboard_all_prompts || Object.keys(getCurrentBeats()).length === 0}
                      className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                    >
                      {isGenerating.moodboard_all_prompts ? (
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Visual Moodboard</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(moodboardPrompts || {}).length} / {getStructureBeats().length} prompts generated
                </p>
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
                {Object.keys(getCurrentBeats()).length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Generate Story Structure terlebih dahulu di tab Story
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Animation Studio</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(animationPrompts || {}).length} / {getStructureBeats().length} prompts generated
                </p>
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

          {/* IP BIBLE TAB - Complete Preview */}
          <TabsContent value="ip-bible" className="flex-1 overflow-auto mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>IP Bible - Complete Document</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" /> Full Preview
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" /> Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-white text-black min-h-[800px] print:border-0">
                  
                  {/* COVER PAGE */}
                  <div className="p-12 text-center border-b-4 border-orange-500 bg-gradient-to-b from-slate-50 to-white">
                    <p className="text-xs text-red-600 font-bold tracking-widest mb-8">CONFIDENTIAL</p>
                    {project.logoUrl && (
                      <img src={project.logoUrl} className="h-24 mx-auto mb-6" alt="Logo" />
                    )}
                    <h1 className="text-4xl font-black mb-2">{project.title || "Untitled IP"}</h1>
                    <p className="text-xl text-gray-600 mb-4">Series Bible & IP Documentation</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Version 1.0 | {new Date().toLocaleDateString('id-ID')}</p>
                      {project.studioName && <p>Created by {project.studioName}</p>}
                      {project.ipOwner && <p>IP Owner: {project.ipOwner}</p>}
                    </div>
                  </div>

                  {/* TABLE OF CONTENTS */}
                  <div className="p-8 border-b bg-slate-50">
                    <h2 className="text-lg font-bold mb-4 text-orange-600">Table of Contents</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>1. Project Overview</p>
                      <p>5. Universe & World-Building</p>
                      <p>2. Story Formula</p>
                      <p>6. Visual Development</p>
                      <p>3. Story Structure</p>
                      <p>7. Moodboard Gallery</p>
                      <p>4. Character Profiles</p>
                      <p>8. Animation & Motion</p>
                    </div>
                  </div>

                  {/* 1. PROJECT OVERVIEW */}
                  <div className="p-8 border-b">
                    <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">1. Project Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div><p className="text-xs text-gray-500 uppercase">Genre</p><p className="font-semibold">{story.genre || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Sub-Genre</p><p className="font-semibold">{story.subGenre || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Format</p><p className="font-semibold">{story.format || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Duration</p><p className="font-semibold">{story.duration || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Tone</p><p className="font-semibold">{story.tone || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Theme</p><p className="font-semibold">{story.theme || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Conflict Type</p><p className="font-semibold">{story.conflict || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Target Audience</p><p className="font-semibold">{story.targetAudience || "-"}</p></div>
                      <div><p className="text-xs text-gray-500 uppercase">Ending Type</p><p className="font-semibold">{story.endingType || "-"}</p></div>
                    </div>
                  </div>

                  {/* 2. STORY FORMULA */}
                  <div className="p-8 border-b">
                    <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">2. Story Formula</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-gray-700 mb-2">Premise</h3>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{story.premise || "Belum diisi"}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-700 mb-2">Synopsis</h3>
                          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm">{story.synopsis || "Belum diisi"}</p>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-700 mb-2">Global Synopsis</h3>
                          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm">{story.globalSynopsis || "Belum diisi"}</p>
                        </div>
                      </div>

                      {/* Want/Need Matrix */}
                      {(story.wantNeedMatrix?.want?.external || story.wantNeedMatrix?.need?.internal) && (
                        <div>
                          <h3 className="font-bold text-gray-700 mb-3">Want vs Need Matrix</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="font-bold text-blue-800 mb-2">WANT (External Goal)</p>
                              <div className="text-sm space-y-1">
                                <p><span className="text-gray-500">External:</span> {story.wantNeedMatrix?.want?.external || "-"}</p>
                                <p><span className="text-gray-500">Known:</span> {story.wantNeedMatrix?.want?.known || "-"}</p>
                                <p><span className="text-gray-500">Specific:</span> {story.wantNeedMatrix?.want?.specific || "-"}</p>
                                <p><span className="text-gray-500">Achieved:</span> {story.wantNeedMatrix?.want?.achieved || "-"}</p>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="font-bold text-purple-800 mb-2">NEED (Internal Growth)</p>
                              <div className="text-sm space-y-1">
                                <p><span className="text-gray-500">Internal:</span> {story.wantNeedMatrix?.need?.internal || "-"}</p>
                                <p><span className="text-gray-500">Unknown:</span> {story.wantNeedMatrix?.need?.unknown || "-"}</p>
                                <p><span className="text-gray-500">Universal:</span> {story.wantNeedMatrix?.need?.universal || "-"}</p>
                                <p><span className="text-gray-500">Achieved:</span> {story.wantNeedMatrix?.need?.achieved || "-"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. STORY STRUCTURE */}
                  {Object.keys(getCurrentBeats() || {}).length > 0 && (
                    <div className="p-8 border-b">
                      <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">3. Story Structure - {story.structure === "hero" ? "Hero's Journey" : story.structure === "cat" ? "Save the Cat" : "Dan Harmon Circle"}</h2>
                      <div className="space-y-4">
                        {Object.entries(getCurrentBeats() || {}).map(([beat, desc], idx) => (
                          <div key={beat} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{beat}</p>
                              <p className="text-gray-600 text-sm mt-1">{desc as string}</p>
                              {getCurrentKeyActions()?.[beat] && (
                                <p className="text-orange-600 text-sm mt-2">
                                  <span className="font-semibold">Key Action:</span> {getCurrentKeyActions()[beat]}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. CHARACTER PROFILES */}
                  {characters.length > 0 && (
                    <div className="p-8 border-b">
                      <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">4. Character Profiles</h2>
                      <div className="space-y-8">
                        {characters.map((char, idx) => (
                          <div key={char.id} className="bg-gray-50 rounded-xl p-6">
                            <div className="flex gap-6">
                              {/* Character Image */}
                              <div className="flex-shrink-0">
                                <div className="w-32 h-40 bg-white rounded-lg shadow flex items-center justify-center overflow-hidden">
                                  {char.imageUrl || char.imagePoses?.portrait ? (
                                    <img src={char.imageUrl || char.imagePoses?.portrait} className="w-full h-full object-cover" alt={char.name} />
                                  ) : (
                                    <User className="h-12 w-12 text-gray-300" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Character Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-xl font-bold">{char.name || `Character ${idx + 1}`}</h3>
                                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold uppercase">
                                    {char.role || "Role TBD"}
                                  </span>
                                </div>
                                
                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                                  <div><span className="text-gray-500">Age:</span> <span className="font-medium">{char.age || "-"}</span></div>
                                  <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{char.physiological?.gender || "-"}</span></div>
                                  <div><span className="text-gray-500">Ethnicity:</span> <span className="font-medium">{char.physiological?.ethnicity || "-"}</span></div>
                                  <div><span className="text-gray-500">Archetype:</span> <span className="font-medium">{char.psychological?.archetype || "-"}</span></div>
                                </div>

                                {/* Psychology */}
                                {(char.psychological?.wants || char.psychological?.needs || char.psychological?.fears) && (
                                  <div className="bg-white p-3 rounded-lg mb-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Psychology</p>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div><span className="text-gray-500">Want:</span> {char.psychological?.wants || "-"}</div>
                                      <div><span className="text-gray-500">Need:</span> {char.psychological?.needs || "-"}</div>
                                      <div><span className="text-gray-500">Fear:</span> {char.psychological?.fears || "-"}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Traits */}
                                {char.personalityTraits && char.personalityTraits.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {char.personalityTraits.map((trait, i) => (
                                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{trait}</span>
                                    ))}
                                  </div>
                                )}

                                {/* Traumatic/Origin */}
                                {char.psychological?.traumatic && (
                                  <p className="text-gray-600 text-sm mt-3 italic">"{char.psychological.traumatic}"</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. UNIVERSE & WORLD-BUILDING */}
                  {universe.name && (
                    <div className="p-8 border-b">
                      <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">5. Universe & World-Building</h2>
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4">{universe.name}</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Time & Place</p>
                            <p><span className="text-gray-500">Period:</span> {universe.period || "-"}</p>
                            <p><span className="text-gray-500">Era:</span> {universe.era || "-"}</p>
                            <p><span className="text-gray-500">Location:</span> {universe.location || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">World Type</p>
                            <p><span className="text-gray-500">Type:</span> {universe.worldType || "-"}</p>
                            <p><span className="text-gray-500">Technology:</span> {universe.technologyLevel || "-"}</p>
                            <p><span className="text-gray-500">Magic:</span> {universe.magicSystem || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Society</p>
                            <p><span className="text-gray-500">Government:</span> {universe.government || "-"}</p>
                            <p><span className="text-gray-500">Economy:</span> {universe.economy || "-"}</p>
                            <p><span className="text-gray-500">Culture:</span> {universe.culture || "-"}</p>
                          </div>
                        </div>
                        {universe.environment && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Environment</p>
                            <p className="text-gray-700">{universe.environment}</p>
                          </div>
                        )}
                        {universe.society && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Society & Culture</p>
                            <p className="text-gray-700">{universe.society}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 6. MOODBOARD GALLERY */}
                  {Object.keys(moodboardImages).length > 0 && (
                    <div className="p-8 border-b">
                      <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">6. Moodboard Gallery</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(moodboardImages).filter(([_, url]) => url).map(([beat, url], idx) => (
                          <div key={idx} className="group relative">
                            <img src={url} className="w-full h-48 object-cover rounded-lg" alt={beat} />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                              <p className="text-white text-sm font-semibold">{beat}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. ANIMATION PREVIEWS */}
                  {Object.keys(animationPreviews).length > 0 && (
                    <div className="p-8 border-b">
                      <h2 className="text-2xl font-bold mb-6 text-orange-600 border-b-2 border-orange-200 pb-2">7. Animation Previews</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(animationPreviews).filter(([_, url]) => url).map(([beat, url], idx) => (
                          <div key={idx} className="bg-gray-100 rounded-lg overflow-hidden">
                            <img src={url} className="w-full h-40 object-cover" alt={beat} />
                            <div className="p-3">
                              <p className="font-semibold text-sm">{beat}</p>
                              <p className="text-xs text-gray-500">{animationPrompts[beat] || ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="p-6 bg-gray-50 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} {project.studioName || "MODO Studio"} - All Rights Reserved</p>
                    <p className="text-xs mt-1">Generated with MODO Creator Verse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
