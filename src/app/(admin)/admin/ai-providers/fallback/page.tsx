"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, ArrowDown, Trash2, Plus, Loader2, 
  Sparkles, Image, Video, Music, AlertTriangle, Save, ArrowLeft 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface FallbackConfig {
  id: string;
  tier: string;
  modelType: string;
  priority: number;
  providerName: string;
  modelId: string;
  apiKeyId?: string;
  isActive: boolean;
}

interface AIModel {
  id: string;
  providerId: string;
  providerName: string;
  modelId: string;
  name: string;
  type: string;
  creditCost: number;
  isActive: boolean;
  isFree?: boolean;
}

const TIERS = [
  { id: "all", label: "All Tiers (Default)", description: "Applies to all tiers unless overridden" },
  { id: "trial", label: "Trial", description: "Free trial users (30s delay, free models only)" },
  { id: "creator", label: "Creator", description: "Basic paid tier (5s delay)" },
  { id: "studio", label: "Studio", description: "Professional tier (no delay)" },
  { id: "enterprise", label: "Enterprise", description: "Enterprise users (0 delay, own AI option)" },
];

const MODEL_TYPES = [
  { id: "text", label: "LLM (Text)", icon: Sparkles },
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
];

export default function FallbackConfigPage() {
  const [configs, setConfigs] = useState<FallbackConfig[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedType, setSelectedType] = useState("text");

  const [newConfig, setNewConfig] = useState({
    tier: "all",
    modelType: "text",
    providerName: "",
    modelId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ai-providers/fallback");
      const data = await res.json();

      if (data.success) {
        setConfigs(data.configs);
        // Only models with API keys or FREE models
        setModels(data.availableModels || []);
      }
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Get configs for selected tier and type
  const filteredConfigs = configs
    .filter((c) => c.tier === selectedTier && c.modelType === selectedType)
    .sort((a, b) => a.priority - b.priority);

  // Get available models for selected type
  const availableModels = models.filter((m) => m.type === selectedType && m.isActive);

  async function addFallback() {
    if (!newConfig.providerName || !newConfig.modelId) {
      alert("Please select a model");
      return;
    }

    setIsSaving(true);
    try {
      const nextPriority = filteredConfigs.length + 1;
      const res = await fetch("/api/admin/ai-providers/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          modelType: selectedType,
          priority: nextPriority,
          providerName: newConfig.providerName,
          modelId: newConfig.modelId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewConfig({ tier: "all", modelType: "text", providerName: "", modelId: "" });
        fetchData();
      } else {
        alert(data.error || "Failed to add");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeFallback(id: string) {
    if (!confirm("Remove this fallback?")) return;

    try {
      const res = await fetch(`/api/admin/ai-providers/fallback?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      alert("Failed to remove");
    }
  }

  async function movePriority(index: number, direction: "up" | "down") {
    const newConfigs = [...filteredConfigs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newConfigs.length) return;

    // Swap priorities
    const temp = newConfigs[index].priority;
    newConfigs[index].priority = newConfigs[targetIndex].priority;
    newConfigs[targetIndex].priority = temp;

    setIsSaving(true);
    try {
      await fetch("/api/admin/ai-providers/fallback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configs: [
            { id: newConfigs[index].id, priority: newConfigs[index].priority },
            { id: newConfigs[targetIndex].id, priority: newConfigs[targetIndex].priority },
          ],
        }),
      });
      fetchData();
    } catch (e) {
      alert("Failed to update priority");
    } finally {
      setIsSaving(false);
    }
  }

  const TypeIcon = MODEL_TYPES.find((t) => t.id === selectedType)?.icon || Sparkles;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/ai-providers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Providers
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Fallback Queue Configuration</h1>
            <p className="text-gray-400">Set backup AI models when primary fails</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <Card className="bg-blue-900/20 border-blue-700/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">How Fallback Works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300">
                <li><strong>Priority 1</strong> = Primary model (tried first)</li>
                <li><strong>Priority 2+</strong> = Fallback models (tried in order if primary fails)</li>
                <li>System auto-detects rate limits and switches to next model</li>
                <li>Enterprise users with own AI: their config tried first, then system fallback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier & Type Selection */}
      <div className="flex gap-4">
        <Card className="bg-gray-800/50 border-gray-700 flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Select Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <Button
                  key={tier.id}
                  variant={selectedTier === tier.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTier(tier.id)}
                  className={selectedTier === tier.id ? "bg-orange-600" : ""}
                >
                  {tier.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Select Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {MODEL_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className={selectedType === type.id ? "bg-orange-600" : ""}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fallback Queue */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TypeIcon className="w-6 h-6 text-orange-400" />
              <div>
                <CardTitle>
                  {MODEL_TYPES.find((t) => t.id === selectedType)?.label} Fallback Queue
                </CardTitle>
                <CardDescription>
                  {TIERS.find((t) => t.id === selectedTier)?.description}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fallback
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500/50" />
              <p>No fallback configured for this tier/type</p>
              <p className="text-sm mt-1">System will use the default active model only</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Fallback
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConfigs.map((config, index) => {
                const model = models.find((m) => m.modelId === config.modelId);
                return (
                  <div
                    key={config.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      config.priority === 1
                        ? "bg-green-900/20 border-green-700/50"
                        : "bg-gray-700/30 border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          config.priority === 1
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }
                      >
                        #{config.priority}
                      </Badge>
                      <div>
                        <div className="font-medium text-white">
                          {model?.name || config.modelId}
                        </div>
                        <div className="text-sm text-gray-400">
                          {config.providerName} • {config.modelId}
                          {model && (
                            <span className={`ml-2 ${model.isFree ? "text-cyan-400" : "text-green-400"}`}>
                              ({model.isFree ? "FREE" : `${model.creditCost} credits`})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === 0 || isSaving}
                        onClick={() => movePriority(index, "up")}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === filteredConfigs.length - 1 || isSaving}
                        onClick={() => movePriority(index, "down")}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => removeFallback(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Fallback Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Fallback Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-700/50 rounded-lg text-sm">
              <p className="text-gray-300">
                Adding to: <strong>{TIERS.find((t) => t.id === selectedTier)?.label}</strong> -{" "}
                <strong>{MODEL_TYPES.find((t) => t.id === selectedType)?.label}</strong>
              </p>
              <p className="text-gray-400 mt-1">
                This will be priority #{filteredConfigs.length + 1}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Model</Label>
              <Select
                value={newConfig.modelId}
                onValueChange={(v) => {
                  const model = availableModels.find((m) => m.modelId === v);
                  if (model) {
                    setNewConfig({
                      ...newConfig,
                      modelId: v,
                      providerName: model.providerName,
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.modelId}>
                      {model.name} ({model.providerName}) - {model.isFree ? "FREE" : `${model.creditCost} credits`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableModels.length === 0 && (
                <p className="text-sm text-yellow-400">
                  No active models for this type. Add models first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={addFallback} disabled={isSaving || !newConfig.modelId}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

