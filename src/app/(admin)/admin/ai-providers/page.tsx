"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Plus, Eye, EyeOff, Loader2, Check, X, Save,
  Sparkles, Image, Video, Music, AlertCircle, Settings,
  DollarSign, Zap, ChevronDown, ChevronUp, Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { toast, alert as swalAlert } from "@/lib/sweetalert";

interface AIProvider {
  id: string;
  name: string;
  slug: string;
  type: string;
  apiBaseUrl: string;
  hasApiKey: boolean;
  isActive: boolean;
  createdAt: string;
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
  isDefault: boolean;
}



type ModelType = "text" | "image" | "video" | "audio" | "multimodal";

interface ActiveModels {
  [key: string]: AIModel | null;
}

// MODEL_TYPES matches database enum values
// Models are grouped by their DB type, but displayed with readable names
const MODEL_TYPES = [
  // LLM/Text - for story, character, dialog generation
  { id: "text", label: "LLM (Text Generation)", icon: Sparkles, description: "GPT, Claude, Gemini - untuk generate cerita, karakter, dialog" },

  // Image - includes text-to-image, image-to-image, inpainting, face-swap, interior, etc
  { id: "image", label: "Image Generation", icon: Image, description: "Text-to-Image, Image-to-Image, Inpainting, Face Swap, Interior Design" },

  // Video - includes text-to-video, image-to-video, face-swap-video
  { id: "video", label: "Video Generation", icon: Video, description: "Text-to-Video, Image-to-Video, Face Swap Video, Scene Maker" },

  // Audio - TTS, voice cloning, music
  { id: "audio", label: "Audio/Music", icon: Music, description: "Text-to-Speech, Voice Cloning, Music Generation" },

  // Multimodal - 3D, special models
  { id: "multimodal", label: "3D & Multimodal", icon: Sparkles, description: "Text-to-3D, Image-to-3D, dan model multimodal lainnya" },
];

