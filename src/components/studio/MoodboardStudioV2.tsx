'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    LayoutGrid, Palette, Sparkles, Download, AlertCircle,
    Image as ImageIcon, Wand2, Grid3X3, Layers, Eye,
    RefreshCw, Check, X, Trash2, ChevronRight, ChevronDown,
    Camera, Film, Brush, Pencil, Paintbrush, Aperture, Users, MapPin,
    Loader2, Info, Settings2, ListChecks, History, Upload, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { SearchableMoodboardDropdown } from './SearchableMoodboardDropdown';
import { AssetGallery } from './AssetGallery';
import { toast, alert as swalAlert } from '@/lib/sweetalert';

// Types
interface StoryVersion {
    id: string;
    versionName: string;
    structureType: string;
    episodeNumber: number;
    isActive: boolean;
}

interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
}

interface MoodboardItem {
    id: string;
    beatKey: string;
    beatLabel: string;
    beatContent: string | null;
    beatIndex: number;
    keyActionIndex: number;
    keyActionDescription: string | null;
    charactersInvolved: string[];
    universeLevel: string | null;
    prompt: string | null;
    negativePrompt: string | null;
    imageUrl: string | null;
    status: string; // empty, has_description, has_prompt, has_image
}

interface Moodboard {
    id: string;
    projectId: string;
    storyVersionId: string;
    versionName: string;
    artStyle: string;
    keyActionCount: number;
    items: MoodboardItem[];
}

interface MoodboardPrerequisites {
    hasUniverse: boolean;
    hasStoryBeats: boolean;
    hasCharacters: boolean;
    canCreate: boolean;
}

interface MoodboardStudioV2Props {
    projectId: string;
    userId: string;
    storyVersions: StoryVersion[];
    characters: Character[];
    onMoodboardChange?: () => void;
}

// Art Style Options
const ART_STYLES = [
    { id: 'realistic', label: 'Realistic', icon: Camera, desc: 'Cinematic, photorealistic' },
    { id: 'anime', label: 'Anime', icon: Sparkles, desc: 'Japanese animation style' },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Brush, desc: 'Miyazaki-inspired watercolor' },
    { id: 'disney', label: 'Disney/Pixar', icon: Film, desc: '3D animated movie style' },
    { id: 'comic', label: 'Comic Book', icon: Grid3X3, desc: 'Bold lines, dynamic poses' },
    { id: 'noir', label: 'Film Noir', icon: Aperture, desc: 'High contrast, moody shadows' },
];

// Universe level icons
const UNIVERSE_ICONS: Record<string, string> = {
    room_cave: '🛏️',
    house_castle: '🏠',
    private_interior: '🚪',
    private_exterior: '🌳',
    village_kingdom: '🏘️',
    city_galaxy: '🌆',
    nature_cosmos: '🌌',
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
    empty: 'bg-gray-200 text-gray-600',
    has_description: 'bg-blue-100 text-blue-600',
    has_prompt: 'bg-amber-100 text-amber-600',
    has_image: 'bg-emerald-100 text-emerald-600',
    has_video: 'bg-purple-100 text-purple-600',
};

// Aspect Ratio Options
const ASPECT_RATIOS = [
    { id: '16:9', label: '16:9', desc: 'Landscape (Cinematic)' },
    { id: '9:16', label: '9:16', desc: 'Portrait (Mobile)' },
    { id: '4:3', label: '4:3', desc: 'Standard' },
    { id: '3:4', label: '3:4', desc: 'Portrait Standard' },
    { id: '3:2', label: '3:2', desc: 'Photo' },
    { id: '2:3', label: '2:3', desc: 'Portrait Photo' },
    { id: '1:1', label: '1:1', desc: 'Square' },
];

// Helper function to get CSS aspect ratio class
const getAspectRatioStyle = (ratio: string): React.CSSProperties => {
    const ratioMap: Record<string, string> = {
        '1:1': '1/1',
        '16:9': '16/9',
        '9:16': '9/16',
        '4:3': '4/3',
        '3:4': '3/4',
        '21:9': '21/9',
        '3:2': '3/2',
        '2:3': '2/3',
    };
    return { aspectRatio: ratioMap[ratio] || '16/9' };
};

