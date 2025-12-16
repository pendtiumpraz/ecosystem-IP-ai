"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  Coins, Plus, ArrowUpRight, ArrowDownRight, Clock, CreditCard,
  Sparkles, Image, Video, Music, Loader2, CheckCircle, History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreditTransaction {
  id: string;
  type: "subscription_credit" | "purchase" | "usage" | "refund" | "bonus" | "adjustment";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", name: "Starter", credits: 100, price: 49000, pricePerCredit: 490 },
  { id: "basic", name: "Basic", credits: 300, price: 129000, pricePerCredit: 430, popular: true },
  { id: "pro", name: "Pro", credits: 700, price: 279000, pricePerCredit: 399 },
  { id: "studio", name: "Studio", credits: 1500, price: 549000, pricePerCredit: 366 },
  { id: "enterprise", name: "Enterprise", credits: 5000, price: 1499000, pricePerCredit: 300 },
];

const CREDIT_USAGE = [
  { type: "Text Generation", icon: Sparkles, examples: "Synopsis, characters, scripts", cost: "1-25 credits" },
  { type: "Image Generation", icon: Image, examples: "Moodboards, character art", cost: "5-25 credits" },
  { type: "Video Generation", icon: Video, examples: "Animation previews", cost: "50-100 credits" },
  { type: "Audio Generation", icon: Music, examples: "Voice, music", cost: "10-30 credits" },
];

export default function CreditsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  async function fetchTransactions() {
    try {
      const res = await fetch(`/api/user/credits/history?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePurchase() {
    if (!selectedPackage || !user?.id) return;
    
    setIsPurchasing(true);
    try {
      const res = await fetch("/api/user/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          packageId: selectedPackage.id,
          credits: selectedPackage.credits,
          amount: selectedPackage.price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBuyModal(false);
        setSelectedPackage(null);
        fetchTransactions();
        // Refresh user data
        window.location.reload();
      } else {
        alert(data.error || "Purchase failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsPurchasing(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="w-7 h-7 text-yellow-500" />
            Credits
          </h1>
          <p className="text-gray-500">Manage your AI generation credits</p>
        </div>
        <Button onClick={() => setShowBuyModal(true)}>
          <Plus className="w-4 h-4" />
          Buy Credits
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 mb-2">Current Balance</p>
              <div className="text-5xl font-bold mb-2">
                {user?.creditBalance?.toLocaleString() || 0}
              </div>
              <p className="text-orange-200">credits available</p>
            </div>
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Coins className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Credit Usage Guide */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Credit Usage Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {CREDIT_USAGE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.type} className="p-4 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.type}</h3>
                          <p className="text-sm text-orange-600 font-semibold">{item.cost}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{item.examples}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 20).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "usage" ? "bg-red-100" :
                          tx.type === "refund" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          {tx.type === "usage" ? (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          ) : tx.type === "refund" ? (
                            <ArrowDownRight className="w-5 h-5 text-blue-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === "usage" ? "text-red-600" : "text-green-600"
                        }`}>
                          {tx.type === "usage" ? "-" : "+"}{Math.abs(tx.amount)}
                        </p>
                        <p className="text-sm text-gray-500">Balance: {tx.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Buy */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Buy Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => { setSelectedPackage(pkg); setShowBuyModal(true); }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    pkg.popular 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {pkg.popular && (
                    <span className="text-xs font-semibold text-orange-600 mb-1 block">POPULAR</span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{pkg.credits} Credits</div>
                      <div className="text-sm text-gray-500">{formatCurrency(pkg.pricePerCredit)}/credit</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{formatCurrency(pkg.price)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buy Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="py-4">
              <div className="p-6 rounded-xl bg-orange-50 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {selectedPackage.credits.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Credits</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Package</span>
                  <span className="font-medium">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per credit</span>
                  <span className="font-medium">{formatCurrency(selectedPackage.pricePerCredit)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedPackage.price)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Payment will be processed via bank transfer. Credits will be added after verification.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyModal(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