const PRESET_PROVIDERS = [
  { name: "openai", displayName: "OpenAI", types: ["text", "image"], baseUrl: "https://api.openai.com/v1" },
  { name: "anthropic", displayName: "Anthropic (Claude)", types: ["text"], baseUrl: "https://api.anthropic.com" },
  { name: "google", displayName: "Google (Gemini)", types: ["text", "image"], baseUrl: "https://generativelanguage.googleapis.com" },
  { name: "fal", displayName: "Fal.ai", types: ["image", "video"], baseUrl: "https://fal.run" },
  { name: "replicate", displayName: "Replicate", types: ["image", "video", "audio"], baseUrl: "https://api.replicate.com" },
  { name: "runway", displayName: "Runway ML", types: ["video"], baseUrl: "https://api.runwayml.com" },
  { name: "elevenlabs", displayName: "ElevenLabs", types: ["audio"], baseUrl: "https://api.elevenlabs.io" },
  { name: "suno", displayName: "Suno AI", types: ["audio"], baseUrl: "https://api.suno.ai" },
];

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [allModels, setAllModels] = useState<AIModel[]>([]);
  const [activeModels, setActiveModels] = useState<ActiveModels>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedType, setExpandedType] = useState<string>("llm");
  const [testStatus, setTestStatus] = useState<{ status: string; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [modelTestResult, setModelTestResult] = useState<{ modelId: string; success: boolean; message: string } | null>(null);

  const [providerForm, setProviderForm] = useState({
    preset: "",
    name: "",
    slug: "",
    type: "text",
    apiBaseUrl: "",
    apiKey: "",
  });

  const [modelForm, setModelForm] = useState({
    providerId: "",
    modelId: "",
    name: "",
    type: "text",
    creditCost: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [providersRes, modelsRes] = await Promise.all([
        fetch("/api/admin/ai-providers"),
        fetch("/api/admin/ai-providers/models"),
      ]);

      const providersData = await providersRes.json();
      const modelsData = await modelsRes.json();

      if (providersData.success) setProviders(providersData.providers);
      if (modelsData.success) {
        setAllModels(modelsData.models);
        // Find active models per type - now supports all types dynamically
        const active: ActiveModels = {};
        modelsData.models.forEach((m: AIModel) => {
          if (m.isDefault && m.isActive) {
            active[m.type] = m;
          }
        });
        setActiveModels(active);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function setActiveModel(modelId: string, modelType: string) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers/models/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, modelType }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        toast.error(data.error || "Failed to set active model");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveApiKey(providerId: string) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: providerId, apiKey: apiKeyInput }),
      });
      const data = await res.json();
      if (data.success) {
        setShowApiKeyModal(null);
        setApiKeyInput("");
        setTestStatus(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to save API key");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function testApiKey(providerId: string) {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/admin/ai-providers/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, apiKey: apiKeyInput || undefined }),
      });
      const data = await res.json();
      setTestStatus({
        status: data.success ? "success" : "error",
        message: data.message || data.error
      });
    } catch (e) {
      setTestStatus({ status: "error", message: "Network error" });
    } finally {
      setIsTesting(false);
    }
  }

  async function testModel(modelId: string, modelName: string) {
    setTestingModelId(modelId);
    setModelTestResult(null);
    try {
      const res = await fetch("/api/admin/ai-providers/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });
      const data = await res.json();
      setModelTestResult({
        modelId,
        success: data.success,
        message: data.message || data.error,
      });
      // Show alert with result
      if (data.success) {
        toast.success(`✅ ${modelName}: ${data.message}`);
      } else {
        toast.error(`❌ ${modelName}: ${data.error || "Test failed"}`);
      }
    } catch (e) {
      toast.error(`❌ ${modelName}: Network error`);
    } finally {
      setTestingModelId(null);
    }
  }

  async function saveProvider() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProvider(false);
        setProviderForm({ preset: "", name: "", slug: "", type: "text", apiBaseUrl: "", apiKey: "" });
        fetchData();
      } else {
        toast.error(data.error || "Failed to save provider");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveModel() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModel(false);
        setModelForm({ providerId: "", modelId: "", name: "", type: "text", creditCost: 5 });
        fetchData();
      } else {
        toast.error(data.error || "Failed to save model");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteModel(modelId: string) {
    const confirmed = await swalAlert.confirm("Delete Model", "Delete this model?", "Delete", "Cancel");
    if (!confirmed.isConfirmed) return;
    try {
      await fetch(`/api/admin/ai-providers/models?id=${modelId}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  function handlePresetSelect(presetName: string) {
    const preset = PRESET_PROVIDERS.find(p => p.name === presetName);
    if (preset) {
      setProviderForm({
        ...providerForm,
        preset: presetName,
        name: preset.displayName,
        slug: preset.name,
        apiBaseUrl: preset.baseUrl,
        type: preset.types[0],
      });
    }
  }

  // Get models for type that have providers with active API keys (for actual usage)
  function getActiveModelsForType(type: string) {
    return allModels.filter(m => {
      if (m.type !== type) return false;
      const provider = providers.find(p => p.id === m.providerId);
      // Show if provider has API key OR model has 0 credit cost (free/external)
      return provider?.hasApiKey || m.creditCost === 0;
    });
  }

  // Get all models for type (for admin to see what needs API key configuration)
  function getAllModelsForType(type: string) {
    return allModels.filter(m => m.type === type);
  }

  // Check if there are models without API keys (need configuration)
  function getModelsNeedingApiKey(type: string) {
    return allModels.filter(m => {
      if (m.type !== type) return false;
      const provider = providers.find(p => p.id === m.providerId);
      return !provider?.hasApiKey && m.creditCost > 0;
    });
  }

  function getProviderForModel(providerId: string) {
    return providers.find(p => p.id === providerId);
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
            <Bot className="w-7 h-7 text-orange-400" />
            AI Providers Configuration
          </h1>
          <p className="text-gray-400">Set API keys dan pilih model aktif untuk setiap tipe. Tenant akan menggunakan setting ini.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ai-providers/fallback">
            <Button variant="outline">
              <Zap className="w-4 h-4" />
              Fallback Queue
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowAddProvider(true)}>
            <Plus className="w-4 h-4" />
            Add Provider
          </Button>
          <Button onClick={() => setShowAddModel(true)}>
            <Plus className="w-4 h-4" />
            Add Model
          </Button>
        </div>
      </div>

      {/* Active Models Summary - show only types with active models */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Model Aktif Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {MODEL_TYPES.filter(type => {
              // Only show types that have models in the system
              const hasModels = allModels.some(m => m.type === type.id);
              return hasModels;
            }).map(type => {
              const Icon = type.icon;
              const active = activeModels[type.id];
              return (
                <div key={type.id} className="p-3 rounded-lg bg-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-gray-300 truncate">{type.label}</span>
                  </div>
                  {active ? (
                    <div>
                      <div className="font-semibold text-white text-sm truncate">{active.name}</div>
                      <div className="text-xs text-gray-400 truncate">{active.providerName}</div>
                    </div>
                  ) : (
                    <div className="text-yellow-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Belum dipilih
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      {/* Model Selection by Type - only show types with models */}
      <div className="space-y-4">
        {MODEL_TYPES.filter(type => allModels.some(m => m.type === type.id)).map(type => {
          const Icon = type.icon;
          const allModelsForType = getAllModelsForType(type.id);
          const activeModelsForType = getActiveModelsForType(type.id);
          const modelsNeedingKey = getModelsNeedingApiKey(type.id);
          const active = activeModels[type.id];
          const isExpanded = expandedType === type.id;

          return (
            <Card key={type.id} className="bg-gray-800 border-gray-700">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedType(isExpanded ? "" : type.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{type.label}</CardTitle>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gray-600/50 text-gray-300">
                      {activeModelsForType.length}/{allModelsForType.length} ready
                    </Badge>
                    {modelsNeedingKey.length > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {modelsNeedingKey.length} need API key
                      </Badge>
                    )}
                    {active && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        {active.name}
                      </Badge>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  {activeModelsForType.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Belum ada model dengan API key aktif untuk {type.label}</p>
                      {allModelsForType.length > 0 && (
                        <p className="text-sm text-yellow-500 mt-2">
                          {allModelsForType.length} model tersedia, tapi provider belum punya API key.
                          Silahkan set API key di bagian Providers di bawah.
                        </p>
                      )}
                      <Button className="mt-4" variant="outline" onClick={() => {
                        setModelForm({ ...modelForm, type: type.id });
                        setShowAddModel(true);
                      }}>
                        <Plus className="w-4 h-4" />
                        Add Model
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeModelsForType.map(model => {
                        const provider = getProviderForModel(model.providerId);
                        const isActive = active?.id === model.id;

                        return (
                          <div
                            key={model.id}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${isActive
                              ? "border-green-500 bg-green-500/10"
                              : "border-gray-600 hover:border-gray-500 bg-gray-700/30"
                              }`}
                            onClick={() => !isActive && setActiveModel(model.id, model.type)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-500"
                                  }`}>
                                  {isActive && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{model.name}</div>
                                  <div className="text-sm text-gray-400">
                                    <span className="font-mono">{model.modelId}</span>
                                    <span className="mx-2">•</span>
                                    <span>{model.providerName || provider?.name}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  {model.creditCost === 0 ? (
                                    <Badge className="bg-cyan-600">FREE</Badge>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1 text-green-400">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="font-semibold">{model.creditCost}</span>
                                      </div>
                                      <div className="text-xs text-gray-400">credits/use</div>
                                    </>
                                  )}
                                </div>
                                {provider && !provider.hasApiKey && model.creditCost > 0 && (
                                  <Badge className="bg-yellow-600/30 text-yellow-400 border border-yellow-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    No API Key
                                  </Badge>
                                )}
                                {provider && !provider.hasApiKey && model.creditCost > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-yellow-500 border-yellow-500/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowApiKeyModal(model.providerId);
                                    }}
                                  >
                                    <Settings className="w-4 h-4" />
                                    Set API Key
                                  </Button>
                                )}
                                {(provider?.hasApiKey || model.creditCost === 0) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-400 border-blue-500/50 hover:bg-blue-500/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      testModel(model.id, model.name);
                                    }}
                                    disabled={testingModelId === model.id}
                                  >
                                    {testingModelId === model.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Zap className="w-4 h-4" />
                                    )}
                                    Test
                                  </Button>
                                )}
                                {provider?.hasApiKey && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowApiKeyModal(model.providerId);
                                    }}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteModel(model.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Providers List */}
      <Card className="bg-gray-800 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Configured Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No providers configured yet</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map(provider => (
                <div key={provider.id} className="p-4 rounded-lg bg-gray-700/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{provider.name}</div>
                    <div className="text-xs text-gray-400">{provider.apiBaseUrl}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.hasApiKey ? (
                      <Badge className="bg-green-500/20 text-green-400">API Key Set</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400">No API Key</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowApiKeyModal(provider.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Provider Modal */}
      <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add AI Provider</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih preset atau konfigurasi manual
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Preset Provider</Label>
              <Select value={providerForm.preset} onValueChange={handlePresetSelect}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Pilih preset..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_PROVIDERS.map(p => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.displayName} ({p.types.join(", ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="OpenAI"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={providerForm.type} onValueChange={(v) => setProviderForm({ ...providerForm, type: v })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_TYPES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                    <SelectItem value="multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={providerForm.apiBaseUrl}
                onChange={(e) => setProviderForm({ ...providerForm, apiBaseUrl: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={providerForm.apiKey}
                  onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                  className="bg-gray-700 border-gray-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProvider(false)}>Cancel</Button>
            <Button onClick={saveProvider} disabled={isSaving || !providerForm.name}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Modal */}
      <Dialog open={showAddModel} onOpenChange={setShowAddModel}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add AI Model</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tambah model baru ke provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={modelForm.providerId} onValueChange={(v) => setModelForm({ ...modelForm, providerId: v })}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Pilih provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model Type</Label>
              <Select value={modelForm.type} onValueChange={(v) => setModelForm({ ...modelForm, type: v })}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                  <SelectItem value="multimodal">Multimodal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model ID</Label>
              <Input
                placeholder="gpt-4o-mini / flux-pro / etc"
                value={modelForm.modelId}
                onChange={(e) => setModelForm({ ...modelForm, modelId: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="GPT-4o Mini"
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Cost</Label>
              <Input
                type="number"
                value={modelForm.creditCost}
                onChange={(e) => setModelForm({ ...modelForm, creditCost: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModel(false)}>Cancel</Button>
            <Button onClick={saveModel} disabled={isSaving || !modelForm.modelId || !modelForm.providerId}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Modal */}
      <Dialog open={!!showApiKeyModal} onOpenChange={() => { setShowApiKeyModal(null); setTestStatus(null); }}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Configure API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              {providers.find(p => p.id === showApiKeyModal)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-... atau key lainnya"
                  value={apiKeyInput}
                  onChange={(e) => { setApiKeyInput(e.target.value); setTestStatus(null); }}
                  className="bg-gray-700 border-gray-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">API key akan dienkripsi dan disimpan dengan aman</p>
            </div>

            {/* Test Status */}
            {testStatus && (
              <div className={`p-3 rounded-lg text-sm ${testStatus.status === "success"
                ? "bg-green-900/30 border border-green-700 text-green-300"
                : "bg-red-900/30 border border-red-700 text-red-300"
                }`}>
                {testStatus.status === "success" ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {testStatus.message}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {testStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* Current Status */}
            {showApiKeyModal && (
              <div className="p-3 rounded-lg bg-gray-700/50 text-sm">
                <p className="text-gray-400">
                  Status: {providers.find(p => p.id === showApiKeyModal)?.hasApiKey
                    ? <span className="text-green-400">API Key tersimpan</span>
                    : <span className="text-yellow-400">Belum ada API Key</span>
                  }
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowApiKeyModal(null); setApiKeyInput(""); setTestStatus(null); }}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => showApiKeyModal && testApiKey(showApiKeyModal)}
              disabled={isTesting}
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Test Connection
            </Button>
            <Button onClick={() => showApiKeyModal && saveApiKey(showApiKeyModal)} disabled={isSaving || !apiKeyInput}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

