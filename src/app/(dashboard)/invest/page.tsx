"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, DollarSign, Users, Target, PieChart, 
  Plus, ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  AlertCircle, BarChart3, Wallet, FileText, Calendar
} from "lucide-react";

const mockCampaigns = [
  {
    id: "1",
    title: "Legenda Nusantara - Season 2",
    goal: 500000000,
    raised: 375000000,
    investors: 124,
    daysLeft: 18,
    status: "active",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop",
  },
  {
    id: "2",
    title: "Cyber Jakarta 2077 - Pilot",
    goal: 250000000,
    raised: 250000000,
    investors: 89,
    daysLeft: 0,
    status: "funded",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop",
  },
  {
    id: "3",
    title: "Dokumenter Kopi Nusantara",
    goal: 150000000,
    raised: 45000000,
    investors: 34,
    daysLeft: 45,
    status: "active",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=225&fit=crop",
  },
];

const stats = [
  { label: "Total Raised", value: "Rp 670M", change: "+18%", icon: DollarSign, color: "green" },
  { label: "Total Investors", value: "247", change: "+12%", icon: Users, color: "blue" },
  { label: "Active Campaigns", value: "2", change: "0", icon: Target, color: "violet" },
  { label: "Success Rate", value: "85%", change: "+5%", icon: TrendingUp, color: "orange" },
];

const recentInvestors = [
  { name: "Budi S.", amount: 5000000, project: "Legenda Nusantara", time: "2 hours ago" },
  { name: "Sarah W.", amount: 10000000, project: "Legenda Nusantara", time: "5 hours ago" },
  { name: "Ahmad R.", amount: 2500000, project: "Dokumenter Kopi", time: "1 day ago" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function InvestPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-green-500" />
            Invest
          </h1>
          <p className="text-gray-500">Crowdfunding & revenue sharing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Campaign
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
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-xs font-medium ${
                    stat.change.startsWith("+") ? "text-green-600" : "text-gray-500"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCampaigns.map((campaign) => {
                const progress = (campaign.raised / campaign.goal) * 100;
                return (
                  <div
                    key={campaign.id}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={campaign.thumbnail}
                      alt={campaign.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "funded"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {campaign.status === "funded" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Funded
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {campaign.daysLeft} days left
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {formatCurrency(campaign.raised)} raised
                          </span>
                          <span className="font-medium text-gray-900">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              campaign.status === "funded" ? "bg-green-500" : "bg-violet-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {campaign.investors} investors
                        </span>
                        <span>Goal: {formatCurrency(campaign.goal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Withdraw Funds</h3>
                <p className="text-sm text-gray-500">Transfer to your bank</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-500">Financial statements</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <PieChart className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Revenue Share</h3>
                <p className="text-sm text-gray-500">Manage distributions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Investors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Investors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentInvestors.map((investor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white font-medium">
                    {investor.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{investor.name}</span>
                      <span className="text-green-600 font-medium text-sm">
                        +{formatCurrency(investor.amount)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {investor.project} • {investor.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Investor Update Due</p>
                  <p className="text-xs text-gray-500">Legenda Nusantara • in 3 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Revenue Distribution</p>
                  <p className="text-xs text-gray-500">Cyber Jakarta • in 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
