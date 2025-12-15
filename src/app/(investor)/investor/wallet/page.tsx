"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2,
  CreditCard, Building2, History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function InvestorWalletPage() {
  const { user } = useAuth();
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const balance = 75000000; // Mock data

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  }

  const transactions = [
    { id: 1, type: "topup", amount: 25000000, date: "2024-12-15", status: "completed" },
    { id: 2, type: "invest", amount: -10000000, date: "2024-12-14", status: "completed", project: "Project Alpha" },
    { id: 3, type: "return", amount: 2500000, date: "2024-12-10", status: "completed", project: "Project Beta" },
    { id: 4, type: "withdraw", amount: -5000000, date: "2024-12-05", status: "pending" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-green-600" />
            Wallet
          </h1>
          <p className="text-gray-500">Manage your investment balance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTopup(true)}>
            <Plus className="w-4 h-4" />
            Top Up
          </Button>
          <Button variant="outline" onClick={() => setShowWithdraw(true)}>
            <ArrowUpRight className="w-4 h-4" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 mb-2">Available Balance</p>
              <div className="text-4xl font-bold mb-2">
                {formatCurrency(balance)}
              </div>
              <p className="text-green-200">Ready to invest</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {tx.amount > 0 ? (
                          <ArrowDownRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                        <p className="text-sm text-gray-500">
                          {tx.project || tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </p>
                      <p className={`text-xs ${tx.status === "pending" ? "text-orange-500" : "text-gray-500"}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-4 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 text-left">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-gray-500">BCA, Mandiri, BNI</p>
                </div>
              </button>
              <button className="w-full p-4 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 text-left">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium">E-Wallet</p>
                  <p className="text-sm text-gray-500">GoPay, OVO, DANA</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Up Modal */}
      <Dialog open={showTopup} onOpenChange={setShowTopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Balance</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Amount (IDR)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min. 100,000"
              />
            </div>
            <div className="flex gap-2 mt-4">
              {[1000000, 5000000, 10000000, 25000000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(val.toString())}
                >
                  {(val / 1000000)}Jt
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopup(false)}>Cancel</Button>
            <Button disabled={!amount || isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Amount (IDR)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min. 100,000"
              />
              <p className="text-sm text-gray-500">
                Available: {formatCurrency(balance)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button disabled={!amount || isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Request Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
