"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
  Loader2, FolderOpen, Clapperboard, X, Check, AlertCircle,
  Calendar, Tag, Building, User, Globe, Lock
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  genre: string | null;
  subGenre: string | null;
  status: string;
  studioName: string | null;
  ipOwner: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

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
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    subGenre: "",
    studioName: "",
    ipOwner: "",
    status: "draft",
    isPublic: false,
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
    if (!confirm(`Delete "${project.title}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(
        `/api/creator/projects?id=${project.id}&userId=${user!.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        fetchProjects();
      } else {
        alert(data.error || "Failed to delete project");
      }
    } catch (error) {
      alert("Network error. Please try again.");
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
            <Clapperboard className="w-7 h-7 text-violet-600" />
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
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
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
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Clapperboard className="w-16 h-16 text-violet-300" />
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
                      {project.genre || "No genre"}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
              <CardTitle>
                {modalMode === "create" ? "Create New Project" : "Edit Project"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
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
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Legenda Nusantara"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your project..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <select
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select genre</option>
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subGenre">Sub-Genre</Label>
                  <Input
                    id="subGenre"
                    value={formData.subGenre}
                    onChange={(e) => setFormData({ ...formData, subGenre: e.target.value })}
                    placeholder="e.g., Coming-of-age"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="studioName">Studio Name</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="studioName"
                      value={formData.studioName}
                      onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                      placeholder="Your studio name"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ipOwner">IP Owner</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="ipOwner"
                      value={formData.ipOwner}
                      onChange={(e) => setFormData({ ...formData, ipOwner: e.target.value })}
                      placeholder="IP owner name"
                      className="pl-9"
                    />
                  </div>
                </div>

                {modalMode === "edit" && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Make project public (visible in showcase)
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {modalMode === "create" ? "Create Project" : "Save Changes"}
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
