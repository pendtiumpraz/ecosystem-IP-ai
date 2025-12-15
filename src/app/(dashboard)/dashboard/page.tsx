"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
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
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  creditBalance: number;
  totalGenerations: number;
  creditsUsed: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  genre: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const quickActions = [
  { label: "New Project", icon: Plus, href: "/projects?new=true", color: "violet" },
  { label: "Generate Story", icon: FileText, href: "/projects?action=story", color: "blue" },
  { label: "Create Character", icon: ImageIcon, href: "/projects?action=character", color: "green" },
  { label: "Generate Video", icon: Video, href: "/projects?action=video", color: "orange" },
];

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("id-ID");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  async function fetchDashboardData() {
    try {
      const response = await fetch(`/api/creator/dashboard?userId=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentProjects(data.recentProjects || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const statCards = [
    { label: "Projects", value: stats?.totalProjects || 0, icon: FolderOpen, color: "violet" },
    { label: "AI Generations", value: stats?.totalGenerations || 0, icon: Sparkles, color: "indigo" },
    { label: "Credits Balance", value: stats?.creditBalance || 0, icon: TrendingUp, color: "green" },
    { label: "Credits Used", value: stats?.creditsUsed || 0, icon: Clock, color: "orange" },
  ];
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
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                    </p>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : recentProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Create your first IP project to get started</p>
            <Link href="/projects?new=true">
              <Button>
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={project.thumbnailUrl || `https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop`}
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
                      <span>{project.genre || "No genre"}</span>
                      <span>{formatTimeAgo(project.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
