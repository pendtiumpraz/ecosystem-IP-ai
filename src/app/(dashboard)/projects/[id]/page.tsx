"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Sparkles,
  FileText,
  Users,
  Globe,
  Image as ImageIcon,
  Video,
  Download,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  History,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const storyStructures = [
  { value: "hero", label: "Hero's Journey (12 steps)" },
  { value: "cat", label: "Save the Cat (15 beats)" },
  { value: "harmon", label: "Dan Harmon's Story Circle (8 steps)" },
];

interface Generation {
  id: string;
  generationType: string;
  prompt: string;
  resultText?: string;
  resultUrl?: string;
  status: "pending" | "processing" | "completed" | "failed";
  creditCost: number;
  isAccepted: boolean;
  createdAt: string;
  errorMessage?: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string;
  backstory?: string;
  imageUrl?: string;
  imageGenerationId?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  // Get userId from session (mock for now)
  const userId = "user-1"; // TODO: Get from auth session

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  
  // History panel
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyType, setHistoryType] = useState<string>("synopsis");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Story state
  const [story, setStory] = useState({
    premise: "",
    synopsis: "",
    genre: "Drama",
    format: "series",
    structure: "hero",
    structureBeats: {} as Record<string, string>,
  });

  // Characters state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterForm, setCharacterForm] = useState({ name: "", role: "", traits: "", backstory: "" });

  // Universe state
  const [universe, setUniverse] = useState({
    environment: "",
    society: "",
    history: "",
  });

  // Moodboard state
  const [moodboardImages, setMoodboardImages] = useState<Record<string, { url: string; generationId: string }>>({});

  // Load project data
  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      // Load project details
      const res = await fetch(`/api/creator/projects?userId=${userId}&projectId=${projectId}`);
      const data = await res.json();
      
      if (data.success && data.projects.length > 0) {
        setProject(data.projects[0]);
      }

      // Load accepted generations for each type
      await loadAcceptedGenerations();
      
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAcceptedGenerations = async () => {
    try {
      const types = ["synopsis", "story_structure", "character_profile", "universe"];
      
      for (const type of types) {
        const res = await fetch(
          `/api/ai/generate?userId=${userId}&projectId=${projectId}&generationType=${type}&accepted=true`
        );
        const data = await res.json();
        
        if (data.success && data.generations.length > 0) {
          const accepted = data.generations.find((g: Generation) => g.isAccepted);
          if (accepted) {
            applyGeneration(type, accepted);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load accepted generations:", error);
    }
  };

  const applyGeneration = (type: string, generation: Generation) => {
    if (type === "synopsis") {
      setStory(prev => ({ ...prev, synopsis: generation.resultText || "" }));
    } else if (type === "story_structure") {
      try {
        const beats = JSON.parse(generation.resultText || "{}");
        setStory(prev => ({ ...prev, structureBeats: beats }));
      } catch (e) {
        // If not JSON, treat as text
      }
    } else if (type === "universe") {
      try {
        const universeData = JSON.parse(generation.resultText || "{}");
        setUniverse(universeData);
      } catch (e) {}
    }
  };

  const loadHistory = async (type: string) => {
    setLoadingHistory(true);
    setHistoryType(type);
    setHistoryOpen(true);
    
    try {
      const res = await fetch(
        `/api/ai/generate?userId=${userId}&projectId=${projectId}&generationType=${type}&limit=50`
      );
      const data = await res.json();
      
      if (data.success) {
        setGenerations(data.generations);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateWithAI = async (type: string, prompt: string) => {
    setIsGenerating(true);
    setGeneratingField(type);
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          projectId,
          projectName: project?.title,
          generationType: type,
          prompt,
          modelProvider: "openai",
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Apply the new generation
        if (type === "synopsis") {
          setStory(prev => ({ ...prev, synopsis: data.result }));
        } else if (type === "story_structure") {
          try {
            const beats = JSON.parse(data.result);
            setStory(prev => ({ ...prev, structureBeats: beats }));
          } catch (e) {
            // Parse as text beats
            const lines = data.result.split("\n").filter((l: string) => l.trim());
            const beats: Record<string, string> = {};
            lines.forEach((line: string, i: number) => {
              const [title, ...content] = line.split(":");
              beats[title.trim() || `Beat ${i + 1}`] = content.join(":").trim();
            });
            setStory(prev => ({ ...prev, structureBeats: beats }));
          }
        } else if (type === "character_profile") {
          // Handle character generation
        } else if (type === "universe") {
          try {
            const universeData = JSON.parse(data.result);
            setUniverse(universeData);
          } catch (e) {
            setUniverse(prev => ({ ...prev, environment: data.result }));
          }
        }
        
        // Refresh history if panel is open
        if (historyOpen && historyType === type) {
          loadHistory(type);
        }
      } else {
        alert(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  const generateImage = async (type: string, prompt: string, targetKey?: string) => {
    setIsGenerating(true);
    setGeneratingField(targetKey || type);
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          projectId,
          projectName: project?.title,
          generationType: type,
          prompt,
          modelProvider: "fal",
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.resultType === "url") {
        if (type === "moodboard_image" && targetKey) {
          setMoodboardImages(prev => ({
            ...prev,
            [targetKey]: { url: data.result, generationId: data.generationId }
          }));
        } else if (type === "character_image" && editingCharacter) {
          setCharacters(prev => prev.map(c => 
            c.id === editingCharacter.id 
              ? { ...c, imageUrl: data.result, imageGenerationId: data.generationId }
              : c
          ));
        }
      } else {
        alert(data.error || "Image generation failed");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  const acceptGeneration = async (generationId: string) => {
    try {
      const res = await fetch(`/api/ai/generate/${generationId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, projectId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update local state
        setGenerations(prev => prev.map(g => ({
          ...g,
          isAccepted: g.id === generationId
        })));
        
        // Apply the accepted generation
        const accepted = generations.find(g => g.id === generationId);
        if (accepted) {
          applyGeneration(historyType, accepted);
        }
      }
    } catch (error) {
      console.error("Failed to accept generation:", error);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      await fetch("/api/creator/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          userId,
          description: story.premise,
          genre: story.genre,
        }),
      });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Character handlers
  const handleSaveCharacter = () => {
    if (editingCharacter) {
      setCharacters(characters.map((c) =>
        c.id === editingCharacter.id ? { ...c, ...characterForm } : c
      ));
    } else {
      setCharacters([...characters, { id: Date.now().toString(), ...characterForm }]);
    }
    setIsCharacterModalOpen(false);
    setEditingCharacter(null);
    setCharacterForm({ name: "", role: "", traits: "", backstory: "" });
  };

  const openCharacterModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setCharacterForm({ 
        name: character.name, 
        role: character.role, 
        traits: character.traits,
        backstory: character.backstory || ""
      });
    } else {
      setEditingCharacter(null);
      setCharacterForm({ name: "", role: "", traits: "", backstory: "" });
    }
    setIsCharacterModalOpen(true);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter((c) => c.id !== id));
  };

  const generateCharacterProfile = async () => {
    if (!characterForm.name) return;
    
    const prompt = `Create a detailed character profile for: ${characterForm.name}
Role: ${characterForm.role}
Initial traits: ${characterForm.traits}
Story context: ${story.synopsis}

Generate: detailed personality traits (with MBTI), backstory, goals, fears, strengths, weaknesses, and character arc.`;

    setIsGenerating(true);
    setGeneratingField("character_profile");
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          projectId,
          projectName: project?.title,
          generationType: "character_profile",
          prompt,
          modelProvider: "openai",
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCharacterForm(prev => ({ ...prev, backstory: data.result }));
      }
    } catch (error) {
      console.error("Character generation error:", error);
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project?.title || "Project"}</h1>
          <p className="text-gray-500">{story.genre} • {project?.status || "Draft"}</p>
        </div>
        <Button variant="outline" onClick={() => loadHistory(activeTab === "story" ? "synopsis" : activeTab)}>
          <History className="w-4 h-4" />
          History
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button onClick={saveProject} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="story" className="gap-2">
            <FileText className="w-4 h-4" />
            Story
          </TabsTrigger>
          <TabsTrigger value="characters" className="gap-2">
            <Users className="w-4 h-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="universe" className="gap-2">
            <Globe className="w-4 h-4" />
            Universe
          </TabsTrigger>
          <TabsTrigger value="moodboard" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Moodboard
          </TabsTrigger>
          <TabsTrigger value="animation" className="gap-2">
            <Video className="w-4 h-4" />
            Animation
          </TabsTrigger>
        </TabsList>

        {/* Story Tab */}
        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Story Formula
                <Button variant="ghost" size="sm" onClick={() => loadHistory("synopsis")}>
                  <History className="w-4 h-4" />
                  View History
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Premise */}
              <div className="space-y-2">
                <Label>Premise / Idea</Label>
                <Textarea
                  placeholder="What is your story about? (e.g., A young man discovers he has supernatural powers)"
                  value={story.premise}
                  onChange={(e) => setStory({ ...story, premise: e.target.value })}
                  className="min-h-24"
                />
              </div>

              {/* Genre & Format */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select value={story.genre} onValueChange={(v) => setStory({ ...story, genre: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Horror">Horror</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Thriller">Thriller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={story.format} onValueChange={(v) => setStory({ ...story, format: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature Film</SelectItem>
                      <SelectItem value="series">Series</SelectItem>
                      <SelectItem value="short">Short Film</SelectItem>
                      <SelectItem value="webseries">Web Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Synopsis</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadHistory("synopsis")}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateWithAI("synopsis", `Generate a compelling synopsis for: ${story.premise}. Genre: ${story.genre}. Format: ${story.format}`)}
                      disabled={isGenerating || !story.premise}
                    >
                      {generatingField === "synopsis" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Generate
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="AI-generated or write your own synopsis..."
                  value={story.synopsis}
                  onChange={(e) => setStory({ ...story, synopsis: e.target.value })}
                  className="min-h-32"
                />
              </div>

              {/* Structure */}
              <div className="space-y-2">
                <Label>Story Structure</Label>
                <Select value={story.structure} onValueChange={(v) => setStory({ ...story, structure: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storyStructures.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Structure Beats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Structure Beats</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadHistory("story_structure")}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateWithAI("story_structure", `Based on this synopsis: "${story.synopsis}"\n\nGenerate detailed ${story.structure === "hero" ? "Hero's Journey" : story.structure === "cat" ? "Save the Cat" : "Story Circle"} structure beats. Format as JSON object with beat names as keys and descriptions as values.`)}
                      disabled={isGenerating || !story.synopsis}
                    >
                      {generatingField === "story_structure" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Generate Structure
                    </Button>
                  </div>
                </div>
                
                {Object.entries(story.structureBeats).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(story.structureBeats).map(([beat, content], index) => (
                      <div key={beat} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">{beat}</span>
                        </div>
                        <Textarea
                          value={content}
                          onChange={(e) => setStory({
                            ...story,
                            structureBeats: { ...story.structureBeats, [beat]: e.target.value }
                          })}
                          className="min-h-20"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    Generate structure beats from your synopsis
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Characters Tab */}
        <TabsContent value="characters" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Characters ({characters.length})</h2>
            <Button onClick={() => openCharacterModal()}>
              <Plus className="w-4 h-4" />
              Add Character
            </Button>
          </div>

          {characters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Card key={character.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {character.imageUrl ? (
                        <img 
                          src={character.imageUrl} 
                          alt={character.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold">
                          {character.name[0]}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openCharacterModal(character)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCharacter(character.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">{character.name}</h3>
                    <p className="text-violet-600 text-sm mb-2">{character.role}</p>
                    <p className="text-gray-500 text-sm line-clamp-2">{character.traits}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full"
                      onClick={() => {
                        setEditingCharacter(character);
                        generateImage("character_image", `Portrait of ${character.name}, ${character.role}. Traits: ${character.traits}. Style: cinematic, professional character portrait.`);
                      }}
                      disabled={isGenerating}
                    >
                      {generatingField === "character_image" && editingCharacter?.id === character.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Generate Image
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No characters yet. Add your first character!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Universe Tab */}
        <TabsContent value="universe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                World Building
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateWithAI("universe", `Create a detailed world/universe for this story: "${story.synopsis}". Include environment, society/culture, and history/lore. Format as JSON with keys: environment, society, history.`)}
                  disabled={isGenerating || !story.synopsis}
                >
                  {generatingField === "universe" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate World
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Environment & Setting</Label>
                <Textarea 
                  placeholder="Describe the world, setting, time period..." 
                  className="min-h-24"
                  value={universe.environment}
                  onChange={(e) => setUniverse({ ...universe, environment: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Society & Culture</Label>
                <Textarea 
                  placeholder="Describe the social structure, customs, traditions..." 
                  className="min-h-24"
                  value={universe.society}
                  onChange={(e) => setUniverse({ ...universe, society: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>History & Lore</Label>
                <Textarea 
                  placeholder="Important historical events, legends, myths..." 
                  className="min-h-24"
                  value={universe.history}
                  onChange={(e) => setUniverse({ ...universe, history: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moodboard Tab */}
        <TabsContent value="moodboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moodboard</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(story.structureBeats).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(story.structureBeats).map(([beat, content]) => (
                    <div key={beat} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{beat}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{content}</p>
                      {moodboardImages[beat] ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden group">
                          <img src={moodboardImages[beat].url} alt={beat} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => generateImage("moodboard_image", `Cinematic scene: ${content}. Style: movie still, dramatic lighting.`, beat)}
                              disabled={isGenerating}
                            >
                              <RefreshCw className="w-4 h-4" />
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <Button
                            variant="outline"
                            onClick={() => generateImage("moodboard_image", `Cinematic scene: ${content}. Style: movie still, dramatic lighting.`, beat)}
                            disabled={isGenerating}
                          >
                            {generatingField === beat ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Generate story structure beats first to create moodboard images
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animation Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Animation Previews</h3>
                <p className="mb-4">Create short animation clips from your moodboard images</p>
                <Button disabled={Object.keys(moodboardImages).length === 0}>
                  <Sparkles className="w-4 h-4" />
                  Generate Video Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Character Modal */}
      <Dialog open={isCharacterModalOpen} onOpenChange={setIsCharacterModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCharacter ? "Edit Character" : "Add Character"}</DialogTitle>
            <DialogDescription>
              {editingCharacter ? "Update character details" : "Create a new character for your story"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Character name"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={characterForm.role} onValueChange={(v) => setCharacterForm({ ...characterForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Protagonist">Protagonist</SelectItem>
                    <SelectItem value="Antagonist">Antagonist</SelectItem>
                    <SelectItem value="Love Interest">Love Interest</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                    <SelectItem value="Sidekick">Sidekick</SelectItem>
                    <SelectItem value="Supporting">Supporting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Traits</Label>
              <Textarea
                placeholder="Character traits, personality..."
                value={characterForm.traits}
                onChange={(e) => setCharacterForm({ ...characterForm, traits: e.target.value })}
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Backstory & Details</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateCharacterProfile}
                  disabled={isGenerating || !characterForm.name}
                >
                  {generatingField === "character_profile" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Profile
                </Button>
              </div>
              <Textarea
                placeholder="Detailed backstory, goals, fears, character arc..."
                value={characterForm.backstory}
                onChange={(e) => setCharacterForm({ ...characterForm, backstory: e.target.value })}
                className="min-h-40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCharacterModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCharacter} disabled={!characterForm.name || !characterForm.role}>
              {editingCharacter ? "Save Changes" : "Add Character"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Generation History
            </SheetTitle>
            <SheetDescription>
              {historyType.replace("_", " ")} - All generated versions
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-150px)] mt-6">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              </div>
            ) : generations.length > 0 ? (
              <div className="space-y-4 pr-4">
                {generations.map((gen) => (
                  <Card key={gen.id} className={gen.isAccepted ? "border-violet-500 bg-violet-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {gen.status === "completed" ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : gen.status === "failed" ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(gen.createdAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {gen.isAccepted && (
                          <Badge variant="default" className="bg-violet-600">Active</Badge>
                        )}
                      </div>
                      
                      {gen.resultText && (
                        <p className="text-sm text-gray-700 line-clamp-4 mb-3">{gen.resultText}</p>
                      )}
                      
                      {gen.resultUrl && (
                        <img src={gen.resultUrl} alt="Generated" className="w-full rounded-lg mb-3" />
                      )}
                      
                      {gen.errorMessage && (
                        <p className="text-sm text-red-500 mb-3">{gen.errorMessage}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{gen.creditCost} credits</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          {!gen.isAccepted && gen.status === "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => acceptGeneration(gen.id)}
                            >
                              <Check className="w-4 h-4" />
                              Use This
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No generation history yet</p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
