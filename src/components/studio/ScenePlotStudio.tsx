'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Film, Camera, Check, X, AlertCircle, Loader2, Wand2,
    ChevronDown, ChevronRight, Eye, Edit3, RefreshCw,
    Clock, Video, Sparkles, Play, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/lib/sweetalert';

interface Shot {
    shotNumber: number;
    shotType: string;
    shotAngle: string;
    cameraMovement: string;
    durationSeconds: number;
    shotDescription: string;
    action: string;
}

interface ScenePlot {
    shots: Shot[];
    preference?: string;
    generatedAt?: string;
}

interface ClipWithScenePlot {
    id: string;
    beatKey: string;
    beatLabel: string;
    clipOrder: number;
    keyActionDescription: string | null;
    sourceImageUrl: string | null;
    scenePlot: ScenePlot | null;
    hasScenePlot: boolean;
    hasPrompt: boolean;
    hasAnimation: boolean;
    shotsCount: number;
    totalDuration: number;
}

interface ScenePlotViewProps {
    projectId: string;
    userId: string;
    animationVersionId: string | null;
    beats: { key: string; label: string; desc: string; act: number }[];
    onRefresh?: () => void;
    onCreateAnimationVersion?: () => void;
}

// Shot type display names
const SHOT_TYPE_LABELS: Record<string, string> = {
    'establishing': 'EST',
    'wide': 'WIDE',
    'full': 'FULL',
    'medium': 'MED',
    'medium-close': 'MCU',
    'close-up': 'CU',
    'extreme-close-up': 'ECU',
    'over-shoulder': 'OTS',
    'two-shot': '2S',
    'group': 'GRP',
    'pov': 'POV',
    'insert': 'INS'
};

// Camera movement icons/labels
const MOVEMENT_LABELS: Record<string, string> = {
    'static': '⊙',
    'pan-left': '←',
    'pan-right': '→',
    'tilt-up': '↑',
    'tilt-down': '↓',
    'dolly-in': '⟿',
    'dolly-out': '⟾',
    'tracking': '↠',
    'crane-up': '⤊',
    'crane-down': '⤋',
    'handheld': '≋',
    'steadicam': '≈',
    'zoom-in': '⊕',
    'zoom-out': '⊖'
};

