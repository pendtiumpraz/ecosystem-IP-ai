"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bot, Plus, Settings, Eye, EyeOff, Loader2, Check, X,
  Sparkles, Image, Video, Music, AlertCircle, RefreshCw,
  DollarSign, Zap, Server
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

interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  providerType: string;
  baseUrl: string;
  isEnabled: boolean;
  isDefault: boolean;
  modelsCount: number;
  createdAt: string;
}

interface AIModel {
  id: string;
  providerId: string;
  modelId: string;
  displayName: string;
  modelType: string;
  creditCostPerUse: number;
  isEnabled: boolean;
  isDefault: boolean;
}

const PROVIDER_TYPES = ["text", "image", "video", "audio"];

const PROVIDER_ICONS: Record<string, any> = {
  text: Sparkles,
  image: Image,
  video: Video,
  audio: Music,
};

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [providerForm, setProviderForm] = useState({
    name: "",
    displayName: "",
    providerType: "text",
    baseUrl: "",
    apiKey: "",
  });

  const [modelForm, setModelForm] = useState({
    providerId: "",
    modelId: "",
    displayName: "",
    modelType: "text",
    creditCostPerUse: 5,
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchModels(selectedProvider);
    }
  }, [selectedProvider]);

  async function fetchProviders() {
    try {
      const res = await fetch("/api/admin/ai-providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
        if (data.providers.length > 0 && !selectedProvider) {
          setSelectedProvider(data.providers[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch providers:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchModels(providerId: string) {
    try {
      const res = await fetch(`/api/admin/ai-providers/models?providerId=${providerId}`);
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
      }
    } catch (e) {
      console.error("Failed to fetch models:", e);
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
        setShowProviderModal(false);
        setProviderForm({ name: "", displayName: "", providerType: "text", baseUrl: "", apiKey: "" });
        fetchProviders();
      } else {
        alert(data.error || "Failed to save provider");
      }
    } catch (e) {
      alert("Network error");
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
        body: JSON.stringify({ ...modelForm, providerId: selectedProvider }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModelModal(false);
        setModelForm({ providerId: "", modelId: "", displayName: "", modelType: "text", creditCostPerUse: 5 });
        if (selectedProvider) fetchModels(selectedProvider);
      } else {
        alert(data.error || "Failed to save model");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProviderStatus(providerId: string, isEnabled: boolean) {
    try {
      await fetch("/api/admin/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: providerId, isEnabled }),
      });
      fetchProviders();
    } catch (e) {
      console.error("Failed to update provider:", e);
    }
  }

  async function toggleModelStatus(modelId: string, isEnabled: boolean) {
    try {
      await fetch("/api/admin/ai-providers/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modelId, isEnabled }),
      });
      if (selectedProvider) fetchModels(selectedProvider);
    } catch (e) {
      console.error("Failed to update model:", e);
    }
  }

  async function testProvider(providerId: string) {
    try {
      const res = await fetch(`/api/admin/ai-providers/test?providerId=${providerId}`);
      const data = await res.json();
      alert(data.success ? "Provider is working!" : `Error: ${data.error}`);
    } catch (e) {
      alert("Test failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-violet-400" />
            AI Providers
          </h1>
          <p className="text-gray-400">Manage AI providers and models</p>
        </div>
        <Button onClick={() => setShowProviderModal(true)}>
          <Plus className="w-4 h-4" />
          Add Provider
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Providers List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Providers</h2>
          {providers.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No providers configured</p>
                <Button className="mt-4" onClick={() => setShowProviderModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add First Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => {
              const Icon = PROVIDER_ICONS[provider.providerType] || Bot;
              return (
                <Card
                  key={provider.id}
                  className={`bg-gray-800 border-gray-700 cursor-pointer transition-colors ${
                    selectedProvider === provider.id ? "border-violet-500" : "hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${provider.providerType === "text" ? "blue" : provider.providerType === "image" ? "green" : "violet"}-500/20 flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{provider.displayName}</h3>
                          <p className="text-xs text-gray-400">{provider.name}</p>
                        </div>
                      </div>
                      <Switch
                        checked={provider.isEnabled}
                        onCheckedChange={(checked) => toggleProviderStatus(provider.id, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{provider.modelsCount} models</span>
                      <div className="flex gap-2">
                        <Badge variant={provider.isEnabled ? "success" : "secondary"} className={provider.isEnabled ? "bg-green-500/20 text-green-400" : "bg-gray-600"}>
                          {provider.isEnabled ? "Active" : "Disabled"}
                        </Badge>
                        {provider.isDefault && (
                          <Badge className="bg-violet-500/20 text-violet-400">Default</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Models List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Models {selectedProvider && `(${providers.find(p => p.id === selectedProvider)?.displayName})`}
            </h2>
            {selectedProvider && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => testProvider(selectedProvider)}>
                  <Zap className="w-4 h-4" />
                  Test
                </Button>
                <Button size="sm" onClick={() => setShowModelModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Model
                </Button>
              </div>
            )}
          </div>

          {!selectedProvider ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center text-gray-400">
                Select a provider to view models
              </CardContent>
            </Card>
          ) : models.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center text-gray-400">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No models configured</p>
                <Button className="mt-4" onClick={() => setShowModelModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Model
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {models.map((model) => (
                <Card key={model.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white">{model.displayName}</h3>
                        <p className="text-xs text-gray-400 font-mono">{model.modelId}</p>
                      </div>
                      <Switch
                        checked={model.isEnabled}
                        onCheckedChange={(checked) => toggleModelStatus(model.id, checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{model.creditCostPerUse} credits</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400">{model.modelType}</Badge>
                        {model.isDefault && (
                          <Badge className="bg-violet-500/20 text-violet-400">Default</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Provider Modal */}
      <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add AI Provider</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure a new AI provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input
                  placeholder="openai"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="OpenAI"
                  value={providerForm.displayName}
                  onChange={(e) => setProviderForm({ ...providerForm, displayName: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={providerForm.providerType} onValueChange={(v) => setProviderForm({ ...providerForm, providerType: v })}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={providerForm.baseUrl}
                onChange={(e) => setProviderForm({ ...providerForm, baseUrl: e.target.value })}
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
            <Button variant="outline" onClick={() => setShowProviderModal(false)}>Cancel</Button>
            <Button onClick={saveProvider} disabled={isSaving || !providerForm.name}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Modal */}
      <Dialog open={showModelModal} onOpenChange={setShowModelModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Model</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new model to the provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Model ID</Label>
              <Input
                placeholder="gpt-4o-mini"
                value={modelForm.modelId}
                onChange={(e) => setModelForm({ ...modelForm, modelId: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                placeholder="GPT-4o Mini"
                value={modelForm.displayName}
                onChange={(e) => setModelForm({ ...modelForm, displayName: e.target.value })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={modelForm.modelType} onValueChange={(v) => setModelForm({ ...modelForm, modelType: v })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Credit Cost</Label>
                <Input
                  type="number"
                  value={modelForm.creditCostPerUse}
                  onChange={(e) => setModelForm({ ...modelForm, creditCostPerUse: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModelModal(false)}>Cancel</Button>
            <Button onClick={saveModel} disabled={isSaving || !modelForm.modelId}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
