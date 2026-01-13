"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase, Share2, User, Film, Book, Image as ImageIcon,
  Video, FileText, Save, Download, Plus, ChevronRight,
  Wand2, Trash2, Upload, Play, Settings, Sparkles, Globe,
  Volume2, Music, Palette, Users, Eye,
  AlertCircle, Layers, LayoutTemplate
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

import { StrategicPlan } from "@/components/studio/StrategicPlan";
import { StudioMode } from "@/components/studio";

import { StoryArcStudio } from "@/components/studio/StoryArcStudio";
import { UniverseCosmos } from "@/components/studio/UniverseCosmos";
import { UniverseFormulaStudio, UniverseData } from "@/components/studio/UniverseFormulaStudio";
import { IPPassport } from "@/components/studio/IPPassport";
import { CharacterStudio } from "@/components/studio/CharacterStudio";
import { MoodboardStudio } from "@/components/studio/MoodboardStudio";
import { MoodboardStudioV2 } from "@/components/studio/MoodboardStudioV2";
import { AnimateStudio } from "@/components/studio/AnimateStudio";
import { EditMixStudio } from "@/components/studio/EditMixStudio";
import { IPBibleStudio } from "@/components/studio/IPBibleStudio";
import { toast, alert as swalAlert } from "@/lib/sweetalert";
import { NewStoryDialog } from "@/components/studio/NewStoryDialog";
import { CreateStoryModal } from "@/components/studio/CreateStoryModal";
import { EditStoryModal } from "@/components/studio/EditStoryModal";
import { GenerationProgressModal } from "@/components/ui/generation-progress-modal";

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
  // Tension levels for Arc View graph
  tensionLevels?: Record<string, number>;
  // Want/Need Matrix with optional fields
  wantNeedMatrix?: {
    want?: { external?: string; known?: string; specific?: string; achieved?: string };
    need?: { internal?: string; unknown?: string; universal?: string; achieved?: string };
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

// Story Version for version control
interface StoryVersionListItem {
  id: string;
  storyId: string;
  versionNumber: number;
  versionName: string;
  isActive: boolean;
  structure: string;
  structureType?: string;
  characterIds?: string[];
  episodeNumber?: number;
  premise?: string;
  createdAt: string;
  updatedAt: string;
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
  const [deletedCharacters, setDeletedCharacters] = useState<{ id: string, name: string, role: string, imageUrl?: string, deletedAt: string }[]>([]);
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
  const [timeline, setTimeline] = useState<any[]>([]);

  // Strategic Plan state
  const [strategicPlanData, setStrategicPlanData] = useState<any>(null);

  // Story Versions state (for version control)
  const [storyVersions, setStoryVersions] = useState<StoryVersionListItem[]>([]);
  const [deletedStoryVersions, setDeletedStoryVersions] = useState<{ id: string; versionName: string; structure: string; deletedAt: string }[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>('');
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  // Universe per story version state
  const [universeForStory, setUniverseForStory] = useState<UniverseData>({
    universeName: '', period: '',
    roomCave: '', houseCastle: '', privateInterior: '',
    familyInnerCircle: '', neighborhoodEnvironment: '',
    townDistrictCity: '', workingOfficeSchool: '',
    country: '', governmentSystem: '',
    laborLaw: '', rulesOfWork: '',
    societyAndSystem: '', socioculturalSystem: '',
    environmentLandscape: '', sociopoliticEconomy: '', kingdomTribeCommunal: '',
  });
  const [isGeneratingUniverse, setIsGeneratingUniverse] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [generatingCountdown, setGeneratingCountdown] = useState<Record<string, number>>({});
  const [queuePosition, setQueuePosition] = useState<Record<string, { position: number; total: number; queueId: string }>>({});
  const [userTier, setUserTier] = useState<string>("trial");

  // Generation progress for multi-step processes
  const [storyGenProgress, setStoryGenProgress] = useState<{
    isActive: boolean;
    steps: { id: string; label: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }[];
    currentIndex: number;
  }>({
    isActive: false,
    steps: [],
    currentIndex: 0,
  });

  const [characterGenProgress, setCharacterGenProgress] = useState<{
    isActive: boolean;
    steps: { id: string; label: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }[];
    currentIndex: number;
  }>({
    isActive: false,
    steps: [],
    currentIndex: 0,
  });

  const [universeGenProgress, setUniverseGenProgress] = useState<{
    isActive: boolean;
    steps: { id: string; label: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }[];
    currentIndex: number;
  }>({
    isActive: false,
    steps: [],
    currentIndex: 0,
  });


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
        if (data.deletedCharacters) setDeletedCharacters(data.deletedCharacters);
        if (data.story) setStory(data.story);
        if (data.universe) setUniverse(data.universe);
        if (data.moodboardPrompts) setMoodboardPrompts(data.moodboardPrompts);
        if (data.moodboardImages) setMoodboardImages(data.moodboardImages);
        if (data.animationPrompts) setAnimationPrompts(data.animationPrompts);
        if (data.animationPreviews) setAnimationPreviews(data.animationPreviews);
        if (data.timeline) setTimeline(data.timeline);

        // Load strategic plan data
        try {
          const strategicRes = await fetch(`/api/projects/${projectId}/strategic-plan?userId=${user?.id}`);
          if (strategicRes.ok) {
            const strategicData = await strategicRes.json();
            setStrategicPlanData(strategicData);
          }
        } catch (error) {
          console.error("Failed to load strategic plan:", error);
        }

        // Load story versions
        try {
          const storiesRes = await fetch(`/api/creator/projects/${projectId}/stories`);
          if (storiesRes.ok) {
            const storiesData = await storiesRes.json();
            setStoryVersions(storiesData.versions || []);
            setDeletedStoryVersions(storiesData.deletedVersions || []);
            if (storiesData.activeVersion) {
              setActiveVersionId(storiesData.activeVersion.id);
              // Map version data to story state
              setStory({
                ...story,
                premise: storiesData.activeVersion.premise || '',
                synopsis: storiesData.activeVersion.synopsis || '',
                globalSynopsis: storiesData.activeVersion.globalSynopsis || '',
                genre: storiesData.activeVersion.genre || '',
                subGenre: storiesData.activeVersion.subGenre || '',
                format: storiesData.activeVersion.format || '',
                duration: storiesData.activeVersion.duration || '',
                tone: storiesData.activeVersion.tone || '',
                theme: storiesData.activeVersion.theme || '',
                conflict: storiesData.activeVersion.conflict || '',
                targetAudience: storiesData.activeVersion.targetAudience || '',
                endingType: storiesData.activeVersion.endingType || '',
                structure: storiesData.activeVersion.structure || 'Save the Cat',
                catBeats: storiesData.activeVersion.catBeats || {},
                heroBeats: storiesData.activeVersion.heroBeats || {},
                harmonBeats: storiesData.activeVersion.harmonBeats || {},
                tensionLevels: storiesData.activeVersion.tensionLevels || {},
                wantNeedMatrix: storiesData.activeVersion.wantNeedMatrix || {},
                beatCharacters: storiesData.activeVersion.beatCharacters || {},
              });
            }
          }
        } catch (error) {
          console.error("Failed to load story versions:", error);
        }
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== STORY VERSION HANDLERS ==========

  // Switch to a different story version
  const handleSwitchStory = async (versionId: string) => {
    if (versionId === activeVersionId) return;

    try {
      // First, save current version if dirty
      if (activeVersionId) {
        await autoSaveStoryVersion();
      }

      // Activate the new version
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveVersionId(versionId);
        // Update story state with new version data
        setStory({
          ...story,
          premise: data.version.premise || '',
          synopsis: data.version.synopsis || '',
          globalSynopsis: data.version.globalSynopsis || '',
          genre: data.version.genre || '',
          subGenre: data.version.subGenre || '',
          format: data.version.format || '',
          duration: data.version.duration || '',
          tone: data.version.tone || '',
          theme: data.version.theme || '',
          conflict: data.version.conflict || '',
          targetAudience: data.version.targetAudience || '',
          endingType: data.version.endingType || '',
          structure: data.version.structure || 'Save the Cat',
          catBeats: data.version.catBeats || {},
          heroBeats: data.version.heroBeats || {},
          harmonBeats: data.version.harmonBeats || {},
          tensionLevels: data.version.tensionLevels || {},
          wantNeedMatrix: data.version.wantNeedMatrix || {},
          beatCharacters: data.version.beatCharacters || {},
        });
        // Update versions list to reflect new active
        setStoryVersions(prev => prev.map(v => ({
          ...v,
          isActive: v.id === versionId
        })));
        toast.success(`Switched to ${data.version.versionName}`);
      }
    } catch (error) {
      console.error("Failed to switch story version:", error);
      toast.error("Failed to switch story version");
    }
  };

  // Create a new story version
  const handleCreateNewStory = async (params: {
    name?: string;
    structure: string;
    copyFromVersionId?: string;
    isDuplicate?: boolean;
  }) => {
    setIsCreatingStory(true);
    try {
      // Save current version first
      if (activeVersionId) {
        await autoSaveStoryVersion();
      }

      const res = await fetch(`/api/creator/projects/${projectId}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        // Add new version to list
        const newVersionItem: StoryVersionListItem = {
          id: data.version.id,
          storyId: data.version.storyId,
          versionNumber: data.version.versionNumber,
          versionName: data.version.versionName,
          isActive: true,
          structure: data.version.structure,
          premise: data.version.premise,
          createdAt: data.version.createdAt,
          updatedAt: data.version.updatedAt,
        };
        setStoryVersions(prev => [newVersionItem, ...prev.map(v => ({ ...v, isActive: false }))]);
        setActiveVersionId(data.version.id);
        // Set story state
        setStory({
          ...story,
          premise: data.version.premise || '',
          synopsis: data.version.synopsis || '',
          genre: data.version.genre || '',
          tone: data.version.tone || '',
          theme: data.version.theme || '',
          structure: data.version.structure || 'Save the Cat',
          catBeats: data.version.catBeats || {},
          heroBeats: data.version.heroBeats || {},
          harmonBeats: data.version.harmonBeats || {},
          tensionLevels: {},
          wantNeedMatrix: {},
        });
        setShowNewStoryDialog(false);
        toast.success(`Created ${data.version.versionName}`);
      }
    } catch (error) {
      console.error("Failed to create story version:", error);
      toast.error("Failed to create story version");
    } finally {
      setIsCreatingStory(false);
    }
  };

  // Create story with characters (new flow with locked structure)
  const handleCreateStoryWithCharacters = async (data: {
    name: string;
    structureType: string;
    characterIds: string[];
  }) => {
    setIsCreatingStory(true);
    try {
      // Save current version first
      if (activeVersionId) {
        await autoSaveStoryVersion();
      }

      const res = await fetch(`/api/creator/projects/${projectId}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          structureType: data.structureType,
          characterIds: data.characterIds,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        // Add new version to list
        const newVersionItem: StoryVersionListItem = {
          id: result.version.id,
          storyId: result.version.storyId,
          versionNumber: result.version.versionNumber,
          versionName: result.version.versionName,
          isActive: true,
          structure: result.version.structureType || result.version.structure,
          premise: result.version.premise,
          createdAt: result.version.createdAt,
          updatedAt: result.version.updatedAt,
        };
        setStoryVersions(prev => [newVersionItem, ...prev.map(v => ({ ...v, isActive: false }))]);
        setActiveVersionId(result.version.id);

        // Set story state with the new structure
        setStory(prev => ({
          ...prev,
          premise: result.version.premise || '',
          synopsis: result.version.synopsis || '',
          structure: result.version.structureType || result.version.structure || 'hero-journey',
        }));

        setShowCreateStoryModal(false);
        toast.success(`Created "${data.name}" with ${data.characterIds.length} characters`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create story");
      }
    } catch (error) {
      console.error("Failed to create story with characters:", error);
      toast.error("Failed to create story");
    } finally {
      setIsCreatingStory(false);
    }
  };

  // Update story (name and characters)
  const handleUpdateStory = async (data: {
    storyId: string;
    name: string;
    characterIds: string[];
  }) => {
    try {
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${data.storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionName: data.name,
          characterIds: data.characterIds,
        }),
      });

      if (res.ok) {
        // Update local state
        setStoryVersions(prev => prev.map(v =>
          v.id === data.storyId
            ? { ...v, versionName: data.name, characterIds: data.characterIds }
            : v
        ));
        toast.success("Story updated!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update story");
      }
    } catch (error) {
      console.error("Failed to update story:", error);
      toast.error("Failed to update story");
    }
  };

  // Auto-save current story version
  const autoSaveStoryVersion = async () => {
    if (!activeVersionId) return;

    try {
      await fetch(`/api/creator/projects/${projectId}/stories/${activeVersionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: story.premise,
          synopsis: story.synopsis,
          globalSynopsis: story.globalSynopsis,
          genre: story.genre,
          subGenre: story.subGenre,
          format: story.format,
          duration: story.duration,
          tone: story.tone,
          theme: story.theme,
          conflict: story.conflict,
          targetAudience: story.targetAudience,
          endingType: story.endingType,
          structure: story.structure,
          catBeats: story.catBeats,
          heroBeats: story.heroBeats,
          harmonBeats: story.harmonBeats,
          tensionLevels: story.tensionLevels,
          wantNeedMatrix: story.wantNeedMatrix,
          beatCharacters: story.beatCharacters,
        }),
      });
    } catch (error) {
      console.error("Failed to auto-save story version:", error);
    }
  };

  // Delete a story version (soft delete)
  const handleDeleteStory = async (versionId: string) => {
    if (storyVersions.length <= 1) {
      toast.error("Cannot delete the only story version");
      return;
    }

    // Check if story has universe data
    try {
      const universeRes = await fetch(`/api/creator/projects/${projectId}/stories/${versionId}/universe`);
      if (universeRes.ok) {
        const universeData = await universeRes.json();
        if (universeData.universe) {
          const u = universeData.universe;
          // Check if any field has value
          const hasContent = u.universeName || u.period || u.geography || u.climate ||
            u.technology || u.history || u.politics || u.economy || u.culture ||
            u.magic || u.cosmology || u.factions || u.customs || u.conflicts || u.secrets;

          if (hasContent) {
            swalAlert.warning(
              'Story Memiliki Universe',
              'Story ini sudah memiliki data universe. Kosongkan universe terlebih dahulu sebelum menghapus story.'
            );
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to check universe:", err);
    }

    const confirmed = await swalAlert.confirm(
      "Delete Story Version",
      "Are you sure you want to delete this story version? You can restore it later."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${versionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        // Remove from active versions
        const deletedVersion = storyVersions.find(v => v.id === versionId);
        setStoryVersions(prev => prev.filter(v => v.id !== versionId));
        // Add to deleted versions
        if (deletedVersion) {
          setDeletedStoryVersions(prev => [{
            id: deletedVersion.id,
            versionName: deletedVersion.versionName,
            structure: deletedVersion.structure,
            deletedAt: new Date().toISOString(),
          }, ...prev]);
        }
        // Switch to new active if deleted was active
        if (data.newActiveId && versionId === activeVersionId) {
          handleSwitchStory(data.newActiveId);
        }
        toast.success("Story version deleted");
      }
    } catch (error) {
      console.error("Failed to delete story version:", error);
      toast.error("Failed to delete story version");
    }
  };

  // Restore a deleted story version
  const handleRestoreStory = async (versionId: string) => {
    try {
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
      });

      if (res.ok) {
        const data = await res.json();
        // Remove from deleted versions
        const restoredVersion = deletedStoryVersions.find(v => v.id === versionId);
        setDeletedStoryVersions(prev => prev.filter(v => v.id !== versionId));
        // Add to active versions
        if (restoredVersion) {
          const newVersionItem: StoryVersionListItem = {
            id: data.version.id,
            storyId: data.version.storyId,
            versionNumber: data.version.versionNumber,
            versionName: data.version.versionName,
            isActive: false,
            structure: data.version.structure,
            premise: data.version.premise,
            createdAt: data.version.createdAt,
            updatedAt: data.version.updatedAt,
          };
          setStoryVersions(prev => [newVersionItem, ...prev]);
        }
        toast.success(`Restored ${data.version.versionName}`);
      }
    } catch (error) {
      console.error("Failed to restore story version:", error);
      toast.error("Failed to restore story version");
    }
  };

  // ===== Universe Per Story Version Handlers =====

  // Load universe for active story version
  const loadUniverseForStory = async (storyVersionId: string) => {
    if (!storyVersionId) return;

    try {
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${storyVersionId}/universe`);
      if (res.ok) {
        const data = await res.json();
        if (data.universe) {
          setUniverseForStory(data.universe);
        } else {
          // Reset to empty if no universe
          setUniverseForStory({
            universeName: '', period: '',
            roomCave: '', houseCastle: '', privateInterior: '',
            familyInnerCircle: '', neighborhoodEnvironment: '',
            townDistrictCity: '', workingOfficeSchool: '',
            country: '', governmentSystem: '',
            laborLaw: '', rulesOfWork: '',
            societyAndSystem: '', socioculturalSystem: '',
            environmentLandscape: '', sociopoliticEconomy: '', kingdomTribeCommunal: '',
          });
        }
      }
    } catch (error) {
      console.error("Failed to load universe for story:", error);
    }
  };

  // Save universe for active story version (accepts optional data to avoid stale state)
  const saveUniverseForStory = async (dataToSave?: typeof universeForStory) => {
    if (!activeVersionId) return;

    const data = dataToSave || universeForStory;

    try {
      const res = await fetch(`/api/creator/projects/${projectId}/stories/${activeVersionId}/universe`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        console.error("Failed to save universe:", await res.text());
      }
    } catch (error) {
      console.error("Failed to save universe:", error);
    }
  };

  // Clear all universe data for active story
  const handleClearUniverse = async () => {
    if (!activeVersionId) return;

    const confirmed = await swalAlert.confirm(
      "Clear Universe",
      "Semua data universe akan dihapus. Apakah Anda yakin?"
    );
    if (!confirmed) return;

    const emptyUniverse: UniverseData = {
      universeName: '', period: '',
      roomCave: '', houseCastle: '', privateInterior: '',
      familyInnerCircle: '', neighborhoodEnvironment: '',
      townDistrictCity: '', workingOfficeSchool: '',
      country: '', governmentSystem: '',
      laborLaw: '', rulesOfWork: '',
      societyAndSystem: '', socioculturalSystem: '',
      environmentLandscape: '', sociopoliticEconomy: '', kingdomTribeCommunal: '',
    };

    setUniverseForStory(emptyUniverse);
    await saveUniverseForStory(emptyUniverse);
    toast.success("Universe cleared!");
  };

  // Generate universe using AI (with character/story context)
  const handleGenerateUniverseForStory = async () => {
    if (!activeVersionId || !user) return;

    setIsGeneratingUniverse(true);
    try {
      // Build prompt with context
      const characterContext = characters.map(c =>
        `- ${c.name} (${c.role}): ${c.physiological?.ethnicity || 'N/A'}, ${c.sociocultural?.cultureTradition || 'N/A'}`
      ).join('\n');

      const storyContext = `Premise: ${story.premise || 'N/A'}\nSynopsis: ${story.synopsis?.substring(0, 300) || 'N/A'}\nGenre: ${story.genre || 'N/A'}\nTheme: ${story.theme || 'N/A'}`;

      const prompt = `Generate World-Building Universe untuk IP project berikut.

PROJECT: ${project.title}
GENRE: ${story.genre || project?.description || 'Drama'}

STORY CONTEXT:
${storyContext}

CHARACTER CONTEXT:
${characterContext || 'No characters yet'}

Generate Universe dengan SEMUA 18 field dalam format JSON. Isi setiap field dengan 2-3 kalimat dalam Bahasa Indonesia.`;

      const result = await generateWithAI("universe_from_story", {
        prompt,
        inputParams: {
          projectId,
          storyVersionId: activeVersionId,
        }
      });

      if (result?.resultText) {
        try {
          let jsonText = result.resultText;
          if (jsonText.includes('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          const parsed = JSON.parse(jsonText);

          // Merge with existing data
          const newUniverseData = { ...universeForStory, ...parsed };

          // Update state
          setUniverseForStory(newUniverseData);

          // Save immediately with the new data (don't wait for state)
          await saveUniverseForStory(newUniverseData);

          toast.success("Universe generated and saved!");
        } catch (e) {
          console.error("Failed to parse universe JSON:", e);
          toast.error("Failed to parse AI response");
        }
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to generate universe:", error);
      toast.error("Failed to generate universe");
    } finally {
      setIsGeneratingUniverse(false);
    }
  };

  // Load universe when active story version changes
  useEffect(() => {
    if (activeVersionId) {
      loadUniverseForStory(activeVersionId);
    }
  }, [activeVersionId]);

  // Auto-show Create Story Modal when switching to story-formula tab with no stories
  useEffect(() => {
    if (activeTab === 'story-formula' && storyVersions.length === 0 && !isLoading) {
      setShowCreateStoryModal(true);
    }
  }, [activeTab, storyVersions.length, isLoading]);

  // Get beat NAMES for current structure
  const getStructureBeats = () => {
    switch (story.structure) {
      case "The Hero's Journey": return HERO_JOURNEY_BEATS;
      case "Save the Cat": return SAVE_THE_CAT_BEATS;
      case "Dan Harmon Story Circle": return DAN_HARMON_BEATS;
      default: return SAVE_THE_CAT_BEATS;
    }
  };

  // Get current structure's beat VALUES
  const getCurrentBeats = () => {
    switch (story.structure) {
      case "The Hero's Journey": return story.heroBeats || {};
      case "Save the Cat": return story.catBeats || {};
      case "Dan Harmon Story Circle": return story.harmonBeats || {};
      default: return story.catBeats || {};
    }
  };

  // Get current structure's key actions
  const getCurrentKeyActions = () => {
    switch (story.structure) {
      case "The Hero's Journey": return story.heroKeyActions || {};
      case "Save the Cat": return story.catKeyActions || {};
      case "Dan Harmon Story Circle": return story.harmonKeyActions || {};
      default: return story.catKeyActions || {};
    }
  };

  // Set beats for current structure
  const setCurrentBeats = (beats: Record<string, string>) => {
    setStory(s => ({
      ...s,
      ...(s.structure === "The Hero's Journey" ? { heroBeats: beats } :
        s.structure === "Dan Harmon Story Circle" ? { harmonBeats: beats } :
          { catBeats: beats })
    }));
  };

  // Set key actions for current structure
  const setCurrentKeyActions = (actions: Record<string, string>) => {
    setStory(s => ({
      ...s,
      ...(s.structure === "The Hero's Journey" ? { heroKeyActions: actions } :
        s.structure === "Dan Harmon Story Circle" ? { harmonKeyActions: actions } :
          { catKeyActions: actions })
    }));
  };

  // Convert beats to format for MoodboardStudio and AnimateStudio
  const getBeatsForStudio = () => {
    const beatNames = getStructureBeats();
    const beatValues = getCurrentBeats();
    return beatNames.map((label: string, index: number) => ({
      key: label.toLowerCase().replace(/\s+/g, '_'),
      label,
      content: beatValues[label] || ''
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
      toast.warning("Please login first");
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
      toast.error(error.message || "Generation failed");
      return null;
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
      setGeneratingCountdown(prev => ({ ...prev, [type]: 0 }));
      setQueuePosition(prev => ({ ...prev, [type]: undefined as any }));
    }
  };

  // Auto-save project to database
  // Auto-save project to database
  const autoSaveProject = async (updatedStory?: typeof story, updatedUniverse?: typeof universe, updatedTimeline?: any[]) => {
    try {
      const payload = {
        ...project,
        story: updatedStory || story,
        universe: updatedUniverse || universe,
        timeline: updatedTimeline || timeline,
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
        toast.error("Failed to save: " + (error.error || "Unknown error"));
      } else {
        console.log("Auto-save success!");
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
      toast.error("Failed to save project");
    }
  };

  // Helper: Parse JSON from AI response (handles markdown code blocks, imperfect JSON, and truncated responses)
  const parseAIResponse = (text: string): any => {
    let jsonText = text.trim();

    // Remove markdown code blocks
    if (jsonText.includes("```")) {
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonText = match[1].trim();
      } else {
        // Handle unclosed code block (truncated)
        jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```\s*$/g, "").trim();
      }
    }

    // Try to extract JSON object or array from text
    const jsonMatch = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Fix common JSON issues from AI
    // Remove trailing commas before } or ]
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    // Replace single quotes with double quotes (be careful with apostrophes)
    jsonText = jsonText.replace(/(\w)'(\w)/g, '$1APOSTROPHE$2');
    jsonText = jsonText.replace(/'/g, '"');
    jsonText = jsonText.replace(/APOSTROPHE/g, "'");
    // Remove comments
    jsonText = jsonText.replace(/\/\/.*$/gm, '');
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
    // Fix unquoted property names
    jsonText = jsonText.replace(/(\{|\,)\s*(\w+)\s*:/g, '$1"$2":');

    // Try to repair truncated JSON by closing unclosed brackets
    const repairTruncatedJson = (json: string): string => {
      let repaired = json;
      // Count brackets
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      // Remove trailing incomplete string/value
      repaired = repaired.replace(/,\s*"[^"]*$/, ''); // Incomplete string key
      repaired = repaired.replace(/:\s*"[^"]*$/, ': ""'); // Incomplete string value
      repaired = repaired.replace(/,\s*$/, ''); // Trailing comma

      // Close unclosed structures
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += '}';
      }
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repaired += ']';
      }

      return repaired;
    };

    try {
      return JSON.parse(jsonText);
    } catch (e) {
      console.warn("Initial JSON parse failed, attempting repair...");
      console.log("Problematic JSON content (first 500 chars):", jsonText.substring(0, 500));
      console.log("JSON length:", jsonText.length);

      // Try to repair truncated JSON
      try {
        const repaired = repairTruncatedJson(jsonText);
        return JSON.parse(repaired);
      } catch (e2) {
        console.warn("Repaired JSON also failed, trying regex extraction...");
      }

      // Fallback: Extract multiple characters via regex
      if (jsonText.toLowerCase().includes('name')) {
        try {
          const characters: any[] = [];
          // Find all name fields and extract character data
          const nameMatches = jsonText.matchAll(/"name"\s*:\s*"([^"]+)"/gi);

          for (const match of nameMatches) {
            const charName = match[1];
            // Try to find associated data near this name - expand range
            const startIdx = Math.max(0, match.index! - 100);
            const endIdx = Math.min(jsonText.length, match.index! + 2000);
            const charBlock = jsonText.substring(startIdx, endIdx);

            // Helper function to extract field
            const getField = (field: string) => {
              const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
              const m = charBlock.match(regex);
              return m ? m[1] : "";
            };

            characters.push({
              name: charName,
              // Physiological
              gender: getField('gender'),
              ethnicity: getField('ethnicity'),
              skinTone: getField('skinTone'),
              faceShape: getField('faceShape'),
              eyeShape: getField('eyeShape'),
              eyeColor: getField('eyeColor'),
              hairStyle: getField('hairStyle'),
              hairColor: getField('hairColor'),
              bodyType: getField('bodyType'),
              height: getField('height'),
              uniqueness: getField('uniqueness'),
              // Psychological
              archetype: getField('archetype'),
              fears: getField('fears'),
              wants: getField('wants'),
              needs: getField('needs'),
              personalityType: getField('personalityType'),
              // Other
              clothingStyle: getField('clothingStyle'),
              strength: getField('strength'),
              weakness: getField('weakness')
            });
          }

          if (characters.length > 0) {
            console.log(`Extracted ${characters.length} characters via regex fallback`);
            return { characters };
          }
        } catch (e3) {
          console.error("Regex extraction also failed:", e3);
        }
      }

      console.error("All JSON parsing attempts failed");
      console.log("Problematic JSON (first 1000 chars):", jsonText.substring(0, 1000));
      throw e;
    }
  };

  // Generate Synopsis - auto-fill all story fields and auto-save
  const handleGenerateSynopsis = async () => {
    if (!story.premise) {
      toast.warning("Please enter a premise first");
      return;
    }

    // Initialize progress modal with 2 steps
    const steps = [
      { id: 'synopsis', label: 'Generating Synopsis & Story Details', status: 'pending' as const },
      { id: 'structure', label: 'Generating Story Structure/Beats', status: 'pending' as const },
    ];

    setStoryGenProgress({
      isActive: true,
      steps,
      currentIndex: 0,
    });

    try {
      // Step 1: Generate synopsis
      setStoryGenProgress(prev => ({
        ...prev,
        currentIndex: 1,
        steps: prev.steps.map((s, i) => i === 0 ? { ...s, status: 'processing' } : s),
      }));

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
          await autoSaveProject(updatedStory);

          // Mark step 1 as completed
          setStoryGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map((s, i) => i === 0 ? { ...s, status: 'completed' } : s),
          }));

          // Step 2: Generate story structure/beats based on selected structure
          setStoryGenProgress(prev => ({
            ...prev,
            currentIndex: 2,
            steps: prev.steps.map((s, i) => i === 1 ? { ...s, status: 'processing' } : s),
          }));

          await handleGenerateStructureFor(updatedStory);

          // Mark step 2 as completed
          setStoryGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map((s, i) => i === 1 ? { ...s, status: 'completed' } : s),
          }));

        } catch (e) {
          // Fallback: use as plain text synopsis
          console.warn("Could not parse JSON, using as plain text:", e);
          const updatedStory = { ...story, synopsis: result.resultText };
          setStory(updatedStory);
          await autoSaveProject(updatedStory);

          setStoryGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map((s, i) => i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'error', error: 'Could not generate beats' } : s),
          }));
        }
      } else {
        setStoryGenProgress(prev => ({
          ...prev,
          steps: prev.steps.map((s, i) => i === 0 ? { ...s, status: 'error', error: 'No response from AI' } : s),
        }));
      }
    } catch (e: any) {
      setStoryGenProgress(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.status === 'processing' ? { ...s, status: 'error', error: e.message } : s),
      }));
    }
  };

  // Helper to generate structure with a specific story state
  const handleGenerateStructureFor = async (currentStory: typeof story) => {
    if (!currentStory.premise || !currentStory.synopsis) {
      return;
    }

    // Get beats for current structure (matching StoryArcStudio values)
    const structureName = currentStory.structure === "The Hero's Journey" ? "Hero's Journey" :
      currentStory.structure === "Dan Harmon Story Circle" ? "Dan Harmon Circle" : "Save the Cat";

    const beatsKey = currentStory.structure === "The Hero's Journey" ? "heroBeats" :
      currentStory.structure === "Dan Harmon Story Circle" ? "harmonBeats" : "catBeats";

    const beatNames = currentStory.structure === "The Hero's Journey"
      ? ["ordinaryWorld", "callToAdventure", "refusalOfCall", "meetingMentor", "crossingThreshold", "testsAlliesEnemies", "approachCave", "ordeal", "reward", "roadBack", "resurrection", "returnElixir"]
      : currentStory.structure === "Dan Harmon Story Circle"
        ? ["you", "need", "go", "search", "find", "take", "return", "change"]
        : ["openingImage", "themeStated", "setup", "catalyst", "debate", "breakIntoTwo", "bStory", "funAndGames", "midpoint", "badGuysCloseIn", "allIsLost", "darkNightOfTheSoul", "breakIntoThree", "finale", "finalImage"];

    const result = await generateWithAI("story_structure", {
      prompt: `Generate ${structureName} beats with Want/Need Matrix for this story.

PREMISE: ${currentStory.premise}
SYNOPSIS: ${currentStory.synopsis?.substring(0, 200)}
GENRE: ${currentStory.genre}, TONE: ${currentStory.tone}

RULES:
1. Generate ALL ${beatNames.length} beats: ${beatNames.join(", ")}
2. Each beat MUST be 20-40 words ONLY. Be concise!
3. Write in Bahasa Indonesia
4. Do NOT skip any beat

Output JSON (strict format):
{
  "beats": {
    ${beatNames.map(b => `"${b}": "20-40 kata saja"`).join(",\n    ")}
  },
  "tensionLevels": {
    ${beatNames.map((b, i) => `"${b}": ${Math.round(30 + (i / beatNames.length) * 60)}`).join(",\n    ")}
  },
  "wantNeedMatrix": {
    "want": { "external": "1 kalimat", "known": "1 kalimat", "specific": "1 kalimat", "achieved": "1 kalimat" },
    "need": { "internal": "1 kalimat", "unknown": "1 kalimat", "universal": "1 kalimat", "achieved": "1 kalimat" }
  }
}`
    });

    if (result?.resultText) {
      try {
        const parsed = parseAIResponse(result.resultText);

        const updatedStory = {
          ...currentStory,
          [beatsKey]: parsed.beats || {},
          tensionLevels: parsed.tensionLevels || currentStory.tensionLevels || {},
          wantNeedMatrix: parsed.wantNeedMatrix || currentStory.wantNeedMatrix
        };

        setStory(updatedStory);
        await autoSaveProject(updatedStory);
        toast.success("Story structure generated!");
      } catch (e) {
        console.warn("Could not parse structure JSON:", e);
      }
    }
  };

  // Generate Premise/Logline from project description and characters
  const handleGeneratePremise = async () => {
    if (characters.length === 0) {
      toast.warning("Please create at least one character first");
      return;
    }

    // Initialize progress modal - single step
    setStoryGenProgress({
      isActive: true,
      steps: [{ id: 'premise', label: 'Generating Premise/Logline', status: 'processing' }],
      currentIndex: 1,
    });

    try {
      // Build context from characters
      const charContext = characters
        .map(c => `- ${c.name} (${c.role || 'Unknown role'}): ${c.psychological?.archetype || ''} ${c.psychological?.wants || ''}`)
        .join('\n');

      const result = await generateWithAI("premise", {
        prompt: `
PROJECT DESCRIPTION: ${project.description || 'No description provided'}

CHARACTERS:
${charContext}

Generate a compelling one-sentence premise/logline for this story. The logline should:
1. Introduce the protagonist and their goal
2. Hint at the main conflict or obstacle
3. Create intrigue and hook the audience
4. Be under 50 words

Return JSON format:
{
  "premise": "The one-sentence logline here...",
  "genre": "suggested genre based on characters and description",
  "tone": "suggested tone",
  "theme": "suggested main theme"
}
      `.trim()
      });

      if (result?.resultText) {
        try {
          const parsed = parseAIResponse(result.resultText);
          const updatedStory = {
            ...story,
            premise: parsed.premise || story.premise,
            genre: parsed.genre || story.genre,
            tone: parsed.tone || story.tone,
            theme: parsed.theme || story.theme,
          };
          setStory(updatedStory);
          await autoSaveProject(updatedStory);

          // Mark as completed
          setStoryGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
          }));

          toast.success("Premise generated!");
        } catch (e) {
          // Fallback: use as plain text
          const updatedStory = { ...story, premise: result.resultText };
          setStory(updatedStory);
          await autoSaveProject(updatedStory);

          setStoryGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
          }));
        }
      } else {
        setStoryGenProgress(prev => ({
          ...prev,
          steps: prev.steps.map(s => ({ ...s, status: 'error', error: 'No AI response' })),
        }));
        toast.error("No response from AI");
      }
    } catch (e: any) {
      setStoryGenProgress(prev => ({
        ...prev,
        steps: prev.steps.map(s => ({ ...s, status: 'error', error: e.message })),
      }));
      toast.error("Failed to generate premise");
    }
  };

  // Generate Story Structure - auto-fill beats, key actions, and want/need matrix, auto-save
  const handleGenerateStructure = async () => {
    if (!story.premise || !story.synopsis) {
      toast.warning("Please enter premise and synopsis first");
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
        toast.error("Gagal parse hasil AI. Coba generate ulang.");
      }
    }
  };

  // Generate ALL moodboard prompts from story beats - auto-fill and auto-save
  const handleGenerateAllMoodboardPrompts = async () => {
    if (!story.synopsis || Object.keys(getCurrentBeats()).length === 0) {
      toast.warning("Please generate synopsis and story structure first");
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
  const handleGenerateCharacterImage = async (pose: string, styleContext?: string) => {
    if (!editingCharacter?.name) {
      toast.warning("Please enter character name first");
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
      prompt: `${editingCharacter.name}, ${editingCharacter.role}, ${appearance}, ${pose} pose. ${styleContext || ''}`,
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
      toast.warning("Please add a prompt description first");
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

  // Generate Animation Prompt (Batch)
  const handleGenerateAnimatePrompts = async () => {
    if (!story.synopsis) {
      toast.warning("Please generate synopsis first");
      return;
    }

    const beats = getStructureBeats();
    const newPrompts: Record<string, string> = {};

    for (const beat of beats) {
      if (animationPrompts[beat]) continue;

      setIsGenerating(prev => ({ ...prev, [`animate_prompt_${beat}`]: true }));

      const result = await generateWithAI("moodboard_prompt", {
        prompt: `Create a video generation prompt for beat: "${beat}".
        Context: ${moodboardPrompts[beat] || getCurrentBeats()[beat] || ''}
        Genre: ${story.genre}
        Focus on MOTION, CAMERA ANGLES, and AMBIENCE suitable for video generation.`,
        beat,
        genre: story.genre
      });

      if (result?.resultText) {
        try {
          const parsed = parseAIResponse(result.resultText);
          newPrompts[beat] = parsed.prompt || result.resultText;
        } catch {
          newPrompts[beat] = result.resultText;
        }
      }

      setIsGenerating(prev => ({ ...prev, [`animate_prompt_${beat}`]: false }));
    }

    setAnimationPrompts(prev => ({ ...prev, ...newPrompts }));
    await autoSaveProject();
  };

  // Generate Animation Clip
  const handleGenerateAnimation = async (beat: string) => {
    const prompt = animationPrompts[beat] || moodboardPrompts[beat];
    if (!prompt) {
      toast.warning("Please describe the animation first");
      return;
    }

    // Set specific loading state for this beat
    setIsGenerating(prev => ({ ...prev, [`video_${beat}`]: true }));

    try {
      const result = await generateWithAI("video_generation", {
        prompt,
        beat,
        sourceImage: moodboardImages[beat], // Use moodboard image as init_image if available
        genre: story.genre,
        tone: story.tone
      });

      if (result?.resultUrl) {
        setAnimationPreviews(prev => ({ ...prev, [beat]: result.resultUrl }));
        await autoSaveProject(); // Save the new video URL
        toast.success("Animation generated!");
      }
    } catch (e) {
      console.error("Animation generation failed:", e);
    } finally {
      setIsGenerating(prev => ({ ...prev, [`video_${beat}`]: false }));
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        );
      }
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {countdown}s
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
        animationPreviews,
        timeline
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

      const newCharacters = [...characters];
      let charactersUpdated = false;

      for (let i = 0; i < newCharacters.length; i++) {
        const char = newCharacters[i];
        if (char.id.startsWith("temp-")) {
          // Create new character
          const res = await fetch(`/api/creator/projects/${projectId}/characters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(char)
          });
          if (res.ok) {
            const savedChar = await res.json();
            newCharacters[i] = savedChar;
            charactersUpdated = true;

            // Update selection state if this was the selected character
            if (selectedCharacterId === char.id) {
              setSelectedCharacterId(savedChar.id);
              setEditingCharacter(prev => prev ? { ...prev, id: savedChar.id } : null);
            }
          }
        } else {
          // Update existing character
          await fetch(`/api/creator/projects/${projectId}/characters/${char.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(char)
          });
        }
      }

      if (charactersUpdated) {
        setCharacters(newCharacters);
      }

      toast.success("Project saved successfully!");
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Character management
  const handleNewCharacter = () => {
    const newChar = {
      id: `temp-${Date.now()}`,
      ...createEmptyCharacter()
    };

    // Add to characters list immediately so it appears in UI
    setCharacters(prev => [...prev, newChar]);

    // Select it for editing
    setSelectedCharacterId(newChar.id);
    setEditingCharacter(newChar);
  };

  const handleSelectCharacter = (id: string | null) => {
    setSelectedCharacterId(id);
    if (id) {
      const char = characters.find(c => c.id === id);
      if (char) setEditingCharacter({ ...char });
    }
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
    // Check if character is linked to any story
    const linkedStories = storyVersions.filter(v => v.characterIds?.includes(id));
    if (linkedStories.length > 0) {
      const storyNames = linkedStories.map(s => s.versionName).join(', ');
      swalAlert.warning(
        'Karakter Sedang Digunakan',
        `Karakter ini terhubung ke story: ${storyNames}. Hapus karakter dari story terlebih dahulu.`
      );
      return;
    }

    const confirmed = await swalAlert.confirm(
      "Delete Character",
      "Are you sure you want to delete this character?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/creator/projects/${projectId}/characters/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      // Move to deleted list
      const deletedChar = characters.find(c => c.id === id);
      if (deletedChar) {
        setDeletedCharacters(prev => [{
          id: deletedChar.id,
          name: deletedChar.name,
          role: deletedChar.role,
          imageUrl: deletedChar.imageUrl,
          deletedAt: new Date().toISOString()
        }, ...prev]);
      }
      setCharacters(prev => prev.filter(c => c.id !== id));
      if (selectedCharacterId === id) {
        setSelectedCharacterId(null);
        setEditingCharacter(null);
      }
      toast.success("Character deleted");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to delete character");
    }
  };

  // Restore deleted character
  const handleRestoreCharacter = async (id: string) => {
    try {
      const res = await fetch(`/api/creator/projects/${projectId}/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
      });

      if (res.ok) {
        // Remove from deleted list
        setDeletedCharacters(prev => prev.filter(c => c.id !== id));
        // Reload characters to get full data
        const charRes = await fetch(`/api/creator/projects/${projectId}/characters`);
        if (charRes.ok) {
          const data = await charRes.json();
          setCharacters(data.characters);
          if (data.deletedCharacters) setDeletedCharacters(data.deletedCharacters);
        }
        toast.success("Character restored!");
      } else {
        toast.error("Failed to restore character");
      }
    } catch (error) {
      console.error("Failed to restore character:", error);
      toast.error("Failed to restore character");
    }
  };

  // Generate characters from story
  const [numCharactersToGenerate, setNumCharactersToGenerate] = useState(3);

  const handleGenerateCharactersFromStory = async (customPrompt?: string, role?: string, count?: number) => {
    // Use project description for context (not story)
    const numChars = count || 1;
    const charRole = role || 'Protagonist';

    // Initialize progress modal - single step
    const steps = [
      { id: 'generate', label: `Generating ${charRole} Character`, status: 'processing' as const },
    ];

    setCharacterGenProgress({
      isActive: true,
      steps,
      currentIndex: 1,
    });

    setIsGenerating(prev => ({ ...prev, characters_from_story: true }));

    try {
      const prompt = customPrompt || `Generate ${numChars} ${charRole} character(s) for this project:
      
PROJECT: ${project.title}
DESCRIPTION: ${project.description}
STUDIO: ${project.studioName}`;

      const result = await generateWithAI("characters_from_story", {
        prompt,
        numCharacters: numChars,
        role: charRole,
        projectTitle: project.title,
        projectDescription: project.description
      });

      if (result?.resultText) {
        try {
          const parsed = parseAIResponse(result.resultText);

          // Handle various response formats
          let generatedChars: any[] = [];
          if (Array.isArray(parsed.characters)) {
            generatedChars = parsed.characters;
          } else if (Array.isArray(parsed)) {
            generatedChars = parsed;
          } else if (parsed.character) {
            generatedChars = [parsed.character];
          } else if (parsed.name) {
            // Single character object returned
            generatedChars = [parsed];
          }

          if (generatedChars.length === 0) {
            toast.warning("AI tidak mengembalikan data karakter yang valid");
            return;
          }

          // Create each character
          for (const charData of generatedChars) {
            // Helper to get nested value - handles camelCase, snake_case, and lowercase
            const get = (obj: any, key: string) => {
              if (!obj) return "";
              // Try various key formats
              const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
              const lowerKey = key.toLowerCase();

              const tryGet = (o: any) => o?.[key] || o?.[snakeKey] || o?.[lowerKey] || "";

              // Try direct access first, then nested
              return tryGet(obj) ||
                tryGet(obj.physiological) ||
                tryGet(obj.psychological) ||
                tryGet(obj.emotional) ||
                tryGet(obj.family) ||
                tryGet(obj.sociocultural) ||
                tryGet(obj.coreBeliefs) || tryGet(obj.core_beliefs) ||
                tryGet(obj.educational) ||
                tryGet(obj.sociopolitics) ||
                tryGet(obj.swot) ||
                "";
            };

            const newChar = {
              id: `temp-${Date.now()}-${Math.random()}`,
              name: charData.name || "Generated Character",
              role: charRole,
              age: charData.age || "",
              castReference: charData.castReference || "",
              imageUrl: "",
              imagePoses: {},
              physiological: {
                gender: get(charData, 'gender'),
                ethnicity: get(charData, 'ethnicity'),
                skinTone: get(charData, 'skinTone'),
                faceShape: get(charData, 'faceShape'),
                eyeShape: get(charData, 'eyeShape'),
                eyeColor: get(charData, 'eyeColor'),
                noseShape: get(charData, 'noseShape'),
                lipsShape: get(charData, 'lipsShape'),
                hairStyle: get(charData, 'hairStyle'),
                hairColor: get(charData, 'hairColor'),
                hijab: get(charData, 'hijab') || "none",
                bodyType: get(charData, 'bodyType'),
                height: get(charData, 'height'),
                uniqueness: get(charData, 'uniqueness')
              },
              psychological: {
                archetype: get(charData, 'archetype'),
                fears: get(charData, 'fears'),
                wants: get(charData, 'wants'),
                needs: get(charData, 'needs'),
                alterEgo: get(charData, 'alterEgo'),
                traumatic: get(charData, 'traumatic'),
                personalityType: get(charData, 'personalityType')
              },
              emotional: {
                logos: get(charData, 'logos'),
                ethos: get(charData, 'ethos'),
                pathos: get(charData, 'pathos'),
                tone: get(charData, 'emotionalTone') || get(charData, 'tone'),
                style: get(charData, 'emotionalStyle') || get(charData, 'style'),
                mode: get(charData, 'emotionalMode') || get(charData, 'mode')
              },
              family: {
                spouse: get(charData, 'spouse'),
                children: get(charData, 'children'),
                parents: get(charData, 'parents')
              },
              sociocultural: {
                affiliation: get(charData, 'affiliation'),
                groupRelationshipLevel: get(charData, 'groupRelationshipLevel'),
                cultureTradition: get(charData, 'cultureTradition'),
                language: get(charData, 'language'),
                tribe: get(charData, 'tribe'),
                economicClass: get(charData, 'economicClass')
              },
              coreBeliefs: {
                faith: get(charData, 'faith'),
                religionSpirituality: get(charData, 'religionSpirituality'),
                trustworthy: get(charData, 'trustworthy'),
                willingness: get(charData, 'willingness'),
                vulnerability: get(charData, 'vulnerability'),
                commitments: get(charData, 'commitments'),
                integrity: get(charData, 'integrity')
              },
              educational: {
                graduate: get(charData, 'graduate'),
                achievement: get(charData, 'achievement'),
                fellowship: get(charData, 'fellowship')
              },
              sociopolitics: {
                partyId: get(charData, 'partyId'),
                nationalism: get(charData, 'nationalism'),
                citizenship: get(charData, 'citizenship')
              },
              swot: {
                strength: get(charData, 'strength'),
                weakness: get(charData, 'weakness'),
                opportunity: get(charData, 'opportunity'),
                threat: get(charData, 'threat')
              },
              clothingStyle: get(charData, 'clothingStyle'),
              accessories: charData.accessories || [],
              props: charData.props || "",
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
            } else {
              console.error("Failed to save character:", await res.text());
            }
          }

          // Mark step as completed
          setCharacterGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
          }));

          toast.success(`${generatedChars.length} karakter berhasil digenerate!`);
        } catch (e) {
          console.error("Failed to parse characters:", e);
          setCharacterGenProgress(prev => ({
            ...prev,
            steps: prev.steps.map(s => ({ ...s, status: 'error', error: 'Failed to parse' })),
          }));
          toast.error("Gagal parse hasil AI. Coba lagi.");
        }
      } else {
        setCharacterGenProgress(prev => ({
          ...prev,
          steps: prev.steps.map((s, i) => i === 0 ? { ...s, status: 'error', error: 'No AI response' } : s),
        }));
        toast.error("Tidak ada response dari AI");
      }
    } catch (e: any) {
      console.error("Generate characters failed:", e);
      setCharacterGenProgress(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.status === 'processing' ? { ...s, status: 'error', error: e.message } : s),
      }));
      toast.error("Gagal generate karakter");
    } finally {
      setIsGenerating(prev => ({ ...prev, characters_from_story: false }));
    }
  };

  // Generate Universe from Story
  const handleGenerateUniverseFromStory = async () => {
    if (!story.premise && !story.synopsis) {
      toast.warning("Harap isi Premise atau Synopsis di tab Story terlebih dahulu");
      return;
    }

    // Initialize progress modal - single step
    const steps = [
      { id: 'generate', label: 'Generating Universe/World Building', status: 'processing' as const },
    ];

    setUniverseGenProgress({
      isActive: true,
      steps,
      currentIndex: 1,
    });

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

        // Mark step as completed
        setUniverseGenProgress(prev => ({
          ...prev,
          steps: prev.steps.map(s => ({ ...s, status: 'completed' })),
        }));

        toast.success("Universe berhasil digenerate!");
      } else {
        setUniverseGenProgress(prev => ({
          ...prev,
          steps: prev.steps.map(s => ({ ...s, status: 'error', error: 'No AI response' })),
        }));
        toast.error("Tidak ada response dari AI");
      }
    } catch (e: any) {
      console.error("Generate universe failed:", e);
      setUniverseGenProgress(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.status === 'processing' ? { ...s, status: 'error', error: e.message } : s),
      }));
      toast.error("Gagal generate universe");
    } finally {
      setIsGenerating(prev => ({ ...prev, universe_from_story: false }));
    }
  };

  // Generate All Moodboard Prompts from Story
  const handleGenerateMoodboardPrompts = async () => {
    if (Object.keys(getCurrentBeats()).length === 0) {
      toast.warning("Harap generate Story Structure terlebih dahulu di tab Story");
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
          toast.success("Moodboard prompts berhasil digenerate! Silakan save lalu generate image satu-satu.");
        }
      }
    } catch (e) {
      console.error("Generate moodboard prompts failed:", e);
      toast.error("Gagal generate moodboard prompts");
    } finally {
      setIsGenerating(prev => ({ ...prev, moodboard_all_prompts: false }));
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Navigation items - Order matches AI-Series-Studio
  // modes: which view modes are available for each tab
  const navItems: { id: string; label: string; icon: any; color: string; modes: StudioMode[] }[] = [
    { id: "ip-project", label: "IP Project", icon: Briefcase, color: "from-orange-500 to-amber-500", modes: ["form"] },
    { id: "strategic-plan", label: "Strategic Plan", icon: Share2, color: "from-blue-500 to-cyan-500", modes: ["form", "canvas"] },
    { id: "characters", label: "Character Formula", icon: User, color: "from-emerald-500 to-teal-500", modes: ["form", "canvas"] },
    { id: "story", label: "Story Formula", icon: Wand2, color: "from-purple-500 to-pink-500", modes: ["form", "canvas"] },
    { id: "universe-formula", label: "Universe Formula", icon: Globe, color: "from-violet-500 to-fuchsia-500", modes: ["form", "canvas"] },
    { id: "moodboard", label: "Moodboard", icon: LayoutTemplate, color: "from-pink-500 to-rose-500", modes: ["form", "canvas"] },
    { id: "animate", label: "Animate", icon: Video, color: "from-rose-500 to-orange-500", modes: ["form", "canvas", "storyboard"] },
    { id: "edit-mix", label: "Edit & Mix", icon: Film, color: "from-indigo-500 to-purple-500", modes: ["form", "storyboard"] },
    { id: "ip-bible", label: "IP Bible", icon: Book, color: "from-slate-600 to-slate-800", modes: ["form"] },
  ];

  // Canvas type mapping for HybridStudioWrapper
  const canvasTypeMap: Record<string, 'character' | 'universe' | 'story' | 'project' | 'moodboard'> = {
    'characters': 'character',
    'story': 'story',
    'universe-formula': 'universe',
    'moodboard': 'moodboard',
    'strategic-plan': 'project',
    'animate': 'moodboard',
  };

  const currentNav = navItems.find(n => n.id === activeTab) || navItems[0];

  return (
    <>
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

          {/* Navigation Tabs - Horizontally Scrollable */}
          <div className="px-2 sm:px-4 lg:px-8 overflow-x-auto scrollbar-thin pb-1">
            <div className="flex gap-1 pb-2 min-w-max">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === item.id
                    ? "text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                  {activeTab === item.id && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`} />
                  )}
                  <item.icon className={`h-4 w-4 relative z-10 ${activeTab === item.id ? "text-white" : ""}`} />
                  <span className="relative z-10 hidden xs:inline sm:inline">{item.label}</span>
                  {/* Mode indicators */}
                  {item.modes.length > 1 && (
                    <div className="relative z-10 flex items-center gap-0.5 ml-0.5 sm:ml-1">
                      {item.modes.includes('canvas') && (
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === item.id ? 'bg-white/60' : 'bg-orange-400'}`} title="Canvas Mode available" />
                      )}
                      {item.modes.includes('storyboard') && (
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === item.id ? 'bg-white/60' : 'bg-purple-400'}`} title="Storyboard Mode available" />
                      )}
                    </div>
                  )}
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
            {/* IP PROJECT TAB */}
            <TabsContent value="ip-project" className="h-[calc(100vh-140px)] mt-4">
              <IPPassport
                project={project}
                onUpdate={(updates) => setProject(prev => ({ ...prev, ...updates }))}
              />
            </TabsContent>

            {/* STRATEGIC PLAN TAB */}
            <TabsContent value="strategic-plan" className="flex-1 overflow-auto mt-4 h-[calc(100vh-140px)]">
              <StrategicPlan
                projectId={projectId}
                userId={user?.id || ""}
                initialData={strategicPlanData}
                onSave={(data) => {
                  setStrategicPlanData(data);
                }}
              />
            </TabsContent>

            {/* CHARACTERS TAB */}
            {/* CHARACTERS TAB */}
            <TabsContent value="characters" className="h-[calc(100vh-140px)] mt-4">
              <CharacterStudio
                characters={characters}
                deletedCharacters={deletedCharacters}
                projectData={project}
                selectedId={selectedCharacterId}
                characterRelations={story.characterRelations || []}
                onSelect={handleSelectCharacter}
                onAdd={handleNewCharacter}
                onDelete={handleDeleteCharacter}
                onRestore={handleRestoreCharacter}
                onUpdate={(id, updates) => {
                  setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
                  if (selectedCharacterId === id) {
                    setEditingCharacter(prev => prev ? { ...prev, ...updates } : null);
                  }
                }}
                onCharacterRelationsChange={async (relations) => {
                  const updatedStory = { ...story, characterRelations: relations };
                  setStory(updatedStory);

                  // Auto-save to database
                  try {
                    await fetch(`/api/creator/projects/${projectId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ story: updatedStory }),
                    });
                  } catch (error) {
                    console.error('Failed to save relations:', error);
                  }
                }}
                onGenerateRelations={async () => {
                  // Auto-generate relations based on character roles
                  const newRelations: any[] = [];
                  const protagonists = characters.filter(c => c.role?.toLowerCase().includes('protagonist'));
                  const antagonists = characters.filter(c => c.role?.toLowerCase().includes('antagonist'));
                  const loveInterests = characters.filter(c => c.role?.toLowerCase().includes('love'));
                  const mentors = characters.filter(c => c.role?.toLowerCase().includes('mentor'));

                  // Protagonists vs Antagonists = rivals
                  protagonists.forEach(p => {
                    antagonists.forEach(a => {
                      newRelations.push({
                        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        fromCharId: p.id,
                        toCharId: a.id,
                        type: 'rivals',
                        label: 'Rivals'
                      });
                    });
                  });

                  // Protagonists with Love Interests
                  protagonists.forEach((p, i) => {
                    if (loveInterests[i]) {
                      newRelations.push({
                        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        fromCharId: p.id,
                        toCharId: loveInterests[i].id,
                        type: 'loves',
                        label: 'Loves'
                      });
                    }
                  });

                  // Mentors mentor Protagonists
                  mentors.forEach(m => {
                    protagonists.forEach(p => {
                      newRelations.push({
                        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        fromCharId: m.id,
                        toCharId: p.id,
                        type: 'mentor',
                        label: 'Mentors'
                      });
                    });
                  });

                  // Update local state
                  const updatedStory = { ...story, characterRelations: newRelations };
                  setStory(updatedStory);

                  // Save to database via API
                  try {
                    await fetch(`/api/creator/projects/${projectId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ story: updatedStory }),
                    });
                    toast.success(`Generated and saved ${newRelations.length} relationships!`);
                  } catch (error) {
                    console.error('Failed to save relations:', error);
                    toast.error('Generated relationships but failed to save. Please try again.');
                  }
                }}
                isGeneratingRelations={false}
                onGenerateImage={(id, type, style) => handleGenerateCharacterImage(type, style)}
                isGeneratingImage={Boolean(isGenerating.character_image)}
                onGenerateCharacters={(prompt, role, count) => handleGenerateCharactersFromStory(prompt, role, count)}
                isGeneratingCharacters={Boolean(isGenerating.characters_from_story)}
                userId={user?.id}
                projectId={projectId}
              />
            </TabsContent>
            {/* STORY TAB - Redesigned */}
            <TabsContent value="story" className="flex-1 overflow-auto mt-4">
              <div className="h-[calc(100vh-140px)]">
                <StoryArcStudio
                  story={story}
                  characters={characters}
                  projectDescription={project.description}
                  stories={storyVersions.map(v => ({ id: v.id, name: v.versionName }))}
                  deletedStories={deletedStoryVersions}
                  selectedStoryId={activeVersionId}
                  onSelectStory={handleSwitchStory}
                  onNewStory={() => setShowCreateStoryModal(true)}
                  onEditStory={() => setShowEditStoryModal(true)}
                  onDeleteStory={handleDeleteStory}
                  onRestoreStory={handleRestoreStory}
                  structureType={storyVersions.find(v => v.id === activeVersionId)?.structureType}
                  storyCharacterIds={storyVersions.find(v => v.id === activeVersionId)?.characterIds || []}
                  onUpdate={(updates) => setStory(prev => ({ ...prev, ...updates }))}
                  onGenerate={() => handleGenerateSynopsis()}
                  onGeneratePremise={handleGeneratePremise}
                  isGenerating={Boolean(isGenerating.synopsis || isGenerating.story_structure)}
                  isGeneratingPremise={Boolean(isGenerating.premise)}
                />
              </div>
              <div className="hidden">
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
                              <SelectItem value="The Hero's Journey">Hero's Journey (12)</SelectItem>
                              <SelectItem value="Save the Cat">Save the Cat (15)</SelectItem>
                              <SelectItem value="Dan Harmon Story Circle">Dan Harmon (8)</SelectItem>
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
                                  value={story.wantNeedMatrix?.want?.[key as keyof NonNullable<typeof story.wantNeedMatrix>['want']] || ''}
                                  onChange={(e) => setStory(s => ({
                                    ...s,
                                    wantNeedMatrix: { ...s.wantNeedMatrix, want: { ...s.wantNeedMatrix?.want, [key]: e.target.value } }
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
                                  value={story.wantNeedMatrix?.need?.[key as keyof NonNullable<typeof story.wantNeedMatrix>['need']] || ''}
                                  onChange={(e) => setStory(s => ({
                                    ...s,
                                    wantNeedMatrix: { ...s.wantNeedMatrix, need: { ...s.wantNeedMatrix?.need, [key]: e.target.value } }
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
              </div>
            </TabsContent>



            {/* UNIVERSE FORMULA TAB */}
            <TabsContent value="universe-formula" className="flex-1 overflow-auto mt-4">
              <div className="h-[calc(100vh-140px)]">
                <UniverseFormulaStudio
                  universe={universeForStory}
                  stories={storyVersions.map(sv => ({ id: sv.id, name: sv.versionName }))}
                  selectedStoryId={activeVersionId}
                  onSelectStory={(storyId) => {
                    setActiveVersionId(storyId);
                    // Also switch story version data
                    const selectedVersion = storyVersions.find(sv => sv.id === storyId);
                    if (selectedVersion) {
                      handleSwitchStory(storyId);
                    }
                  }}
                  onUpdate={(updates) => {
                    const newData = { ...universeForStory, ...updates };
                    setUniverseForStory(newData);
                    // Auto-save with the new data
                    saveUniverseForStory(newData);
                  }}
                  onClear={handleClearUniverse}
                  onGenerate={handleGenerateUniverseForStory}
                  isGenerating={isGeneratingUniverse}
                />
              </div>
            </TabsContent>

            {/* MOODBOARD TAB */}
            <TabsContent value="moodboard" className="h-[calc(100vh-140px)] mt-4">
              <MoodboardStudioV2
                projectId={projectId as string}
                userId={user?.id || ''}
                storyVersions={storyVersions.map(v => ({
                  id: v.id,
                  versionName: v.versionName,
                  structureType: v.structureType || 'harmon',
                  episodeNumber: v.episodeNumber || 1,
                  isActive: v.isActive,
                }))}
                characters={characters.map(c => ({
                  id: c.id,
                  name: c.name,
                  role: c.role,
                  imageUrl: c.imageUrl,
                }))}
                onMoodboardChange={() => {
                  // Optionally refresh data when moodboard changes
                  console.log('Moodboard changed');
                }}
              />
            </TabsContent>

            {/* ANIMATE TAB */}
            <TabsContent value="animate" className="h-[calc(100vh-140px)] mt-4">
              <AnimateStudio
                beats={getBeatsForStudio()}
                moodboardImages={moodboardImages}
                animationPrompts={animationPrompts}
                animationPreviews={animationPreviews}
                onUpdatePrompt={(beatKey, prompt) => setAnimationPrompts(p => ({ ...p, [beatKey]: prompt }))}
                onGenerateAnimation={(beatKey) => handleGenerateAnimation(beatKey)}
                onGenerateAll={handleGenerateAnimatePrompts}
                isGenerating={isGenerating}
              />
            </TabsContent>



            {/* EDIT & MIX TAB */}
            <TabsContent value="edit-mix" className="h-[calc(100vh-140px)] mt-4">
              <EditMixStudio
                timeline={timeline}
                onUpdateTimeline={setTimeline}
                videoClips={Object.entries(animationPreviews).filter(([_, url]) => url).map(([key, url]) => ({
                  id: key,
                  name: key,
                  src: url,
                  duration: 5
                }))}
                onExport={(format) => {
                  // TODO: Wire up export API
                  console.log('Export as:', format);
                }}
                onGenerateTTS={(text, voice) => {
                  // TODO: Wire up TTS API
                  console.log('Generate TTS:', text, 'with voice:', voice);
                }}
                isExporting={isGenerating.export}
              />
            </TabsContent>

            {/* IP BIBLE TAB - Complete Preview */}
            <TabsContent value="ip-bible" className="h-[calc(100vh-140px)] mt-4">
              <IPBibleStudio
                project={{
                  title: project.title,
                  studioName: project.studioName,
                  logline: story.premise,
                  description: project.description,
                  genre: story.genre,
                  format: story.format,
                  targetAudience: story.targetAudience,
                  logoUrl: project.logoUrl,
                  ipOwner: project.ipOwner
                }}
                characters={characters.map(c => ({
                  id: c.id,
                  name: c.name,
                  role: c.role,
                  archetype: c.psychological?.archetype,
                  personality: c.personalityTraits?.join(', '),
                  backstory: c.psychological?.traumatic,
                  imagePoses: c.imagePoses
                }))}
                story={{
                  premise: story.premise,
                  theme: story.theme,
                  tone: story.tone,
                  genre: story.genre,
                  structure: story.structure === 'hero' ? "The Hero's Journey" :
                    story.structure === 'cat' ? 'Save the Cat' : 'Dan Harmon Circle',
                  catBeats: story.catBeats,
                  heroBeats: story.heroBeats
                }}
                universe={{
                  ...universe,
                  description: universe.environment
                }}
                moodboardImages={moodboardImages}
                onExportPDF={() => {
                  // TODO: Wire up PDF export
                  console.log('Export PDF');
                }}
                isExporting={isGenerating.export_pdf}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* New Story Dialog */}
      <NewStoryDialog
        open={showNewStoryDialog}
        onOpenChange={setShowNewStoryDialog}
        existingVersions={storyVersions}
        onCreateStory={handleCreateNewStory}
        isCreating={isCreatingStory}
      />

      {/* Create Story Modal (with character linking) */}
      <CreateStoryModal
        open={showCreateStoryModal}
        onOpenChange={setShowCreateStoryModal}
        characters={characters.map(c => ({
          id: c.id,
          name: c.name,
          role: c.role || 'Unknown',
          imageUrl: c.imageUrl,
        }))}
        onCreateStory={handleCreateStoryWithCharacters}
        isLoading={isCreatingStory}
        canDismiss={storyVersions.length > 0}
      />

      {/* Edit Story Modal */}
      {activeVersionId && (
        <EditStoryModal
          open={showEditStoryModal}
          onOpenChange={setShowEditStoryModal}
          characters={characters.map(c => ({
            id: c.id,
            name: c.name,
            role: c.role || 'Unknown',
            imageUrl: c.imageUrl,
          }))}
          storyId={activeVersionId}
          storyName={storyVersions.find(v => v.id === activeVersionId)?.versionName || ''}
          structureType={storyVersions.find(v => v.id === activeVersionId)?.structureType || 'save-the-cat'}
          characterIds={storyVersions.find(v => v.id === activeVersionId)?.characterIds || []}
          onUpdateStory={handleUpdateStory}
          isLoading={isCreatingStory}
        />
      )}

      {/* Story Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={storyGenProgress.isActive}
        title="Generating Story"
        steps={storyGenProgress.steps}
        currentStepIndex={storyGenProgress.currentIndex}
        onClose={() => setStoryGenProgress(prev => ({ ...prev, isActive: false }))}
      />

      {/* Character Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={characterGenProgress.isActive}
        title="Generating Characters"
        steps={characterGenProgress.steps}
        currentStepIndex={characterGenProgress.currentIndex}
        onClose={() => setCharacterGenProgress(prev => ({ ...prev, isActive: false }))}
      />

      {/* Universe Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={universeGenProgress.isActive}
        title="Generating Universe"
        steps={universeGenProgress.steps}
        currentStepIndex={universeGenProgress.currentIndex}
        onClose={() => setUniverseGenProgress(prev => ({ ...prev, isActive: false }))}
      />
    </>
  );
}
