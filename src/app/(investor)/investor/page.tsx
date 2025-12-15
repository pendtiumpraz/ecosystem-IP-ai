"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp, Briefcase, DollarSign, PieChart, ArrowUpRight,
  ArrowDownRight, Eye, Clock, CheckCircle, Target, Sparkles,
  ChevronRight, Play
} from "lucide-react";

interface Investment {
  id: string;
  projectTitle: string;
  projectImage: string;
  investedAmount: number;
  currentValue: number;
  returnPercentage: number;
  status: string;
}

interface Project {
  id: string;
  title: string;
  thumbnail: string;
  genre: string;
  fundingGoal: number;
  fundingRaised: number;
  daysLeft: number;
}

export default function InvestorDashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setInvestments([
      {
        id: "1",
        projectTitle: "Legenda Nusantara",
        projectImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400",
        investedAmount: 50000000,
        currentValue: 62500000,
        returnPercentage: 25,
        status: "active",
      },
      {
        id: "2",
        projectTitle: "Cyber Jakarta 2077",
        projectImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
        investedAmount: 25000000,
        currentValue: 27500000,
        returnPercentage: 10,
        status: "active",
      },
      {
        id: "3",
        projectTitle: "Warung Universe",
        projectImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400",
        investedAmount: 50000000,
        currentValue: 55000000,
        returnPercentage: 10,
        status: "completed",
      },
    ]);

    setFeaturedProjects([
      {
        id: "1",
        title: "Pulau Misteri",
        thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
        genre: "Horror Mystery",
        fundingGoal: 300000000,
        fundingRaised: 180000000,
        daysLeft: 15,
      },
      {
        id: "2",
        title: "Cinta di Kota Tua",
        thumbnail: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400",
        genre: "Romance Drama",
        fundingGoal: 200000000,
        fundingRaised: 150000000,
        daysLeft: 8,
      },
    ]);

    setIsLoading(false);
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = currentValue - totalInvested;
  const returnPercentage = ((totalReturns / totalInvested) * 100).toFixed(1);

  const stats = [
    { label: "Total Invested", value: `Rp ${(totalInvested / 1000000).toFixed(0)}M`, icon: Briefcase, color: "blue" },
    { label: "Current Value", value: `Rp ${(currentValue / 1000000).toFixed(0)}M`, icon: DollarSign, color: "green" },
    { label: "Total Returns", value: `Rp ${(totalReturns / 1000000).toFixed(0)}M`, change: Number(returnPercentage), icon: TrendingUp, color: "emerald" },
    { label: "Active Investments", value: investments.filter(i => i.status === "active").length, icon: Target, color: "violet" },
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
        {stats.map((stat) => {
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
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={investment.projectImage}
                    alt={investment.projectTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{investment.projectTitle}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        investment.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {investment.status === "active" ? "Active" : "Completed"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Invested: Rp {(investment.investedAmount / 1000000).toFixed(0)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      Rp {(investment.currentValue / 1000000).toFixed(0)}M
                    </div>
                    <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
                      investment.returnPercentage >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {investment.returnPercentage >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {investment.returnPercentage >= 0 ? "+" : ""}{investment.returnPercentage}%
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Featured Projects */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredProjects.map((project) => {
                const progress = (project.fundingRaised / project.fundingGoal) * 100;
                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="relative mb-3">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {project.genre}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Rp {(project.fundingRaised / 1000000).toFixed(0)}M raised
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
                        {project.daysLeft} days left
                      </span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
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
