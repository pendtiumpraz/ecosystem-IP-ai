"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import {
  DollarSign, Search, CheckCircle, XCircle, Clock, Eye,
  Loader2, ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentProof: string | null;
  notes: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [filterStatus, page]);

  async function fetchPayments() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: String(page * 20),
        ...(filterStatus !== "all" && { status: filterStatus }),
      });
      const response = await fetch(`/api/admin/payments?${params}`);
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
        setTotal(data.total);
        setPendingCount(data.pendingCount);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(paymentId: string) {
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentId,
          status: "verified",
          verifiedBy: user?.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPayments();
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  }

  async function handleReject(paymentId: string) {
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentId,
          status: "rejected",
          verifiedBy: user?.id,
          notes: rejectNotes,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPayments();
        setSelectedPayment(null);
        setRejectNotes("");
      }
    } catch (error) {
      console.error("Failed to reject payment:", error);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7" />
            Payment Verification
          </h1>
          <p className="text-gray-400">Verify manual payments from users</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-medium">{pendingCount} pending payments</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["pending", "verified", "rejected", "all"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilterStatus(status); setPage(0); }}
            className={filterStatus !== status ? "border-gray-600 text-gray-300" : ""}
          >
            {status === "pending" && <Clock className="w-4 h-4 mr-1" />}
            {status === "verified" && <CheckCircle className="w-4 h-4 mr-1" />}
            {status === "rejected" && <XCircle className="w-4 h-4 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Payments Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Method</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white">{payment.userName}</div>
                          <div className="text-sm text-gray-400">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{payment.paymentMethod || "Bank Transfer"}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          payment.status === "verified" ? "bg-green-500/20 text-green-400" :
                          payment.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {payment.status === "verified" && <CheckCircle className="w-3 h-3" />}
                          {payment.status === "pending" && <Clock className="w-3 h-3" />}
                          {payment.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payment.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300"
                                onClick={() => handleVerify(payment.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <span className="text-sm text-gray-400">
              Showing {page * 20 + 1}-{Math.min((page + 1) * 20, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="border-gray-600 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="border-gray-600 text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">User</label>
                  <p className="text-white">{selectedPayment.userName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <p className="text-white font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Method</label>
                  <p className="text-white">{selectedPayment.paymentMethod || "Bank Transfer"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Date</label>
                  <p className="text-white">{new Date(selectedPayment.createdAt).toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <p className="text-white capitalize">{selectedPayment.status}</p>
                </div>
              </div>

              {selectedPayment.paymentProof && (
                <div>
                  <label className="text-sm text-gray-400">Payment Proof</label>
                  <img src={selectedPayment.paymentProof} alt="Proof" className="mt-2 rounded-lg max-h-48 object-contain" />
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <div>
                  <label className="text-sm text-gray-400">Rejection Notes (optional)</label>
                  <Input
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                  onClick={() => { setSelectedPayment(null); setRejectNotes(""); }}
                >
                  Close
                </Button>
                {selectedPayment.status === "pending" && (
                  <>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedPayment.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerify(selectedPayment.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
