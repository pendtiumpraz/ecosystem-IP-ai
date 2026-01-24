'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Sparkles, Loader2, Image as ImageIcon, Grid3X3, User, Move,
    Camera, Film, Brush, Wand2, X, Upload, Link2, Square, RectangleHorizontal,
    RectangleVertical, Maximize, Smartphone, Zap, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/lib/sweetalert';

// ============ CONSTANTS ============

// Art style options
const ART_STYLES = [
    { id: 'realistic', label: 'Cinematic Realistic', icon: Camera, desc: 'Photorealistic, movie quality', promptPrefix: 'cinematic photography, photorealistic, 8K, movie quality' },
    { id: 'anime', label: 'Anime', icon: Sparkles, desc: 'Japanese animation style', promptPrefix: 'anime style, Japanese animation, vibrant colors' },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Brush, desc: 'Miyazaki watercolor style', promptPrefix: 'Studio Ghibli style, watercolor, soft colors, Hayao Miyazaki' },
    { id: 'disney', label: 'Disney/Pixar 3D', icon: Film, desc: '3D animated movie style', promptPrefix: 'Disney Pixar 3D animation style, vibrant, cartoon' },
    { id: 'comic', label: 'Comic Book', icon: Grid3X3, desc: 'Bold lines, superhero art', promptPrefix: 'comic book style, bold outlines, superhero art, graphic novel' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Wand2, desc: 'Neon, futuristic digital', promptPrefix: 'cyberpunk style, neon lights, futuristic, digital art' },
    { id: 'watercolor', label: 'Watercolor', icon: Palette, desc: 'Soft watercolor painting', promptPrefix: 'watercolor painting, soft edges, artistic, traditional media' },
    { id: 'oil_painting', label: 'Oil Painting', icon: Brush, desc: 'Classical oil painting', promptPrefix: 'oil painting, classical art, renaissance style, rich textures' },
];

// Image templates
const TEMPLATES = [
    { id: 'portrait', label: 'Portrait', icon: User, desc: 'Close-up face shot', poses: ['portrait'], creditCost: 12 },
    { id: 'headshot', label: 'Headshot', icon: User, desc: 'Professional headshot', poses: ['headshot'], creditCost: 12 },
    { id: 'medium_shot', label: 'Medium Shot', icon: User, desc: 'Torso and above', poses: ['medium_shot'], creditCost: 12 },
    { id: 'full_body', label: 'Full Body', icon: Move, desc: 'Complete figure standing', poses: ['full_body_standing'], creditCost: 12 },
    { id: 'expression_sheet', label: 'Expression Sheet', icon: Grid3X3, desc: '3x3 grid of emotions', poses: ['happy', 'sad', 'angry', 'surprised', 'fear', 'neutral', 'smirk', 'laugh', 'disgusted'], creditCost: 50 },
    { id: 'action_poses', label: 'Action Poses', icon: Zap, desc: 'Dynamic action shots', poses: ['action'], creditCost: 15 },
];

// Action pose options
const ACTION_POSES = [
    { id: 'walking', label: 'Walking', prompt: 'walking pose, natural stride, casual movement' },
    { id: 'running', label: 'Running', prompt: 'running pose, dynamic motion, athletic' },
    { id: 'fighting', label: 'Fighting Stance', prompt: 'fighting stance, ready for combat, martial arts pose' },
    { id: 'sitting', label: 'Sitting', prompt: 'sitting pose, relaxed, on a chair or bench' },
    { id: 'jumping', label: 'Jumping', prompt: 'jumping pose, mid-air, dynamic leap' },
    { id: 'kneeling', label: 'Kneeling', prompt: 'kneeling pose, one or both knees down' },
    { id: 'pointing', label: 'Pointing', prompt: 'pointing finger, directive gesture, confident pose' },
    { id: 'arms_crossed', label: 'Arms Crossed', prompt: 'arms crossed, confident stance, power pose' },
    { id: 'hero_pose', label: 'Hero Shot', prompt: 'hero pose, low angle, dramatic lighting, powerful stance' },
    { id: 'villain_reveal', label: 'Villain Reveal', prompt: 'villain reveal pose, menacing, dramatic shadows, imposing' },
    { id: 'emotional', label: 'Emotional Moment', prompt: 'emotional breakdown, tears, vulnerable moment, dramatic' },
    { id: 'victory', label: 'Victory Pose', prompt: 'victory pose, triumphant, celebrating, fist raised' },
];

// Aspect ratios
const ASPECT_RATIOS = [
    { id: '1:1', label: 'Square', icon: Square, desc: '1024x1024' },
    { id: '4:3', label: 'Landscape', icon: RectangleHorizontal, desc: '1024x768' },
    { id: '3:4', label: 'Portrait', icon: RectangleVertical, desc: '768x1024' },
    { id: '16:9', label: 'Widescreen', icon: Maximize, desc: '1024x576' },
    { id: '9:16', label: 'Vertical', icon: Smartphone, desc: '576x1024' },
];

