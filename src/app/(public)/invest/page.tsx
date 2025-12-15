"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, Search, Users, Target, Clock, DollarSign,
  ChevronRight, Loader2, Rocket, CheckCircle, AlertCircle
} from "lucide-react";

interface Campaign {
  id: string;
  projectId: string;
  title: string;
  description: string;
  posterUrl: string;
  goalAmount: number;
  raisedAmount: number;
  backerCount: number;
  status: string;
  startDate: string;
  endDate: string;
}

export default function InvestPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/public/invest");
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function getProgress(raised: number, goal: number) {
    return Math.min(Math.round((raised / goal) * 100), 100);
  }

  function getDaysLeft(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRaised: campaigns.reduce((sum, c) => sum + c.raisedAmount, 0),
    totalBackers: campaigns.reduce((sum, c) => sum + c.backerCount, 0),
    activeCampaigns: campaigns.filter(c => c.status === "active").length,
    fundedCampaigns: campaigns.filter(c => c.status === "funded").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-900/50 to-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" /> Platform Investasi IP Indonesia
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Investasi di Karya Kreatif Indonesia
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Dukung film, serial, dan konten kreatif Indonesia. Dapatkan revenue share, merchandise eksklusif, dan akses spesial.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Rocket className="w-5 h-5" /> Mulai Investasi
                </Button>
              </Link>
              <Link href="#campaigns">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Lihat Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
                <div className="text-sm text-gray-400">Total Terkumpul</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalBackers.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Investor</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                <div className="text-sm text-gray-400">Campaign Aktif</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.fundedCampaigns}</div>
                <div className="text-sm text-gray-400">Berhasil Didanai</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div id="campaigns" className="max-w-7xl mx-auto px-4 py-16">
        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari campaign..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["active", "funded", "all"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                className={filterStatus !== status ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-green-600 hover:bg-green-700"}
                onClick={() => setFilterStatus(status)}
              >
                {status === "active" ? "Aktif" : status === "funded" ? "Terdanai" : "Semua"}
              </Button>
            ))}
          </div>
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400">Tidak ada campaign ditemukan</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const progress = getProgress(campaign.raisedAmount, campaign.goalAmount);
              const daysLeft = getDaysLeft(campaign.endDate);
              
              return (
                <Link key={campaign.id} href={`/invest/${campaign.id}`}>
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-green-500 transition-colors group cursor-pointer h-full">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={campaign.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800"}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {campaign.status === "funded" && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Terdanai
                          </span>
                        </div>
                      )}
                      {campaign.status === "active" && daysLeft <= 7 && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-orange-500 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {daysLeft} hari lagi
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1">{campaign.title}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{campaign.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-400 font-medium">{progress}%</span>
                          <span className="text-gray-400">{formatCurrency(campaign.goalAmount)}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="text-white font-medium">{formatCurrency(campaign.raisedAmount)}</div>
                          <div className="text-gray-500">Terkumpul</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{campaign.backerCount}</div>
                          <div className="text-gray-500">Investor</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{daysLeft}</div>
                          <div className="text-gray-500">Hari</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* How it Works */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-12">Cara Kerja Investasi</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Pilih Campaign", desc: "Temukan proyek yang sesuai dengan minat Anda" },
              { step: 2, title: "Pilih Tier", desc: "Tentukan jumlah investasi dan benefit yang diinginkan" },
              { step: 3, title: "Investasi", desc: "Lakukan pembayaran dengan metode yang tersedia" },
              { step: 4, title: "Dapatkan Return", desc: "Terima benefit dan revenue share sesuai tier" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Punya Proyek yang Butuh Pendanaan?</h2>
          <p className="text-gray-300 mb-6">Ajukan proyek Anda dan dapatkan pendanaan dari ribuan investor</p>
          <Link href="/auth">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Ajukan Proyek <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
