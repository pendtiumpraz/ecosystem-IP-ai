'use client';

import { useState } from 'react';
import {
    Sparkles, Loader2, Image as ImageIcon, Grid3X3,
    Camera, Film, Brush, Wand2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';

// Art style options
const ART_STYLES = [
    { id: 'realistic', label: 'Cinematic Realistic', icon: Camera, desc: 'Photorealistic, movie quality', cost: 12 },
    { id: 'anime', label: 'Anime', icon: Sparkles, desc: 'Japanese animation style', cost: 12 },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Brush, desc: 'Miyazaki watercolor style', cost: 12 },
    { id: 'disney', label: 'Disney/Pixar', icon: Film, desc: '3D animated movie style', cost: 12 },
    { id: 'comic', label: 'Comic Book', icon: Grid3X3, desc: 'Bold lines, superhero art', cost: 12 },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Wand2, desc: 'Neon, futuristic digital', cost: 12 },
];

interface GenerateCharacterImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    characterId: string;
    characterData: {
        name: string;
        role?: string;
        gender?: string;
        age?: string;
        ethnicity?: string;
        skinTone?: string;
        hairStyle?: string;
        hairColor?: string;
        eyeColor?: string;
        bodyType?: string;
        clothingStyle?: string;
    };
    userId: string;
    projectId?: string;
    projectName?: string;
    referenceAssetId?: string;
    referenceImageUrl?: string; // Direct URL for image references
    onSuccess?: (result: {
        mediaIds: string[];
        thumbnailUrls: string[];
        versionName: string;
    }) => void;
}

export function GenerateCharacterImageModal({
    isOpen,
    onClose,
    characterId,
    characterData,
    userId,
    projectId,
    projectName,
    referenceAssetId,
    referenceImageUrl,
    onSuccess,
}: GenerateCharacterImageModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [style, setStyle] = useState('realistic');
    const [generationType, setGenerationType] = useState<'single' | 'expression_sheet'>('single');
    const [versionName, setVersionName] = useState('');
    const [additionalPrompt, setAdditionalPrompt] = useState('');

    const selectedStyle = ART_STYLES.find(s => s.id === style);
    const creditCost = generationType === 'single' ? 12 : 50;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate/character-variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    characterId,
                    projectId,
                    projectName,
                    characterData,
                    style,
                    type: generationType,
                    versionName: versionName || undefined,
                    referenceAssetId,
                    referenceImageUrl,
                    additionalPrompt,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Generation failed');
            }

            toast.success(
                generationType === 'single'
                    ? `Image "${result.versionName}" generated!`
                    : `Expression sheet "${result.versionName}" generated (${result.mediaIds.length} images)!`
            );

            onSuccess?.({
                mediaIds: result.mediaIds,
                thumbnailUrls: result.thumbnailUrls,
                versionName: result.versionName,
            });

            onClose();

        } catch (error) {
            console.error('Generate error:', error);
            toast.error(error instanceof Error ? error.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        Create New Character Image Version
                    </DialogTitle>
                    <DialogDescription>
                        Generate a new image for <strong>{characterData.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Version Name */}
                    <div>
                        <Label className="text-sm font-medium">Version Name <span className="text-gray-400">(optional)</span></Label>
                        <Input
                            placeholder={`Auto: "${selectedStyle?.label} v1"`}
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            className="mt-1.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Give this version a memorable name, or leave empty for auto-naming
                        </p>
                    </div>

                    {/* Art Style */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Art Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {ART_STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left ${style === s.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <s.icon className={`h-4 w-4 ${style === s.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className={`text-sm font-medium ${style === s.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                            {s.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500">{s.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generation Type */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Generation Type</Label>
                        <RadioGroup value={generationType} onValueChange={(v) => setGenerationType(v as 'single' | 'expression_sheet')}>
                            <div className="flex gap-3">
                                <label
                                    className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${generationType === 'single'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <RadioGroupItem value="single" id="single" />
                                    <div>
                                        <p className="font-medium text-sm">Single Portrait</p>
                                        <p className="text-xs text-gray-500">12 credits</p>
                                    </div>
                                </label>
                                <label
                                    className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${generationType === 'expression_sheet'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <RadioGroupItem value="expression_sheet" id="expression_sheet" />
                                    <div>
                                        <p className="font-medium text-sm">Expression Sheet</p>
                                        <p className="text-xs text-gray-500">3x3 grid • 50 credits</p>
                                    </div>
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Additional Prompt */}
                    <div>
                        <Label className="text-sm font-medium">Additional Details <span className="text-gray-400">(optional)</span></Label>
                        <Textarea
                            placeholder="e.g., wearing battle armor, in a forest setting..."
                            value={additionalPrompt}
                            onChange={(e) => setAdditionalPrompt(e.target.value)}
                            className="mt-1.5 min-h-[60px]"
                            rows={2}
                        />
                    </div>

                    {/* Reference indicator */}
                    {(referenceAssetId || referenceImageUrl) && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-700">
                                {referenceImageUrl
                                    ? 'Using character reference image for style/face matching'
                                    : 'Using reference image for consistency'}
                            </span>
                        </div>
                    )}

                    {/* Cost */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Credit Cost:</span>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                            {creditCost} credits
                        </Badge>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate New Version
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
