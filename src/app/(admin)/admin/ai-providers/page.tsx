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
  { id: "llm", label: "LLM (Chat)", icon: Sparkles, type: "text", description: "GPT, Claude, Gemini, DeepSeek, Mistral" },

  // Image Generation subcategories (42+ models)
  { id: "text-to-image", label: "Text to Image", icon: Image, type: "image", description: "FLUX, DALL-E, Stable Diffusion, Imagen" },
  { id: "image-to-image", label: "Image to Image", icon: Image, type: "image", description: "img2img, Background Removal" },
  { id: "controlnet", label: "ControlNet", icon: Image, type: "image", description: "Canny, Pose, Depth, Scribble" },
  { id: "inpainting", label: "Inpainting", icon: Image, type: "image", description: "Hapus/ubah bagian gambar" },
  { id: "outpainting", label: "Outpainting", icon: Image, type: "image", description: "Extend canvas gambar" },
  { id: "upscaling", label: "Upscaling", icon: Image, type: "image", description: "Super Resolution, Image Enhancement" },

  // Face/Avatar subcategories
  { id: "face-swap", label: "Face Swap (Image)", icon: Image, type: "image", description: "DeepFake, Avatar, Headshot" },
  { id: "face-swap-video", label: "Face Swap (Video)", icon: Video, type: "video", description: "DeepFake video" },

  // Video subcategories (48+ models)
  { id: "text-to-video", label: "Text to Video", icon: Video, type: "video", description: "Wan 2.1, CogVideoX, Veo 2, Kling" },
  { id: "image-to-video", label: "Image to Video", icon: Video, type: "video", description: "Runway Gen4, Luma, AnimateDiff" },
  { id: "video-to-video", label: "Video to Video", icon: Video, type: "video", description: "Style transfer, video editing" },
  { id: "lip-sync", label: "Lip Sync", icon: Video, type: "video", description: "Sinkronisasi bibir dengan audio" },
  { id: "dubbing", label: "Dubbing", icon: Video, type: "video", description: "AI dubbing video" },

  // Audio subcategories (20+ models)
  { id: "text-to-speech", label: "Text to Speech", icon: Music, type: "audio", description: "ElevenLabs, OpenAI TTS" },
  { id: "speech-to-text", label: "Speech to Text", icon: Music, type: "audio", description: "Whisper, Transcription" },
  { id: "voice-cloning", label: "Voice Cloning", icon: Music, type: "audio", description: "Clone & change voice" },
  { id: "text-to-music", label: "Music Generation", icon: Music, type: "audio", description: "Suno, Udio, AI Music" },
  { id: "text-to-sfx", label: "Sound Effects", icon: Music, type: "audio", description: "Foley, AI sound effects" },
  { id: "song-edit", label: "Song Editing", icon: Music, type: "audio", description: "Vocal isolation, stems, remix" },

  // 3D subcategories
  { id: "text-to-3d", label: "Text to 3D", icon: Sparkles, type: "multimodal", description: "Meshy, AI 3D mesh generation" },
  { id: "image-to-3d", label: "Image to 3D", icon: Sparkles, type: "multimodal", description: "Convert image ke 3D model" },

  // Specialty subcategories
  { id: "interior", label: "AI Interior", icon: Image, type: "image", description: "Room design, floor plan, staging" },
  { id: "virtual-try-on", label: "Virtual Try-On", icon: Image, type: "image", description: "Fashion, clothes try-on" },
  { id: "image-to-text", label: "Image to Text", icon: Sparkles, type: "text", description: "Image description, OCR, caption" },
  { id: "training", label: "Model Training", icon: Sparkles, type: "multimodal", description: "LoRA, DreamBooth, fine-tuning" },
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
        toast.success("API Key berhasil disimpan!");
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

  async function clearApiKey(providerId: string) {
    // Close the modal first to avoid conflicts
    setShowApiKeyModal(null);
    setApiKeyInput("");
    setTestStatus(null);

    // Use simple confirm to avoid modal conflicts
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus API Key untuk provider ini?\n\nSemua model dari provider ini tidak akan bisa digunakan."
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: providerId, apiKey: "" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("API Key berhasil dihapus!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to clear API key");
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
    const lowerId = modelId.toLowerCase();

    // ========== New Model ID Suffix Detection ==========
    // Models with -t2v, -i2v, -i2i suffixes
    if (lowerId.endsWith('-t2v') || lowerId.includes('-t2v-')) return 'text-to-video';
    if (lowerId.endsWith('-i2v') || lowerId.includes('-i2v-')) return 'image-to-video';
    if (lowerId.endsWith('-i2i') || lowerId.includes('-i2i-') || lowerId.includes('-img-edit')) return 'image-to-image';

    // ========== v6/v7 API Path Based Detection ==========

    // Video paths - extended with more keywords
    if (lowerId.includes('v7/video-fusion/text-to-video') || lowerId.includes('v6/video/text2video') ||
      lowerId.includes('cogvideo') || lowerId.includes('kling') || lowerId.includes('minimax') ||
      lowerId.includes('hunyuan') || lowerId.includes('ltx') || lowerId.includes('mochi') ||
      lowerId.includes('wan-') && lowerId.includes('t2v') ||
      lowerId.includes('veo-') && !lowerId.includes('-i2v') ||
      lowerId.includes('seedance') && lowerId.includes('t2v') ||
      lowerId.includes('sora') && lowerId.includes('t2v')) return 'text-to-video';

    if (lowerId.includes('v7/video-fusion/image-to-video') || lowerId.includes('v6/video/img2video') ||
      lowerId.includes('scene_maker') || lowerId.includes('runway') || lowerId.includes('luma') ||
      lowerId.includes('pika') || lowerId.includes('animate') || lowerId.includes('svd') ||
      lowerId.includes('omnihuman') ||
      lowerId.includes('wan-') && lowerId.includes('i2v') ||
      lowerId.includes('veo-') && lowerId.includes('i2v') ||
      lowerId.includes('seedance') && lowerId.includes('i2v')) return 'image-to-video';

    if (lowerId.includes('v7/video-fusion/video-to-video') || lowerId.includes('v6/video/vid2vid')) return 'video-to-video';
    if (lowerId.includes('v7/video-fusion/lip-sync') || lowerId.includes('v6/video/lip') || lowerId.includes('lip-sync')) return 'lip-sync';

    // Voice/Audio paths
    if (lowerId.includes('v7/voice/text-to-speech') || lowerId.includes('v6/voice/text_to_audio') ||
      lowerId.includes('tts') || lowerId.includes('eleven_labs') || lowerId.includes('openai-tts')) return 'text-to-speech';
    if (lowerId.includes('v7/voice/speech-to-text') || lowerId.includes('v6/voice/whisper') || lowerId.includes('whisper')) return 'speech-to-text';
    if (lowerId.includes('v7/voice/speech-to-speech') || lowerId.includes('v6/voice/voice_to_voice') ||
      lowerId.includes('voice_cover') || lowerId.includes('v6/voice/clone') || lowerId.includes('voice-changer')) return 'voice-cloning';
    if (lowerId.includes('v7/voice/music-gen') || lowerId.includes('v6/voice/music_gen') ||
      lowerId.includes('suno') || lowerId.includes('udio') || lowerId.includes('song_gen') ||
      lowerId.includes('instrumental') || lowerId.includes('jukebox') || lowerId.includes('ace-step')) return 'text-to-music';
    if (lowerId.includes('v7/voice/sound-generation') || lowerId.includes('v6/voice/sfx') ||
      lowerId.includes('foley') || lowerId.includes('sound-effect')) return 'text-to-sfx';
    if (lowerId.includes('v7/voice/song-extender') || lowerId.includes('v7/voice/song-inpaint') ||
      lowerId.includes('v6/voice/vocals_isolate') || lowerId.includes('v6/voice/stems') ||
      lowerId.includes('remix') || lowerId.includes('pitch-shift') || lowerId.includes('tempo-changer')) return 'song-edit';
    if (lowerId.includes('v7/voice/create-dubbing') || lowerId.includes('v6/voice/dubbing')) return 'dubbing';

    // Image to Image - extended detection
    if (lowerId.includes('v6/images/img2img') || lowerId.includes('v6/realtime/img2img') ||
      lowerId.includes('removebg') || lowerId.includes('replace_bg') || lowerId.includes('relighting') ||
      lowerId.includes('colorize') || lowerId.includes('v6/image_editing/removebg') ||
      lowerId.includes('v6/image_editing/replace_bg') || lowerId.includes('v6/image_editing/relighting') ||
      lowerId.includes('v6/image_editing/face_restore') || lowerId.includes('v6/image_editing/colorize') ||
      lowerId.includes('kontext') || lowerId.includes('qwen-i2i') || lowerId.includes('qwen-img-edit') ||
      lowerId.includes('seededit') || lowerId.includes('controlnet_img2img') ||
      lowerId.includes('nano-banana') && lowerId.includes('edit')) return 'image-to-image';

    // Image generation paths
    if (lowerId.includes('v6/images/text2img') || lowerId.includes('v6/realtime/text2img') || lowerId.includes('v6/images/imagen')) return 'text-to-image';

    // Image editing paths - inpainting, outpainting, upscaling
    if (lowerId.includes('v6/image_editing/inpaint') || lowerId.includes('object_removal') ||
      lowerId.includes('object-remover') || lowerId.includes('interior-mixer') || lowerId.includes('sketch-renderer')) return 'inpainting';
    if (lowerId.includes('v6/image_editing/outpaint') || lowerId.includes('outpainting')) return 'outpainting';
    if (lowerId.includes('v6/image_editing/super_resolution') || lowerId.includes('v6/image_editing/enhance') ||
      lowerId.includes('v6/image_editing/restore') || lowerId.includes('upscal') || lowerId.includes('image-enhancer')) return 'upscaling';

    // ControlNet paths
    if (lowerId === 'canny' || lowerId === 'hed' || lowerId === 'mlsd' || lowerId === 'normal' ||
      lowerId === 'openpose' || lowerId === 'scribble' || lowerId === 'segmentation' ||
      lowerId === 'depth' || lowerId === 'lineart' || lowerId === 'softedge' || lowerId.includes('ip-adapter')) return 'controlnet';

    // DeepFake paths
    if (lowerId.includes('v6/deepfake/video_swap')) return 'face-swap-video';
    if (lowerId.includes('v6/deepfake/') || lowerId.includes('v6/headshot/') ||
      lowerId.includes('face_swap') || lowerId.includes('face_gen') || lowerId.includes('multi_face') ||
      lowerId.includes('ai-avatar') || lowerId.includes('headshot') || lowerId.includes('avatar-gen')) return 'face-swap';

    // Interior paths
    if (lowerId.includes('v6/interior/') || lowerId.includes('staging') || lowerId.includes('renovation') ||
      lowerId.includes('kitchen') || lowerId.includes('bathroom') || lowerId.includes('living_room')) return 'interior';

    // Fashion/Virtual Try-On paths
    if (lowerId.includes('v6/fashion/') || lowerId.includes('tryon') || lowerId.includes('try-on') ||
      lowerId.includes('clothes') || lowerId.includes('outfit') || lowerId.includes('fashion-model')) return 'virtual-try-on';

    // 3D paths
    if (lowerId.includes('v6/3d/text_to_3d') || lowerId.includes('mesh_gen') || lowerId.includes('v6/3d/texture') ||
      (lowerId.includes('3d') && !lowerId.includes('image'))) return 'text-to-3d';
    if (lowerId.includes('v6/3d/image_to_3d') || (lowerId.includes('3d') && lowerId.includes('image'))) return 'image-to-3d';

    // Trainer paths
    if (lowerId.includes('v6/trainer/') || lowerId.includes('finetune') || lowerId.includes('dreambooth') || lowerId.includes('hypernetwork')) return 'training';

    // Image to Text paths
    if (lowerId.includes('v6/describe/') || lowerId.includes('v6/ocr/') || lowerId.includes('v6/caption/') ||
      lowerId.includes('image-to-text') || lowerId.includes('image-description')) return 'image-to-text';

    // ========== Legacy/General Detection ==========

    // Text to Image - FLUX, SD, and other image gen models  
    if (lowerId.includes('flux') && !lowerId.includes('i2i') && !lowerId.includes('edit') && !lowerId.includes('kontext')) return 'text-to-image';
    if (lowerId.startsWith('sd-') || lowerId.includes('diffusion') || lowerId.includes('sdxl') ||
      lowerId.includes('seedream') && !lowerId.includes('i2i') ||
      lowerId.includes('ideogram') || lowerId.includes('midjourney') || lowerId.includes('dall-e') ||
      lowerId.includes('recraft') || lowerId.includes('playground') || lowerId.includes('qwen-text-to-image') ||
      lowerId.includes('ghibli') || lowerId.includes('nano-banana-pro') && !lowerId.includes('edit')) return 'text-to-image';
    if (lowerId.includes('mix') || lowerId.includes('realistic') || lowerId.includes('anime') ||
      lowerId.includes('protogen') || lowerId.includes('dreamlike') || lowerId.includes('pixel') ||
      lowerId.includes('vector') || lowerId.includes('inkpunk') || lowerId.includes('counterfeit') || lowerId.includes('waifu')) return 'text-to-image';

    // General music/voice
    if (lowerId.includes('music') || lowerId.includes('song') && !lowerId.includes('edit')) return 'text-to-music';
    if (lowerId.includes('voice') || lowerId.includes('clone')) return 'voice-cloning';

    // LLM
    if (lowerId.includes('chat') || lowerId.includes('gpt') || lowerId.includes('claude') ||
      lowerId.includes('gemini') || lowerId.includes('deepseek') || lowerId.includes('llama') || lowerId.includes('mistral')) return 'llm';

    return 'text-to-image'; // Default fallback for image models
  }

  // Helper to check if a model is an LLM
  function isLLMModel(model: AIModel): boolean {
    const lowerId = model.modelId.toLowerCase();
    const lowerName = model.name.toLowerCase();

    // Check by provider - known LLM providers
    const provider = providers.find(p => p.id === model.providerId);
    const providerSlug = provider?.slug?.toLowerCase() || '';
    const isLLMProvider = ['deepseek', 'openai', 'anthropic', 'google', 'routeway', 'zhipu'].includes(providerSlug);

    // Check by model ID patterns
    const hasLLMPattern = lowerId.includes('chat') || lowerId.includes('gpt') || lowerId.includes('claude') ||
      lowerId.includes('gemini') || lowerId.includes('deepseek') || lowerId.includes('llama') ||
      lowerId.includes('mistral') || lowerId.includes('qwen') || lowerId.includes(':free') ||
      lowerId.includes('glm') || lowerId.includes('kimi') || lowerId.includes('nemotron') ||
      lowerId.includes('olympic') || lowerId.includes('devstral') || lowerId.includes('nemo') ||
      lowerId.includes('instruct') || lowerId.includes('reasoner') ||
      lowerName.includes('chat') || lowerName.includes('gpt') || lowerName.includes('claude') ||
      lowerName.includes('gemini') || lowerName.includes('deepseek') || lowerName.includes('llama');

    // If provider is text type and has LLM pattern, it's an LLM
    if (provider?.type === 'text' && hasLLMPattern) return true;

    // If model type is text or llm and has LLM pattern
    if ((model.type === 'text' || model.type === 'llm') && hasLLMPattern) return true;

    // If it's from a known LLM provider
    if (isLLMProvider && (model.type === 'text' || model.type === 'llm')) return true;

    return false;
  }

  // Get all models for a specific subcategory
  // Use the model's 'type' field directly - it's already set correctly during seeding
  // Special case for LLM: models might have type "text" but are actually LLM models
  function getModelsForSubcategory(subcategoryId: string) {
    return allModels.filter(m => {
      // Special case for LLM
      if (subcategoryId === 'llm') {
        return isLLMModel(m);
      }

      // Direct type match for other subcategories
      return m.type === subcategoryId;
    });
  }

  // Get models for subcategory that have providers with active API keys
  function getActiveModelsForSubcategory(subcategoryId: string) {
    return allModels.filter(m => {
      // Check type match
      let typeMatches = false;

      if (subcategoryId === 'llm') {
        typeMatches = isLLMModel(m);
      } else {
        typeMatches = m.type === subcategoryId;
      }

      if (!typeMatches) return false;

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
          <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => { setShowApiKeyModal(null); setApiKeyInput(""); setTestStatus(null); }}>
              Cancel
            </Button>
            {/* Clear API Key button - only show if provider has API key */}
            {showApiKeyModal && providers.find(p => p.id === showApiKeyModal)?.hasApiKey && (
              <Button
                variant="destructive"
                onClick={() => showApiKeyModal && clearApiKey(showApiKeyModal)}
                disabled={isSaving}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Key
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => showApiKeyModal && testApiKey(showApiKeyModal)}
              disabled={isTesting || !apiKeyInput}
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
              Test
            </Button>
            <Button onClick={() => showApiKeyModal && saveApiKey(showApiKeyModal)} disabled={isSaving || !apiKeyInput}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
}

