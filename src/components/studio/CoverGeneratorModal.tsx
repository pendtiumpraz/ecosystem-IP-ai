"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2, ImageIcon, Sparkles, Upload, X, Plus, Users, Check } from 'lucide-react';
import { toast } from '@/lib/sweetalert';

// Style options for cover generation
const COVER_STYLE_OPTIONS = [
    { value: 'cinematic', label: 'Cinematic Movie Poster' },
    { value: 'anime', label: 'Anime Style' },
    { value: 'illustration', label: 'Digital Illustration' },
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'comic', label: 'Comic Book Style' },
    { value: 'watercolor', label: 'Watercolor Art' },
    { value: 'minimalist', label: 'Minimalist Design' },
    { value: 'fantasy', label: 'Fantasy Art' },
    { value: 'scifi', label: 'Sci-Fi Concept Art' },
];

// Resolution options
const RESOLUTION_OPTIONS = [
    { value: '768x1024', label: '768 x 1024 (Portrait - Recommended)', width: 768, height: 1024 },
    { value: '1024x768', label: '1024 x 768 (Landscape)', width: 1024, height: 768 },
    { value: '1024x1024', label: '1024 x 1024 (Square)', width: 1024, height: 1024 },
    { value: '576x1024', label: '576 x 1024 (Phone Wallpaper)', width: 576, height: 1024 },
];

const MAX_REFERENCE_IMAGES = 5;
const MAX_ADDITIONAL_CHARACTERS = 5;

// Character type for selection
interface CharacterForSelection {
    id: string;
    name: string;
    role?: string;
    imageUrl?: string;
    imagePoses?: Record<string, string>;
    imageVersions?: { id: string; imageUrl: string; isActive: boolean }[];
}

interface ReferenceImage {
    id: string;
    file: File;
    previewUrl: string;
    uploadedUrl?: string;
    isUploading?: boolean;
}

interface CoverGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: CoverGenerationOptions) => Promise<void>;
    projectTitle: string;
    projectDescription?: string;
    studioName?: string;
    mediumType?: string;
    mainGenre?: string;
    subGenre?: string;
    tone?: string;
    theme?: string;
    coreConflict?: string;
    protagonistName?: string;
    ipOwner?: string;
    hasProtagonistImage: boolean;
    isGenerating: boolean;
    characters?: CharacterForSelection[];
}

export interface CoverGenerationOptions {
    style: string;
    resolution: string;
    width: number;
    height: number;
    prompt: string;
    useI2I: boolean;
    referenceImageUrls?: string[];
    selectedCharacterIds?: string[];
}

