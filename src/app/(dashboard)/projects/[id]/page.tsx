"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const storyStructures = [
  { value: "hero", label: "Hero's Journey (12 steps)" },
  { value: "cat", label: "Save the Cat (15 beats)" },
  { value: "harmon", label: "Dan Harmon's Story Circle (8 steps)" },
];

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string;
  imageUrl?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;

  const [activeTab, setActiveTab] = useState("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  // Story state
  const [story, setStory] = useState({
    premise: "",
    synopsis: "",
    genre: "Drama",
    format: "series",
    structure: "hero",
    structureBeats: {} as Record<string, string>,
    endingType: "",
  });

  // Characters state
  const [characters, setCharacters] = useState<Character[]>([
    { id: "1", name: "Arya", role: "Protagonist", traits: "Brave, determined, loyal" },
    { id: "2", name: "Maya", role: "Love Interest", traits: "Smart, compassionate, mysterious" },
  ]);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterForm, setCharacterForm] = useState({ name: "", role: "", traits: "" });

  // Moodboard state
  const [moodboardImages, setMoodboardImages] = useState<Record<string, string>>({});

  // Mock AI generation
  const generateWithAI = async (field: string) => {
    setIsGenerating(true);
    setGeneratingField(field);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (field === "synopsis") {
      setStory((prev) => ({
        ...prev,
        synopsis: "Di sebuah kota metropolitan yang ramai, Arya, seorang pemuda idealis dari keluarga sederhana, berjuang untuk membuktikan dirinya di dunia yang kejam. Ketika ia bertemu Maya, seorang wanita misterius dengan masa lalu yang kelam, hidupnya berubah selamanya. Bersama-sama mereka menghadapi tantangan yang menguji batas cinta dan kesetiaan mereka.",
      }));
    } else if (field === "structure") {
      setStory((prev) => ({
        ...prev,
        structureBeats: {
          "Ordinary World": "Arya bekerja sebagai kurir di Jakarta, tinggal di kontrakan kecil bersama ibunya yang sakit.",
          "Call to Adventure": "Arya menemukan paket misterius yang berisi bukti korupsi besar.",
          "Refusal of the Call": "Arya ragu untuk terlibat, takut membahayakan keluarganya.",
          "Meeting the Mentor": "Arya bertemu Maya, jurnalis investigasi yang menyelidiki kasus yang sama.",
          "Crossing the Threshold": "Arya memutuskan untuk membantu Maya mengungkap kebenaran.",
          "Tests, Allies, Enemies": "Mereka menghadapi berbagai rintangan dan menemukan siapa yang bisa dipercaya.",
        },
      }));
    }
    
    setIsGenerating(false);
    setGeneratingField(null);
  };

  const generateMoodboardImage = async (beatName: string) => {
    setIsGenerating(true);
    setGeneratingField(beatName);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock generated image
    setMoodboardImages((prev) => ({
      ...prev,
      [beatName]: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 100000000}?w=800&h=600&fit=crop`,
    }));
    
    setIsGenerating(false);
    setGeneratingField(null);
  };

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
    setCharacterForm({ name: "", role: "", traits: "" });
  };

  const openCharacterModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setCharacterForm({ name: character.name, role: character.role, traits: character.traits });
    } else {
      setEditingCharacter(null);
      setCharacterForm({ name: "", role: "", traits: "" });
    }
    setIsCharacterModalOpen(true);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter((c) => c.id !== id));
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Anak Langit Season 5</h1>
          <p className="text-gray-500">Drama • In Progress</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
        <Button>
          <Save className="w-4 h-4" />
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
              <CardTitle>Story Formula</CardTitle>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Synopsis</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateWithAI("synopsis")}
                    disabled={isGenerating || !story.premise}
                  >
                    {generatingField === "synopsis" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate with AI
                  </Button>
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

              {/* Generate Structure */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Structure Beats</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateWithAI("structure")}
                    disabled={isGenerating || !story.synopsis}
                  >
                    {generatingField === "structure" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Structure
                  </Button>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card key={character.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold">
                      {character.name[0]}
                    </div>
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
                  <p className="text-gray-500 text-sm">{character.traits}</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    <Sparkles className="w-4 h-4" />
                    Generate Image
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Universe Tab */}
        <TabsContent value="universe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>World Building</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Environment</Label>
                <Textarea placeholder="Describe the world, setting, time period..." className="min-h-24" />
              </div>
              <div className="space-y-2">
                <Label>Society & Culture</Label>
                <Textarea placeholder="Describe the social structure, customs, traditions..." className="min-h-24" />
              </div>
              <div className="space-y-2">
                <Label>History & Lore</Label>
                <Textarea placeholder="Important historical events, legends, myths..." className="min-h-24" />
              </div>
              <Button>
                <Sparkles className="w-4 h-4" />
                Generate World Details
              </Button>
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
                  {Object.entries(story.structureBeats).map(([beat]) => (
                    <div key={beat} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{beat}</h4>
                      {moodboardImages[beat] ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img src={moodboardImages[beat]} alt={beat} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <Button
                            variant="outline"
                            onClick={() => generateMoodboardImage(beat)}
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
                <Button disabled>
                  <Sparkles className="w-4 h-4" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Character Modal */}
      <Dialog open={isCharacterModalOpen} onOpenChange={setIsCharacterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCharacter ? "Edit Character" : "Add Character"}</DialogTitle>
            <DialogDescription>
              {editingCharacter ? "Update character details" : "Create a new character for your story"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label>Traits</Label>
              <Textarea
                placeholder="Character traits, personality..."
                value={characterForm.traits}
                onChange={(e) => setCharacterForm({ ...characterForm, traits: e.target.value })}
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
    </div>
  );
}
