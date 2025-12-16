"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  Briefcase, Search, Filter, ArrowLeft, Clock, CheckCircle,
  XCircle, Loader2, TrendingUp, Calendar, DollarSign
} from "lucide-react";

interface Investment {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignThumbnail: string;
  projectTitle: string;
  genre: string;
  investedAmount: number;
  tierName: string;
  tierRewards: string;
  status: string;
  campaignStatus: string;
  fundingGoal: number;
  fundingRaised: number;
  endDate: string;
  createdAt: string;
}

export default function InvestorPortfolioPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchPortfolio();
    }
  }, [user?.id, filterStatus]);

  async function fetchPortfolio() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ userId: user!.id });
      if (filterStatus !== "all") params.append("status", filterStatus);
      
      const res = await fetch(`/api/investor/portfolio?${params}`);
      const data = await res.json();
      if (data.success) {
        setInvestments(data.investments || []);
      }
    } catch (e) {
      console.error("Failed to fetch portfolio:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredInvestments = investments.filter(inv =>
    inv.campaignTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const activeCount = investments.filter(inv => inv.campaignStatus === "active").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case "cancelled":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{status}</span>;
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  }

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
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-500">Track all your investments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">Rp {(totalInvested / 1000000).toFixed(0)}M</div>
                <div className="text-sm text-gray-500">Total Invested</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{investments.length}</div>
                <div className="text-sm text-gray-500">Total Investments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeCount}</div>
                <div className="text-sm text-gray-500">Active Campaigns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search investments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "pending", "confirmed", "cancelled"].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Investments List */}
      {filteredInvestments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "Try different search terms" : "Start investing in creative projects"}
            </p>
            <Link href="/invest">
              <Button>Discover Projects</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvestments.map(investment => {
            const progress = investment.fundingGoal > 0 
              ? (investment.fundingRaised / investment.fundingGoal) * 100 
              : 0;
            
            return (
              <Card key={investment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={investment.campaignThumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"}
                      alt={investment.campaignTitle}
                      className="w-32 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{investment.campaignTitle || investment.projectTitle}</h3>
                          <p className="text-sm text-gray-500">{investment.genre}</p>
                        </div>
                        {getStatusBadge(investment.status)}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-gray-500">Invested</div>
                          <div className="font-semibold">Rp {(investment.investedAmount / 1000000).toFixed(1)}M</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tier</div>
                          <div className="font-medium">{investment.tierName || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Campaign Progress</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Invested On</div>
                          <div className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(investment.createdAt)}
                          </div>
                        </div>
                      </div>

                      {investment.tierRewards && (
                        <div className="mt-3 p-2 bg-orange-50 rounded text-sm text-orange-700">
                          <strong>Rewards:</strong> {investment.tierRewards}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

