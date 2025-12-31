'use client';

import { useState } from 'react';
import {
    Film, Play, Pause, SkipBack, SkipForward,
    Sparkles, Download, Upload, Image as ImageIcon,
    Video, Layers, Grid3X3, ChevronLeft, ChevronRight,
    Wand2, RefreshCw, Eye, Clock, Zap, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

// Interfaces
interface AnimationClip {
    id: string;
    beatKey: string;
    beatLabel: string;
    sourceImage?: string;
    videoUrl?: string;
    prompt: string;
    duration: number; // in seconds
    status: 'pending' | 'generating' | 'done' | 'error';
}

interface StoryBeat {
    key: string;
    label: string;
    content?: string;
}

interface AnimateStudioProps {
    beats: StoryBeat[];
    moodboardImages: Record<string, string>;
    animationPrompts: Record<string, string>;
    animationPreviews: Record<string, string>;
    onUpdatePrompt: (beatKey: string, prompt: string) => void;
    onGenerateAnimation?: (beatKey: string) => void;
    onGenerateAll?: () => void;
    isGenerating?: Record<string, boolean>;
}

type ViewMode = 'form' | 'storyboard' | 'preview';

// Motion presets
const MOTION_PRESETS = [
    { id: 'cinematic', label: 'Cinematic Pan', desc: 'Slow horizontal movement' },
    { id: 'zoom-in', label: 'Zoom In', desc: 'Focus on subject' },
    { id: 'zoom-out', label: 'Zoom Out', desc: 'Reveal scene' },
    { id: 'parallax', label: 'Parallax', desc: '2.5D depth effect' },
    { id: 'orbit', label: 'Orbit', desc: 'Rotate around subject' },
    { id: 'static', label: 'Static', desc: 'No camera movement' },
];

export function AnimateStudio({
    beats,
    moodboardImages,
    animationPrompts,
    animationPreviews,
    onUpdatePrompt,
    onGenerateAnimation,
    onGenerateAll,
    isGenerating = {}
}: AnimateStudioProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('form');
    const [selectedClip, setSelectedClip] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [motionPreset, setMotionPreset] = useState('cinematic');

    // Convert beats to clips
    const clips: AnimationClip[] = beats.map(beat => ({
        id: beat.key,
        beatKey: beat.key,
        beatLabel: beat.label,
        sourceImage: moodboardImages[beat.key],
        videoUrl: animationPreviews[beat.key],
        prompt: animationPrompts[beat.key] || '',
        duration: 5,
        status: animationPreviews[beat.key] ? 'done' :
            isGenerating[`animation_${beat.key}`] ? 'generating' : 'pending'
    }));

    const completedCount = clips.filter(c => c.status === 'done').length;
    const progress = clips.length > 0 ? Math.round((completedCount / clips.length) * 100) : 0;
    const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col gap-4">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-panel">

                {/* Left: View Mode */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'form' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('form')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'form' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Layers className="h-3 w-3" /> Clips
                        </Button>
                        <Button
                            variant={viewMode === 'storyboard' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('storyboard')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'storyboard' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Grid3X3 className="h-3 w-3" /> Storyboard
                        </Button>
                        <Button
                            variant={viewMode === 'preview' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('preview')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'preview' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Play className="h-3 w-3" /> Preview
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-orange-400" />
                            <span className="text-gray-500 font-medium">{completedCount}/{clips.length} clips</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-400" />
                            <span className="text-gray-500 font-medium">{formatTime(totalDuration)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Motion & Generate */}
                <div className="flex items-center gap-3">
                    <Select value={motionPreset} onValueChange={setMotionPreset}>
                        <SelectTrigger className="h-8 w-[140px] text-xs bg-white border-gray-200 text-gray-900 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                            {MOTION_PRESETS.map(preset => (
                                <SelectItem key={preset.id} value={preset.id} className="text-gray-900 focus:bg-orange-50">
                                    {preset.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={onGenerateAll}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white h-8 px-4 text-xs font-bold shadow-md shadow-orange-200"
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Generate All Videos
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden">

                {/* CLIPS VIEW */}
                {viewMode === 'form' && (
                    <ScrollArea className="h-full">
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {clips.map((clip, index) => (
                                <Card
                                    key={clip.id}
                                    className={`bg-white border-gray-200 overflow-hidden group shadow-sm hover:shadow-md transition-shadow cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-orange-500' : ''}`}
                                    onClick={() => setSelectedClip(clip.id)}
                                >
                                    {/* Preview Area */}
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden text-gray-400">
                                        {clip.videoUrl ? (
                                            <video
                                                src={clip.videoUrl}
                                                className="w-full h-full object-cover"
                                                muted
                                                loop
                                                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                                onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                                            />
                                        ) : clip.sourceImage ? (
                                            <img
                                                src={clip.sourceImage}
                                                alt={clip.beatLabel}
                                                className="w-full h-full object-cover opacity-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-12 w-12 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Status Overlay */}
                                        {clip.status === 'generating' && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-2" />
                                                    <span className="text-xs text-gray-900 font-bold">Generating...</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Play Icon */}
                                        {clip.videoUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-white ml-1 filter drop-shadow-md" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0 text-[10px]">
                                            {index + 1}
                                        </Badge>
                                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-0 text-[10px]">
                                            {clip.duration}s
                                        </Badge>
                                    </div>

                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{clip.beatLabel}</h3>
                                            {clip.status === 'done' && (
                                                <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 text-[10px]">
                                                    Done
                                                </Badge>
                                            )}
                                        </div>

                                        <Textarea
                                            value={clip.prompt}
                                            onChange={(e) => onUpdatePrompt(clip.beatKey, e.target.value)}
                                            placeholder="Describe the motion for this scene..."
                                            className="h-16 text-xs bg-gray-50 border-gray-200 text-gray-900 resize-none focus:bg-white focus:ring-orange-200 focus:border-orange-400"
                                        />

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onGenerateAnimation?.(clip.beatKey);
                                                }}
                                                disabled={clip.status === 'generating' || !clip.sourceImage}
                                                className="flex-1 h-8 text-xs"
                                            >
                                                <Wand2 className="h-3 w-3 mr-1" />
                                                {clip.status === 'generating' ? 'Generating...' : 'Generate'}
                                            </Button>
                                            {clip.videoUrl && (
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* STORYBOARD VIEW */}
                {viewMode === 'storyboard' && (
                    <div className="h-full flex flex-col">
                        {/* Timeline Header */}
                        <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-4">
                            <span className="text-xs text-gray-500 w-20 font-bold uppercase">Timeline</span>
                            <div className="flex-1 flex items-center gap-1">
                                {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
                                    <div key={i} className="flex-1 text-[10px] text-gray-400 border-l border-gray-300 pl-1">
                                        {formatTime(i * 5)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Storyboard Strip */}
                        <ScrollArea className="flex-1 bg-white">
                            <div className="p-4">
                                <div className="flex gap-2">
                                    {clips.map((clip, index) => (
                                        <div
                                            key={clip.id}
                                            className={`shrink-0 w-48 rounded-lg overflow-hidden border transition-all cursor-pointer ${selectedClip === clip.id ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-gray-200 hover:border-gray-400'}`}
                                            onClick={() => setSelectedClip(clip.id)}
                                        >
                                            <div className="aspect-video relative bg-gray-100">
                                                {clip.videoUrl ? (
                                                    <video
                                                        src={clip.videoUrl}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                    />
                                                ) : clip.sourceImage ? (
                                                    <img
                                                        src={clip.sourceImage}
                                                        alt={clip.beatLabel}
                                                        className="w-full h-full object-cover opacity-90"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Film className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                                    <span className="text-[10px] font-bold text-white shadow-sm">{index + 1}. {clip.beatLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* Selected Clip Editor */}
                        {selectedClip && (
                            <div className="h-48 bg-white border-t border-gray-200 p-4 flex gap-4 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]">
                                <div className="w-64 aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    {clips.find(c => c.id === selectedClip)?.videoUrl ? (
                                        <video
                                            src={clips.find(c => c.id === selectedClip)?.videoUrl}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    ) : clips.find(c => c.id === selectedClip)?.sourceImage ? (
                                        <img
                                            src={clips.find(c => c.id === selectedClip)?.sourceImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film className="h-12 w-12 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {clips.find(c => c.id === selectedClip)?.beatLabel}
                                    </h3>
                                    <Textarea
                                        value={clips.find(c => c.id === selectedClip)?.prompt || ''}
                                        onChange={(e) => onUpdatePrompt(selectedClip, e.target.value)}
                                        placeholder="Motion prompt..."
                                        className="h-16 text-xs bg-gray-50 border-gray-200 text-gray-900 resize-none focus:bg-white focus:ring-orange-200 focus:border-orange-400"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => onGenerateAnimation?.(selectedClip)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white h-8 shadow-md shadow-orange-200"
                                        >
                                            <Wand2 className="h-3 w-3 mr-1" />
                                            Generate Video
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PREVIEW VIEW */}
                {viewMode === 'preview' && (
                    <div className="h-full flex flex-col">
                        {/* Video Player */}
                        <div className="flex-1 bg-black flex items-center justify-center">
                            {clips.some(c => c.videoUrl) ? (
                                <div className="max-w-4xl w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                                    <video
                                        src={clips.find(c => c.videoUrl)?.videoUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Film className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">No videos generated yet</p>
                                    <p className="text-xs text-gray-600 mt-1">Generate clips from the Clips or Storyboard view</p>
                                </div>
                            )}
                        </div>

                        {/* Playback Controls */}
                        <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-center gap-4">
                            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-gray-600 hover:text-gray-900">
                                <SkipBack className="h-5 w-5" />
                            </Button>
                            <Button
                                size="sm"
                                className="h-12 w-12 rounded-full bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/20"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-gray-600 hover:text-gray-900">
                                <SkipForward className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
