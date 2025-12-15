"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Building2, CreditCard, DollarSign, Bot, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, CheckCircle,
  Clock, Eye, Sparkles, BarChart3
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  aiGenerations: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface RecentPayment {
  id: string;
  userName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentPayments(data.recentPayments);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: stats?.totalUsers || 0, 
      change: stats?.userGrowth || 0,
      icon: Users, 
      color: "blue" 
    },
    { 
      label: "Organizations", 
      value: stats?.totalOrganizations || 0, 
      icon: Building2, 
      color: "violet" 
    },
    { 
      label: "Active Subscriptions", 
      value: stats?.activeSubscriptions || 0, 
      icon: CreditCard, 
      color: "green" 
    },
    { 
      label: "Total Revenue", 
      value: `Rp ${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M`, 
      change: stats?.revenueGrowth || 0,
      icon: DollarSign, 
      color: "emerald" 
    },
    { 
      label: "Pending Payments", 
      value: stats?.pendingPayments || 0, 
      icon: Clock, 
      color: "amber" 
    },
    { 
      label: "AI Generations", 
      value: stats?.aiGenerations || 0, 
      icon: Sparkles, 
      color: "pink" 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                  </div>
                  {stat.change !== undefined && (
                    <span className={`text-xs font-medium ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stat.change >= 0 ? "+" : ""}{stat.change}%
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.userType === "tenant" ? "bg-blue-500/20 text-blue-400" :
                        user.userType === "investor" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {user.userType}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent users
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Payments</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === "verified" ? "bg-green-500/20" :
                      payment.status === "pending" ? "bg-amber-500/20" :
                      "bg-red-500/20"
                    }`}>
                      {payment.status === "verified" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : payment.status === "pending" ? (
                        <Clock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{payment.userName}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">
                        Rp {payment.amount.toLocaleString("id-ID")}
                      </div>
                      <span className={`text-xs ${
                        payment.status === "verified" ? "text-green-400" :
                        payment.status === "pending" ? "text-amber-400" :
                        "text-red-400"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent payments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-white/80 mb-3" />
            <h3 className="font-semibold text-white mb-1">Manage Users</h3>
            <p className="text-sm text-blue-100">View and manage all users</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-600 to-orange-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Clock className="w-8 h-8 text-white/80 mb-3" />
            <h3 className="font-semibold text-white mb-1">Verify Payments</h3>
            <p className="text-sm text-amber-100">Review pending payments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-600 to-purple-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Bot className="w-8 h-8 text-white/80 mb-3" />
            <h3 className="font-semibold text-white mb-1">AI Providers</h3>
            <p className="text-sm text-violet-100">Configure AI models</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <BarChart3 className="w-8 h-8 text-white/80 mb-3" />
            <h3 className="font-semibold text-white mb-1">Analytics</h3>
            <p className="text-sm text-green-100">View platform metrics</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
