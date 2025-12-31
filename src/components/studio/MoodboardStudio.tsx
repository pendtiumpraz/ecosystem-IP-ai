'use client';

import { useState, useRef } from 'react';
import {
    LayoutGrid, Palette, Sparkles, Download, Upload,
    Image as ImageIcon, Wand2, Grid3X3, Layers, Eye,
    ZoomIn, ZoomOut, Move, RefreshCw, Check, X,
    Camera, Film, Brush, Pencil, Paintbrush, Aperture
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces
interface MoodboardItem {
    id: string;
    beatKey: string;
    beatLabel: string;
    prompt: string;
    imageUrl?: string;
    style: string;
    position?: { x: number; y: number };
    isGenerating?: boolean;
}

interface StoryBeat {
    key: string;
    label: string;
    content?: string;
}

interface MoodboardStudioProps {
    beats: StoryBeat[];
    prompts: Record<string, string>;
    images: Record<string, string>;
    onUpdatePrompt: (beatKey: string, prompt: string) => void;
    onGeneratePrompt?: (beatKey: string) => void;
    onGenerateImage?: (beatKey: string, style: string) => void;
    onGenerateAll?: () => void;
    isGenerating?: Record<string, boolean>;
}

// Art Style Options
const ART_STYLES = [
    { id: 'realistic', label: 'Realistic', icon: Camera, desc: 'Cinematic, photorealistic quality' },
    { id: 'anime', label: 'Anime', icon: Sparkles, desc: 'Japanese animation style' },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Brush, desc: 'Miyazaki-inspired watercolor' },
    { id: 'disney', label: 'Disney/Pixar', icon: Film, desc: '3D animated movie style' },
    { id: 'handdrawn', label: 'Hand Drawn', icon: Pencil, desc: 'Sketch, storyboard look' },
    { id: 'oilpainting', label: 'Oil Painting', icon: Paintbrush, desc: 'Classical fine art' },
    { id: 'watercolor', label: 'Watercolor', icon: Palette, desc: 'Soft, flowing colors' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Aperture, desc: 'Neon-drenched futuristic' },
    { id: 'fantasy', label: 'Fantasy Art', icon: Wand2, desc: 'Epic, magical realism' },
    { id: 'comic', label: 'Comic Book', icon: Grid3X3, desc: 'Bold lines, dynamic poses' },
];

type ViewMode = 'form' | 'canvas';

