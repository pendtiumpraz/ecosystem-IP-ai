"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, Users, TrendingUp, CreditCard, Activity, 
  Loader2, ArrowUp, ArrowDown, DollarSign, Sparkles
} from "lucide-react";

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalGenerations: number;
  generationsToday: number;
  activeSubscriptions: number;
  conversionRate: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: stats?.totalUsers || 0, 
      change: stats?.newUsersToday || 0,
      changeLabel: "new today",
      icon: Users, 
      color: "text-blue-400", 
      bg: "bg-blue-500/20" 
    },
    { 
      label: "Total Revenue", 
      value: `Rp ${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M`, 
      change: stats?.revenueThisMonth || 0,
      changeLabel: "this month",
      icon: DollarSign, 
      color: "text-green-400", 
      bg: "bg-green-500/20" 
    },
    { 
      label: "AI Generations", 
      value: stats?.totalGenerations || 0, 
      change: stats?.generationsToday || 0,
      changeLabel: "today",
      icon: Sparkles, 
      color: "text-purple-400", 
      bg: "bg-purple-500/20" 
    },
    { 
      label: "Active Subscriptions", 
      value: stats?.activeSubscriptions || 0, 
      change: stats?.conversionRate || 0,
      changeLabel: "% conversion",
      icon: CreditCard, 
      color: "text-yellow-400", 
      bg: "bg-yellow-500/20" 
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-violet-400" />
          Analytics
        </h1>
        <p className="text-gray-400">Platform performance and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{stat.change}</span>
                      <span className="text-gray-500">{stat.changeLabel}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart coming soon</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
