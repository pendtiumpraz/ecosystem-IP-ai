"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Play, Upload, Eye, Clock, TrendingUp, Users, 
  BarChart3, Settings, Search, Filter, MoreVertical,
  PlayCircle, Pause, Video, Calendar, Heart, MessageSquare,
  Plus, ExternalLink
} from "lucide-react";

const mockVideos = [
  {
    id: "1",
    title: "Legenda Nusantara - Episode 1",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop",
    duration: "24:35",
    views: "12.5K",
    likes: "892",
    status: "published",
    publishedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Legenda Nusantara - Episode 2",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop",
    duration: "26:12",
    views: "8.2K",
    likes: "654",
    status: "published",
    publishedAt: "5 days ago",
  },
  {
    id: "3",
    title: "Behind The Scenes",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=225&fit=crop",
    duration: "15:48",
    views: "3.1K",
    likes: "234",
    status: "draft",
    publishedAt: null,
  },
];

const stats = [
  { label: "Total Views", value: "45.2K", change: "+12%", icon: Eye },
  { label: "Watch Time", value: "1,234h", change: "+8%", icon: Clock },
  { label: "Subscribers", value: "2,891", change: "+24%", icon: Users },
  { label: "Engagement", value: "8.4%", change: "+3%", icon: TrendingUp },
];

export default function WatchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-7 h-7 text-red-500" />
            Watch
          </h1>
          <p className="text-gray-500">Distribute and monetize your content</p>
        </div>
        <Button>
          <Upload className="w-4 h-4" />
          Upload Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-6">
            <Video className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold mb-1">Upload New Video</h3>
            <p className="text-sm text-red-100 mb-4">Share your latest content with subscribers</p>
            <Button variant="white" size="sm">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold mb-1">Schedule Release</h3>
            <p className="text-sm text-blue-100 mb-4">Plan your content calendar</p>
            <Button variant="white" size="sm">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className="text-sm text-violet-100 mb-4">Deep dive into your performance</p>
            <Button variant="white" size="sm">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Video List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Videos</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {video.likes}
                    </span>
                    <span>
                      {video.publishedAt || "Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    video.status === "published" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {video.status === "published" ? "Published" : "Draft"}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
