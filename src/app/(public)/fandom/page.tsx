"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, MessageCircle, Heart, ExternalLink,
  ChevronRight, Sparkles
} from "lucide-react";

// Community links - just external platforms
const COMMUNITIES = [
  {
    id: "comm_001",
    name: "Legenda Gatotkaca Fans",
    description: "Komunitas resmi fans Legenda Gatotkaca. Diskusi, fan art, dan update eksklusif!",
    memberCount: 12500,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/gatotkaca", color: "bg-indigo-600" },
      { name: "Telegram", url: "https://t.me/gatotkacafans", color: "bg-blue-500" },
      { name: "WhatsApp", url: "https://chat.whatsapp.com/xxx", color: "bg-green-500" },
    ],
  },
  {
    id: "comm_002",
    name: "Neo Jakarta Citizens",
    description: "Selamat datang di Neo Jakarta 2077! Diskusi cyberpunk, teori, dan fan creations.",
    memberCount: 8900,
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/neojakarta", color: "bg-indigo-600" },
      { name: "Telegram", url: "https://t.me/neojakarta2077", color: "bg-blue-500" },
    ],
  },
  {
    id: "comm_003",
    name: "Indonesian Cinema Lovers",
    description: "Komunitas pecinta film Indonesia. Review, diskusi, dan rekomendasi film terbaik!",
    memberCount: 54200,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/idcinema", color: "bg-indigo-600" },
      { name: "Telegram", url: "https://t.me/indonesiancinema", color: "bg-blue-500" },
      { name: "Facebook", url: "https://facebook.com/groups/idcinema", color: "bg-blue-600" },
    ],
  },
  {
    id: "comm_004",
    name: "Warung Dimensi Club",
    description: "Fans Warung Dimensi! Teori multiverse, fan art, dan diskusi seru seputar series.",
    memberCount: 3200,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/warungdimensi", color: "bg-indigo-600" },
      { name: "WhatsApp", url: "https://chat.whatsapp.com/yyy", color: "bg-green-500" },
    ],
  },
  {
    id: "comm_005",
    name: "Horror Nusantara",
    description: "Komunitas pecinta horor Indonesia. Diskusi film, folklore, dan cerita seram!",
    memberCount: 15800,
    image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/horrornusantara", color: "bg-indigo-600" },
      { name: "Telegram", url: "https://t.me/horrornusantara", color: "bg-blue-500" },
    ],
  },
  {
    id: "comm_006",
    name: "MODO Creators Hub",
    description: "Komunitas kreator MODO. Sharing tips, feedback karya, dan networking sesama creator.",
    memberCount: 2100,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
    platforms: [
      { name: "Discord", url: "https://discord.gg/modocreators", color: "bg-indigo-600" },
      { name: "WhatsApp", url: "https://chat.whatsapp.com/zzz", color: "bg-green-500" },
    ],
  },
];

export default function FandomPage() {
  function formatNumber(num: number) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-900/50 to-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 rounded-full text-pink-400 text-sm font-medium mb-6">
              <Users className="w-4 h-4" /> Komunitas Fans
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bergabung dengan Komunitas IP Favorit
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Temukan dan bergabung dengan komunitas fans IP Indonesia. Diskusi, share fan art, dan dapatkan update eksklusif!
            </p>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITIES.map((community) => (
            <Card key={community.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-pink-500 transition-colors">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded text-sm">
                    <Users className="w-4 h-4" />
                    {formatNumber(community.memberCount)} members
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg text-white mb-2">{community.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{community.description}</p>
                
                {/* Platform Buttons */}
                <div className="flex flex-wrap gap-2">
                  {community.platforms.map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className={`${platform.color} hover:opacity-90`}>
                        {platform.name}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">96.7K+</div>
              <div className="text-sm text-gray-400">Total Members</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">6</div>
              <div className="text-sm text-gray-400">Komunitas</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-gray-400">IP Aktif</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-400">Aktif</div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-pink-900/30 to-gray-800 border-pink-500/30">
            <CardContent className="p-8">
              <Users className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Buat Komunitas untuk IP Anda</h3>
              <p className="text-gray-300 mb-6">
                Punya IP dan ingin membangun fanbase? Kami akan membantu setup komunitas di platform favorit Anda.
              </p>
              <Link href="/contact">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  Hubungi Kami <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-900/30 to-gray-800 border-violet-500/30">
            <CardContent className="p-8">
              <MessageCircle className="w-12 h-12 text-violet-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Butuh Bantuan?</h3>
              <p className="text-gray-300 mb-6">
                Ada pertanyaan tentang komunitas atau ingin request komunitas baru? Hubungi tim kami via WhatsApp.
              </p>
              <a href="https://wa.me/6281319504441" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700">
                  WhatsApp: 081319504441 <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
