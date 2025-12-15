"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Projects", value: "3", icon: FolderOpen, color: "violet" },
  { label: "AI Generations", value: "47", icon: Sparkles, color: "indigo" },
  { label: "This Month", value: "12", icon: TrendingUp, color: "green" },
  { label: "Credits Used", value: "50", icon: Clock, color: "orange" },
];

const recentProjects = [
  {
    id: "1",
    title: "Anak Langit Season 5",
    genre: "Drama",
    status: "in_progress",
    updatedAt: "2 hours ago",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Petualangan Si Kancil",
    genre: "Animation",
    status: "draft",
    updatedAt: "Yesterday",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Legenda Nusantara",
    genre: "Fantasy",
    status: "completed",
    updatedAt: "3 days ago",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop",
  },
];

const quickActions = [
  { label: "New Project", icon: Plus, href: "/projects/new", color: "violet" },
  { label: "Generate Story", icon: FileText, href: "/projects?action=story", color: "blue" },
  { label: "Create Character", icon: ImageIcon, href: "/projects?action=character", color: "green" },
  { label: "Generate Video", icon: Video, href: "/projects?action=video", color: "orange" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your creative overview.</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-xl bg-${action.color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 text-${action.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/projects" className="text-violet-600 hover:underline text-sm font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
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
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{project.genre}</span>
                    <span>{project.updatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
