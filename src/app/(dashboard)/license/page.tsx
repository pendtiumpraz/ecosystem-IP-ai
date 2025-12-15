"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag, DollarSign, Package, Tag, Percent, Store,
  Plus, Search, Filter, MoreVertical, ExternalLink,
  TrendingUp, FileText, Users, CheckCircle, Clock, Eye
} from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Gatotkaca Action Figure",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    price: 299000,
    sales: 156,
    revenue: 46644000,
    status: "active",
    type: "Merchandise",
  },
  {
    id: "2",
    name: "Legenda Nusantara T-Shirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    price: 199000,
    sales: 342,
    revenue: 68058000,
    status: "active",
    type: "Merchandise",
  },
  {
    id: "3",
    name: "Character License - Games",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop",
    price: 50000000,
    sales: 2,
    revenue: 100000000,
    status: "active",
    type: "License",
  },
];

const mockDeals = [
  {
    id: "1",
    partner: "PT Toys Indonesia",
    type: "Manufacturing License",
    value: 150000000,
    royalty: "8%",
    status: "active",
    expires: "Dec 2025",
  },
  {
    id: "2",
    partner: "GameDev Studio",
    type: "Game Rights",
    value: 500000000,
    royalty: "12%",
    status: "negotiating",
    expires: null,
  },
];

const stats = [
  { label: "Total Revenue", value: "Rp 215M", change: "+24%", icon: DollarSign },
  { label: "Products Sold", value: "500+", change: "+18%", icon: Package },
  { label: "Active Deals", value: "3", change: "+1", icon: FileText },
  { label: "Royalty Income", value: "Rp 45M", change: "+32%", icon: Percent },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function LicensePage() {
  const [activeTab, setActiveTab] = useState<"products" | "deals">("products");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-orange-500" />
            License
          </h1>
          <p className="text-gray-500">Monetize your IP through merchandise & licensing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4" />
            New Deal
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
        >
          <Package className="w-4 h-4" />
          Products
        </Button>
        <Button
          variant={activeTab === "deals" ? "default" : "outline"}
          onClick={() => setActiveTab("deals")}
        >
          <FileText className="w-4 h-4" />
          Licensing Deals
        </Button>
      </div>

      {activeTab === "products" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Merchandise & Products</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search products..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Sales</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.type === "License" 
                            ? "bg-violet-100 text-violet-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {product.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">{product.sales}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Licensing Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{deal.partner}</h3>
                    <p className="text-sm text-gray-500">{deal.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(deal.value)}</div>
                  <div className="text-sm text-gray-500">Royalty: {deal.royalty}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    deal.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {deal.status === "active" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Negotiating
                      </span>
                    )}
                  </span>
                  {deal.expires && (
                    <span className="text-sm text-gray-500">Exp: {deal.expires}</span>
                  )}
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