interface GenerateCharacterImageModalV2Props {
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
        height?: string;
        clothingStyle?: string;
        castReference?: string;
        physiological?: Record<string, string>;
    };
    userId: string;
    projectId?: string;
    projectName?: string;
    imageReferences?: string[]; // Character reference image URLs for I2I
    onSuccess?: (result: {
        imageUrl: string;
        thumbnailUrl?: string;
        versionName: string;
        creditCost: number;
    }) => void;
}

export function GenerateCharacterImageModalV2({
    isOpen,
    onClose,
    characterId,
    characterData,
    userId,
    projectId,
    projectName,
    imageReferences = [],
    onSuccess,
}: GenerateCharacterImageModalV2Props) {
    // Form state
    const [isGenerating, setIsGenerating] = useState(false);
    const [versionName, setVersionName] = useState('');

    // Template & Style
    const [template, setTemplate] = useState('portrait');
    const [style, setStyle] = useState('realistic');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [actionPose, setActionPose] = useState('hero_pose');

    // References
    const [characterRefUrl, setCharacterRefUrl] = useState('');
    const [backgroundRefUrl, setBackgroundRefUrl] = useState('');
    const [additionalPrompt, setAdditionalPrompt] = useState('');

    // File inputs
    const charRefInputRef = useRef<HTMLInputElement>(null);
    const bgRefInputRef = useRef<HTMLInputElement>(null);

    // Auto-initialize characterRefUrl from imageReferences when modal opens
    useEffect(() => {
        if (isOpen && imageReferences.length > 0 && !characterRefUrl) {
            setCharacterRefUrl(imageReferences[0]);
            console.log('[GenerateV2] Auto-set character ref from imageReferences:', imageReferences[0]);
        }
    }, [isOpen, imageReferences]);

    const selectedTemplate = TEMPLATES.find(t => t.id === template);
    const selectedStyle = ART_STYLES.find(s => s.id === style);
    const selectedAction = ACTION_POSES.find(a => a.id === actionPose);

    // Credit calculation
    const creditCost = selectedTemplate?.creditCost || 12;

    // Build prompt from character data
    const buildPrompt = () => {
        const physio = characterData.physiological || {};
        const appearance = [
            physio.gender || characterData.gender,
            physio.age || characterData.age,
            physio.ethnicity || characterData.ethnicity,
            physio.skinTone || characterData.skinTone,
            `${physio.hairColor || characterData.hairColor} ${physio.hairStyle || characterData.hairStyle} hair`,
            `${physio.eyeColor || characterData.eyeColor} eyes`,
            physio.bodyType || characterData.bodyType,
            physio.height || characterData.height,
            characterData.clothingStyle,
        ].filter(Boolean).join(', ');

        // Get pose prompt
        let posePrompt = '';
        if (template === 'action_poses' && selectedAction) {
            posePrompt = selectedAction.prompt;
        } else if (template === 'portrait') {
            posePrompt = 'close-up portrait, face focus, looking at camera';
        } else if (template === 'headshot') {
            posePrompt = 'professional headshot, shoulders up, clean background';
        } else if (template === 'medium_shot') {
            posePrompt = 'medium shot, waist up, three-quarter view';
        } else if (template === 'full_body') {
            posePrompt = 'full body shot, standing pose, full figure visible';
        } else if (template === 'expression_sheet') {
            posePrompt = '3x3 expression sheet, multiple emotions grid, character reference sheet';
        }

        // Build full prompt
        const parts = [
            selectedStyle?.promptPrefix,
            `${characterData.name}`,
            characterData.role ? `a ${characterData.role}` : '',
            appearance,
            posePrompt,
            characterData.castReference ? `face like ${characterData.castReference}` : '',
            additionalPrompt,
        ].filter(Boolean);

        return parts.join(', ');
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const startTime = Date.now();

        try {
            const fullPrompt = buildPrompt();
            console.log('[Generate] Prompt:', fullPrompt);

            // Determine if we should use image-to-image
            const hasReference = characterRefUrl || backgroundRefUrl;

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    projectId,
                    projectName,
                    generationType: 'character_image',
                    prompt: fullPrompt,
                    inputParams: {
                        characterId,
                        characterName: characterData.name,
                        template,
                        style,
                        aspectRatio,
                        actionPose: template === 'action_poses' ? actionPose : undefined,
                        characterRefUrl: characterRefUrl || undefined,
                        backgroundRefUrl: backgroundRefUrl || undefined,
                        versionName: versionName || `${selectedStyle?.label} ${template}`,
                    }
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Generation failed');
            }

            const imageUrl = result.resultUrl || result.result;
            const finalVersionName = versionName || `${selectedStyle?.label} ${selectedTemplate?.label}`;
            const generationTimeMs = Date.now() - startTime;

            // Save version to database with all settings
            if (projectId) {
                try {
                    const versionResponse = await fetch('/api/character-image-versions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            characterId,
                            projectId,
                            userId,
                            versionName: finalVersionName,
                            imageUrl,
                            thumbnailUrl: imageUrl,
                            // Generation settings
                            template,
                            artStyle: style,
                            aspectRatio,
                            actionPose: template === 'action_poses' ? actionPose : null,
                            characterRefUrl: characterRefUrl || null,
                            backgroundRefUrl: backgroundRefUrl || null,
                            additionalPrompt: additionalPrompt || null,
                            fullPromptUsed: fullPrompt,
                            // Character snapshot at time of generation
                            characterDataSnapshot: characterData,
                            // AI info
                            modelUsed: result.modelUsed || 'seedream-4.5',
                            modelProvider: result.modelProvider || 'modelslab',
                            creditCost: result.creditCost || creditCost,
                            generationTimeMs,
                        }),
                    });

                    const versionResult = await versionResponse.json();
                    if (versionResult.success) {
                        console.log('[Generate] Version saved:', versionResult.versionNumber);
                    } else {
                        console.warn('[Generate] Failed to save version:', versionResult.error);
                    }
                } catch (versionError) {
                    console.warn('[Generate] Error saving version:', versionError);
                }
            }

            toast.success(`Image "${finalVersionName}" generated & saved!`);

            onSuccess?.({
                imageUrl,
                thumbnailUrl: imageUrl,
                versionName: finalVersionName,
                creditCost: result.creditCost || creditCost,
            });

            onClose();

        } catch (error) {
            console.error('Generate error:', error);
            toast.error(error instanceof Error ? error.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'character' | 'background') => {
        // For now, just create a local URL. In production, upload to server/cloud
        const url = URL.createObjectURL(file);
        if (type === 'character') {
            setCharacterRefUrl(url);
        } else {
            setBackgroundRefUrl(url);
        }
        toast.success(`${type === 'character' ? 'Character' : 'Background'} reference uploaded!`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        Generate Character Image
                    </DialogTitle>
                    <DialogDescription>
                        Create a new image for <strong>{characterData.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* Version Name */}
                        <div>
                            <Label className="text-sm font-medium">Version Name <span className="text-gray-400">(optional)</span></Label>
                            <Input
                                placeholder={`Auto: "${selectedStyle?.label} ${selectedTemplate?.label}"`}
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Template Selection */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Template</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTemplate(t.id)}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${template === t.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <t.icon className={`h-4 w-4 ${template === t.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                        <div>
                                            <p className={`text-sm font-medium ${template === t.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                                {t.label}
                                            </p>
                                            <p className="text-[10px] text-gray-500">{t.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Pose Selection (only for action_poses template) */}
                        {template === 'action_poses' && (
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Action Pose</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ACTION_POSES.map((pose) => (
                                        <button
                                            key={pose.id}
                                            onClick={() => setActionPose(pose.id)}
                                            className={`p-2 rounded-lg border-2 transition-all text-center ${actionPose === pose.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className={`text-xs font-medium ${actionPose === pose.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                                {pose.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Art Style */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Art Style</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {ART_STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${style === s.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <s.icon className={`h-4 w-4 ${style === s.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                        <p className={`text-xs font-medium text-center ${style === s.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                            {s.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Image Size</Label>
                            <div className="flex gap-2">
                                {ASPECT_RATIOS.map((ar) => (
                                    <button
                                        key={ar.id}
                                        onClick={() => setAspectRatio(ar.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${aspectRatio === ar.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <ar.icon className={`h-4 w-4 ${aspectRatio === ar.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                        <span className={`text-xs font-medium ${aspectRatio === ar.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                            {ar.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* References */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium block">References <span className="text-gray-400">(optional)</span></Label>

                            {/* Character Reference */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Character reference image URL..."
                                        value={characterRefUrl}
                                        onChange={(e) => setCharacterRefUrl(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                                <input
                                    ref={charRefInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'character')}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => charRefInputRef.current?.click()}
                                    className="shrink-0"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            {characterRefUrl && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                    <ImageIcon className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-green-700 truncate flex-1">Character reference set</span>
                                    <Button variant="ghost" size="sm" onClick={() => setCharacterRefUrl('')} className="h-6 w-6 p-0">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Background Reference */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Background reference image URL..."
                                        value={backgroundRefUrl}
                                        onChange={(e) => setBackgroundRefUrl(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                                <input
                                    ref={bgRefInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => bgRefInputRef.current?.click()}
                                    className="shrink-0"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            {backgroundRefUrl && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                    <ImageIcon className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs text-blue-700 truncate flex-1">Background reference set</span>
                                    <Button variant="ghost" size="sm" onClick={() => setBackgroundRefUrl('')} className="h-6 w-6 p-0">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Additional Description */}
                        <div>
                            <Label className="text-sm font-medium">Additional Details <span className="text-gray-400">(optional)</span></Label>
                            <Textarea
                                placeholder="e.g., wearing battle armor, dramatic sunset background, rain effect..."
                                value={additionalPrompt}
                                onChange={(e) => setAdditionalPrompt(e.target.value)}
                                className="mt-1.5 min-h-[80px]"
                                rows={3}
                            />
                        </div>

                        {/* Cost Summary */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-gray-600">Credit Cost:</span>
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-base px-3">
                                {creditCost} credits
                            </Badge>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="border-t pt-4">
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
                                Generate Image
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