export function MoodboardStudioV2({
    projectId,
    userId,
    storyVersions,
    characters,
    onMoodboardChange,
}: MoodboardStudioV2Props) {
    // State
    const [selectedVersionId, setSelectedVersionId] = useState<string>('');
    const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
    const [moodboardVersions, setMoodboardVersions] = useState<any[]>([]);
    const [selectedMoodboardVersion, setSelectedMoodboardVersion] = useState<number | null>(null);
    const [prerequisites, setPrerequisites] = useState<MoodboardPrerequisites | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    const [expandedBeats, setExpandedBeats] = useState<Record<string, boolean>>({});
    const [showSettings, setShowSettings] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMoodboardName, setNewMoodboardName] = useState('');
    const [newArtStyle, setNewArtStyle] = useState('realistic');
    const [newKeyActionCount, setNewKeyActionCount] = useState(7);
    const [moodboardName, setMoodboardName] = useState(''); // For editing in settings
    const [artStyle, setArtStyle] = useState('realistic');
    const [keyActionCount, setKeyActionCount] = useState(7);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    // Generation mode settings - controls which buttons are visible
    const [keyActionGenMode, setKeyActionGenMode] = useState<'all' | 'per_beat'>('all');
    const [promptGenMode, setPromptGenMode] = useState<'all' | 'per_beat'>('per_beat');
    const [imageGenMode, setImageGenMode] = useState<'per_beat' | 'per_item'>('per_beat');
    const [deletedMoodboards, setDeletedMoodboards] = useState<any[]>([]);
    const [storyVersionSearch, setStoryVersionSearch] = useState('');
    // Item detail modal state
    const [selectedItemForDetail, setSelectedItemForDetail] = useState<MoodboardItem | null>(null);
    const [itemImageVersions, setItemImageVersions] = useState<any[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [uploadImageUrl, setUploadImageUrl] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generation progress state
    const [generationProgress, setGenerationProgress] = useState<{
        isActive: boolean;
        type: 'key_actions' | 'prompts' | 'images' | null;
        currentIndex: number;
        totalCount: number;
        currentLabel: string;
        currentBeat: string;
        lastGeneratedImage: string | null;
        errors: string[];
    }>({
        isActive: false,
        type: null,
        currentIndex: 0,
        totalCount: 0,
        currentLabel: '',
        currentBeat: '',
        lastGeneratedImage: null,
        errors: [],
    });

    // Credit management state
    const [userCredits, setUserCredits] = useState<number>(0);
    const [isLoadingCredits, setIsLoadingCredits] = useState(false);

    // Credit costs for moodboard operations
    const CREDIT_COSTS = {
        key_action: 5,      // Per beat
        prompt: 3,          // Per beat
        image: 12,          // Per image
    };

    // Using SweetAlert toast for errors instead of state
    // Local edits for items (before saving)
    const [localEdits, setLocalEdits] = useState<Record<string, { description?: string; prompt?: string }>>({});

    // Load generation mode settings from localStorage on mount
    useEffect(() => {
        const savedModes = localStorage.getItem('moodboard_gen_modes');
        if (savedModes) {
            try {
                const modes = JSON.parse(savedModes);
                if (modes.keyActionGenMode) setKeyActionGenMode(modes.keyActionGenMode);
                if (modes.promptGenMode) setPromptGenMode(modes.promptGenMode);
                if (modes.imageGenMode) setImageGenMode(modes.imageGenMode);
            } catch (e) {
                console.error('Failed to parse generation modes:', e);
            }
        }
    }, []);

    // Save generation mode settings to localStorage when changed
    useEffect(() => {
        localStorage.setItem('moodboard_gen_modes', JSON.stringify({
            keyActionGenMode,
            promptGenMode,
            imageGenMode,
        }));
    }, [keyActionGenMode, promptGenMode, imageGenMode]);

    // Initialize with active version
    useEffect(() => {
        const activeVersion = storyVersions.find(v => v.isActive);
        if (activeVersion && !selectedVersionId) {
            setSelectedVersionId(activeVersion.id);
        } else if (storyVersions.length > 0 && !selectedVersionId) {
            setSelectedVersionId(storyVersions[0].id);
        }
    }, [storyVersions, selectedVersionId]);

    // Load image versions when item detail modal opens
    useEffect(() => {
        if (selectedItemForDetail && moodboard) {
            loadItemVersions(selectedItemForDetail.id);
        } else {
            setItemImageVersions([]);
        }
    }, [selectedItemForDetail?.id]);

    const loadItemVersions = async (itemId: string) => {
        if (!moodboard) return;
        setIsLoadingVersions(true);
        try {
            const res = await fetch(`/api/moodboard-item-versions?moodboardId=${moodboard.id}&itemId=${itemId}`);
            if (res.ok) {
                const data = await res.json();
                setItemImageVersions(data.versions || []);
            }
        } catch (e) {
            console.error('Failed to load versions:', e);
        } finally {
            setIsLoadingVersions(false);
        }
    };

    const setActiveVersion = async (versionId: string) => {
        try {
            const res = await fetch('/api/moodboard-item-versions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId, action: 'activate' }),
            });
            if (res.ok) {
                toast.success('Version activated!');
                // Get the version's image URL to update selectedItemForDetail immediately
                const versionData = await res.json();
                if (versionData.version && selectedItemForDetail) {
                    // Update selectedItemForDetail with new imageUrl immediately
                    setSelectedItemForDetail(prev => prev ? {
                        ...prev,
                        imageUrl: versionData.version.image_url,
                    } : null);
                }
                await loadMoodboard();
                if (selectedItemForDetail) {
                    await loadItemVersions(selectedItemForDetail.id);
                }
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to activate version');
        }
    };

    // Upload image from URL (Google Drive, external URL, etc.)
    const uploadImageFromUrl = async () => {
        if (!selectedItemForDetail || !moodboard || !uploadImageUrl.trim()) return;

        // Validate URL
        let finalUrl = uploadImageUrl.trim();
        let sourceType = 'uploaded_url';

        // Convert Google Drive share links to direct image URLs
        if (finalUrl.includes('drive.google.com')) {
            sourceType = 'uploaded_drive';
            // Extract file ID from various Drive URL formats
            const driveIdMatch = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                finalUrl.match(/id=([a-zA-Z0-9_-]+)/);
            if (driveIdMatch) {
                const fileId = driveIdMatch[1];
                finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            }
        }

        setIsUploadingImage(true);
        try {
            // Create new version with the uploaded image
            const res = await fetch('/api/moodboard-item-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: moodboard.id,
                    itemId: selectedItemForDetail.id,
                    imageUrl: finalUrl,
                    thumbnailUrl: finalUrl,
                    sourceType,
                    setAsActive: true,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to upload image');
            }

            // Update moodboard item with new image
            await fetch(`/api/creator/projects/${projectId}/moodboard/items/${selectedItemForDetail.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: finalUrl,
                    status: 'has_image',
                }),
            });

            toast.success('Image uploaded successfully!');
            setUploadImageUrl('');
            await loadMoodboard();
            await loadItemVersions(selectedItemForDetail.id);
        } catch (e: any) {
            toast.error(e.message || 'Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Handle file upload to Google Drive
    const handleFileUpload = async (file: File) => {
        if (!selectedItemForDetail || !moodboard) {
            toast.error('No item selected');
            return;
        }

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);
            formData.append('userId', userId);
            formData.append('entityType', 'moodboard');
            formData.append('entityId', selectedItemForDetail.id);

            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success && (data.thumbnailUrl || data.publicUrl)) {
                const imageUrl = data.thumbnailUrl || data.publicUrl;

                // Create new version with uploaded image
                await fetch('/api/moodboard-item-versions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moodboardId: moodboard.id,
                        itemId: selectedItemForDetail.id,
                        imageUrl,
                        thumbnailUrl: imageUrl,
                        sourceType: 'uploaded_drive',
                        setAsActive: true,
                    }),
                });

                // Update moodboard item
                await fetch(`/api/creator/projects/${projectId}/moodboard/items/${selectedItemForDetail.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl,
                        status: 'has_image',
                    }),
                });

                toast.success('Image uploaded!');
                setUploadImageUrl('');
                await loadMoodboard();
                await loadItemVersions(selectedItemForDetail.id);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Convert Google Drive URL to thumbnail
    const getGoogleDriveThumbnail = (url: string): string => {
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&]+)/,
            /\/d\/([^\/]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match?.[1]) {
                return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
            }
        }
        return url;
    };

    // Handle URL input with Drive conversion
    const handleUrlInput = (url: string) => {
        if (url.includes('drive.google.com')) {
            setUploadImageUrl(getGoogleDriveThumbnail(url));
        } else {
            setUploadImageUrl(url);
        }
    };

    // Load moodboard when version changes
    useEffect(() => {
        if (selectedVersionId) {
            loadMoodboard();
        }
    }, [selectedVersionId, selectedMoodboardVersion]);

    // Load user credits on mount
    const loadUserCredits = async () => {
        setIsLoadingCredits(true);
        try {
            const res = await fetch(`/api/creator/dashboard?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUserCredits(data.stats?.creditBalance || 0);
            }
        } catch (err) {
            console.error('Error loading credits:', err);
        } finally {
            setIsLoadingCredits(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadUserCredits();
        }
    }, [userId]);

    // Check if user has enough credits for an operation
    const hasEnoughCredits = (requiredCredits: number): boolean => {
        return userCredits >= requiredCredits;
    };

    // Get credit warning message
    const getCreditWarning = (requiredCredits: number): string => {
        if (hasEnoughCredits(requiredCredits)) return '';
        return `Insufficient credits (need ${requiredCredits}, have ${userCredits})`;
    };

    // API functions
    const loadMoodboard = async () => {
        setIsLoading(true);
        try {
            // Check prerequisites first (but don't fail if this errors)
            try {
                const prereqRes = await fetch(
                    `/api/creator/projects/${projectId}/moodboard/prerequisites?storyVersionId=${selectedVersionId}`
                );
                if (prereqRes.ok) {
                    const prereqData = await prereqRes.json();
                    setPrerequisites(prereqData.prerequisites || { hasUniverse: false, hasStoryBeats: true, hasCharacters: false, canCreate: true });
                } else {
                    // Default to allowing create if API fails
                    console.warn('Prerequisites API failed, using defaults');
                    setPrerequisites({ hasUniverse: false, hasStoryBeats: true, hasCharacters: false, canCreate: true });
                }
            } catch (e) {
                console.warn('Prerequisites check failed:', e);
                setPrerequisites({ hasUniverse: false, hasStoryBeats: true, hasCharacters: false, canCreate: true });
            }

            // Load existing moodboard (with optional version selection)
            const versionParam = selectedMoodboardVersion ? `&version=${selectedMoodboardVersion}` : '';
            const res = await fetch(
                `/api/creator/projects/${projectId}/moodboard?storyVersionId=${selectedVersionId}${versionParam}`
            );
            const data = await res.json();

            // Store all versions
            setMoodboardVersions(data.versions || []);
            setDeletedMoodboards(data.deletedVersions || []);

            if (data.moodboard) {
                setMoodboard(data.moodboard);
                setMoodboardName(data.moodboard.versionName || '');
                setArtStyle(data.moodboard.artStyle || 'realistic');
                setKeyActionCount(data.moodboard.keyActionCount || 7);
                setAspectRatio(data.moodboard.aspectRatio || '16:9');
                setSelectedMoodboardVersion(data.moodboard.versionNumber || 1);
                // Expand first beat by default
                if (data.moodboard.items?.length > 0) {
                    const firstBeat = data.moodboard.items[0].beatKey;
                    setExpandedBeats({ [firstBeat]: true });
                }
            } else {
                setMoodboard(null);
                setSelectedMoodboardVersion(null);
            }
        } catch (err) {
            console.error('Error loading moodboard:', err);
            toast.error('Failed to load moodboard');
        } finally {
            setIsLoading(false);
        }
    };

    const createMoodboard = async () => {
        setIsGenerating(prev => ({ ...prev, create: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyVersionId: selectedVersionId,
                    artStyle,
                    keyActionCount,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Unknown error');
            }

            await loadMoodboard();
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, create: false }));
        }
    };

    // Open create modal for new moodboard version
    const openCreateModal = () => {
        // Reset to defaults when opening
        setNewMoodboardName('');
        setNewArtStyle('realistic');
        setNewKeyActionCount(7);
        setShowCreateModal(true);
    };

    // Actually create the new moodboard version with settings from modal
    const confirmCreateNewVersion = async () => {
        setShowCreateModal(false);
        setIsGenerating(prev => ({ ...prev, create: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyVersionId: selectedVersionId,
                    versionName: newMoodboardName || undefined, // Optional custom name
                    artStyle: newArtStyle,
                    keyActionCount: newKeyActionCount,
                    createNewVersion: moodboard ? true : false, // Only flag as new version if one exists
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Unknown error');
            }

            toast.success('Moodboard created successfully!');
            await loadMoodboard();
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, create: false }));
        }
    };

    // Switch to a different moodboard version
    const switchMoodboardVersion = async (versionNumber: number) => {
        setSelectedMoodboardVersion(versionNumber);
        // Reload will happen via useEffect dependency
    };

    const generateKeyActions = async (beatKey?: string) => {
        if (!moodboard) return;

        // Single beat generation
        if (beatKey) {
            const genKey = `keyActions_${beatKey}`;
            setIsGenerating(prev => ({ ...prev, [genKey]: true }));
            try {
                const res = await fetch(`/api/creator/projects/${projectId}/moodboard/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moodboardId: moodboard.id,
                        type: 'key_actions',
                        userId,
                        beatKey,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error);
                }

                await loadMoodboard();
                onMoodboardChange?.();
                toast.success('Key actions generated!');
            } catch (err: any) {
                toast.error(err.message || 'Failed to generate key actions');
            } finally {
                setIsGenerating(prev => ({ ...prev, [genKey]: false }));
            }
            return;
        }

        // Generate ALL - loop per beat with progress
        const beatKeys = Object.keys(itemsByBeat);
        const errors: string[] = [];

        setGenerationProgress({
            isActive: true,
            type: 'key_actions',
            currentIndex: 0,
            totalCount: beatKeys.length,
            currentLabel: '',
            currentBeat: '',
            lastGeneratedImage: null,
            errors: [],
        });
        setIsGenerating(prev => ({ ...prev, keyActions_all: true }));

        try {
            for (let i = 0; i < beatKeys.length; i++) {
                const key = beatKeys[i];
                const beatData = itemsByBeat[key];

                setGenerationProgress(prev => ({
                    ...prev,
                    currentIndex: i + 1,
                    currentLabel: beatData.label,
                }));

                try {
                    const res = await fetch(`/api/creator/projects/${projectId}/moodboard/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            moodboardId: moodboard.id,
                            type: 'key_actions',
                            userId,
                            beatKey: key,
                        }),
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        errors.push(`${beatData.label}: ${errData.error}`);
                    }
                } catch (err: any) {
                    errors.push(`${beatData.label}: ${err.message}`);
                }

                // Add delay between beats to prevent rate limiting
                if (i < beatKeys.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            await loadMoodboard();
            onMoodboardChange?.();

            if (errors.length > 0) {
                toast.error(`Completed with ${errors.length} errors`);
            } else {
                toast.success('All key actions generated!');
            }
        } finally {
            setGenerationProgress(prev => ({ ...prev, isActive: false, errors }));
            setIsGenerating(prev => ({ ...prev, keyActions_all: false }));
        }
    };

    const generatePrompts = async (beatKey?: string) => {
        if (!moodboard) return;

        // Single beat generation
        if (beatKey) {
            const genKey = `prompts_${beatKey}`;
            setIsGenerating(prev => ({ ...prev, [genKey]: true }));
            try {
                const res = await fetch(`/api/creator/projects/${projectId}/moodboard/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moodboardId: moodboard.id,
                        type: 'prompts',
                        userId,
                        beatKey,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error);
                }

                await loadMoodboard();
                onMoodboardChange?.();
                toast.success('Prompts generated!');
            } catch (err: any) {
                toast.error(err.message || 'Failed to generate prompts');
            } finally {
                setIsGenerating(prev => ({ ...prev, [genKey]: false }));
            }
            return;
        }

        // Generate ALL - loop per beat with progress
        const beatKeys = Object.keys(itemsByBeat);
        const errors: string[] = [];

        setGenerationProgress({
            isActive: true,
            type: 'prompts',
            currentIndex: 0,
            totalCount: beatKeys.length,
            currentLabel: '',
            currentBeat: '',
            lastGeneratedImage: null,
            errors: [],
        });
        setIsGenerating(prev => ({ ...prev, prompts_all: true }));

        try {
            for (let i = 0; i < beatKeys.length; i++) {
                const key = beatKeys[i];
                const beatData = itemsByBeat[key];

                setGenerationProgress(prev => ({
                    ...prev,
                    currentIndex: i + 1,
                    currentLabel: beatData.label,
                }));

                try {
                    const res = await fetch(`/api/creator/projects/${projectId}/moodboard/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            moodboardId: moodboard.id,
                            type: 'prompts',
                            userId,
                            beatKey: key,
                        }),
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        errors.push(`${beatData.label}: ${errData.error}`);
                    }
                } catch (err: any) {
                    errors.push(`${beatData.label}: ${err.message}`);
                }

                // Add delay between beats to prevent rate limiting
                if (i < beatKeys.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            await loadMoodboard();
            onMoodboardChange?.();

            if (errors.length > 0) {
                toast.error(`Completed with ${errors.length} errors`);
            } else {
                toast.success('All prompts generated!');
            }
        } finally {
            setGenerationProgress(prev => ({ ...prev, isActive: false, errors }));
            setIsGenerating(prev => ({ ...prev, prompts_all: false }));
        }
    };

    // Generate image for a single item using character's active image version as I2I reference
    const generateImage = async (item: MoodboardItem) => {
        if (!moodboard || !item.prompt) return;

        const genKey = `image_${item.id}`;
        setIsGenerating(prev => ({ ...prev, [genKey]: true }));

        try {
            // Get characters involved in this action
            const involvedCharacters = characters.filter(c =>
                item.charactersInvolved?.includes(c.id)
            );

            // Check if any character has an active image version
            let characterImageUrl: string | undefined;
            let characterDetails = '';

            if (involvedCharacters.length > 0) {
                const primaryCharacter = involvedCharacters[0];

                // First, try to get the active character image version
                if (primaryCharacter.id) {
                    try {
                        const versionRes = await fetch(`/api/character-image-versions?characterId=${primaryCharacter.id}`);
                        if (versionRes.ok) {
                            const versionData = await versionRes.json();
                            // Use activeVersion from API (properly respects is_active flag)
                            const activeVersion = versionData.activeVersion;
                            if (activeVersion) {
                                characterImageUrl = activeVersion.image_url || activeVersion.thumbnail_url;
                                console.log(`[MOODBOARD] Using ACTIVE character image for I2I (v${activeVersion.version_number}): ${characterImageUrl}`);
                            }
                        }
                    } catch (err) {
                        console.log('[MOODBOARD] No active character image version, will use T2I');
                    }
                }

                // Also build character details for prompt enhancement
                characterDetails = involvedCharacters.map(c => {
                    const name = c.name || 'Unknown';
                    const role = c.role || '';
                    return `${name} (${role})`;
                }).join(', ');
            }

            // Call the moodboard image generation API
            const res = await fetch('/api/generate/moodboard-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    moodboardId: moodboard.id,
                    projectId,
                    projectName: moodboard.versionName,
                    beatName: item.beatLabel,
                    prompt: item.prompt,
                    style: moodboard.artStyle,
                    aspectRatio: aspectRatio || '16:9', // Pass aspect ratio for image generation
                    characterImageUrl, // Will use I2I if available
                    characterDetails,  // Will enhance prompt if no image
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Image generation failed');
            }

            const data = await res.json();
            const imageUrl = data.data.publicUrl || data.data.thumbnailUrl;

            // Update the item in database with the generated image
            await fetch(`/api/creator/projects/${projectId}/moodboard/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl,
                    status: 'has_image',
                }),
            });

            // Also save to versions table for history tracking
            await fetch('/api/moodboard-item-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: moodboard.id,
                    itemId: item.id,
                    imageUrl,
                    thumbnailUrl: imageUrl,
                    promptUsed: item.prompt,
                    artStyle: moodboard.artStyle,
                    aspectRatio: aspectRatio || '16:9',
                    creditCost: CREDIT_COSTS.image,
                    sourceType: 'generated',
                    setAsActive: true,
                }),
            });

            await loadMoodboard();
            await loadUserCredits(); // Refresh credits after generation
            onMoodboardChange?.();
            toast.success(`Image generated for ${item.beatLabel}!`);

        } catch (err: any) {
            toast.error(err.message || 'Failed to generate image');
        } finally {
            setIsGenerating(prev => ({ ...prev, [genKey]: false }));
        }
    };

    // Batch generate images for all items in a beat
    const generateBeatImages = async (beatKey: string) => {
        if (!moodboard) return;

        const beatItems = moodboard.items.filter(i => i.beatKey === beatKey && i.prompt);
        if (beatItems.length === 0) {
            toast.error('No items with prompts to generate images for');
            return;
        }

        const totalCost = CREDIT_COSTS.image * beatItems.length;
        if (!hasEnoughCredits(totalCost)) {
            toast.error(`Insufficient credits. Need ${totalCost}, have ${userCredits}`);
            return;
        }

        const beatLabel = beatItems[0]?.beatLabel || beatKey;
        const genKey = `images_${beatKey}`;
        setIsGenerating(prev => ({ ...prev, [genKey]: true }));

        // Initialize progress
        setGenerationProgress({
            isActive: true,
            type: 'images',
            currentIndex: 0,
            totalCount: beatItems.length,
            currentLabel: beatItems[0]?.keyActionDescription?.slice(0, 50) || '',
            currentBeat: beatLabel,
            lastGeneratedImage: null,
            errors: [],
        });

        const errors: string[] = [];

        for (let i = 0; i < beatItems.length; i++) {
            const item = beatItems[i];

            // Update progress
            setGenerationProgress(prev => ({
                ...prev,
                currentIndex: i + 1,
                currentLabel: item.keyActionDescription?.slice(0, 50) || `Action ${item.keyActionIndex}`,
            }));

            try {
                // Get character's active image for I2I
                let characterImageUrl: string | undefined;
                let characterDetails: string | undefined;

                if (item.charactersInvolved?.length > 0) {
                    const charId = item.charactersInvolved[0];
                    try {
                        const versionRes = await fetch(`/api/character-image-versions?characterId=${charId}`);
                        if (versionRes.ok) {
                            const versionData = await versionRes.json();
                            if (versionData.activeVersion?.thumbnailUrl) {
                                characterImageUrl = versionData.activeVersion.thumbnailUrl;
                            }
                        }
                    } catch (e) {
                        console.log('Could not get character image, using text2image');
                    }

                    // Get character details for prompt enhancement
                    const char = characters.find(c => c.id === charId);
                    if (char) {
                        characterDetails = `${char.name} - ${char.role || ''}`;
                    }
                }

                // Generate the image
                const res = await fetch('/api/generate/moodboard-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        moodboardId: moodboard.id,
                        projectId,
                        projectName: moodboard.versionName,
                        beatName: item.beatLabel,
                        prompt: item.prompt,
                        style: moodboard.artStyle,
                        aspectRatio: aspectRatio || '16:9',
                        characterImageUrl,
                        characterDetails,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to generate image');
                }

                const data = await res.json();
                const imageUrl = data.data?.publicUrl || data.data?.thumbnailUrl;

                // Update last generated image for preview
                setGenerationProgress(prev => ({
                    ...prev,
                    lastGeneratedImage: imageUrl,
                }));

                // Save to database
                await fetch(`/api/creator/projects/${projectId}/moodboard/items/${item.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl,
                        status: 'has_image',
                    }),
                });

                // Also save to versions table for history tracking
                await fetch('/api/moodboard-item-versions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moodboardId: moodboard.id,
                        itemId: item.id,
                        imageUrl,
                        thumbnailUrl: imageUrl,
                        promptUsed: item.prompt,
                        artStyle: moodboard.artStyle,
                        aspectRatio: aspectRatio || '16:9',
                        creditCost: CREDIT_COSTS.image,
                        sourceType: 'generated',
                        setAsActive: true,
                    }),
                });

            } catch (err: any) {
                errors.push(`Action ${item.keyActionIndex}: ${err.message}`);
                setGenerationProgress(prev => ({
                    ...prev,
                    errors: [...prev.errors, `#${item.keyActionIndex}: ${err.message}`],
                }));
            }

            // Small delay between generations to avoid rate limiting
            if (i < beatItems.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Complete
        setGenerationProgress(prev => ({ ...prev, isActive: false }));
        setIsGenerating(prev => ({ ...prev, [genKey]: false }));

        // Refresh data
        await loadMoodboard();
        await loadUserCredits();

        if (errors.length === 0) {
            toast.success(`All ${beatItems.length} images generated for ${beatLabel}!`);
        } else {
            toast.warning(`Generated ${beatItems.length - errors.length}/${beatItems.length} images. ${errors.length} failed.`);
        }
    };

    const clearMoodboard = async (type: 'all' | 'descriptions' | 'prompts' | 'images') => {
        if (!moodboard) return;
        setIsGenerating(prev => ({ ...prev, clear: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: moodboard.id,
                    type,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error);
            }

            await loadMoodboard();
            setShowClearDialog(false);
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to clear moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, clear: false }));
        }
    };

    const updateSettings = async () => {
        if (!moodboard) return;
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: moodboard.id,
                    versionName: moodboardName || undefined,
                    artStyle,
                    keyActionCount,
                    aspectRatio,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error);
            }

            toast.success('Settings saved!');
            setShowSettings(false);
            await loadMoodboard(); // Reload to update dropdown with new name
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update settings');
        }
    };

    // Delete moodboard (soft delete)
    const deleteMoodboard = async () => {
        if (!moodboard) return;
        setIsGenerating(prev => ({ ...prev, delete: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard?moodboardId=${moodboard.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error);
            }

            setMoodboard(null);
            setShowClearDialog(false);
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, delete: false }));
        }
    };

    // Restore deleted moodboard
    const restoreMoodboard = async (moodboardId: string) => {
        setIsGenerating(prev => ({ ...prev, restore: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moodboardId }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error);
            }

            await loadMoodboard();
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to restore moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, restore: false }));
        }
    };

    // Re-create moodboard (delete current and create new with same version)
    const recreateMoodboard = async () => {
        const result = await swalAlert.confirm(
            'Recreate Moodboard',
            'This will delete the current moodboard and create a new one with fresh beats. Are you sure?',
            'Recreate',
            'Cancel'
        );
        if (!result.isConfirmed) return;

        setIsGenerating(prev => ({ ...prev, create: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyVersionId: selectedVersionId,
                    artStyle,
                    keyActionCount,
                    recreate: true, // Replace current moodboard
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Unknown error');
            }

            toast.success('Moodboard recreated successfully!');
            await loadMoodboard();
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to recreate moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, create: false }));
        }
    };

    // Update individual item
    const updateItem = async (itemId: string, updates: { description?: string; prompt?: string }) => {
        setIsGenerating(prev => ({ ...prev, [`save_${itemId}`]: true }));
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error);
            }

            // Clear local edits for this item
            setLocalEdits(prev => {
                const newEdits = { ...prev };
                delete newEdits[itemId];
                return newEdits;
            });

            await loadMoodboard();
            onMoodboardChange?.();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update item');
        } finally {
            setIsGenerating(prev => ({ ...prev, [`save_${itemId}`]: false }));
        }
    };

    // Local edit helpers
    const updateLocalEdit = (itemId: string, field: 'description' | 'prompt', value: string) => {
        setLocalEdits(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            },
        }));
    };

    const getItemValue = (item: MoodboardItem, field: 'description' | 'prompt') => {
        if (localEdits[item.id]?.[field] !== undefined) {
            return localEdits[item.id][field];
        }
        return field === 'description' ? item.keyActionDescription : item.prompt;
    };

    const hasLocalEdits = (itemId: string) => {
        return localEdits[itemId] !== undefined &&
            (localEdits[itemId].description !== undefined || localEdits[itemId].prompt !== undefined);
    };

    // Helper functions
    const getCharacterById = (id: string) => characters.find(c => c.id === id);
    const getStyleInfo = (styleId: string) => ART_STYLES.find(s => s.id === styleId);
    const currentStyle = getStyleInfo(artStyle);

    // Group items by beat
    const itemsByBeat = moodboard?.items.reduce((acc, item) => {
        if (!acc[item.beatKey]) {
            acc[item.beatKey] = {
                label: item.beatLabel,
                content: item.beatContent,
                index: item.beatIndex,
                items: [],
            };
        }
        acc[item.beatKey].items.push(item);
        return acc;
    }, {} as Record<string, { label: string; content: string | null; index: number; items: MoodboardItem[] }>) || {};

    // Calculate progress
    const totalItems = moodboard?.items.length || 0;
    const descriptionCount = moodboard?.items.filter(i => i.keyActionDescription).length || 0;
    const promptCount = moodboard?.items.filter(i => i.prompt).length || 0;
    const imageCount = moodboard?.items.filter(i => i.imageUrl).length || 0;

    const toggleBeat = (beatKey: string) => {
        setExpandedBeats(prev => ({ ...prev, [beatKey]: !prev[beatKey] }));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading moodboard...</p>
                </div>
            </div>
        );
    }

    // No story versions
    if (storyVersions.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No story versions found. Create a story first to use the Moodboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4">
            {/* TOOLBAR - Responsive wrapper */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl glass-panel bg-white/80 border border-gray-200 shadow-sm">
                {/* Left: Story Version Selector */}
                <div className="flex items-center gap-2 min-w-fit">
                    <Label className="text-xs text-gray-500 whitespace-nowrap">Story Version:</Label>
                    <Select value={selectedVersionId} onValueChange={(val) => { setSelectedVersionId(val); setStoryVersionSearch(''); }}>
                        <SelectTrigger className="h-8 w-[180px] sm:w-[200px] text-xs bg-white border-gray-200">
                            <SelectValue placeholder="Select story version" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] min-w-[200px]">
                            {/* Search input - Orange themed */}
                            {storyVersions.length > 3 && (
                                <div className="p-2 border-b border-orange-100 bg-orange-50/50 sticky top-0 z-10">
                                    <div className="relative">
                                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search stories..."
                                            value={storyVersionSearch}
                                            onChange={(e) => setStoryVersionSearch(e.target.value)}
                                            className="w-full text-xs pl-8 pr-7 py-1.5 border border-orange-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-orange-300"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {storyVersionSearch && (
                                            <button
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                                                onClick={(e) => { e.stopPropagation(); setStoryVersionSearch(''); }}
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* All items with scroll - no slice limitation */}
                            {storyVersions
                                .filter(v => {
                                    if (!storyVersionSearch) return true;
                                    const name = v.versionName || `Episode ${v.episodeNumber}`;
                                    return name.toLowerCase().includes(storyVersionSearch.toLowerCase());
                                })
                                .map(version => (
                                    <SelectItem
                                        key={version.id}
                                        value={version.id}
                                        textValue={version.versionName || `Episode ${version.episodeNumber}`}
                                    >
                                        <div className="flex items-center gap-2 max-w-[180px]">
                                            {version.isActive && <Badge className="bg-orange-100 text-orange-600 text-[10px] flex-shrink-0">Active</Badge>}
                                            <span className="truncate">{version.versionName || `Episode ${version.episodeNumber}`}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            {storyVersions.filter(v => {
                                if (!storyVersionSearch) return true;
                                const name = v.versionName || `Episode ${v.episodeNumber}`;
                                return name.toLowerCase().includes(storyVersionSearch.toLowerCase());
                            }).length === 0 && (
                                    <div className="px-3 py-4 text-center text-xs text-orange-400">
                                        No stories match "{storyVersionSearch}"
                                    </div>
                                )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Divider - hidden on small screens */}
                <div className="hidden sm:block h-8 w-px bg-gray-200" />

                {/* Progress Badges */}
                {moodboard && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                                        <ListChecks className="h-3 w-3 mr-1" />
                                        {descriptionCount}/{totalItems}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Key Actions Generated</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                                        <Wand2 className="h-3 w-3 mr-1" />
                                        {promptCount}/{totalItems}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Prompts Generated</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        {imageCount}/{totalItems}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Images Generated</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Credit Balance Badge */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${userCredits < 12
                                            ? 'text-red-600 border-red-200 bg-red-50'
                                            : 'text-gray-600 border-gray-200 bg-gray-50'}`}
                                    >
                                        💳 {userCredits} credits
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {userCredits < 12
                                        ? 'Low credits - some operations disabled'
                                        : 'Available credits for AI generation'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                {/* Spacer to push actions to right on larger screens */}
                <div className="flex-grow" />

                {/* Actions Group */}
                {moodboard && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Art Style Badge */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        className="h-8 px-3 cursor-pointer bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 gap-1.5"
                                        onClick={() => setShowSettings(true)}
                                    >
                                        {currentStyle && <currentStyle.icon className="h-3.5 w-3.5" />}
                                        <span className="text-xs font-medium">{currentStyle?.label}</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Click to change style</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Moodboard Version Selector with Deleted */}
                        {(moodboardVersions.length > 0 || deletedMoodboards.length > 0) && (
                            <SearchableMoodboardDropdown
                                moodboards={moodboardVersions}
                                deletedMoodboards={deletedMoodboards}
                                selectedVersionNumber={selectedMoodboardVersion}
                                onSelect={switchMoodboardVersion}
                                onRestore={restoreMoodboard}
                                onCreateNew={openCreateModal}
                                isCreating={isGenerating['create']}
                                showCreateNew={true}
                                showRestore={true}
                            />
                        )}

                        {/* Divider */}
                        <div className="hidden sm:block h-6 w-px bg-gray-300" />

                        {/* Settings Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSettings(true)}
                            className="h-8 text-xs"
                        >
                            <Settings2 className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Settings</span>
                        </Button>

                        {/* Re-create Moodboard Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={recreateMoodboard}
                            disabled={isGenerating['delete'] || isGenerating['create']}
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            {(isGenerating['delete'] || isGenerating['create']) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3 w-3" />
                            )}
                        </Button>

                        {/* Generate Buttons - Only show when mode is 'all' */}
                        {keyActionGenMode === 'all' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateKeyActions()}
                                disabled={isGenerating['keyActions_all'] || !hasEnoughCredits(CREDIT_COSTS.key_action * Object.keys(itemsByBeat).length)}
                                className="h-8 text-xs"
                                title={getCreditWarning(CREDIT_COSTS.key_action * Object.keys(itemsByBeat).length) || `Generate all key actions (${CREDIT_COSTS.key_action * Object.keys(itemsByBeat).length} credits)`}
                            >
                                {isGenerating['keyActions_all'] ? (
                                    <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" />
                                ) : (
                                    <ListChecks className="h-3 w-3 sm:mr-1" />
                                )}
                                <span className="hidden sm:inline">Gen Actions</span>
                            </Button>
                        )}

                        {promptGenMode === 'all' && (
                            <Button
                                size="sm"
                                onClick={() => generatePrompts()}
                                disabled={isGenerating['prompts_all'] || descriptionCount === 0 || !hasEnoughCredits(CREDIT_COSTS.prompt * Object.keys(itemsByBeat).length)}
                                className="h-8 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white"
                                title={getCreditWarning(CREDIT_COSTS.prompt * Object.keys(itemsByBeat).length) || `Generate all prompts (${CREDIT_COSTS.prompt * Object.keys(itemsByBeat).length} credits)`}
                            >
                                {isGenerating['prompts_all'] ? (
                                    <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3 sm:mr-1" />
                                )}
                                <span className="hidden sm:inline">Gen Prompts</span>
                            </Button>
                        )}

                        {/* Clear Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowClearDialog(true)}
                            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* No Moodboard Yet - Show create panel */}
                {!moodboard && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Palette className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Moodboard</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Generate visual key actions for each story beat. Configure the art style and number of actions per beat.
                            </p>

                            {/* Prerequisites Status */}
                            {prerequisites && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Prerequisites:</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className={prerequisites.hasStoryBeats ? 'text-green-600' : 'text-red-500'}>
                                            {prerequisites.hasStoryBeats ? '✅' : '❌'} Story Beats
                                        </span>
                                        <span className={prerequisites.hasUniverse ? 'text-green-600' : 'text-amber-500'}>
                                            {prerequisites.hasUniverse ? '✅' : '⚠️'} Universe
                                        </span>
                                        <span className={prerequisites.hasCharacters ? 'text-green-600' : 'text-amber-500'}>
                                            {prerequisites.hasCharacters ? '✅' : '⚠️'} Characters
                                        </span>
                                    </div>
                                    {!prerequisites.hasStoryBeats && (
                                        <p className="text-xs text-red-500 mt-2">
                                            ⚠️ Story beats are required to create moodboard
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4 mb-6 text-left bg-gray-50 rounded-xl p-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Art Style</Label>
                                    <Select value={artStyle} onValueChange={setArtStyle}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ART_STYLES.map(style => (
                                                <SelectItem key={style.id} value={style.id}>
                                                    <div className="flex items-center gap-2">
                                                        <style.icon className="h-4 w-4" />
                                                        <span>{style.label}</span>
                                                        <span className="text-gray-400 text-xs">- {style.desc}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500">Key Actions per Beat: {keyActionCount}</Label>
                                    <Slider
                                        value={[keyActionCount]}
                                        onValueChange={([v]) => setKeyActionCount(v)}
                                        min={3}
                                        max={10}
                                        step={1}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        More actions = more detailed visual breakdown
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={createMoodboard}
                                disabled={isGenerating['create'] || (prerequisites !== null && !prerequisites.hasStoryBeats)}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white disabled:opacity-50"
                            >
                                {isGenerating['create'] ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                Create Moodboard
                            </Button>
                        </div>
                    </div>
                )
                }

                {/* Moodboard Content */}
                {
                    moodboard && (
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-4">
                                {Object.entries(itemsByBeat)
                                    .sort(([, a], [, b]) => a.index - b.index)
                                    .map(([beatKey, beatData]) => (
                                        <Collapsible
                                            key={beatKey}
                                            open={expandedBeats[beatKey]}
                                            onOpenChange={() => toggleBeat(beatKey)}
                                        >
                                            {/* Beat Header */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                                <CollapsibleTrigger className="w-full">
                                                    <div className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <Badge className="bg-orange-100 text-orange-600 border-orange-200">
                                                                {beatData.index}
                                                            </Badge>
                                                            <div className="text-left">
                                                                <h3 className="font-bold text-gray-900">{beatData.label}</h3>
                                                                {beatData.content && (
                                                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">
                                                                        {beatData.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {/* Beat Progress */}
                                                            <div className="flex gap-1">
                                                                {beatData.items.map(item => (
                                                                    <div
                                                                        key={item.id}
                                                                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[item.status]?.split(' ')[0] || 'bg-gray-200'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <ChevronDown
                                                                className={`h-5 w-5 text-gray-400 transition-transform ${expandedBeats[beatKey] ? 'rotate-180' : ''
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </CollapsibleTrigger>

                                                {/* Beat Content */}
                                                <CollapsibleContent>
                                                    <div className="border-t border-gray-200 p-4">
                                                        {/* Beat Actions - Show based on generation mode */}
                                                        <div className="flex gap-2 mb-4 flex-wrap">
                                                            {/* Gen Key Actions - only when mode is per_beat */}
                                                            {keyActionGenMode === 'per_beat' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => generateKeyActions(beatKey)}
                                                                    disabled={isGenerating[`keyActions_${beatKey}`] || !hasEnoughCredits(CREDIT_COSTS.key_action)}
                                                                    className="text-xs h-7"
                                                                    title={getCreditWarning(CREDIT_COSTS.key_action) || `Generate key actions (${CREDIT_COSTS.key_action} credits)`}
                                                                >
                                                                    {isGenerating[`keyActions_${beatKey}`] ? (
                                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                    ) : (
                                                                        <ListChecks className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    Gen Key Actions
                                                                </Button>
                                                            )}

                                                            {/* Gen Prompts - only when mode is per_beat */}
                                                            {promptGenMode === 'per_beat' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => generatePrompts(beatKey)}
                                                                    disabled={isGenerating[`prompts_${beatKey}`] || beatData.items.every(i => !i.keyActionDescription) || !hasEnoughCredits(CREDIT_COSTS.prompt)}
                                                                    className="text-xs h-7"
                                                                    title={
                                                                        beatData.items.every(i => !i.keyActionDescription)
                                                                            ? 'Generate key actions first'
                                                                            : getCreditWarning(CREDIT_COSTS.prompt) || `Generate prompts (${CREDIT_COSTS.prompt} credits)`
                                                                    }
                                                                >
                                                                    {isGenerating[`prompts_${beatKey}`] ? (
                                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                    ) : (
                                                                        <Wand2 className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    Gen Prompts
                                                                </Button>
                                                            )}

                                                            {/* Gen All Images - only when mode is per_beat */}
                                                            {imageGenMode === 'per_beat' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => generateBeatImages(beatKey)}
                                                                    disabled={
                                                                        isGenerating[`images_${beatKey}`] ||
                                                                        !beatData.items.every(i => i.prompt) ||
                                                                        !hasEnoughCredits(CREDIT_COSTS.image * beatData.items.length)
                                                                    }
                                                                    className="text-xs h-7 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white"
                                                                    title={
                                                                        !beatData.items.every(i => i.keyActionDescription)
                                                                            ? 'Generate key actions first'
                                                                            : !beatData.items.every(i => i.prompt)
                                                                                ? 'Generate prompts for all key actions first'
                                                                                : getCreditWarning(CREDIT_COSTS.image * beatData.items.length) || `Generate all ${beatData.items.length} images (${CREDIT_COSTS.image * beatData.items.length} credits)`
                                                                    }
                                                                >
                                                                    {isGenerating[`images_${beatKey}`] ? (
                                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                    ) : (
                                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    Gen All Images
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {/* Key Actions Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                            {beatData.items
                                                                .sort((a, b) => a.keyActionIndex - b.keyActionIndex)
                                                                .map(item => (
                                                                    <Card
                                                                        key={item.id}
                                                                        className="bg-white hover:shadow-md transition-shadow cursor-pointer group"
                                                                        onClick={() => setSelectedItemForDetail(item)}
                                                                    >
                                                                        {/* Image Preview - Dynamic aspect ratio from settings */}
                                                                        <div
                                                                            className="bg-gray-100 relative overflow-hidden rounded-t-lg"
                                                                            style={getAspectRatioStyle(aspectRatio)}
                                                                        >
                                                                            {item.imageUrl ? (
                                                                                <img
                                                                                    src={item.imageUrl}
                                                                                    alt={`Key action ${item.keyActionIndex}`}
                                                                                    className="w-full h-full object-contain"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <ImageIcon className="h-8 w-8 text-gray-300" />
                                                                                </div>
                                                                            )}

                                                                            {/* Status Badge */}
                                                                            <Badge
                                                                                className={`absolute top-2 left-2 text-[10px] ${STATUS_COLORS[item.status] || 'bg-gray-200 text-gray-600'}`}
                                                                            >
                                                                                {item.keyActionIndex}
                                                                            </Badge>

                                                                            {/* Info Button - Only show when image exists */}
                                                                            {item.imageUrl && (
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    // Could open a modal with more details
                                                                                                }}
                                                                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-xs font-bold transition-colors"
                                                                                            >
                                                                                                i
                                                                                            </button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent side="left" className="max-w-xs">
                                                                                            <div className="text-xs space-y-1">
                                                                                                <p><strong>Art Style:</strong> {artStyle}</p>
                                                                                                <p><strong>Aspect Ratio:</strong> {aspectRatio}</p>
                                                                                                <p><strong>Credit Cost:</strong> {CREDIT_COSTS.image} credits</p>
                                                                                                {item.prompt && (
                                                                                                    <p className="truncate"><strong>Prompt:</strong> {item.prompt.slice(0, 80)}...</p>
                                                                                                )}
                                                                                            </div>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            )}

                                                                            {/* Hover overlay */}
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                                                <span className="text-white text-xs font-medium">Click to view details</span>
                                                                            </div>
                                                                        </div>

                                                                        <CardContent className="p-4">
                                                                            {/* Brief Description */}
                                                                            <p className="text-xs text-gray-700 line-clamp-2 min-h-[32px]">
                                                                                {item.keyActionDescription || <span className="text-gray-400 italic">No description yet</span>}
                                                                            </p>

                                                                            {/* Status Indicators */}
                                                                            <div className="flex items-center gap-2 mt-3">
                                                                                {item.keyActionDescription && (
                                                                                    <Badge variant="outline" className="py-1 px-2 text-blue-500 border-blue-200">
                                                                                        <ListChecks className="h-3.5 w-3.5" />
                                                                                    </Badge>
                                                                                )}
                                                                                {item.prompt && (
                                                                                    <Badge variant="outline" className="py-1 px-2 text-amber-500 border-amber-200">
                                                                                        <Wand2 className="h-3.5 w-3.5" />
                                                                                    </Badge>
                                                                                )}
                                                                                {item.imageUrl && (
                                                                                    <Badge variant="outline" className="py-1 px-2 text-emerald-500 border-emerald-200">
                                                                                        <ImageIcon className="h-3.5 w-3.5" />
                                                                                    </Badge>
                                                                                )}
                                                                                {item.charactersInvolved?.length > 0 && (
                                                                                    <Badge variant="outline" className="py-1 px-2 text-purple-500 border-purple-200 text-xs">
                                                                                        <Users className="h-3.5 w-3.5 mr-1" />
                                                                                        {item.charactersInvolved.length}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </div>
                                        </Collapsible>
                                    ))}
                            </div>
                        </ScrollArea>
                    )
                }
            </div >

            {/* Item Detail Modal */}
            <Dialog open={!!selectedItemForDetail} onOpenChange={(open) => !open && setSelectedItemForDetail(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[selectedItemForDetail?.status || 'empty']}>
                                #{selectedItemForDetail?.keyActionIndex}
                            </Badge>
                            {selectedItemForDetail?.beatLabel}
                        </DialogTitle>
                        <DialogDescription>
                            Edit key action details and generate image
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItemForDetail && (
                        <div className="flex-1 overflow-y-auto space-y-4 px-1">
                            {/* Image Preview */}
                            <div
                                className="bg-gray-100 rounded-lg overflow-hidden"
                                style={getAspectRatioStyle(aspectRatio)}
                            >
                                {selectedItemForDetail.imageUrl ? (
                                    <img
                                        src={selectedItemForDetail.imageUrl}
                                        alt="Generated"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                                            <p className="text-sm">No image generated yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Image Versions Gallery */}
                            {itemImageVersions.length > 1 && (
                                <div>
                                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        Image Versions ({itemImageVersions.length})
                                    </Label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {itemImageVersions.map((version: any) => (
                                            <button
                                                key={version.id}
                                                onClick={() => !version.is_active && setActiveVersion(version.id)}
                                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${version.is_active
                                                    ? 'border-orange-500 ring-2 ring-orange-200'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                <img
                                                    src={version.thumbnail_url || version.image_url}
                                                    alt={`v${version.version_number}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <span className={`absolute bottom-0 left-0 right-0 text-[10px] text-center py-0.5 ${version.is_active
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-black/50 text-white'
                                                    }`}>
                                                    v{version.version_number}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Image Section */}
                            <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Add Image
                                </Label>

                                {/* File Upload */}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                    >
                                        {isUploadingImage ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Choose File
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* OR Separator */}
                                <div className="flex items-center gap-2">
                                    <Separator className="flex-1" />
                                    <span className="text-xs text-gray-400">OR</span>
                                    <Separator className="flex-1" />
                                </div>

                                {/* URL Input */}
                                <div>
                                    <Label className="text-xs text-gray-500">Image URL</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={uploadImageUrl}
                                            onChange={(e) => handleUrlInput(e.target.value)}
                                            placeholder="https://... or Google Drive link"
                                            className="flex-1"
                                            disabled={isUploadingImage}
                                        />
                                        <Button
                                            onClick={uploadImageFromUrl}
                                            disabled={!uploadImageUrl.trim() || isUploadingImage}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isUploadingImage ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Link2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Google Drive links will be auto-converted to thumbnails
                                    </p>
                                </div>

                                {/* Preview */}
                                {uploadImageUrl && (
                                    <div className="border rounded-lg p-2 bg-white">
                                        <Label className="text-xs text-gray-500">Preview</Label>
                                        <div className="mt-1 aspect-video bg-gray-100 rounded overflow-hidden">
                                            <img
                                                src={uploadImageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Action Description */}
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Key Action Description</Label>
                                <Textarea
                                    value={getItemValue(selectedItemForDetail, 'description') || ''}
                                    onChange={(e) => updateLocalEdit(selectedItemForDetail.id, 'description', e.target.value)}
                                    placeholder="Describe what happens in this scene..."
                                    className="min-h-[80px]"
                                    rows={3}
                                />
                            </div>

                            {/* Meta Info Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Characters */}
                                <div>
                                    <Label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        Characters Involved
                                    </Label>
                                    {selectedItemForDetail.charactersInvolved?.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedItemForDetail.charactersInvolved.map(charId => {
                                                const char = getCharacterById(charId);
                                                return char ? (
                                                    <Badge key={charId} variant="secondary" className="text-xs">
                                                        {char.name}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No characters assigned</p>
                                    )}
                                </div>

                                {/* Universe Level */}
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Universe Level</Label>
                                    {selectedItemForDetail.universeLevel ? (
                                        <Badge variant="outline">
                                            {UNIVERSE_ICONS[selectedItemForDetail.universeLevel] || '📍'} {selectedItemForDetail.universeLevel.replace('_', ' ')}
                                        </Badge>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Not specified</p>
                                    )}
                                </div>
                            </div>

                            {/* Image Prompt */}
                            <div>
                                <Label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <Wand2 className="h-4 w-4" />
                                    Image Prompt (YAML)
                                </Label>
                                <Textarea
                                    value={getItemValue(selectedItemForDetail, 'prompt') || ''}
                                    onChange={(e) => updateLocalEdit(selectedItemForDetail.id, 'prompt', e.target.value)}
                                    placeholder="scene: ...\ncharacters:\n  - name: ...\naction: ..."
                                    className="min-h-[120px] font-mono text-sm bg-amber-50 border-amber-200"
                                    rows={6}
                                />
                            </div>

                            {/* Negative Prompt (if exists) */}
                            {selectedItemForDetail.negativePrompt && (
                                <div>
                                    <Label className="text-sm font-medium mb-2 block text-red-500">Negative Prompt</Label>
                                    <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-200">
                                        {selectedItemForDetail.negativePrompt}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2 mt-4 pt-4 border-t">
                        {/* Save Button - show if has edits */}
                        {selectedItemForDetail && hasLocalEdits(selectedItemForDetail.id) && (
                            <Button
                                onClick={async () => {
                                    await updateItem(selectedItemForDetail.id, {
                                        description: localEdits[selectedItemForDetail.id]?.description,
                                        prompt: localEdits[selectedItemForDetail.id]?.prompt,
                                    });
                                }}
                                disabled={isGenerating[`save_${selectedItemForDetail?.id}`]}
                                className="bg-green-600 hover:bg-green-500"
                            >
                                {isGenerating[`save_${selectedItemForDetail?.id}`] ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                )}
                                Save Changes
                            </Button>
                        )}

                        {/* Generate Image Button - only when mode is per_item */}
                        {selectedItemForDetail && imageGenMode === 'per_item' && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    generateImage(selectedItemForDetail);
                                }}
                                disabled={!selectedItemForDetail.prompt || isGenerating[`image_${selectedItemForDetail.id}`] || !hasEnoughCredits(CREDIT_COSTS.image)}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
                                title={getCreditWarning(CREDIT_COSTS.image) || `Generate image (${CREDIT_COSTS.image} credits)`}
                            >
                                {isGenerating[`image_${selectedItemForDetail.id}`] ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                )}
                                Generate Image
                            </Button>
                        )}

                        <Button variant="outline" onClick={() => setSelectedItemForDetail(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Generation Progress Modal */}
            <Dialog open={generationProgress.isActive && generationProgress.type === 'images'} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            Generating Images - {generationProgress.currentBeat}
                        </DialogTitle>
                        <DialogDescription>
                            Processing {generationProgress.currentIndex} of {generationProgress.totalCount} images
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progress</span>
                                <span className="font-medium">
                                    {generationProgress.currentIndex}/{generationProgress.totalCount}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                    style={{
                                        width: `${(generationProgress.currentIndex / generationProgress.totalCount) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Current Action */}
                        <div className="text-sm">
                            <span className="text-gray-500">Current: </span>
                            <span className="text-gray-700 font-medium">
                                {generationProgress.currentLabel}...
                            </span>
                        </div>

                        {/* Last Generated Image Preview */}
                        {generationProgress.lastGeneratedImage && (
                            <div className="border rounded-lg overflow-hidden">
                                <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-b">
                                    Last Generated
                                </p>
                                <div className="p-2">
                                    <img
                                        src={generationProgress.lastGeneratedImage}
                                        alt="Last generated"
                                        className="w-full h-40 object-cover rounded"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Errors */}
                        {generationProgress.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-700 mb-1">
                                    Errors ({generationProgress.errors.length})
                                </p>
                                <ul className="text-xs text-red-600 space-y-1">
                                    {generationProgress.errors.slice(-3).map((err, i) => (
                                        <li key={i}>• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <p className="text-xs text-gray-400">
                            Please wait while images are being generated...
                        </p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Moodboard Settings</DialogTitle>
                        <DialogDescription>
                            Edit moodboard settings and art style.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Moodboard Name */}
                        <div>
                            <Label className="text-sm font-medium">Moodboard Name</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                Give your moodboard a descriptive name.
                            </p>
                            <input
                                type="text"
                                placeholder={moodboard?.versionName || 'v1'}
                                value={moodboardName}
                                onChange={(e) => setMoodboardName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* Art Style */}
                        <div>
                            <Label className="text-sm font-medium">Art Style</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                This style will be applied to all generated image prompts.
                            </p>
                            <Select value={artStyle} onValueChange={setArtStyle}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ART_STYLES.map(style => (
                                        <SelectItem key={style.id} value={style.id}>
                                            <div className="flex items-center gap-2">
                                                <style.icon className="h-4 w-4" />
                                                <div>
                                                    <span className="font-medium">{style.label}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{style.desc}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Aspect Ratio */}
                        <div>
                            <Label className="text-sm font-medium">Aspect Ratio</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                Image dimensions for all generated moodboard images.
                            </p>
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1:1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-400 rounded-sm" />
                                            <span>1:1 Square</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="16:9">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-3 border-2 border-gray-400 rounded-sm" />
                                            <span>16:9 Landscape (Cinematic)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="9:16">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-5 border-2 border-gray-400 rounded-sm" />
                                            <span>9:16 Portrait (Vertical)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="4:3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-3 border-2 border-gray-400 rounded-sm" />
                                            <span>4:3 Classic</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="3:4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-4 border-2 border-gray-400 rounded-sm" />
                                            <span>3:4 Portrait</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="21:9">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-2 border-2 border-gray-400 rounded-sm" />
                                            <span>21:9 Ultra-wide</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Generation Mode Settings */}
                        <div className="border-t pt-4 mt-4">
                            <Label className="text-sm font-medium mb-3 block">Generation Mode</Label>
                            <p className="text-xs text-gray-500 mb-3">
                                Choose how generation buttons are displayed.
                            </p>

                            {/* Key Actions Mode */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-700">Key Actions</span>
                                <Select value={keyActionGenMode} onValueChange={(v) => setKeyActionGenMode(v as 'all' | 'per_beat')}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All at once</SelectItem>
                                        <SelectItem value="per_beat">Per beat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Prompts Mode */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-700">Prompts</span>
                                <Select value={promptGenMode} onValueChange={(v) => setPromptGenMode(v as 'all' | 'per_beat')}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All at once</SelectItem>
                                        <SelectItem value="per_beat">Per beat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Images Mode */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-700">Images</span>
                                <Select value={imageGenMode} onValueChange={(v) => setImageGenMode(v as 'per_beat' | 'per_item')}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_beat">Per beat</SelectItem>
                                        <SelectItem value="per_item">Per key action</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Info about settings */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-700">
                                <strong>Tip:</strong> Change art style and aspect ratio before generating images for best results.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                            Cancel
                        </Button>
                        <Button onClick={updateSettings}>
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create New Moodboard Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Moodboard</DialogTitle>
                        <DialogDescription>
                            Configure the settings for your new moodboard version.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Moodboard Name */}
                        <div>
                            <Label className="text-sm font-medium">Moodboard Name</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                Optional - give your moodboard a memorable name.
                            </p>
                            <input
                                type="text"
                                placeholder={`v${(moodboardVersions?.length || 0) + 1}`}
                                value={newMoodboardName}
                                onChange={(e) => setNewMoodboardName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        {/* Art Style Selector */}
                        <div>
                            <Label className="text-sm font-medium">Art Style</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                Choose the visual style for generated images.
                            </p>
                            <Select value={newArtStyle} onValueChange={setNewArtStyle}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ART_STYLES.map(style => (
                                        <SelectItem key={style.id} value={style.id}>
                                            <div className="flex items-center gap-2">
                                                <style.icon className="h-4 w-4" />
                                                <span className="font-medium">{style.label}</span>
                                                <span className="text-xs text-gray-500">- {style.desc}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Key Action Count Slider */}
                        <div>
                            <Label className="text-sm font-medium">Key Actions per Beat: {newKeyActionCount}</Label>
                            <p className="text-xs text-gray-500 mb-2">
                                Number of visual key actions to generate for each story beat.
                            </p>
                            <Slider
                                value={[newKeyActionCount]}
                                onValueChange={([v]) => setNewKeyActionCount(v)}
                                min={3}
                                max={10}
                                step={1}
                                className="mt-2"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>3 (quick overview)</span>
                                <span>10 (detailed breakdown)</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-700">
                                <strong>Note:</strong> {moodboard ? 'The current moodboard version will be preserved.' : 'This will create your first moodboard based on the story beats.'}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmCreateNewVersion}
                            disabled={isGenerating['create']}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
                        >
                            {isGenerating['create'] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Create Moodboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Dialog */}
            < Dialog open={showClearDialog} onOpenChange={setShowClearDialog} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Moodboard Content</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <p className="text-sm text-gray-500">Choose what to clear:</p>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3"
                            onClick={() => clearMoodboard('images')}
                            disabled={isGenerating['clear']}
                        >
                            <div className="text-left">
                                <p className="font-medium">Clear Images Only</p>
                                <p className="text-xs text-gray-500">Keep prompts and key actions</p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3"
                            onClick={() => clearMoodboard('prompts')}
                            disabled={isGenerating['clear']}
                        >
                            <div className="text-left">
                                <p className="font-medium">Clear Prompts</p>
                                <p className="text-xs text-gray-500">Keep key actions, clear prompts and images</p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => clearMoodboard('all')}
                            disabled={isGenerating['clear']}
                        >
                            <div className="text-left">
                                <p className="font-medium">Clear Everything</p>
                                <p className="text-xs text-red-400">Remove all generated content</p>
                            </div>
                        </Button>

                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <p className="text-sm text-gray-500 mb-2">Danger Zone:</p>
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-3 border-red-300 text-red-700 hover:bg-red-50"
                                onClick={async () => {
                                    // Close dialog first to avoid modal conflict
                                    setShowClearDialog(false);

                                    // Small delay to allow dialog to close
                                    await new Promise(resolve => setTimeout(resolve, 100));

                                    const result = await swalAlert.confirm(
                                        'Delete Moodboard',
                                        'Are you sure you want to delete this moodboard version? You can restore it later.',
                                        'Delete',
                                        'Cancel'
                                    );
                                    if (result.isConfirmed) {
                                        await deleteMoodboard();
                                        toast.success('Moodboard deleted successfully');
                                    }
                                }}
                                disabled={isGenerating['delete']}
                            >
                                {isGenerating['delete'] ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                <div className="text-left">
                                    <p className="font-medium">Delete Moodboard</p>
                                    <p className="text-xs text-red-400">Soft delete - can be restored later</p>
                                </div>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Generation Progress Modal - for key_actions and prompts only (images have separate modal) */}
            <Dialog open={generationProgress.isActive && generationProgress.type !== 'images'} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            Generating {generationProgress.type === 'key_actions' ? 'Key Actions' : generationProgress.type === 'images' ? 'Images' : 'Prompts'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{generationProgress.currentIndex} / {generationProgress.totalCount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(generationProgress.currentIndex / generationProgress.totalCount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Current beat */}
                        <div className="text-center py-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Currently processing:</p>
                            <p className="text-lg font-semibold text-orange-600">
                                {generationProgress.currentLabel || 'Starting...'}
                            </p>
                        </div>

                        {/* Errors if any */}
                        {generationProgress.errors.length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                <p className="text-sm font-medium text-red-600 mb-1">
                                    Errors ({generationProgress.errors.length}):
                                </p>
                                <ul className="text-xs text-red-500 max-h-20 overflow-y-auto">
                                    {generationProgress.errors.slice(0, 3).map((err, i) => (
                                        <li key={i}>• {err}</li>
                                    ))}
                                    {generationProgress.errors.length > 3 && (
                                        <li>... and {generationProgress.errors.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Please wait while AI generates content for each story beat...
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
