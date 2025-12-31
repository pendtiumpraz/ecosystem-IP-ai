'use client';

import { useState } from 'react';
import {
    Film, Volume2, Music, Mic, Play, Pause,
    SkipBack, SkipForward, Download, Plus, Trash2,
    Layers, Scissors, Move, ZoomIn, ZoomOut,
    Settings, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces
interface TimelineClip {
    id: string;
    type: 'video' | 'audio' | 'voiceover' | 'music';
    name: string;
    startTime: number;
    duration: number;
    src?: string;
    volume: number;
    track: number;
}

interface VoiceOption {
    id: string;
    name: string;
    gender: 'male' | 'female';
    accent: string;
}

interface EditMixStudioProps {
    videoClips: { id: string; name: string; src: string; duration: number }[];
    onExport?: (format: string) => void;
    onGenerateTTS?: (text: string, voice: string) => void;
    isExporting?: boolean;
}

// Voice options for TTS
const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'alloy', name: 'Alloy', gender: 'female', accent: 'American' },
    { id: 'echo', name: 'Echo', gender: 'male', accent: 'American' },
    { id: 'fable', name: 'Fable', gender: 'female', accent: 'British' },
    { id: 'onyx', name: 'Onyx', gender: 'male', accent: 'Deep' },
    { id: 'nova', name: 'Nova', gender: 'female', accent: 'Neutral' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', accent: 'Soft' },
];

// Track colors
const TRACK_COLORS = {
    video: 'bg-blue-500',
    audio: 'bg-green-500',
    voiceover: 'bg-purple-500',
    music: 'bg-yellow-500',
};

