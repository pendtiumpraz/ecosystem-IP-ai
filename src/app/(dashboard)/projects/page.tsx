"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Grid,
  List,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
  Clock,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: "draft" | "in_progress" | "completed";
  thumbnail: string;
  updatedAt: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    title: "Anak Langit Season 5",
    description: "Drama keluarga tentang perjuangan anak muda di kota besar",
    genre: "Drama",
    status: "in_progress",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Petualangan Si Kancil",
    description: "Animasi 3D tentang petualangan kancil di hutan",
    genre: "Animation",
    status: "draft",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    title: "Legenda Nusantara",
    description: "Film fantasi epik tentang pahlawan legendaris Indonesia",
    genre: "Fantasy",
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop",
    updatedAt: "3 days ago",
  },
];

const genres = [
  "Drama", "Comedy", "Action", "Horror", "Fantasy", "Sci-Fi", 
  "Animation", "Documentary", "Romance", "Thriller"
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === "all" || project.genre === filterGenre;
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const handleCreate = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      genre: formData.genre,
      status: "draft",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
      updatedAt: "Just now",
    };
    setProjects([newProject, ...projects]);
    setIsCreateOpen(false);
    setFormData({ title: "", description: "", genre: "" });
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    setProjects(projects.map((p) =>
      p.id === selectedProject.id
        ? { ...p, title: formData.title, description: formData.description, genre: formData.genre }
        : p
    ));
    setIsEditOpen(false);
    setSelectedProject(null);
    setFormData({ title: "", description: "", genre: "" });
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    setProjects(projects.filter((p) => p.id !== selectedProject.id));
    setIsDeleteOpen(false);
    setSelectedProject(null);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      genre: project.genre,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your IP Bible projects</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterGenre} onValueChange={setFilterGenre}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first project</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              <Link href={`/projects/${project.id}`}>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "completed" ? "bg-green-100 text-green-700" :
                      project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {project.status === "in_progress" ? "In Progress" : 
                       project.status === "completed" ? "Completed" : "Draft"}
                    </span>
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-violet-600">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {project.description}
                    </p>
                  </Link>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-32 hidden group-hover:block z-10">
                      <button
                        onClick={() => openEditModal(project)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{project.genre}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.updatedAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Link href={`/projects/${project.id}`}>
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-violet-600">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "completed" ? "bg-green-100 text-green-700" :
                      project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {project.status === "in_progress" ? "In Progress" : 
                       project.status === "completed" ? "Completed" : "Draft"}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{project.updatedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(project)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(project)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new IP Bible project. You can add more details later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g. My Awesome Film"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your project..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.genre}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedProject?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