export function MoodboardStudio({
    beats,
    prompts,
    images,
    onUpdatePrompt,
    onGeneratePrompt,
    onGenerateImage,
    onGenerateAll,
    isGenerating = {}
}: MoodboardStudioProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('form');
    const [selectedStyle, setSelectedStyle] = useState('realistic');
    const [selectedBeat, setSelectedBeat] = useState<string | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Convert beats to canvas items with positions
    const getCanvasItems = (): MoodboardItem[] => {
        const columns = 4;
        return beats.map((beat, index) => ({
            id: beat.key,
            beatKey: beat.key,
            beatLabel: beat.label,
            prompt: prompts[beat.key] || '',
            imageUrl: images[beat.key],
            style: selectedStyle,
            position: {
                x: (index % columns) * 320 + 40,
                y: Math.floor(index / columns) * 400 + 40
            }
        }));
    };

    const getStyleInfo = (styleId: string) => ART_STYLES.find(s => s.id === styleId);
    const currentStyle = getStyleInfo(selectedStyle);

    const completedCount = beats.filter(b => images[b.key]).length;
    const progress = beats.length > 0 ? Math.round((completedCount / beats.length) * 100) : 0;

    return (
        <div className="h-full flex flex-col gap-4">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-panel">

                {/* Left: View Mode & Progress */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10">
                        <Button
                            variant={viewMode === 'form' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('form')}
                            className="gap-2 text-xs h-8"
                        >
                            <Layers className="h-3 w-3" /> Form View
                        </Button>
                        <Button
                            variant={viewMode === 'canvas' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('canvas')}
                            className="gap-2 text-xs h-8"
                        >
                            <Grid3X3 className="h-3 w-3" /> Canvas View
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Progress</span>
                            <span className="text-xs text-white font-bold">{completedCount}/{beats.length} Images</span>
                        </div>
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Style & Generate */}
                <div className="flex items-center gap-3">
                    {/* Style Selector */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-pink-500/10 rounded-md">
                            {currentStyle && <currentStyle.icon className="h-4 w-4 text-pink-400" />}
                        </div>
                        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                            <SelectTrigger className="h-8 w-[160px] text-xs bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700">
                                {ART_STYLES.map(style => (
                                    <SelectItem key={style.id} value={style.id} className="text-white">
                                        <div className="flex items-center gap-2">
                                            <style.icon className="h-3 w-3" />
                                            {style.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        size="sm"
                        onClick={onGenerateAll}
                        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white h-8 px-4 text-xs font-bold"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate All
                    </Button>
                </div>
            </div>

            {/* STYLE INFO PANEL */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {currentStyle && <currentStyle.icon className="h-5 w-5 text-pink-400" />}
                    <div>
                        <span className="text-sm font-bold text-white">{currentStyle?.label} Style</span>
                        <p className="text-xs text-slate-400">{currentStyle?.desc}</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                    {beats.length} Beats to Visualize
                </Badge>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">

                {/* FORM VIEW */}
                {viewMode === 'form' && (
                    <ScrollArea className="h-full">
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {beats.map((beat, index) => {
                                const prompt = prompts[beat.key] || '';
                                const imageUrl = images[beat.key];
                                const generating = isGenerating[`prompt_${beat.key}`] || isGenerating[`moodboard_${beat.key}`];

                                return (
                                    <Card
                                        key={beat.key}
                                        className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 overflow-hidden group"
                                    >
                                        {/* Image Preview */}
                                        <div className="aspect-video bg-slate-800/50 relative overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={beat.label}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-12 w-12 text-slate-700" />
                                                </div>
                                            )}

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => onGenerateImage?.(beat.key, selectedStyle)}
                                                    disabled={generating || !prompt}
                                                    className="h-8 text-xs"
                                                >
                                                    <Wand2 className="h-3 w-3 mr-1" />
                                                    {generating ? 'Generating...' : 'Generate'}
                                                </Button>
                                                {imageUrl && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Beat Number Badge */}
                                            <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0 text-[10px]">
                                                {index + 1}
                                            </Badge>

                                            {/* Status Badge */}
                                            {imageUrl && (
                                                <Badge className="absolute top-2 right-2 bg-emerald-500/80 text-white border-0 text-[10px]">
                                                    <Check className="h-3 w-3" />
                                                </Badge>
                                            )}
                                        </div>

                                        <CardContent className="p-4 space-y-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-white truncate">{beat.label}</h3>
                                                {beat.content && (
                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{beat.content}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] uppercase text-slate-400 font-bold">Visual Prompt</Label>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-[10px]"
                                                        onClick={() => onGeneratePrompt?.(beat.key)}
                                                        disabled={isGenerating[`prompt_${beat.key}`]}
                                                    >
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        Auto
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={prompt}
                                                    onChange={(e) => onUpdatePrompt(beat.key, e.target.value)}
                                                    placeholder={`Describe the visual for "${beat.label}"...`}
                                                    className="h-20 text-xs bg-black/30 border-white/10 text-white resize-none"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* CANVAS VIEW */}
                {viewMode === 'canvas' && (
                    <div className="h-full relative">
                        {/* Canvas Controls */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-black/50"
                                onClick={() => setCanvasZoom(z => Math.min(z + 0.1, 2))}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-black/50"
                                onClick={() => setCanvasZoom(z => Math.max(z - 0.1, 0.5))}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-black/50"
                                onClick={() => { setCanvasZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Canvas Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                        {/* Canvas Content */}
                        <div
                            ref={canvasRef}
                            className="absolute inset-0 overflow-auto"
                            style={{
                                cursor: 'grab'
                            }}
                        >
                            <div
                                className="relative min-w-[2000px] min-h-[2000px] p-8"
                                style={{
                                    transform: `scale(${canvasZoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                                    transformOrigin: 'top left'
                                }}
                            >
                                {/* Pinterest-style Grid */}
                                <div className="grid grid-cols-4 gap-6">
                                    {beats.map((beat, index) => {
                                        const prompt = prompts[beat.key] || '';
                                        const imageUrl = images[beat.key];
                                        const generating = isGenerating[`moodboard_${beat.key}`];

                                        // Variable height for Pinterest effect
                                        const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60'];
                                        const heightClass = heights[index % heights.length];

                                        return (
                                            <div
                                                key={beat.key}
                                                className={`${heightClass} rounded-xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-sm group cursor-pointer transition-all hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10`}
                                                onClick={() => setSelectedBeat(beat.key)}
                                            >
                                                {imageUrl ? (
                                                    <div className="relative h-full">
                                                        <img
                                                            src={imageUrl}
                                                            alt={beat.label}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                                            <Badge className="bg-emerald-500/80 text-white border-0 text-[10px] mb-1">
                                                                {index + 1}. {beat.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                                                        <ImageIcon className="h-8 w-8 text-slate-600 mb-2" />
                                                        <span className="text-xs font-bold text-white mb-1">{beat.label}</span>
                                                        <span className="text-[10px] text-slate-500 mb-3">No image yet</span>
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-[10px] bg-pink-500/20 hover:bg-pink-500/30 text-pink-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onGenerateImage?.(beat.key, selectedStyle);
                                                            }}
                                                            disabled={generating || !prompt}
                                                        >
                                                            <Wand2 className="h-3 w-3 mr-1" />
                                                            Generate
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Selected Beat Detail Panel */}
                        {selectedBeat && (
                            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                                {beats.findIndex(b => b.key === selectedBeat) + 1}
                                            </Badge>
                                            <h3 className="text-sm font-bold text-white">
                                                {beats.find(b => b.key === selectedBeat)?.label}
                                            </h3>
                                        </div>
                                        <Textarea
                                            value={prompts[selectedBeat] || ''}
                                            onChange={(e) => onUpdatePrompt(selectedBeat, e.target.value)}
                                            placeholder="Enter visual prompt..."
                                            className="h-16 text-xs bg-black/30 border-white/10 text-white resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onGenerateImage?.(selectedBeat, selectedStyle)}
                                            disabled={isGenerating[`moodboard_${selectedBeat}`]}
                                            className="bg-pink-500 hover:bg-pink-600 text-white h-8"
                                        >
                                            <Wand2 className="h-3 w-3 mr-1" />
                                            Generate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSelectedBeat(null)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