export function EditMixStudio({
    videoClips,
    onExport,
    onGenerateTTS,
    isExporting = false
}: EditMixStudioProps) {
    const [timeline, setTimeline] = useState<TimelineClip[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [selectedClip, setSelectedClip] = useState<string | null>(null);
    const [ttsText, setTtsText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [activeTab, setActiveTab] = useState<'timeline' | 'tts' | 'music'>('timeline');
    const [masterVolume, setMasterVolume] = useState(100);

    // Calculate total duration
    const totalDuration = Math.max(
        ...timeline.map(c => c.startTime + c.duration),
        ...videoClips.map(c => c.duration),
        60 // minimum 60 seconds
    );

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 30);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    };

    const addToTimeline = (clip: Omit<TimelineClip, 'id' | 'startTime'>) => {
        const lastClip = timeline.filter(c => c.track === clip.track).sort((a, b) => b.startTime - a.startTime)[0];
        const startTime = lastClip ? lastClip.startTime + lastClip.duration : 0;

        setTimeline(prev => [...prev, {
            ...clip,
            id: `clip-${Date.now()}`,
            startTime
        }]);
    };

    const removeFromTimeline = (id: string) => {
        setTimeline(prev => prev.filter(c => c.id !== id));
        if (selectedClip === id) setSelectedClip(null);
    };

    const handleGenerateTTS = () => {
        if (ttsText.trim()) {
            onGenerateTTS?.(ttsText, selectedVoice);
            // After generation, add to timeline
            addToTimeline({
                type: 'voiceover',
                name: `Voiceover - ${selectedVoice}`,
                duration: Math.ceil(ttsText.split(' ').length / 3), // rough estimate
                volume: 100,
                track: 2
            });
            setTtsText('');
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-panel">

                {/* Left: Controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Timecode */}
                    <div className="font-mono text-sm text-white bg-black/50 px-3 py-1 rounded border border-white/10">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Zoom */}
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.min(z + 0.25, 3))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Right: Export */}
                <div className="flex items-center gap-3">
                    {/* Master Volume */}
                    <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-slate-400" />
                        <Slider
                            value={[masterVolume]}
                            onValueChange={([v]: number[]) => setMasterVolume(v)}
                            max={100}
                            className="w-24"
                        />
                    </div>

                    <Button
                        size="sm"
                        onClick={() => onExport?.('mp4')}
                        disabled={isExporting || timeline.length === 0}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white h-8 px-4 text-xs font-bold"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        {isExporting ? 'Exporting...' : 'Export MP4'}
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 flex gap-4">

                {/* LEFT PANEL: Media Browser / TTS */}
                <div className="w-80 rounded-xl border border-white/10 bg-slate-900/50 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'timeline' ? 'text-white border-b-2 border-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Film className="h-4 w-4 mx-auto mb-1" />
                            Clips
                        </button>
                        <button
                            onClick={() => setActiveTab('tts')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tts' ? 'text-white border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Mic className="h-4 w-4 mx-auto mb-1" />
                            Voice
                        </button>
                        <button
                            onClick={() => setActiveTab('music')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'music' ? 'text-white border-b-2 border-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Music className="h-4 w-4 mx-auto mb-1" />
                            Audio
                        </button>
                    </div>

                    {/* Tab Content */}
                    <ScrollArea className="flex-1 p-3">
                        {/* CLIPS TAB */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-2">
                                {videoClips.length > 0 ? videoClips.map(clip => (
                                    <div
                                        key={clip.id}
                                        className="p-3 rounded-lg bg-black/30 border border-white/10 hover:border-blue-500/50 cursor-pointer group"
                                        onClick={() => addToTimeline({
                                            type: 'video',
                                            name: clip.name,
                                            duration: clip.duration,
                                            src: clip.src,
                                            volume: 100,
                                            track: 0
                                        })}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-10 bg-slate-800 rounded overflow-hidden">
                                                <video src={clip.src} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{clip.name}</p>
                                                <p className="text-[10px] text-slate-500">{clip.duration}s</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Film className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">No video clips available</p>
                                        <p className="text-[10px] text-slate-600">Generate clips in Animate tab first</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TTS TAB */}
                        {activeTab === 'tts' && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-slate-400 uppercase font-bold">Voice</Label>
                                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                                        <SelectTrigger className="mt-1 bg-black/30 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            {VOICE_OPTIONS.map(voice => (
                                                <SelectItem key={voice.id} value={voice.id} className="text-white">
                                                    <div className="flex items-center gap-2">
                                                        <span>{voice.name}</span>
                                                        <Badge variant="outline" className="text-[10px]">{voice.accent}</Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-400 uppercase font-bold">Script / Narration</Label>
                                    <Textarea
                                        value={ttsText}
                                        onChange={(e) => setTtsText(e.target.value)}
                                        placeholder="Enter text to convert to speech..."
                                        className="mt-1 h-32 bg-black/30 border-white/10 text-white text-sm resize-none"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerateTTS}
                                    disabled={!ttsText.trim()}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                    <Mic className="h-4 w-4 mr-2" />
                                    Generate Voice
                                </Button>

                                <p className="text-[10px] text-slate-500 text-center">
                                    ~{Math.ceil(ttsText.split(' ').length / 3)} seconds estimated
                                </p>
                            </div>
                        )}

                        {/* MUSIC TAB */}
                        {activeTab === 'music' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {['Epic Orchestra', 'Ambient Drama', 'Tension', 'Upbeat Pop', 'Sad Piano'].map((track, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-lg bg-black/30 border border-white/10 hover:border-yellow-500/50 cursor-pointer group"
                                            onClick={() => addToTimeline({
                                                type: 'music',
                                                name: track,
                                                duration: 30,
                                                volume: 50,
                                                track: 3
                                            })}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                                                    <Music className="h-4 w-4 text-yellow-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-white">{track}</p>
                                                    <p className="text-[10px] text-slate-500">30s loop</p>
                                                </div>
                                                <Plus className="h-4 w-4 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* RIGHT: Timeline / Preview */}
                <div className="flex-1 rounded-xl border border-white/10 bg-black/30 flex flex-col overflow-hidden">

                    {/* Preview Area */}
                    <div className="h-64 bg-black flex items-center justify-center border-b border-white/10">
                        <div className="aspect-video h-full bg-slate-900 flex items-center justify-center">
                            <Film className="h-16 w-16 text-slate-700" />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 flex flex-col">
                        {/* Timeline Header */}
                        <div className="h-8 bg-slate-900/50 border-b border-white/10 flex items-center px-4">
                            <div className="w-24 shrink-0 text-[10px] text-slate-500 uppercase font-bold">Tracks</div>
                            <div className="flex-1 flex">
                                {Array.from({ length: Math.ceil(totalDuration / 10) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 text-[10px] text-slate-500 border-l border-white/10 pl-1"
                                        style={{ width: `${100 * zoom / 6}px` }}
                                    >
                                        {formatTime(i * 10).slice(0, 5)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Track Lanes */}
                        <ScrollArea className="flex-1">
                            <div className="min-h-full">
                                {/* Video Track */}
                                <div className="h-16 flex border-b border-white/5">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-slate-900/30 border-r border-white/10">
                                        <Film className="h-4 w-4 text-blue-400" />
                                        <span className="text-[10px] font-bold text-slate-400">VIDEO</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        {timeline.filter(c => c.track === 0).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                                                style={{
                                                    left: `${(clip.startTime / totalDuration) * 100}%`,
                                                    width: `${(clip.duration / totalDuration) * 100}%`
                                                }}
                                                onClick={() => setSelectedClip(clip.id)}
                                            >
                                                <span className="text-[10px] font-bold text-white truncate">{clip.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Audio Track */}
                                <div className="h-12 flex border-b border-white/5">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-slate-900/30 border-r border-white/10">
                                        <Volume2 className="h-4 w-4 text-green-400" />
                                        <span className="text-[10px] font-bold text-slate-400">AUDIO</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        {timeline.filter(c => c.track === 1).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                                                style={{
                                                    left: `${(clip.startTime / totalDuration) * 100}%`,
                                                    width: `${(clip.duration / totalDuration) * 100}%`
                                                }}
                                                onClick={() => setSelectedClip(clip.id)}
                                            >
                                                <span className="text-[10px] font-bold text-white truncate">{clip.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Voiceover Track */}
                                <div className="h-12 flex border-b border-white/5">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-slate-900/30 border-r border-white/10">
                                        <Mic className="h-4 w-4 text-purple-400" />
                                        <span className="text-[10px] font-bold text-slate-400">VOICE</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        {timeline.filter(c => c.track === 2).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                                                style={{
                                                    left: `${(clip.startTime / totalDuration) * 100}%`,
                                                    width: `${(clip.duration / totalDuration) * 100}%`
                                                }}
                                                onClick={() => setSelectedClip(clip.id)}
                                            >
                                                <span className="text-[10px] font-bold text-white truncate">{clip.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Music Track */}
                                <div className="h-12 flex">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-slate-900/30 border-r border-white/10">
                                        <Music className="h-4 w-4 text-yellow-400" />
                                        <span className="text-[10px] font-bold text-slate-400">MUSIC</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        {timeline.filter(c => c.track === 3).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-white' : ''}`}
                                                style={{
                                                    left: `${(clip.startTime / totalDuration) * 100}%`,
                                                    width: `${(clip.duration / totalDuration) * 100}%`
                                                }}
                                                onClick={() => setSelectedClip(clip.id)}
                                            >
                                                <span className="text-[10px] font-bold text-white truncate">{clip.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
