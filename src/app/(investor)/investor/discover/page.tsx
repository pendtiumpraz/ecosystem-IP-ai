"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Search, Filter, ArrowLeft, Clock, Users, TrendingUp,
  Loader2, Sparkles, Play, Star
} from "lucide-react";

interface Campaign {
  id: string;
  projectId: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
  minInvestment: number;
  endDate: string;
  creatorName: string;
}

const GENRES = ["All", "Drama", "Action", "Comedy", "Horror", "Romance", "Sci-Fi", "Animation"];

export default function InvestorDiscoverPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("trending");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/public/invest");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error("Failed to fetch campaigns:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function getDaysLeft(endDate: string): number {
    if (!endDate) return 30;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  const filteredCampaigns = campaigns
    .filter(c => {
      const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "All" || c.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === "trending") return b.investorCount - a.investorCount;
      if (sortBy === "newest") return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      if (sortBy === "ending") return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/investor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Projects</h1>
          <p className="text-gray-500">Find and invest in creative IP projects</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {GENRES.map(genre => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className="whitespace-nowrap"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try different search terms" : "No active campaigns at the moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => {
            const progress = campaign.fundingGoal > 0 
              ? (campaign.fundingRaised / campaign.fundingGoal) * 100 
              : 0;
            const daysLeft = getDaysLeft(campaign.endDate);

            return (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={campaign.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"}
                    alt={campaign.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded">
                      {campaign.genre || "IP Project"}
                    </span>
                  </div>
                  {daysLeft <= 7 && daysLeft > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      {daysLeft} days left!
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {campaign.description || "An exciting creative project seeking investment"}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-green-600">
                        Rp {(campaign.fundingRaised / 1000000).toFixed(0)}M
                      </span>
                      <span className="text-gray-500">
                        of Rp {(campaign.fundingGoal / 1000000).toFixed(0)}M
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.investorCount || 0} investors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {daysLeft} days left
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2">
                    <Link href={`/invest/${campaign.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Invest Now
                      </Button>
                    </Link>
                    <Link href={`/invest/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {campaign.minInvestment && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Min. investment Rp {(campaign.minInvestment / 1000000).toFixed(0)}M
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

