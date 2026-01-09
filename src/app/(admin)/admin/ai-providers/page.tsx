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

interface ActiveSubcategoryModel {
  id: string;
  subcategory: string;
  model_id: string;
  model_name: string;
  model_api_id: string;
  model_type: string;
  credit_cost: number;
  provider_name: string;
  provider_id: string;
}

type ModelType = "text" | "image" | "video" | "audio" | "multimodal";

interface ActiveModels {
  [key: string]: AIModel | null;
}

// Subcategories with their display info
// Each subcategory can have its own active model
const SUBCATEGORIES = [
  // LLM
  { id: "llm", label: "LLM (Chat)", icon: Sparkles, type: "text", description: "GPT, Claude, Gemini, DeepSeek" },

  // Image subcategories
  { id: "text-to-image", label: "Text to Image", icon: Image, type: "image", description: "DALL-E, FLUX, Stable Diffusion" },
  { id: "image-to-image", label: "Image to Image", icon: Image, type: "image", description: "ControlNet, img2img" },
  { id: "inpainting", label: "Inpainting", icon: Image, type: "image", description: "Edit bagian gambar dengan mask" },
  { id: "face-swap", label: "Face Swap", icon: Image, type: "image", description: "Tukar wajah di gambar" },
  { id: "interior", label: "Interior Design", icon: Image, type: "image", description: "AI Interior design" },

  // Video subcategories
  { id: "text-to-video", label: "Text to Video", icon: Video, type: "video", description: "Runway, Pika, Kling, Luma" },
  { id: "image-to-video", label: "Image to Video", icon: Video, type: "video", description: "Animate gambar jadi video" },
  { id: "face-swap-video", label: "Face Swap Video", icon: Video, type: "video", description: "Deepfake video" },

  // Audio subcategories
  { id: "text-to-speech", label: "Text to Speech", icon: Music, type: "audio", description: "ElevenLabs, OpenAI TTS" },
  { id: "voice-cloning", label: "Voice Cloning", icon: Music, type: "audio", description: "Clone suara" },
  { id: "text-to-music", label: "Text to Music", icon: Music, type: "audio", description: "Suno, Udio" },

  // 3D subcategories
  { id: "text-to-3d", label: "Text to 3D", icon: Sparkles, type: "multimodal", description: "Meshy, Shap-E" },
  { id: "image-to-3d", label: "Image to 3D", icon: Sparkles, type: "multimodal", description: "TripoSR" },
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
  const [activeSubcategoryModels, setActiveSubcategoryModels] = useState<ActiveSubcategoryModel[]>([]);
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
      const [providersRes, modelsRes, activeSubRes] = await Promise.all([
        fetch("/api/admin/ai-providers"),
        fetch("/api/admin/ai-providers/models"),
        fetch("/api/admin/ai-providers/active-models"),
      ]);

      const providersData = await providersRes.json();
      const modelsData = await modelsRes.json();
      const activeSubData = await activeSubRes.json();

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
      if (activeSubData.success) {
        setActiveSubcategoryModels(activeSubData.activeModels || []);
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

  // Set active model for a specific subcategory
  async function setActiveSubcategoryModel(subcategory: string, modelId: string) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers/active-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategory, modelId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Active model untuk ${subcategory} berhasil diset!`);
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

  // Get active model for a subcategory
  function getActiveModelForSubcategory(subcategory: string): ActiveSubcategoryModel | undefined {
    return activeSubcategoryModels.find(m => m.subcategory === subcategory);
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

  // Get subcategory ID from model_id (returns the actual ID used in ai_active_models table)
  function getSubcategoryIdFromModelId(modelId: string): string {
    // Video subcategories
    if (modelId.includes('text-to-video')) return 'text-to-video';
    if (modelId.includes('image-to-video') || modelId === 'scene-maker') return 'image-to-video';
    if (modelId.includes('video-swap') || modelId.includes('face-swap-video')) return 'face-swap-video';
    if (modelId.includes('watermark')) return 'video-editing';

    // Image subcategories  
    if (modelId.includes('text-to-image') || modelId.includes('flux')) return 'text-to-image';
    if (modelId.includes('image-to-image') || modelId === 'controlnet') return 'image-to-image';
    if (modelId.includes('inpaint')) return 'inpainting';
    if (modelId.includes('face-swap') && !modelId.includes('video')) return 'face-swap';
    if (modelId.includes('interior') || modelId.includes('floor') || modelId.includes('room') ||
      modelId.includes('exterior') || modelId.includes('scenario') || modelId.includes('sketch') ||
      modelId.includes('object-removal') || modelId.includes('mixer')) return 'interior';

    // 3D subcategories
    if (modelId.includes('text-to-3d')) return 'text-to-3d';
    if (modelId.includes('image-to-3d')) return 'image-to-3d';

    // Audio subcategories
    if (modelId.includes('tts') || modelId.includes('text-to-speech')) return 'text-to-speech';
    if (modelId.includes('voice') || modelId.includes('clone')) return 'voice-cloning';
    if (modelId.includes('music') || modelId.includes('suno') || modelId.includes('udio')) return 'text-to-music';

    // LLM
    return 'llm';
  }

  // Get all models for a specific subcategory
  function getModelsForSubcategory(subcategoryId: string) {
    return allModels.filter(m => getSubcategoryIdFromModelId(m.modelId) === subcategoryId);
  }

  // Get models for subcategory that have providers with active API keys
  function getActiveModelsForSubcategory(subcategoryId: string) {
    return allModels.filter(m => {
      if (getSubcategoryIdFromModelId(m.modelId) !== subcategoryId) return false;
      const provider = providers.find(p => p.id === m.providerId);
      return provider?.hasApiKey || m.creditCost === 0;
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

      {/* Active Models Summary - per subcategory */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Active Models per Subcategory
            <Badge className="bg-green-500/20 text-green-400 ml-2">
              {activeSubcategoryModels.length}/{SUBCATEGORIES.length} configured
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {SUBCATEGORIES.map(sub => {
              const Icon = sub.icon;
              const activeSub = getActiveModelForSubcategory(sub.id);
              const modelsAvailable = getActiveModelsForSubcategory(sub.id);

              return (
                <div key={sub.id} className={`p-3 rounded-lg ${activeSub ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-gray-300 truncate">{sub.label}</span>
                  </div>
                  {activeSub ? (
                    <div>
                      <div className="font-semibold text-white text-sm truncate">{activeSub.model_name}</div>
                      <div className="text-xs text-gray-400 truncate">{activeSub.provider_name}</div>
                    </div>
                  ) : (
                    <div className="text-yellow-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {modelsAvailable.length > 0 ? `${modelsAvailable.length} tersedia` : 'Tidak ada'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      {/* Model Selection by Subcategory */}
      <div className="space-y-4">
        {SUBCATEGORIES.map(sub => {
          const Icon = sub.icon;
          const allSubModels = getModelsForSubcategory(sub.id);
          const activeSubModels = getActiveModelsForSubcategory(sub.id);
          const activeSub = getActiveModelForSubcategory(sub.id);
          const isExpanded = expandedType === sub.id;

          // Skip if no models
          if (allSubModels.length === 0) return null;

          return (
            <Card key={sub.id} className="bg-gray-800 border-gray-700">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedType(isExpanded ? "" : sub.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{sub.label}</CardTitle>
                      <p className="text-xs text-gray-400">{sub.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-600/50 text-gray-300 text-xs">
                      {activeSubModels.length}/{allSubModels.length} ready
                    </Badge>
                    {activeSub ? (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        {activeSub.model_name}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Belum dipilih
                      </Badge>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  {activeSubModels.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <p>Belum ada model dengan API key aktif untuk {sub.label}</p>
                      {allSubModels.length > 0 && (
                        <p className="text-sm text-yellow-500 mt-2">
                          {allSubModels.length} model tersedia, tapi provider belum punya API key.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeSubModels.map(model => {
                        const provider = getProviderForModel(model.providerId);
                        const isActive = activeSub?.model_id === model.id;

                        return (
                          <div
                            key={model.id}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${isActive
                              ? "border-green-500 bg-green-500/10"
                              : "border-gray-600 hover:border-gray-500 bg-gray-700/30"
                              }`}
                            onClick={() => !isActive && setActiveSubcategoryModel(sub.id, model.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-500"
                                  }`}>
                                  {isActive && <Check className="w-2 h-2 text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium text-white text-sm">{model.name}</div>
                                  <div className="text-xs text-gray-400">
                                    <span className="font-mono">{model.modelId}</span>
                                    <span className="mx-1">•</span>
                                    <span>{model.providerName || provider?.name}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {model.creditCost === 0 ? (
                                  <Badge className="bg-cyan-600 text-xs">FREE</Badge>
                                ) : (
                                  <div className="flex items-center gap-1 text-green-400 text-xs">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="font-semibold">{model.creditCost}</span>
                                  </div>
                                )}
                                {(provider?.hasApiKey || model.creditCost === 0) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-400 border-blue-500/50 hover:bg-blue-500/20 h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      testModel(model.id, model.name);
                                    }}
                                    disabled={testingModelId === model.id}
                                  >
                                    {testingModelId === model.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Zap className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
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
                    <SelectItem value="text">Text/LLM</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
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
      </Dialog >

      {/* Add Model Modal */}
      < Dialog open={showAddModel} onOpenChange={setShowAddModel} >
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
                  <SelectItem value="text">Text/LLM</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
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
      </Dialog >

      {/* API Key Modal */}
      < Dialog open={!!showApiKeyModal} onOpenChange={() => { setShowApiKeyModal(null); setTestStatus(null); }}>
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
      </Dialog >
    </div >
  );
}