export function ScenePlotView({
    projectId,
    userId,
    animationVersionId,
    beats,
    onRefresh,
    onCreateAnimationVersion
}: ScenePlotViewProps) {
    const [clipsByBeat, setClipsByBeat] = useState<Record<string, ClipWithScenePlot[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0, description: '' });
    const [preference, setPreference] = useState('');
    const [expandedBeats, setExpandedBeats] = useState<Set<string>>(new Set());

    // Load clips with scene plot data
    const loadClips = useCallback(async () => {
        if (!animationVersionId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/animation-clips/by-version?animationVersionId=${animationVersionId}`
            );
            if (res.ok) {
                const data = await res.json();
                setClipsByBeat(data.clipsByBeat || {});
            }
        } catch (error) {
            console.error('Error loading clips:', error);
        } finally {
            setIsLoading(false);
        }
    }, [animationVersionId]);

    useEffect(() => {
        loadClips();
    }, [loadClips]);

    // Calculate stats
    const allClips = Object.values(clipsByBeat).flat();
    const stats = {
        totalClips: allClips.length,
        withScenePlot: allClips.filter(c => c.hasScenePlot).length,
        withPrompt: allClips.filter(c => c.hasPrompt).length,
        withAnimation: allClips.filter(c => c.hasAnimation).length,
        totalShots: allClips.reduce((sum, c) => sum + (c.shotsCount || 0), 0),
        totalDuration: allClips.reduce((sum, c) => sum + (c.totalDuration || 0), 0)
    };

    const completionPercent = stats.totalClips > 0
        ? Math.round((stats.withScenePlot / stats.totalClips) * 100)
        : 0;

    // Toggle beat expansion
    const toggleBeat = (beatKey: string) => {
        const newExpanded = new Set(expandedBeats);
        if (newExpanded.has(beatKey)) {
            newExpanded.delete(beatKey);
        } else {
            newExpanded.add(beatKey);
        }
        setExpandedBeats(newExpanded);
    };

    // Expand/collapse all
    const expandAll = () => {
        setExpandedBeats(new Set(Object.keys(clipsByBeat)));
    };

    const collapseAll = () => {
        setExpandedBeats(new Set());
    };

    // Generate all scene plots
    const handleGenerateAll = async () => {
        if (!animationVersionId) {
            toast.warning('Please create an animation version first.');
            onCreateAnimationVersion?.();
            return;
        }

        const clipsToGenerate = allClips.filter(c => c.keyActionDescription);
        if (clipsToGenerate.length === 0) {
            toast.warning('No animation clips found. Generate key actions first.');
            return;
        }

        setIsGenerating(true);
        setGenerateProgress({ current: 0, total: clipsToGenerate.length, description: '' });

        try {
            // Call bulk generate API
            const res = await fetch('/api/animation-clips/generate-scene-plots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId,
                    preference,
                    userId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Generation failed');
            }

            const result = await res.json();

            toast.success(`Generated ${result.successCount}/${result.totalClips} scene plots!`);

            // Reload data
            await loadClips();
            onRefresh?.();
        } catch (error: any) {
            toast.error(`Generation failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setGenerateProgress({ current: 0, total: 0, description: '' });
        }
    };

    // Generate missing only
    const handleGenerateMissing = async () => {
        const missingClips = allClips.filter(c => !c.hasScenePlot && c.keyActionDescription);
        if (missingClips.length === 0) {
            toast.info('All clips already have scene plots.');
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch('/api/animation-clips/generate-scene-plots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipIds: missingClips.map(c => c.id),
                    preference,
                    userId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Generation failed');
            }

            const result = await res.json();

            toast.success(`Generated ${result.successCount} missing scene plots!`);

            await loadClips();
            onRefresh?.();
        } catch (error: any) {
            toast.error(`Generation failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // No animation version
    if (!animationVersionId) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Video className="w-12 h-12 text-purple-400/50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                    Animation Version Required
                </h3>
                <p className="text-white/60 mb-4 max-w-md">
                    Create an animation version to generate scene plots for your key actions.
                </p>
                <Button
                    onClick={onCreateAnimationVersion}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                    <Film className="w-4 h-4 mr-2" />
                    Create Animation Version
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="ml-3 text-white/60">Loading scene plots...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.totalClips}</div>
                    <div className="text-sm text-white/60">Total Clips</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.withScenePlot}</div>
                    <div className="text-sm text-white/60">With Scene Plot</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-cyan-400">{stats.withPrompt}</div>
                    <div className="text-sm text-white/60">With Prompt</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.totalShots}</div>
                    <div className="text-sm text-white/60">Total Shots</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-white/60">Est. Duration</div>
                </Card>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Scene Plot Completion</span>
                    <span className="text-purple-400 font-bold">{completionPercent}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>

            {/* Preference Input & Generate Button */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30 p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/80 mb-2">
                            <Camera className="w-4 h-4 inline mr-2 text-purple-400" />
                            Cinematography Preference (optional)
                        </label>
                        <Textarea
                            value={preference}
                            onChange={(e) => setPreference(e.target.value)}
                            placeholder="e.g., Cannes film festival style, dramatic lighting, slow camera movements, wide establishing shots..."
                            className="bg-white/5 border-white/20 text-white min-h-[60px]"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            onClick={handleGenerateAll}
                            disabled={isGenerating || stats.totalClips === 0}
                            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate All Scene Plots
                                </>
                            )}
                        </Button>

                        {stats.withScenePlot < stats.totalClips && stats.withScenePlot > 0 && (
                            <Button
                                onClick={handleGenerateMissing}
                                disabled={isGenerating}
                                variant="outline"
                                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Generate Missing ({stats.totalClips - stats.withScenePlot})
                            </Button>
                        )}

                        {stats.totalClips === 0 && (
                            <span className="text-amber-400 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No animation clips found. Generate key actions first.
                            </span>
                        )}
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAll}
                        className="border-white/20 text-white/70 hover:bg-white/10"
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAll}
                        className="border-white/20 text-white/70 hover:bg-white/10"
                    >
                        Collapse All
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadClips}
                    className="text-white/60 hover:text-white"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Beats with Clips */}
            <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                    {beats.map((beat, idx) => {
                        const clips = clipsByBeat[beat.key] || [];
                        const isExpanded = expandedBeats.has(beat.key);
                        const clipCount = clips.length;
                        const withScenePlot = clips.filter(c => c.hasScenePlot).length;

                        return (
                            <Card
                                key={beat.key}
                                className={`bg-white/5 border transition-all ${isExpanded ? 'border-purple-500/50' : 'border-white/10'
                                    }`}
                            >
                                {/* Beat Header */}
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                                    onClick={() => toggleBeat(beat.key)}
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-white/50" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-white/50" />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    {idx + 1}. {beat.label}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-white/20"
                                                >
                                                    Act {beat.act}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {clipCount > 0 ? (
                                            <Badge
                                                className={`${withScenePlot === clipCount
                                                    ? 'bg-green-500'
                                                    : withScenePlot > 0
                                                        ? 'bg-amber-500'
                                                        : 'bg-gray-500'
                                                    } text-white`}
                                            >
                                                {withScenePlot}/{clipCount} Scene Plots
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-500 text-white">
                                                No Clips
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-4 bg-black/20">
                                        {clips.length > 0 ? (
                                            <div className="space-y-3">
                                                {clips.map((clip, clipIdx) => (
                                                    <div
                                                        key={clip.id}
                                                        className="p-3 bg-white/5 rounded-lg border border-white/10"
                                                    >
                                                        {/* Clip Header */}
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
                                                                    {clipIdx + 1}
                                                                </div>
                                                                <span className="text-white/90 text-sm">
                                                                    {clip.keyActionDescription?.slice(0, 60) || 'No description'}
                                                                    {(clip.keyActionDescription?.length || 0) > 60 && '...'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {clip.hasScenePlot ? (
                                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                                        <Check className="w-3 h-3 mr-1" />
                                                                        Scene Plot
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                                                        <X className="w-3 h-3 mr-1" />
                                                                        No Scene Plot
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Scene Plot Details */}
                                                        {clip.scenePlot?.shots && clip.scenePlot.shots.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {clip.scenePlot.shots.map((shot, shotIdx) => (
                                                                        <div
                                                                            key={shotIdx}
                                                                            className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded text-xs"
                                                                        >
                                                                            <span className="text-purple-400 font-mono">
                                                                                {SHOT_TYPE_LABELS[shot.shotType] || shot.shotType}
                                                                            </span>
                                                                            <span className="text-white/40">|</span>
                                                                            <span className="text-cyan-400">
                                                                                {MOVEMENT_LABELS[shot.cameraMovement] || shot.cameraMovement}
                                                                            </span>
                                                                            <span className="text-white/40">|</span>
                                                                            <span className="text-amber-400">
                                                                                {shot.durationSeconds}s
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                                                                    <span className="flex items-center gap-1">
                                                                        <Film className="w-3 h-3" />
                                                                        {clip.shotsCount} shots
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {clip.totalDuration}s total
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-white/40">
                                                <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p>No clips for this beat</p>
                                                <p className="text-sm mt-1">
                                                    Generate key actions and create animation clips first
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
