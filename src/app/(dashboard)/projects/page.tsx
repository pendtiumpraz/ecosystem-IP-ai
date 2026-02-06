"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import {
  Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
  Loader2, FolderOpen, Clapperboard, X, Check, AlertCircle,
  Calendar, Tag, Building, User, Globe, Lock, Film, Palette, BookOpen, Clock, Hash
} from "lucide-react";
import { toast, alert as swalAlert } from "@/lib/sweetalert";
import {
  MEDIUM_TYPE_OPTIONS,
  DURATION_OPTIONS,
  GENRE_OPTIONS,
  SUB_GENRE_OPTIONS,
  THEME_OPTIONS,
  TONE_OPTIONS,
  CORE_CONFLICT_OPTIONS,
  IP_STORY_STRUCTURE_OPTIONS,
} from "@/lib/studio-options";

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  coverImage: string | null;
  genre: string | null;
  subGenre: string | null;
  status: string;
  studioName: string | null;
  ipOwner: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  // IP Project fields
  mediumType?: string;
  duration?: string;
  episodeCount?: number;
  mainGenre?: string;
  theme?: string;
  tone?: string;
  coreConflict?: string;
  storyStructure?: string;
  protagonistName?: string;
}

const STATUSES = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "in_progress", label: "In Progress", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "archived", label: "Archived", color: "orange" },
];

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Form data - includes all IP Project fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    subGenre: "",
    studioName: "",
    ipOwner: "",
    status: "draft",
    isPublic: false,
    // IP Project fields
    mediumType: "",
    duration: "",
    episodeCount: 1,
    mainGenre: "",
    theme: "",
    tone: "",
    coreConflict: "",
    storyStructure: "hero",
    protagonistName: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id, filterStatus]);

  useEffect(() => {
    // Check if should open create modal from URL
    if (searchParams.get("new") === "true") {
      openCreateModal();
    }
  }, [searchParams]);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user!.id,
        ...(filterStatus !== "all" && { status: filterStatus }),
      });
      const response = await fetch(`/api/creator/projects?${params}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({
      title: "",
      description: "",
      genre: "",
      subGenre: "",
      studioName: "",
      ipOwner: "",
      status: "draft",
      isPublic: false,
      // IP Project fields - defaults
      mediumType: "",
      duration: "",
      episodeCount: 1,
      mainGenre: "",
      theme: "",
      tone: "",
      coreConflict: "",
      storyStructure: "hero",
      protagonistName: "",
    });
    setSelectedProject(null);
    setModalMode("create");
    setShowModal(true);
    setError("");
  }

  function openEditModal(project: Project) {
    setFormData({
      title: project.title,
      description: project.description || "",
      genre: project.genre || "",
      subGenre: project.subGenre || "",
      studioName: project.studioName || "",
      ipOwner: project.ipOwner || "",
      status: project.status,
      isPublic: project.isPublic,
      // IP Project fields
      mediumType: project.mediumType || "",
      duration: project.duration || "",
      episodeCount: project.episodeCount || 1,
      mainGenre: project.mainGenre || "",
      theme: project.theme || "",
      tone: project.tone || "",
      coreConflict: project.coreConflict || "",
      storyStructure: project.storyStructure || "hero",
      protagonistName: project.protagonistName || "",
    });
    setSelectedProject(project);
    setModalMode("edit");
    setShowModal(true);
    setError("");
  }

  function openViewModal(project: Project) {
    setSelectedProject(project);
    setModalMode("view");
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      setError("Project title is required");
      return;
    }

    // Validation for create mode - same as IP Project tab
    if (modalMode === "create") {
      const missingFields = [];
      if (!formData.mainGenre) missingFields.push("Main Genre");
      if (!formData.theme) missingFields.push("Theme");
      if (!formData.tone) missingFields.push("Tone");
      if (!formData.coreConflict) missingFields.push("Core Conflict");
      if (!formData.storyStructure) missingFields.push("Story Structure");
      if (!formData.protagonistName?.trim()) missingFields.push("Protagonist Name");

      if (missingFields.length > 0) {
        setError(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }
    }

    setIsSaving(true);
    setError("");

    try {
      const url = "/api/creator/projects";
      const method = modalMode === "create" ? "POST" : "PUT";
      const body = modalMode === "create"
        ? { userId: user!.id, ...formData }
        : { id: selectedProject!.id, userId: user!.id, ...formData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        fetchProjects();
      } else {
        setError(data.error || "Failed to save project");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = await swalAlert.confirm("Delete Project", `Delete "${project.title}"? This action cannot be undone.`, "Delete", "Cancel");
    if (!confirmed.isConfirmed) return;

    try {
      const response = await fetch(
        `/api/creator/projects?id=${project.id}&userId=${user!.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        fetchProjects();
      } else {
        toast.error(data.error || "Failed to delete project");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const filteredProjects = search
    ? projects.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.genre?.toLowerCase().includes(search.toLowerCase())
    )
    : projects;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clapperboard className="w-7 h-7 text-orange-600" />
            Studio Projects
          </h1>
          <p className="text-gray-500">Manage your IP Bible projects</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[{ value: "all", label: "All" }, ...STATUSES].map((status) => (
                <Button
                  key={status.value}
                  variant={filterStatus === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {search ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {search
              ? "Try adjusting your search or filters"
              : "Create your first IP Bible project to start generating stories, characters, and worlds with AI"
            }
          </p>
          {!search && (
            <Button onClick={openCreateModal} size="lg">
              <Plus className="w-5 h-5" />
              Create Your First Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusInfo = STATUSES.find(s => s.value === project.status) || STATUSES[0];
            return (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className={`relative overflow-hidden ${project.coverImage ? 'aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'aspect-video bg-gradient-to-br from-orange-100 to-indigo-100'}`}>
                  {(project.coverImage || project.thumbnailUrl) ? (
                    <img
                      src={project.coverImage || project.thumbnailUrl || ''}
                      alt={project.title}
                      className={`w-full h-full group-hover:scale-105 transition-transform duration-300 ${project.coverImage ? 'object-contain' : 'object-cover'}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Clapperboard className="w-16 h-16 text-orange-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {project.isPublic ? (
                      <span className="p-1.5 rounded-full bg-white/90 text-green-600" title="Public">
                        <Globe className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-white/90 text-gray-600" title="Private">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {project.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {project.mainGenre || project.genre || "No genre"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4" />
                        Open
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(project)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && modalMode !== "view" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gradient-to-r from-orange-50 to-amber-50 z-10 border-b border-orange-200">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clapperboard className="w-5 h-5 text-orange-600" />
                {modalMode === "create" ? "Create New IP Project" : "Edit Project"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="hover:bg-orange-100">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Legenda Nusantara"
                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your project..."
                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    rows={3}
                  />
                </div>

                {/* Format & Duration Section */}
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Film className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Format & Duration <span className="text-red-500">*</span></span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Medium Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.mediumType}
                        onValueChange={(value) => {
                          const medium = MEDIUM_TYPE_OPTIONS.find(m => m.value === value);
                          setFormData({
                            ...formData,
                            mediumType: value,
                            duration: String(medium?.defaultDuration || 90),
                          });
                        }}
                      >
                        <SelectTrigger className="bg-white/80 border-blue-200 focus:ring-blue-400">
                          <Clapperboard className="h-4 w-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Select medium type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIUM_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Duration (minutes)</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => setFormData({ ...formData, duration: value })}
                      >
                        <SelectTrigger className="bg-white/80 border-blue-200 focus:ring-blue-400">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Genre & Story DNA Section */}
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">Story DNA <span className="text-red-500">*</span></span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Main Genre */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Main Genre <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.mainGenre}
                        onValueChange={(value) => setFormData({ ...formData, mainGenre: value, subGenre: "" })}
                      >
                        <SelectTrigger className="bg-white/80 border-orange-200 focus:ring-orange-400">
                          <SelectValue placeholder="Select main genre..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sub Genre */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Sub-Genre <span className="text-slate-400">(Optional)</span></Label>
                      <Select
                        value={formData.subGenre}
                        onValueChange={(value) => setFormData({ ...formData, subGenre: value })}
                        disabled={!formData.mainGenre}
                      >
                        <SelectTrigger className={`bg-white/80 border-orange-200 focus:ring-orange-400 ${!formData.mainGenre ? 'opacity-60' : ''}`}>
                          <SelectValue placeholder={formData.mainGenre ? "Select sub-genre..." : "Select main genre first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.mainGenre && SUB_GENRE_OPTIONS[formData.mainGenre]?.map((opt: any) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Theme <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.theme}
                        onValueChange={(value) => setFormData({ ...formData, theme: value })}
                      >
                        <SelectTrigger className="bg-white/80 border-orange-200 focus:ring-orange-400">
                          <SelectValue placeholder="Select theme..." />
                        </SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Tone <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.tone}
                        onValueChange={(value) => setFormData({ ...formData, tone: value })}
                      >
                        <SelectTrigger className="bg-white/80 border-orange-200 focus:ring-orange-400">
                          <SelectValue placeholder="Select tone..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Core Conflict */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-slate-500">Core Conflict <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.coreConflict}
                        onValueChange={(value) => setFormData({ ...formData, coreConflict: value })}
                      >
                        <SelectTrigger className="bg-white/80 border-orange-200 focus:ring-orange-400">
                          <SelectValue placeholder="Select conflict..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CORE_CONFLICT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Story Structure */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-xs uppercase font-bold text-slate-500">
                        Story Structure <span className="text-red-500">*</span>
                        {modalMode === "edit" && selectedProject?.storyStructure && (
                          <Lock className="w-3 h-3 text-gray-400" />
                        )}
                      </Label>
                      <Select
                        value={formData.storyStructure}
                        onValueChange={(value) => setFormData({ ...formData, storyStructure: value })}
                        disabled={modalMode === "edit" && !!selectedProject?.storyStructure}
                      >
                        <SelectTrigger className={`bg-white/80 border-orange-200 focus:ring-orange-400 ${modalMode === "edit" && selectedProject?.storyStructure ? 'opacity-60' : ''}`}>
                          <BookOpen className="h-4 w-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Select structure..." />
                        </SelectTrigger>
                        <SelectContent>
                          {IP_STORY_STRUCTURE_OPTIONS.map((opt) => {
                            // Check if selected medium type is episodic
                            const isEpisodic = formData.mediumType?.includes('series') || formData.mediumType?.includes('anime');
                            return (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.icon} {opt.label}
                                {opt.steps > 0 && (
                                  <span className="ml-1 text-gray-500">
                                    ({opt.steps} {isEpisodic ? 'eps' : 'beats'})
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {modalMode === "edit" && selectedProject?.storyStructure && (
                        <p className="text-[10px] text-gray-400">Locked after first save</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Studio & Ownership */}
                <div>
                  <Label htmlFor="studioName" className="text-sm font-medium">Studio Name</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="studioName"
                      value={formData.studioName}
                      onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                      placeholder="Your studio name"
                      className="pl-9 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ipOwner" className="text-sm font-medium">IP Owner</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="ipOwner"
                      value={formData.ipOwner}
                      onChange={(e) => setFormData({ ...formData, ipOwner: e.target.value })}
                      placeholder="IP owner name"
                      className="pl-9 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="protagonistName" className="text-sm font-medium">
                    Protagonist Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <Input
                      id="protagonistName"
                      value={formData.protagonistName}
                      onChange={(e) => setFormData({ ...formData, protagonistName: e.target.value })}
                      placeholder="Main character name"
                      className="pl-9 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                      required
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-1">✨ Will create a Protagonist character automatically</p>
                </div>

                {modalMode === "edit" && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Make project public (visible in showcase)
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-orange-100">
                <Button
                  variant="outline"
                  className="flex-1 border-orange-200 hover:bg-orange-50"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {modalMode === "create" ? "Create IP Project" : "Save Changes"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

