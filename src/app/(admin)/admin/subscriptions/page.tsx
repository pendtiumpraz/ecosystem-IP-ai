"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard, Plus, Edit, Trash2, Loader2, Check, Sparkles,
  Image, Video, Music, Users, FolderOpen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  creditsMonthly: number;
  maxProjects: number;
  maxTeamMembers: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
}

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    slug: "",
    priceMonthly: 0,
    priceYearly: 0,
    creditsMonthly: 0,
    maxProjects: 0,
    maxTeamMembers: 1,
    features: "",
    isPopular: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePlan() {
    setIsSaving(true);
    try {
      const method = editingPlan ? "PUT" : "POST";
      const body = {
        ...form,
        id: editingPlan?.id,
        features: form.features.split("\n").filter(f => f.trim()),
      };
      
      const res = await fetch("/api/admin/subscriptions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    try {
      await fetch(`/api/admin/subscriptions?id=${id}`, { method: "DELETE" });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    setForm({
      name: "", slug: "", priceMonthly: 0, priceYearly: 0,
      creditsMonthly: 0, maxProjects: 0, maxTeamMembers: 1, features: "", isPopular: false,
    });
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      creditsMonthly: plan.creditsMonthly,
      maxProjects: plan.maxProjects,
      maxTeamMembers: plan.maxTeamMembers,
      features: plan.features.join("\n"),
      isPopular: plan.isPopular,
    });
    setShowModal(true);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-orange-400" />
            Subscription Plans
          </h1>
          <p className="text-gray-400">Manage pricing and features</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`bg-gray-800 border-gray-700 relative ${
              plan.isPopular ? "ring-2 ring-orange-500" : ""
            } ${!plan.isActive ? "opacity-60" : ""}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">POPULAR</Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <Switch
                  checked={plan.isActive}
                  onCheckedChange={(checked) => toggleActive(plan.id, checked)}
                />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(plan.priceMonthly)}
                </div>
                <div className="text-sm text-gray-400">/month</div>
                {plan.priceYearly > 0 && (
                  <div className="text-sm text-green-400 mt-1">
                    {formatCurrency(plan.priceYearly)}/year (save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>{plan.creditsMonthly.toLocaleString()} credits/month</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                  <span>{plan.maxProjects === -1 ? "Unlimited" : plan.maxProjects} projects</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{plan.maxTeamMembers === -1 ? "Unlimited" : plan.maxTeamMembers} team members</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Pro"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  placeholder="pro"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price Monthly (IDR)</Label>
                <Input
                  type="number"
                  value={form.priceMonthly}
                  onChange={(e) => setForm({ ...form, priceMonthly: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Price Yearly (IDR)</Label>
                <Input
                  type="number"
                  value={form.priceYearly}
                  onChange={(e) => setForm({ ...form, priceYearly: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Credits/Month</Label>
                <Input
                  type="number"
                  value={form.creditsMonthly}
                  onChange={(e) => setForm({ ...form, creditsMonthly: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Projects</Label>
                <Input
                  type="number"
                  value={form.maxProjects}
                  onChange={(e) => setForm({ ...form, maxProjects: parseInt(e.target.value) || 0 })}
                  placeholder="-1 for unlimited"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Team</Label>
                <Input
                  type="number"
                  value={form.maxTeamMembers}
                  onChange={(e) => setForm({ ...form, maxTeamMembers: parseInt(e.target.value) || 1 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="AI Story Generation&#10;Character Designer&#10;Moodboard Creation"
                rows={5}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isPopular}
                onCheckedChange={(checked) => setForm({ ...form, isPopular: checked })}
              />
              <Label>Mark as Popular</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={savePlan} disabled={isSaving || !form.name}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

