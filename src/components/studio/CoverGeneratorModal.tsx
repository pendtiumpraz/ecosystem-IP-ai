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
import { Wand2, Loader2, ImageIcon, Sparkles, Upload, X, Plus } from 'lucide-react';
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
    mainGenre?: string;
    tone?: string;
    theme?: string;
    protagonistName?: string;
    hasProtagonistImage: boolean;
    isGenerating: boolean;
}

export interface CoverGenerationOptions {
    style: string;
    resolution: string;
    width: number;
    height: number;
    prompt: string;
    useI2I: boolean;
    referenceImageUrls?: string[];
}

export function CoverGeneratorModal({
    isOpen,
    onClose,
    onGenerate,
    projectTitle,
    projectDescription,
    mainGenre,
    tone,
    theme,
    protagonistName,
    hasProtagonistImage,
    isGenerating,
}: CoverGeneratorModalProps) {
    const [style, setStyle] = useState('cinematic');
    const [resolution, setResolution] = useState('768x1024');
    const [useI2I, setUseI2I] = useState(hasProtagonistImage);
    const [customPrompt, setCustomPrompt] = useState('');
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        // Get uploaded URLs
        const uploadedUrls = referenceImages
            .filter(img => img.uploadedUrl)
            .map(img => img.uploadedUrl!);

        await onGenerate({
            style,
            resolution,
            width: selectedResolution?.width || 768,
            height: selectedResolution?.height || 1024,
            prompt: customPrompt,
            useI2I: useI2I && hasProtagonistImage,
            referenceImageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-300">Prompt</Label>
                            <button
                                type="button"
                                onClick={() => setCustomPrompt(buildDefaultPrompt(useI2I))}
                                className="text-xs text-orange-400 hover:text-orange-300"
                            >
                                Reset to default
                            </button>
                        </div>
                        <Textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Describe your cover art..."
                            className="bg-slate-800 border-slate-600 text-white min-h-[100px] resize-none"
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
