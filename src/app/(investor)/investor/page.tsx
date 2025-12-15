"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  TrendingUp, Briefcase, DollarSign, PieChart, ArrowUpRight,
  ArrowDownRight, Eye, Clock, CheckCircle, Target, Sparkles,
  ChevronRight, Play, Loader2
} from "lucide-react";

interface Investment {
  id: string;
  campaignTitle: string;
  campaignThumbnail: string;
  investedAmount: number;
  status: string;
  campaignStatus: string;
  genre: string;
}

interface Campaign {
  id: string;
  title: string;
  thumbnail: string;
  genre: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
  endDate: string;
}

interface Stats {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  activeInvestments: number;
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [dashboardStats, setDashboardStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboard();
    }
  }, [user?.id]);

  async function fetchDashboard() {
    try {
      const res = await fetch(`/api/investor/dashboard?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.stats);
        setInvestments(data.investments || []);
        setFeaturedCampaigns(data.featuredCampaigns || []);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function getDaysLeft(endDate: string): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  const totalInvested = dashboardStats?.totalInvested || 0;
  const currentValue = dashboardStats?.currentValue || 0;
  const totalReturns = dashboardStats?.totalReturns || 0;
  const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : "0";

  const statCards = [
    { label: "Total Invested", value: `Rp ${(totalInvested / 1000000).toFixed(0)}M`, icon: Briefcase, color: "blue" },
    { label: "Current Value", value: `Rp ${(currentValue / 1000000).toFixed(0)}M`, icon: DollarSign, color: "green" },
    { label: "Total Returns", value: `Rp ${(totalReturns / 1000000).toFixed(0)}M`, change: Number(returnPercentage), icon: TrendingUp, color: "emerald" },
    { label: "Active Investments", value: dashboardStats?.activeInvestments || 0, icon: Target, color: "violet" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Investor Dashboard</h1>
          <p className="text-gray-500">Track your investments and discover new opportunities</p>
        </div>
        <Link href="/investor/discover">
          <Button>
            <Sparkles className="w-4 h-4" />
            Discover Projects
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
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  {stat.change !== undefined && (
                    <span className={`text-xs font-medium flex items-center gap-1 ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change >= 0 ? "+" : ""}{stat.change}%
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Investments</CardTitle>
              <Link href="/investor/portfolio">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {investments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No investments yet</p>
                  <Link href="/invest">
                    <Button className="mt-4" variant="outline">Discover Projects</Button>
                  </Link>
                </div>
              ) : investments.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={investment.campaignThumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"}
                    alt={investment.campaignTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{investment.campaignTitle}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        investment.campaignStatus === "active"
                          ? "bg-green-100 text-green-700"
                          : investment.campaignStatus === "funded"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {investment.campaignStatus || investment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Invested: Rp {(investment.investedAmount / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      Rp {(investment.investedAmount / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-500">{investment.genre}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Featured Campaigns */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredCampaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active campaigns</p>
                </div>
              ) : featuredCampaigns.map((campaign) => {
                const progress = campaign.fundingGoal > 0 ? (campaign.fundingRaised / campaign.fundingGoal) * 100 : 0;
                return (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="relative mb-3">
                      <img
                        src={campaign.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"}
                        alt={campaign.title}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {campaign.genre || "IP Project"}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{campaign.title}</h3>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Rp {(campaign.fundingRaised / 1000000).toFixed(0)}M raised
                        </span>
                        <span className="font-medium text-gray-900">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getDaysLeft(campaign.endDate)} days left
                      </span>
                      <Link href={`/invest/${campaign.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              <Link href="/investor/discover">
                <Button variant="outline" className="w-full">
                  Browse All Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
