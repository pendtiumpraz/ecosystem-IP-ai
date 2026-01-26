'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, RefreshCw, Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';

// ============ TYPES ============

interface VisualGridItem {
    id: string;
    label: string;
    prompt: string;
    icon?: string;
}

interface GenerationProgress {
    current: number;
    total: number;
    currentItem?: VisualGridItem;
    results: Record<string, { status: 'pending' | 'generating' | 'success' | 'error'; imageUrl?: string }>;
}

interface CharacterVisualGridProps {
    title: string;
    description?: string;
    items: VisualGridItem[];
    characterId: string;
    characterData: {
        name: string;
        role?: string;
        gender?: string;
        ethnicity?: string;
        skinTone?: string;
        hairStyle?: string;
        hairColor?: string;
        eyeColor?: string;
        bodyType?: string;
        height?: string;
        clothingStyle?: string;
        imageUrl?: string; // Active image version URL - used for i2i reference
    };
    savedImages?: Record<string, string>; // { itemId: imageUrl }
    userId: string;
    projectId?: string;
    onSave: (itemId: string, imageUrl: string) => void;
    onSaveAll?: (images: Record<string, string>) => void; // Save all at once for batch
    gridCols?: 2 | 3 | 4 | 5;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
    gridType?: 'poses' | 'expressions' | 'gestures'; // For theming
}

// ============ COMPONENT ============

