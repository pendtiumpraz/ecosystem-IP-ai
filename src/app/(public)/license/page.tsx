"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag, Search, Tag, Star, Heart, ShoppingCart,
  ChevronRight, Loader2, Package, Shirt, BookOpen, Gamepad2
} from "lucide-react";

interface Product {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  stockQuantity: number;
}

const CATEGORIES = [
  { id: "all", label: "Semua", icon: Package },
  { id: "apparel", label: "Apparel", icon: Shirt },
  { id: "collectibles", label: "Collectibles", icon: Star },
  { id: "books", label: "Buku", icon: BookOpen },
  { id: "toys", label: "Mainan", icon: Gamepad2 },
];

// Sample products (will be replaced with API)
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    projectId: "proj_001",
    projectName: "Legenda Gatotkaca",
    name: "Gatotkaca Hero T-Shirt",
    description: "Kaos premium dengan desain Gatotkaca modern",
    category: "apparel",
    price: 250000,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
    stockQuantity: 150,
  },
  {
    id: "prod_002",
    projectId: "proj_001",
    projectName: "Legenda Gatotkaca",
    name: "Gatotkaca Action Figure",
    description: "Action figure 12 inch dengan armor detail",
    category: "collectibles",
    price: 450000,
    images: ["https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400"],
    stockQuantity: 50,
  },
  {
    id: "prod_003",
    projectId: "proj_002",
    projectName: "Neo Jakarta 2077",
    name: "Neo Jakarta Art Book",
    description: "Buku concept art 200 halaman full color",
    category: "books",
    price: 350000,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
    stockQuantity: 200,
  },
  {
    id: "prod_004",
    projectId: "proj_002",
    projectName: "Neo Jakarta 2077",
    name: "Cyberpunk Hoodie",
    description: "Hoodie dengan neon accent dan logo Neo Jakarta",
    category: "apparel",
    price: 450000,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
    stockQuantity: 100,
  },
  {
    id: "prod_005",
    projectId: "proj_003",
    projectName: "Warung Dimensi",
    name: "Pak Joko Plushie",
    description: "Boneka Pak Joko dengan celemek warung",
    category: "toys",
    price: 175000,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    stockQuantity: 300,
  },
  {
    id: "prod_006",
    projectId: "proj_001",
    projectName: "Legenda Gatotkaca",
    name: "Gatotkaca Poster Set",
    description: "Set 3 poster A2 dengan frame",
    category: "collectibles",
    price: 150000,
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400"],
    stockQuantity: 500,
  },
];

export default function LicensePage() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900/50 to-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
              <ShoppingBag className="w-4 h-4" /> Official Merchandise
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Merchandise Resmi IP Indonesia
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Koleksi merchandise eksklusif dari IP-IP terbaik Indonesia. Dari kaos, collectibles, hingga art book.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari produk atau IP..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className={activeCategory !== cat.id ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-purple-600 hover:bg-purple-700"}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400">Tidak ada produk ditemukan</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group cursor-pointer">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-purple-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  {product.stockQuantity < 20 && (
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-orange-500 rounded text-xs font-medium">
                      Stok Terbatas
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <span className="text-xs text-purple-400 mb-1 block">{product.projectName}</span>
                  <h3 className="font-medium text-white mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-400">{formatCurrency(product.price)}</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* B2B Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-purple-900/30 to-gray-800 border-purple-500/30">
            <CardContent className="p-8">
              <Tag className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Lisensi B2B</h3>
              <p className="text-gray-300 mb-6">
                Tertarik untuk melisensikan IP Indonesia untuk produk Anda? Kami menyediakan lisensi untuk merchandise, media, gaming, dan lainnya.
              </p>
              <Link href="/contact">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Hubungi Tim Lisensi <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-gray-800 border-blue-500/30">
            <CardContent className="p-8">
              <Package className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Jadi Seller</h3>
              <p className="text-gray-300 mb-6">
                Punya IP dan ingin menjual merchandise? Daftar sebagai creator dan mulai jual produk resmi dari IP Anda.
              </p>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Daftar Sebagai Creator <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
