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
export interface TimelineClip {
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
    timeline?: TimelineClip[];
    onUpdateTimeline?: (timeline: TimelineClip[]) => void;
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
    timeline: propTimeline,
    onUpdateTimeline,
    onExport,
    onGenerateTTS,
    isExporting = false
}: EditMixStudioProps) {
    const [localTimeline, setLocalTimeline] = useState<TimelineClip[]>([]);

    // Sync with prop if provided, otherwise use local
    const timeline = propTimeline || localTimeline;

    const setTimeline = (newTimelineOrFn: TimelineClip[] | ((prev: TimelineClip[]) => TimelineClip[])) => {
        let newTimeline: TimelineClip[];
        if (typeof newTimelineOrFn === 'function') {
            newTimeline = newTimelineOrFn(timeline);
        } else {
            newTimeline = newTimelineOrFn;
        }

        setLocalTimeline(newTimeline);
        onUpdateTimeline?.(newTimeline);
    };

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
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="h-10 w-10 rounded-full bg-orange-600 text-white hover:bg-orange-500 shadow-md shadow-orange-200"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Timecode */}
                    <div className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded border border-gray-300 shadow-sm">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Zoom */}
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-gray-500 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900" onClick={() => setZoom(z => Math.min(z + 0.25, 3))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Right: Export */}
                <div className="flex items-center gap-3">
                    {/* Master Volume */}
                    <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-gray-400" />
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
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white h-8 px-4 text-xs font-bold shadow-md shadow-orange-200"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        {isExporting ? 'Exporting...' : 'Export MP4'}
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 flex gap-4">

                {/* LEFT PANEL: Media Browser / TTS */}
                <div className="w-80 rounded-xl border border-gray-200 bg-white flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'timeline' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Film className="h-4 w-4 mx-auto mb-1" />
                            Clips
                        </button>
                        <button
                            onClick={() => setActiveTab('tts')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tts' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Mic className="h-4 w-4 mx-auto mb-1" />
                            Voice
                        </button>
                        <button
                            onClick={() => setActiveTab('music')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'music' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
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
                                        className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
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
                                            <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                                                <video src={clip.src} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">{clip.name}</p>
                                                <p className="text-[10px] text-gray-500">{clip.duration}s</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Film className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500">No video clips available</p>
                                        <p className="text-[10px] text-gray-400">Generate clips in Animate tab first</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TTS TAB */}
                        {activeTab === 'tts' && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase font-bold">Voice</Label>
                                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                                        <SelectTrigger className="mt-1 bg-white border-gray-200 text-gray-900">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                                            {VOICE_OPTIONS.map(voice => (
                                                <SelectItem key={voice.id} value={voice.id} className="text-gray-900 focus:bg-orange-50">
                                                    <div className="flex items-center gap-2">
                                                        <span>{voice.name}</span>
                                                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300">{voice.accent}</Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-xs text-gray-500 uppercase font-bold">Script / Narration</Label>
                                    <Textarea
                                        value={ttsText}
                                        onChange={(e) => setTtsText(e.target.value)}
                                        placeholder="Enter text to convert to speech..."
                                        className="mt-1 h-32 bg-gray-50 border-gray-200 text-gray-900 text-sm resize-none focus:ring-orange-200 focus:border-orange-400"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerateTTS}
                                    disabled={!ttsText.trim()}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200"
                                >
                                    <Mic className="h-4 w-4 mr-2" />
                                    Generate Voice
                                </Button>

                                <p className="text-[10px] text-gray-400 text-center">
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
                                            className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
                                            onClick={() => addToTimeline({
                                                type: 'music',
                                                name: track,
                                                duration: 30,
                                                volume: 50,
                                                track: 3
                                            })}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                                                    <Music className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-gray-900">{track}</p>
                                                    <p className="text-[10px] text-gray-500">30s loop</p>
                                                </div>
                                                <Plus className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* RIGHT: Timeline / Preview */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

                    {/* Preview Area */}
                    <div className="h-64 bg-black flex items-center justify-center border-b border-gray-200">
                        <div className="aspect-video h-full bg-gray-900 flex items-center justify-center">
                            <Film className="h-16 w-16 text-gray-700" />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 flex flex-col">
                        {/* Timeline Header */}
                        <div className="h-8 bg-gray-200 border-b border-gray-300 flex items-center px-4">
                            <div className="w-24 shrink-0 text-[10px] text-gray-500 uppercase font-bold">Tracks</div>
                            <div className="flex-1 flex">
                                {Array.from({ length: Math.ceil(totalDuration / 10) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 text-[10px] text-gray-500 border-l border-gray-300 pl-1"
                                        style={{ width: `${100 * zoom / 6}px` }}
                                    >
                                        {formatTime(i * 10).slice(0, 5)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Track Lanes */}
                        <ScrollArea className="flex-1 bg-white">
                            <div className="min-h-full">
                                {/* Video Track */}
                                <div className="h-16 flex border-b border-gray-100">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200">
                                        <Film className="h-4 w-4 text-blue-500" />
                                        <span className="text-[10px] font-bold text-gray-400">VIDEO</span>
                                    </div>
                                    <div className="flex-1 relative bg-gray-50/50">
                                        {timeline.filter(c => c.track === 0).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-orange-500' : ''}`}
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
                                <div className="h-12 flex border-b border-gray-100">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200">
                                        <Volume2 className="h-4 w-4 text-green-500" />
                                        <span className="text-[10px] font-bold text-gray-400">AUDIO</span>
                                    </div>
                                    <div className="flex-1 relative bg-gray-50/50">
                                        {timeline.filter(c => c.track === 1).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-orange-500' : ''}`}
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
                                <div className="h-12 flex border-b border-gray-100">
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200">
                                        <Mic className="h-4 w-4 text-purple-500" />
                                        <span className="text-[10px] font-bold text-gray-400">VOICE</span>
                                    </div>
                                    <div className="flex-1 relative bg-gray-50/50">
                                        {timeline.filter(c => c.track === 2).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-orange-500' : ''}`}
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
                                    <div className="w-24 shrink-0 flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200">
                                        <Music className="h-4 w-4 text-amber-500" />
                                        <span className="text-[10px] font-bold text-gray-400">MUSIC</span>
                                    </div>
                                    <div className="flex-1 relative bg-gray-50/50">
                                        {timeline.filter(c => c.track === 3).map(clip => (
                                            <div
                                                key={clip.id}
                                                className={`absolute top-1 bottom-1 ${TRACK_COLORS[clip.type]} rounded px-2 flex items-center cursor-pointer ${selectedClip === clip.id ? 'ring-2 ring-orange-500' : ''}`}
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