export function CharacterVisualGrid({
    title,
    description,
    items,
    characterId,
    characterData,
    savedImages = {},
    userId,
    projectId,
    onSave,
    onSaveAll,
    gridCols = 4,
    aspectRatio = 'portrait',
    gridType = 'poses'
}: CharacterVisualGridProps) {
    const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());
    const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
    const [preference, setPreference] = useState('');

    // Progress modal state
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress>({
        current: 0,
        total: items.length,
        results: {}
    });
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    // Theme colors based on grid type
    const themeColors = {
        poses: { from: 'from-blue-500', to: 'to-indigo-500', bg: 'from-blue-50/50 to-indigo-50/30', border: 'border-blue-200/50', badge: 'bg-blue-100 text-blue-700' },
        expressions: { from: 'from-pink-500', to: 'to-rose-500', bg: 'from-pink-50/50 to-rose-50/30', border: 'border-pink-200/50', badge: 'bg-pink-100 text-pink-700' },
        gestures: { from: 'from-orange-500', to: 'to-amber-500', bg: 'from-orange-50/50 to-amber-50/30', border: 'border-orange-200/50', badge: 'bg-orange-100 text-orange-700' }
    }[gridType];

    // Build character description for prompt
    const buildCharacterContext = () => {
        const parts = [];
        if (characterData.name) parts.push(`Character: ${characterData.name}`);
        if (characterData.role) parts.push(`Role: ${characterData.role}`);
        if (characterData.gender) parts.push(`Gender: ${characterData.gender}`);
        if (characterData.ethnicity) parts.push(`Ethnicity: ${characterData.ethnicity}`);
        if (characterData.skinTone) parts.push(`Skin tone: ${characterData.skinTone}`);
        if (characterData.hairStyle) parts.push(`Hair: ${characterData.hairStyle}`);
        if (characterData.hairColor) parts.push(`Hair color: ${characterData.hairColor}`);
        if (characterData.eyeColor) parts.push(`Eyes: ${characterData.eyeColor}`);
        if (characterData.bodyType) parts.push(`Body type: ${characterData.bodyType}`);
        if (characterData.height) parts.push(`Height: ${characterData.height}`);
        if (characterData.clothingStyle) parts.push(`Clothing: ${characterData.clothingStyle}`);
        return parts.join(', ');
    };

    // Generate image for a single item (for individual generation)
    const handleGenerate = async (item: VisualGridItem) => {
        if (!characterData.name) {
            toast.warning('Please fill in character name first');
            return;
        }

        if (!characterData.imageUrl) {
            toast.warning('Please generate a character portrait first. The visual grid uses your character image as reference.');
            return;
        }

        setGeneratingItems(prev => new Set([...prev, item.id]));

        try {
            const imageUrl = await generateSingleImage(item);

            if (imageUrl) {
                setPreviewImages(prev => ({
                    ...prev,
                    [item.id]: imageUrl
                }));
                toast.success(`${item.label} generated!`);
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(`Failed to generate ${item.label}`);
        } finally {
            setGeneratingItems(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    // Core generation function
    const generateSingleImage = async (item: VisualGridItem): Promise<string | null> => {
        const characterContext = buildCharacterContext();
        const fullPrompt = `${characterContext}. ${item.prompt}. ${preference || ''}`.trim();

        // Determine aspect ratio dimensions
        let width = 1024;
        let height = 1024;
        if (aspectRatio === 'portrait') {
            width = 768;
            height = 1024;
        } else if (aspectRatio === 'landscape') {
            width = 1024;
            height = 768;
        }

        const response = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: fullPrompt,
                width,
                height,
                // Use active character image as reference for Image-to-Image
                referenceImageUrl: characterData.imageUrl,
                strength: 0.65, // i2i strength - keep character likeness
                metadata: {
                    characterId,
                    projectId,
                    userId,
                    itemType: item.id,
                    itemLabel: item.label,
                    gridType
                }
            })
        });

        if (!response.ok) {
            throw new Error('Generation failed');
        }

        const result = await response.json();
        return result.imageUrl || result.url;
    };

    // Generate all items with progress modal
    const handleGenerateAll = useCallback(async () => {
        if (!characterData.name) {
            toast.warning('Please fill in character name first');
            return;
        }

        if (!characterData.imageUrl) {
            toast.warning('Please generate a character portrait first. The visual grid uses your character image as reference for consistent results.');
            return;
        }

        // Initialize progress
        const initialResults: GenerationProgress['results'] = {};
        items.forEach(item => {
            initialResults[item.id] = { status: 'pending' };
        });

        setProgress({
            current: 0,
            total: items.length,
            results: initialResults
        });
        setShowProgressModal(true);
        setIsGeneratingAll(true);

        const generatedImages: Record<string, string> = {};

        // Generate images sequentially
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Update current item status to generating
            setProgress(prev => ({
                ...prev,
                current: i + 1,
                currentItem: item,
                results: {
                    ...prev.results,
                    [item.id]: { status: 'generating' }
                }
            }));

            try {
                const imageUrl = await generateSingleImage(item);

                if (imageUrl) {
                    generatedImages[item.id] = imageUrl;

                    // Update with success and image
                    setProgress(prev => ({
                        ...prev,
                        results: {
                            ...prev.results,
                            [item.id]: { status: 'success', imageUrl }
                        }
                    }));

                    // Also update preview
                    setPreviewImages(prev => ({
                        ...prev,
                        [item.id]: imageUrl
                    }));
                } else {
                    setProgress(prev => ({
                        ...prev,
                        results: {
                            ...prev.results,
                            [item.id]: { status: 'error' }
                        }
                    }));
                }
            } catch (error) {
                console.error(`Error generating ${item.label}:`, error);
                setProgress(prev => ({
                    ...prev,
                    results: {
                        ...prev.results,
                        [item.id]: { status: 'error' }
                    }
                }));
            }
        }

        setIsGeneratingAll(false);

        // Auto-save all successful generations
        if (Object.keys(generatedImages).length > 0) {
            if (onSaveAll) {
                // Batch save
                onSaveAll(generatedImages);
            } else {
                // Individual save
                for (const [itemId, url] of Object.entries(generatedImages)) {
                    onSave(itemId, url);
                }
            }
            toast.success(`Generated ${Object.keys(generatedImages).length}/${items.length} images!`);
        }
    }, [items, characterData, preference, onSave, onSaveAll, generateSingleImage]);

    // Accept preview and save
    const handleAccept = (itemId: string) => {
        const imageUrl = previewImages[itemId];
        if (imageUrl) {
            onSave(itemId, imageUrl);
            setPreviewImages(prev => {
                const next = { ...prev };
                delete next[itemId];
                return next;
            });
            toast.success('Saved!');
        }
    };

    // Reject preview
    const handleReject = (itemId: string) => {
        setPreviewImages(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    };

    // Accept all from modal
    const handleAcceptAll = () => {
        const successfulImages: Record<string, string> = {};

        for (const [itemId, result] of Object.entries(progress.results)) {
            if (result.status === 'success' && result.imageUrl) {
                successfulImages[itemId] = result.imageUrl;
            }
        }

        if (Object.keys(successfulImages).length > 0) {
            if (onSaveAll) {
                onSaveAll(successfulImages);
            } else {
                for (const [itemId, url] of Object.entries(successfulImages)) {
                    onSave(itemId, url);
                }
            }

            // Clear previews for accepted items
            setPreviewImages(prev => {
                const next = { ...prev };
                for (const itemId of Object.keys(successfulImages)) {
                    delete next[itemId];
                }
                return next;
            });
        }

        setShowProgressModal(false);
        toast.success('All images saved!');
    };

    // Get image to display (preview > saved > none)
    const getDisplayImage = (itemId: string) => {
        return previewImages[itemId] || savedImages[itemId] || null;
    };

    // Grid column classes
    const gridColsClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5'
    }[gridCols];

    // Aspect ratio classes
    const aspectClass = {
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-[4/3]'
    }[aspectRatio];

    const isGenerating = generatingItems.size > 0 || isGeneratingAll;
    const hasReference = !!characterData.imageUrl;

    // Count successful generations
    const successCount = Object.values(progress.results).filter(r => r.status === 'success').length;

    return (
        <>
            <div className={`space-y-4 p-4 rounded-xl bg-gradient-to-br ${themeColors.bg} border ${themeColors.border}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                        {description && (
                            <p className="text-xs text-gray-500">{description}</p>
                        )}
                        {!hasReference && (
                            <Badge variant="outline" className="text-[9px] bg-yellow-50 text-yellow-700 border-yellow-200">
                                Needs portrait first
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={handleGenerateAll}
                        disabled={isGenerating || !characterData.name || !hasReference}
                        className={`bg-gradient-to-r ${themeColors.from} ${themeColors.to} hover:opacity-90 text-white text-xs h-8 px-3`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Zap className="h-3 w-3 mr-1" />
                                Generate All ({items.length})
                            </>
                        )}
                    </Button>
                </div>

                {/* Reference Image Info */}
                {hasReference && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 border border-gray-200/50">
                        <img
                            src={characterData.imageUrl}
                            alt="Reference"
                            className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-[10px] text-gray-500">
                            Using active portrait as reference for consistent character appearance
                        </span>
                    </div>
                )}

                {/* Preference Input */}
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">
                        Style Preference (Optional)
                    </Label>
                    <Textarea
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        placeholder="Add style preference, e.g. 'Studio Ghibli style', 'dramatic lighting', 'cinematic'..."
                        className="min-h-[50px] text-xs bg-white border-gray-200 text-gray-900 resize-none"
                    />
                </div>

                {/* Grid */}
                <div className={`grid ${gridColsClass} gap-3`}>
                    {items.map((item) => {
                        const imageUrl = getDisplayImage(item.id);
                        const isItemGenerating = generatingItems.has(item.id);
                        const hasPreview = !!previewImages[item.id];
                        const isSaved = !!savedImages[item.id];

                        return (
                            <div key={item.id} className="group relative">
                                {/* Label */}
                                <div className="text-center mb-1">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                        {item.icon && <span className="mr-1">{item.icon}</span>}
                                        {item.label}
                                    </span>
                                </div>

                                {/* Image Container */}
                                <div className={`${aspectClass} rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative`}>
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt={item.label}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Saved indicator */}
                                            {isSaved && !hasPreview && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="p-1 bg-green-500 rounded-full">
                                                        <Check className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Preview indicator */}
                                            {hasPreview && (
                                                <div className="absolute top-1 left-1">
                                                    <Badge className="text-[8px] bg-orange-500 text-white">
                                                        Preview
                                                    </Badge>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <ImageIcon className="h-8 w-8 mb-1" />
                                            <span className="text-[10px]">No image</span>
                                        </div>
                                    )}

                                    {/* Loading overlay */}
                                    {isItemGenerating && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                                                <span className="text-[10px] text-white">Generating...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover actions */}
                                    {!isItemGenerating && !isGeneratingAll && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            {hasPreview ? (
                                                // Preview actions: Accept / Reject / Regenerate
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleAccept(item.id)}
                                                        className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600 text-white rounded-full"
                                                        title="Accept & Save"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleReject(item.id)}
                                                        className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                                        title="Reject"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleGenerate(item)}
                                                        disabled={!hasReference}
                                                        className="h-7 w-7 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                                                        title="Regenerate"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                // Generate / Regenerate
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleGenerate(item)}
                                                    disabled={!hasReference}
                                                    className={`bg-gradient-to-r ${themeColors.from} ${themeColors.to} text-white text-xs h-7 px-2`}
                                                >
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    {imageUrl ? 'Regen' : 'Generate'}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress Modal */}
            <Dialog open={showProgressModal} onOpenChange={(open) => !isGeneratingAll && setShowProgressModal(open)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isGeneratingAll ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                    Generating {title}
                                </>
                            ) : (
                                <>
                                    <Check className="h-5 w-5 text-green-500" />
                                    Generation Complete
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-bold text-gray-700">
                                    {progress.current} / {progress.total}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${themeColors.from} ${themeColors.to} transition-all duration-300`}
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            {progress.currentItem && isGeneratingAll && (
                                <p className="text-xs text-gray-500 text-center">
                                    Currently generating: <span className="font-medium">{progress.currentItem.label}</span>
                                </p>
                            )}
                        </div>

                        {/* Thumbnails Grid */}
                        <div className={`grid ${gridColsClass} gap-3`}>
                            {items.map((item) => {
                                const result = progress.results[item.id];
                                const status = result?.status || 'pending';
                                const imageUrl = result?.imageUrl;

                                return (
                                    <div key={item.id} className="text-center">
                                        <div className={`${aspectClass} rounded-lg bg-gray-100 border-2 overflow-hidden relative ${status === 'success' ? 'border-green-400' :
                                                status === 'generating' ? 'border-orange-400' :
                                                    status === 'error' ? 'border-red-400' :
                                                        'border-gray-200'
                                            }`}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.label}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : status === 'generating' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                                                </div>
                                            ) : status === 'error' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-red-50">
                                                    <X className="h-6 w-6 text-red-500" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            {status === 'success' && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="p-0.5 bg-green-500 rounded-full">
                                                        <Check className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-600 mt-1 block">
                                            {item.icon} {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        {!isGeneratingAll && (
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-gray-500">
                                    <span className="text-green-600 font-bold">{successCount}</span> successful,
                                    <span className="text-red-600 font-bold ml-1">{items.length - successCount}</span> failed
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowProgressModal(false)}
                                    >
                                        Close
                                    </Button>
                                    {successCount > 0 && (
                                        <Button
                                            onClick={handleAcceptAll}
                                            className={`bg-gradient-to-r ${themeColors.from} ${themeColors.to} text-white`}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Save All ({successCount})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ============ PRESET CONFIGURATIONS ============

// Key Poses for character (5 poses as per deck slide 8)
export const KEY_POSES_ITEMS: VisualGridItem[] = [
    { id: 'front', label: 'Front', prompt: 'Full body front view, standing pose, facing camera directly, professional character design sheet, same character, consistent appearance' },
    { id: 'right', label: 'Right', prompt: 'Full body right side profile view, standing pose, character design sheet, same character, consistent appearance' },
    { id: 'left', label: 'Left', prompt: 'Full body left side profile view, standing pose, character design sheet, same character, consistent appearance' },
    { id: 'back', label: 'Back', prompt: 'Full body back view, showing back of character, standing pose, character design sheet, same character, consistent appearance' },
    { id: 'three_quarter', label: '3/4 View', prompt: 'Full body three-quarter view, dynamic angle, character design sheet, same character, consistent appearance' },
];

// Facial Expressions (4 expressions as per deck slide 8)
export const FACIAL_EXPRESSION_ITEMS: VisualGridItem[] = [
    { id: 'happy', label: 'Happy', icon: '😊', prompt: 'Close-up portrait, happy facial expression, genuine smile, warm expression, joyful eyes, same character face' },
    { id: 'sad', label: 'Sad', icon: '😢', prompt: 'Close-up portrait, sad facial expression, melancholic look, teary eyes, downturned lips, same character face' },
    { id: 'angry', label: 'Angry', icon: '😠', prompt: 'Close-up portrait, angry facial expression, furrowed brows, intense eyes, clenched jaw, same character face' },
    { id: 'scared', label: 'Scared', icon: '😱', prompt: 'Close-up portrait, scared facial expression, wide eyes, open mouth, fearful look, same character face' },
];

// Emotion & Gesture (4 gestures as per deck slide 8)
export const EMOTION_GESTURE_ITEMS: VisualGridItem[] = [
    { id: 'greeting', label: 'Greeting', icon: '🙋', prompt: 'Full body pose waving hand in greeting, friendly wave, welcoming gesture, warm smile, same character, consistent appearance' },
    { id: 'bow', label: 'Bow', icon: '🙇', prompt: 'Full body bowing pose, respectful bow, humble gesture, formal greeting, same character, consistent appearance' },
    { id: 'dance', label: 'Dance', icon: '💃', prompt: 'Full body dancing pose, dynamic dance movement, graceful motion, expressive dance, same character, consistent appearance' },
    { id: 'run', label: 'Run', icon: '🏃', prompt: 'Full body running pose, dynamic running motion, athletic movement, action pose, same character, consistent appearance' },
];

// Extended expressions for variety
export const EXTENDED_EXPRESSION_ITEMS: VisualGridItem[] = [
    ...FACIAL_EXPRESSION_ITEMS,
    { id: 'surprised', label: 'Surprised', icon: '😲', prompt: 'Close-up portrait, surprised facial expression, wide eyes, raised eyebrows, open mouth, same character face' },
    { id: 'determined', label: 'Determined', icon: '💪', prompt: 'Close-up portrait, determined facial expression, focused eyes, strong jaw, confident look, same character face' },
];

// Extended gestures/actions
export const EXTENDED_GESTURE_ITEMS: VisualGridItem[] = [
    ...EMOTION_GESTURE_ITEMS,
    { id: 'fight', label: 'Fight', icon: '👊', prompt: 'Full body fighting stance, combat ready pose, martial arts pose, defensive stance, same character, consistent appearance' },
    { id: 'thinking', label: 'Thinking', icon: '🤔', prompt: 'Full body thinking pose, hand on chin, contemplative stance, thoughtful expression, same character, consistent appearance' },
    { id: 'celebrate', label: 'Celebrate', icon: '🎉', prompt: 'Full body celebration pose, arms raised, victorious pose, joyful jump, same character, consistent appearance' },
    { id: 'sad_pose', label: 'Mourning', icon: '😞', prompt: 'Full body sad pose, slumped shoulders, looking down, defeated posture, same character, consistent appearance' },
];
