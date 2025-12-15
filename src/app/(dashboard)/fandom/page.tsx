"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Heart, MessageSquare, Image as ImageIcon, Trophy,
  Plus, Search, TrendingUp, Star, Calendar, Gift, Bell,
  ThumbsUp, Share2, MoreVertical, Send, Sparkles
} from "lucide-react";

const mockPosts = [
  {
    id: "1",
    type: "announcement",
    title: "Season 2 Production Update!",
    content: "Exciting news! We've started production on Season 2. Here's a sneak peek...",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=300&fit=crop",
    likes: 234,
    comments: 45,
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "fanart",
    title: "Amazing Gatotkaca Fan Art by @artist123",
    content: "Check out this incredible piece from our community!",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=300&fit=crop",
    likes: 567,
    comments: 89,
    time: "1 day ago",
  },
];

const mockFanArt = [
  { id: "1", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=300&h=300&fit=crop", artist: "@artist123", likes: 234 },
  { id: "2", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop", artist: "@creative_id", likes: 189 },
  { id: "3", image: "https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=300&h=300&fit=crop", artist: "@fanart_pro", likes: 156 },
  { id: "4", image: "https://images.unsplash.com/photo-1560009320-6c12f6e75ed0?w=300&h=300&fit=crop", artist: "@draw_daily", likes: 145 },
];

const topFans = [
  { name: "Sarah W.", points: 2450, badge: "Super Fan", avatar: "S" },
  { name: "Budi S.", points: 2120, badge: "Top Contributor", avatar: "B" },
  { name: "Rina K.", points: 1890, badge: "Fan Artist", avatar: "R" },
  { name: "Ahmad J.", points: 1650, badge: "Active Member", avatar: "A" },
];

const stats = [
  { label: "Community Members", value: "12.5K", change: "+8%", icon: Users },
  { label: "Total Engagement", value: "45.2K", change: "+15%", icon: Heart },
  { label: "Fan Art Submitted", value: "342", change: "+24%", icon: ImageIcon },
  { label: "Active Discussions", value: "89", change: "+12%", icon: MessageSquare },
];

export default function FandomPage() {
  const [newPost, setNewPost] = useState("");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-pink-500" />
            Fandom
          </h1>
          <p className="text-gray-500">Engage with your community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button>
            <Trophy className="w-4 h-4" />
            Run Contest
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Creator */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-medium">
                  Y
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share an update with your community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-20 mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="w-4 h-4" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="w-4 h-4" />
                        Event
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Gift className="w-4 h-4" />
                        Reward
                      </Button>
                    </div>
                    <Button size="sm">
                      <Send className="w-4 h-4" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed */}
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-0">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.type === "announcement" ? (
                      <span className="px-2 py-1 rounded bg-violet-100 text-violet-700 text-xs font-medium">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        Announcement
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs font-medium">
                        <ImageIcon className="w-3 h-3 inline mr-1" />
                        Fan Art
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{post.time}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Fans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top Fans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topFans.map((fan, index) => (
                <div key={fan.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-gray-100 text-gray-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-gray-50 text-gray-500"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-sm font-medium">
                    {fan.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{fan.name}</div>
                    <div className="text-xs text-gray-500">{fan.badge}</div>
                  </div>
                  <div className="text-sm font-medium text-violet-600">{fan.points} pts</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fan Art Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Fan Art Gallery</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {mockFanArt.map((art) => (
                  <div key={art.id} className="relative group">
                    <img
                      src={art.image}
                      alt={art.artist}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-sm font-medium">{art.artist}</div>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Heart className="w-3 h-3" />
                          {art.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardContent className="p-6">
              <Gift className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-semibold mb-1">Reward Your Fans</h3>
              <p className="text-sm text-pink-100 mb-4">
                Create exclusive rewards for your most engaged community members
              </p>
              <Button variant="white" size="sm">
                <Gift className="w-4 h-4" />
                Create Reward
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