export function CoverGeneratorModal({
    isOpen,
    onClose,
    onGenerate,
    projectTitle,
    projectDescription,
    studioName,
    mediumType,
    mainGenre,
    subGenre,
    tone,
    theme,
    coreConflict,
    protagonistName,
    ipOwner,
    hasProtagonistImage,
    isGenerating,
    characters = [],
}: CoverGeneratorModalProps) {
    const [style, setStyle] = useState('cinematic');
    const [resolution, setResolution] = useState('768x1024');
    const [useI2I, setUseI2I] = useState(hasProtagonistImage);
    const [customPrompt, setCustomPrompt] = useState('');
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [userPreference, setUserPreference] = useState('');
    const [promptElements, setPromptElements] = useState<{
        subject?: string;
        style?: string;
        lighting?: string;
        colorPalette?: string;
        cameraAngle?: string;
        background?: string;
        mood?: string;
        composition?: string;
        effects?: string;
        quality?: string;
    } | null>(null);
    const [typography, setTypography] = useState<{
        title?: { text?: string; style?: string; color?: string; position?: string; effect?: string };
        tagline?: { text?: string; style?: string; color?: string };
        credits?: { studio?: string; producer?: string; style?: string };
    } | null>(null);
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter characters with images (excluding protagonist)
    const availableCharacters = characters.filter(char => {
        // Exclude protagonist (already handled separately)
        if (char.role?.toLowerCase() === 'protagonist') return false;
        // Check for ANY image - active version, imageUrl, or any imagePose
        const activeVersion = char.imageVersions?.find(v => v.isActive);
        const hasImagePose = char.imagePoses && Object.values(char.imagePoses).some(url => url && url.length > 0);
        return !!(activeVersion?.imageUrl || char.imageUrl || hasImagePose);
    });

    // Debug: log available characters
    console.log('[CoverModal] Characters passed:', characters.length, 'Available (with images, non-protagonist):', availableCharacters.length);

    // Build default prompt based on project data
    const buildDefaultPrompt = (forI2I: boolean) => {
        const parts = [];

        // Style prefix
        const styleLabel = COVER_STYLE_OPTIONS.find(s => s.value === style)?.label || 'cinematic';
        parts.push(`${styleLabel} style`);

        // Project info
        if (projectTitle) parts.push(`for "${projectTitle}"`);

        // Genre/tone/theme
        if (mainGenre) parts.push(`${mainGenre} genre`);
        if (tone) parts.push(`${tone} tone`);
        if (theme) parts.push(`exploring ${theme} theme`);

        // Protagonist
        if (protagonistName) {
            if (forI2I) {
                parts.push(`featuring the character shown in the reference image as ${protagonistName}`);
            } else {
                parts.push(`featuring ${protagonistName} as protagonist`);
            }
        }

        // Additional selected characters with their roles
        if (selectedCharacters.length > 0) {
            const charDescriptions = selectedCharacters
                .map(id => {
                    const char = characters.find(c => c.id === id);
                    if (!char) return null;
                    return char.role ? `${char.name} (${char.role})` : char.name;
                })
                .filter(Boolean);
            if (charDescriptions.length > 0) {
                parts.push(`with ${charDescriptions.join(', ')}`);
            }
        }

        // Quality keywords
        parts.push('professional key art, dramatic lighting, high quality, detailed');

        // Description
        if (projectDescription) {
            parts.push(projectDescription.slice(0, 200));
        }

        return parts.join(', ');
    };

    // Update custom prompt when style changes or modal opens
    useEffect(() => {
        if (isOpen && !customPrompt) {
            setCustomPrompt(buildDefaultPrompt(useI2I));
        }
    }, [isOpen, style]);

    // Update useI2I when hasProtagonistImage changes
    useEffect(() => {
        setUseI2I(hasProtagonistImage);
    }, [hasProtagonistImage]);

    // Handle style change - update prompt
    const handleStyleChange = (newStyle: string) => {
        setStyle(newStyle);
        setCustomPrompt(buildDefaultPrompt(useI2I));
    };

    // Handle I2I toggle
    const handleUseI2IChange = (checked: boolean) => {
        setUseI2I(checked);
        setCustomPrompt(buildDefaultPrompt(checked));
    };

    // Generate AI prompt using deepseek-chat
    const handleGenerateAIPrompt = async () => {
        setIsGeneratingPrompt(true);
        setPromptElements(null);
        setTypography(null);
        try {
            const styleLabel = COVER_STYLE_OPTIONS.find(s => s.value === style)?.label || 'Cinematic Movie Poster';

            // Build additional characters with roles for API
            const additionalChars = selectedCharacters.map(id => {
                const char = characters.find(c => c.id === id);
                return char ? { name: char.name, role: char.role || 'Supporting' } : null;
            }).filter(Boolean);

            const promptRequest = {
                projectTitle,
                projectDescription,
                studioName,
                mediumType,
                mainGenre,
                subGenre,
                tone,
                theme,
                coreConflict,
                protagonistName,
                ipOwner,
                artStyle: styleLabel,
                resolution,
                useI2I: useI2I && hasProtagonistImage,
                userPreference: userPreference.trim() || undefined,
                additionalCharacters: additionalChars.length > 0 ? additionalChars : undefined,
            };

            const response = await fetch('/api/ai/generate-cover-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptRequest),
            });

            if (!response.ok) {
                throw new Error('Failed to generate prompt');
            }

            const data = await response.json();
            if (data.prompt) {
                setCustomPrompt(data.prompt);
                // Store JSON elements for display
                if (data.jsonPrompt?.elements) {
                    setPromptElements(data.jsonPrompt.elements);
                }
                // Store typography info
                if (data.typography || data.jsonPrompt?.typography) {
                    setTypography(data.typography || data.jsonPrompt?.typography);
                }
                toast.success('AI prompt generated with typography!');
            }
        } catch (error) {
            console.error('Failed to generate AI prompt:', error);
            toast.error('Failed to generate AI prompt');
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
        if (remainingSlots <= 0) {
            toast.warning(`Maximum ${MAX_REFERENCE_IMAGES} reference images allowed`);
            return;
        }

        const filesToAdd = Array.from(files).slice(0, remainingSlots);

        // Create preview and add to state
        const newImages: ReferenceImage[] = filesToAdd.map(file => ({
            id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            previewUrl: URL.createObjectURL(file),
            isUploading: true,
        }));

        setReferenceImages(prev => [...prev, ...newImages]);

        // Upload each image
        for (const img of newImages) {
            await uploadImage(img);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload image to temp storage
    const uploadImage = async (img: ReferenceImage) => {
        try {
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(img.file);
            });
            const base64Data = await base64Promise;

            // Upload to temp storage
            const res = await fetch('/api/temp-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Data }),
            });

            if (res.ok) {
                const data = await res.json();
                setReferenceImages(prev =>
                    prev.map(i =>
                        i.id === img.id
                            ? { ...i, uploadedUrl: data.url, isUploading: false }
                            : i
                    )
                );
                console.log(`[CoverModal] Uploaded reference image: ${data.url}`);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Failed to upload reference image:', error);
            toast.error('Failed to upload image');
            // Remove failed image
            setReferenceImages(prev => prev.filter(i => i.id !== img.id));
        }
    };

    // Remove reference image
    const removeReferenceImage = (id: string) => {
        setReferenceImages(prev => {
            const img = prev.find(i => i.id === id);
            if (img?.previewUrl) {
                URL.revokeObjectURL(img.previewUrl);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    // Handle generate
    const handleGenerate = async () => {
        const selectedResolution = RESOLUTION_OPTIONS.find(r => r.value === resolution);

        // Get uploaded URLs from manual uploads
        const uploadedUrls = referenceImages
            .filter(img => img.uploadedUrl)
            .map(img => img.uploadedUrl!);

        // Get image URLs from selected characters, sorted by role priority
        // Order matters for I2I: protagonist first, then supportive roles, antagonist last
        const rolePriority: Record<string, number> = {
            'protagonist': 1,
            'love interest': 2,
            'sidekick': 3,
            'mentor': 4,
            'supporting': 5,
            'antagonist': 10, // Last, for shadows/background
            'villain': 10,
        };

        const sortedSelectedChars = [...selectedCharacters]
            .map(charId => characters.find(c => c.id === charId))
            .filter((char): char is NonNullable<typeof char> => char !== undefined)
            .sort((a, b) => {
                const roleA = (a.role || 'supporting').toLowerCase();
                const roleB = (b.role || 'supporting').toLowerCase();
                const priorityA = Object.entries(rolePriority).find(([key]) => roleA.includes(key))?.[1] || 5;
                const priorityB = Object.entries(rolePriority).find(([key]) => roleB.includes(key))?.[1] || 5;
                return priorityA - priorityB;
            });

        const characterImageUrls = sortedSelectedChars
            .map(char => {
                const activeVersion = char.imageVersions?.find(v => v.isActive);
                return activeVersion?.imageUrl || char.imageUrl || char.imagePoses?.portrait || null;
            })
            .filter((url): url is string => url !== null);

        // Combine all reference URLs (manual uploads first, then sorted characters)
        const allReferenceUrls = [...uploadedUrls, ...characterImageUrls];

        await onGenerate({
            style,
            resolution,
            width: selectedResolution?.width || 768,
            height: selectedResolution?.height || 1024,
            prompt: customPrompt,
            useI2I: useI2I && hasProtagonistImage,
            referenceImageUrls: allReferenceUrls.length > 0 ? allReferenceUrls : undefined,
            selectedCharacterIds: selectedCharacters.length > 0 ? selectedCharacters : undefined,
        });
    };

    // Reset on close
    const handleClose = () => {
        // Cleanup URLs
        referenceImages.forEach(img => {
            if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        });
        setReferenceImages([]);
        setCustomPrompt('');
        onClose();
    };

    const hasUploadingImages = referenceImages.some(img => img.isUploading);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-orange-500/30 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                            <Wand2 className="h-5 w-5 text-white" />
                        </div>
                        Generate Cover Art
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create stunning cover art for your IP project using AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Project Info Card */}
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                        <div className="flex items-center gap-2 text-orange-400 text-sm font-bold uppercase tracking-wider">
                            <Sparkles className="h-4 w-4" />
                            Project Info
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">{projectTitle || 'Untitled Project'}</h3>
                            {studioName && (
                                <p className="text-sm text-slate-400">Studio: <span className="text-slate-300">{studioName}</span></p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {mediumType && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        {mediumType}
                                    </span>
                                )}
                                {mainGenre && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {mainGenre}
                                    </span>
                                )}
                                {tone && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        {tone}
                                    </span>
                                )}
                            </div>
                            {projectDescription && (
                                <p className="text-xs text-slate-500 line-clamp-2">{projectDescription}</p>
                            )}
                        </div>
                    </div>
                    {/* Generation Mode */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Generation Mode</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleUseI2IChange(false)}
                                className={`p-4 rounded-xl border-2 transition-all ${!useI2I
                                    ? 'border-orange-500 bg-orange-500/10'
                                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                    }`}
                            >
                                <Sparkles className={`h-6 w-6 mx-auto mb-2 ${!useI2I ? 'text-orange-400' : 'text-slate-400'}`} />
                                <div className={`text-sm font-medium ${!useI2I ? 'text-white' : 'text-slate-300'}`}>
                                    Text to Image
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Generate from text prompt
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => hasProtagonistImage && handleUseI2IChange(true)}
                                disabled={!hasProtagonistImage}
                                className={`p-4 rounded-xl border-2 transition-all ${useI2I && hasProtagonistImage
                                    ? 'border-orange-500 bg-orange-500/10'
                                    : hasProtagonistImage
                                        ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                        : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <ImageIcon className={`h-6 w-6 mx-auto mb-2 ${useI2I && hasProtagonistImage ? 'text-orange-400' : 'text-slate-400'}`} />
                                <div className={`text-sm font-medium ${useI2I && hasProtagonistImage ? 'text-white' : 'text-slate-300'}`}>
                                    Image to Image
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {hasProtagonistImage ? 'Use protagonist as reference' : 'No protagonist image available'}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Additional Characters Selection */}
                    {availableCharacters.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-purple-400" />
                                    Additional Characters (Optional)
                                </Label>
                                <span className="text-xs text-slate-500">
                                    {selectedCharacters.length}/{MAX_ADDITIONAL_CHARACTERS}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Select characters with active images to include in the cover art
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {availableCharacters.map(char => {
                                    const isSelected = selectedCharacters.includes(char.id);
                                    const canSelect = selectedCharacters.length < MAX_ADDITIONAL_CHARACTERS || isSelected;
                                    const activeVersion = char.imageVersions?.find(v => v.isActive);
                                    const imageUrl = activeVersion?.imageUrl || char.imageUrl || char.imagePoses?.portrait;

                                    return (
                                        <button
                                            key={char.id}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedCharacters(prev => prev.filter(id => id !== char.id));
                                                } else if (canSelect) {
                                                    setSelectedCharacters(prev => [...prev, char.id]);
                                                }
                                            }}
                                            disabled={!canSelect && !isSelected}
                                            className={`relative flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${isSelected
                                                ? 'border-purple-500 bg-purple-500/20'
                                                : canSelect
                                                    ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                                    : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            {/* Character thumbnail */}
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={char.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-medium text-white">{char.name}</div>
                                                {char.role && (
                                                    <div className="text-[10px] text-slate-400">{char.role}</div>
                                                )}
                                            </div>
                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedCharacters.length > 0 && (
                                <p className="text-xs text-purple-400">
                                    ✨ {selectedCharacters.length} character{selectedCharacters.length > 1 ? 's' : ''} will be included in the cover
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reference Images Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-300">
                                Reference Images (Optional)
                            </Label>
                            <span className="text-xs text-slate-500">
                                {referenceImages.length}/{MAX_REFERENCE_IMAGES}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Uploaded images */}
                            {referenceImages.map(img => (
                                <div
                                    key={img.id}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-600 group"
                                >
                                    <img
                                        src={img.previewUrl}
                                        alt="Reference"
                                        className="w-full h-full object-cover"
                                    />
                                    {img.isUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                                        </div>
                                    )}
                                    {!img.isUploading && (
                                        <button
                                            onClick={() => removeReferenceImage(img.id)}
                                            className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add button */}
                            {referenceImages.length < MAX_REFERENCE_IMAGES && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-600 hover:border-orange-500 flex flex-col items-center justify-center transition-colors bg-slate-800/30"
                                >
                                    <Plus className="h-5 w-5 text-slate-400" />
                                    <span className="text-[10px] text-slate-500">Add</span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-500">
                            📎 Upload up to {MAX_REFERENCE_IMAGES} images as style/composition reference (auto-deleted after 2 min)
                        </p>
                    </div>

                    {/* Style Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Art Style</Label>
                        <Select value={style} onValueChange={handleStyleChange}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                                {COVER_STYLE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-slate-700">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Resolution Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">Resolution</Label>
                        <Select value={resolution} onValueChange={setResolution}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                                {RESOLUTION_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-slate-700">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Prompt */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-300">AI Prompt</Label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomPrompt(buildDefaultPrompt(useI2I));
                                        setPromptElements(null);
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-300"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* User Preference Input */}
                        <div className="space-y-1">
                            <Label className="text-xs text-purple-400">✨ Your Preference (Optional)</Label>
                            <Textarea
                                value={userPreference}
                                onChange={(e) => setUserPreference(e.target.value)}
                                placeholder="e.g., 'Dark moody atmosphere', 'Vibrant anime style', 'Focus on the city skyline', 'Use warm sunset colors'..."
                                className="bg-purple-950/30 border-purple-500/30 text-white min-h-[60px] resize-none placeholder:text-purple-400/50 text-sm"
                            />
                        </div>

                        {/* AI Prompt Generator */}
                        <button
                            type="button"
                            onClick={handleGenerateAIPrompt}
                            disabled={isGeneratingPrompt}
                            className="w-full p-3 rounded-xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500 transition-all flex items-center justify-center gap-2"
                        >
                            {isGeneratingPrompt ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                    <span className="text-sm text-purple-300">Generating cinematic prompt...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm text-purple-300 font-medium">✨ Generate AI Prompt</span>
                                    <span className="text-xs text-purple-500">(DeepSeek)</span>
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-center text-slate-500">
                            AI generates detailed JSON prompt: style, lighting, camera, background, mood, effects
                        </p>

                        {/* Prompt Elements Display */}
                        {promptElements && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 space-y-2">
                                <p className="text-xs font-semibold text-purple-300">🎨 Visual Elements:</p>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                    {promptElements.lighting && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-amber-400">💡 Lighting:</span>
                                            <span className="text-slate-300">{promptElements.lighting}</span>
                                        </div>
                                    )}
                                    {promptElements.colorPalette && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-pink-400">🎨 Colors:</span>
                                            <span className="text-slate-300">{promptElements.colorPalette}</span>
                                        </div>
                                    )}
                                    {promptElements.cameraAngle && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-blue-400">📷 Camera:</span>
                                            <span className="text-slate-300">{promptElements.cameraAngle}</span>
                                        </div>
                                    )}
                                    {promptElements.background && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-green-400">🏔️ Background:</span>
                                            <span className="text-slate-300">{promptElements.background}</span>
                                        </div>
                                    )}
                                    {promptElements.mood && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-purple-400">✨ Mood:</span>
                                            <span className="text-slate-300">{promptElements.mood}</span>
                                        </div>
                                    )}
                                    {promptElements.effects && (
                                        <div className="flex items-start gap-1">
                                            <span className="text-cyan-400">🌟 Effects:</span>
                                            <span className="text-slate-300">{promptElements.effects}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Typography Display */}
                        {typography && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/20 space-y-2">
                                <p className="text-xs font-semibold text-amber-300">🎬 Typography & Credits:</p>
                                <div className="space-y-2 text-[10px]">
                                    {/* Title */}
                                    {typography.title && (
                                        <div className="p-2 rounded-lg bg-black/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-amber-400 font-bold">📽️ TITLE:</span>
                                                <span
                                                    className="font-bold text-sm"
                                                    style={{ color: typography.title.color || '#FFFFFF' }}
                                                >
                                                    {typography.title.text}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-slate-400">
                                                <span>Font: {typography.title.style}</span>
                                                <span>•</span>
                                                <span>Position: {typography.title.position}</span>
                                                {typography.title.effect && <><span>•</span><span>Effect: {typography.title.effect}</span></>}
                                            </div>
                                        </div>
                                    )}
                                    {/* Tagline */}
                                    {typography.tagline && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-orange-400">💬 Tagline:</span>
                                            <span
                                                className="italic"
                                                style={{ color: typography.tagline.color || '#CCCCCC' }}
                                            >
                                                "{typography.tagline.text}"
                                            </span>
                                        </div>
                                    )}
                                    {/* Credits */}
                                    {typography.credits && (
                                        <div className="flex flex-wrap gap-3 text-slate-400">
                                            {typography.credits.studio && (
                                                <span>🏢 {typography.credits.studio}</span>
                                            )}
                                            {typography.credits.producer && (
                                                <span>👤 {typography.credits.producer}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Describe your cover art... or use AI to generate a detailed prompt"
                            className="bg-slate-800 border-slate-600 text-white min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-slate-500">
                            {useI2I && hasProtagonistImage
                                ? '💡 The protagonist image will be used as reference to maintain character consistency'
                                : referenceImages.length > 0
                                    ? `💡 ${referenceImages.length} reference image(s) will guide the style and composition`
                                    : '💡 Tip: Be specific about colors, composition, and mood for better results'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isGenerating}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !customPrompt.trim() || hasUploadingImages}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Cover
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
