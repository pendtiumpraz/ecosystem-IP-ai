"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Play, Search, Star, Clock, Film, Tv, FileVideo,
  ChevronRight, Loader2
} from "lucide-react";

interface Content {
  id: string;
  title: string;
  type: string;
  genre: string;
  rating: string;
  releaseYear: number;
  durationMinutes: number;
  synopsis: string;
  posterUrl: string;
}

const CATEGORIES = [
  { id: "all", label: "Semua", icon: Film },
  { id: "movie", label: "Film", icon: Film },
  { id: "series", label: "Serial", icon: Tv },
  { id: "documentary", label: "Dokumenter", icon: FileVideo },
];

export default function WatchPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchContents();
  }, []);

  async function fetchContents() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/public/watch");
      const data = await response.json();
      if (data.success) {
        setContents(data.contents);
      }
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.genre.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || c.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredContent = contents[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Banner */}
      {featuredContent && (
        <div className="relative h-[70vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredContent.posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
          
          <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded text-sm font-medium mb-4">
                <Play className="w-4 h-4" /> Featured
              </span>
              <h1 className="text-5xl font-bold mb-4">{featuredContent.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" /> {featuredContent.rating}
                </span>
                <span>{featuredContent.releaseYear}</span>
                <span>{featuredContent.genre}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {featuredContent.durationMinutes} min
                </span>
              </div>
              <p className="text-gray-300 mb-6 line-clamp-3">{featuredContent.synopsis}</p>
              <div className="flex gap-3">
                <Link href={`/watch/${featuredContent.id}`}>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    <Play className="w-5 h-5" /> Tonton Sekarang
                  </Button>
                </Link>
                <Link href={`/watch/${featuredContent.id}`}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Detail
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari film, serial, dokumenter..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className={activeCategory !== cat.id ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-red-600 hover:bg-red-700"}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {activeCategory === "all" ? "Semua Konten" : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="text-gray-400">{filteredContents.length} konten</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400">Tidak ada konten ditemukan</h3>
              <p className="text-gray-500">Coba kata kunci atau kategori lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredContents.map((content) => (
                <Link key={content.id} href={`/watch/${content.id}`}>
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-red-500 transition-colors group cursor-pointer">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={content.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400"}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-black/70 rounded text-xs">
                          {content.type === "movie" ? "Film" : content.type === "series" ? "Serial" : "Dok"}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-white truncate">{content.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{content.releaseYear}</span>
                        <span>•</span>
                        <span>{content.genre}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Punya IP yang Ingin Ditayangkan?</h2>
          <p className="text-gray-300 mb-6">Daftarkan karya Anda di MODO dan jangkau jutaan penonton Indonesia</p>
          <Link href="/auth">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Mulai Sekarang <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
