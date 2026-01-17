'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Film, Video, Play, Pause, Image as ImageIcon, Wand2, Sparkles,
    Loader2, Settings2, Trash2, RotateCcw, Plus, ChevronRight, ChevronDown,
    RefreshCw, Download, Eye, Clock, CheckCircle, AlertCircle, GripVertical, Info,
    LayoutGrid, Rows, ListVideo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast, alert as swalAlert } from '@/lib/sweetalert';
import { ClipDetailModal } from './ClipDetailModal';

// Types
interface MoodboardVersion {
    id: string;
    versionNumber: number;
    versionName: string;
    artStyle: string;
    isActive: boolean;
}

interface AnimationVersion {
    id: string;
    moodboardId: string;
    versionNumber: number;
    name: string;
    defaultDuration: number;
    defaultFps: number;
    defaultResolution: string;
    generateAudio: boolean;
    transitionType: string;
    transitionDuration: number;
    effectPreset: any;
    status: string;
    totalClips: number;
    completedClips: number;
    createdAt: string;
    deletedAt: string | null;
}

interface AnimationClip {
    id: string;
    animationVersionId: string;
    moodboardItemId: string;
    beatKey: string;
    beatLabel: string;
    clipOrder: number;
    sourceImageUrl: string;
    keyActionDescription: string;
    videoPrompt: string | null;
    negativePrompt: string | null;
    duration: number;
    fps: number;
    resolution: string;
    cameraMotion: string;
    cameraAngle: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    previewGifUrl: string | null;
    jobId: string | null;
    etaSeconds: number | null;
    status: string;
    errorMessage: string | null;
}

interface AnimationStudioV2Props {
    projectId: string;
    userId: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600 border-gray-200',
    prompt_ready: 'bg-blue-100 text-blue-600 border-blue-200',
    queued: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    processing: 'bg-purple-100 text-purple-600 border-purple-200',
    completed: 'bg-green-100 text-green-600 border-green-200',
    failed: 'bg-red-100 text-red-600 border-red-200',
};

const CAMERA_MOTIONS = [
    { value: 'static', label: 'Static', description: 'No movement' },
    { value: 'orbit', label: 'Orbit', description: '360° rotation around subject' },
    { value: 'zoom_in', label: 'Zoom In', description: 'Dramatic focus on subject' },
    { value: 'zoom_out', label: 'Zoom Out', description: 'Reveal scene context' },
    { value: 'pan_left', label: 'Pan Left', description: 'Horizontal sweep left' },
    { value: 'pan_right', label: 'Pan Right', description: 'Horizontal sweep right' },
    { value: 'ken_burns', label: 'Ken Burns', description: 'Slow pan + zoom' },
    { value: 'parallax', label: 'Parallax', description: '3D depth simulation' },
];

export function AnimationStudioV2({ projectId, userId }: AnimationStudioV2Props) {
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [moodboardVersions, setMoodboardVersions] = useState<MoodboardVersion[]>([]);
    const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(null);
    const [animationVersions, setAnimationVersions] = useState<AnimationVersion[]>([]);
    const [deletedAnimationVersions, setDeletedAnimationVersions] = useState<AnimationVersion[]>([]);
    const [selectedAnimationVersion, setSelectedAnimationVersion] = useState<AnimationVersion | null>(null);
    const [clips, setClips] = useState<AnimationClip[]>([]);
    const [expandedBeats, setExpandedBeats] = useState<Record<string, boolean>>({});

    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    const [newVersionName, setNewVersionName] = useState('');
    const [selectedClip, setSelectedClip] = useState<AnimationClip | null>(null);
    const [showClipModal, setShowClipModal] = useState(false);
    const [viewMode, setViewMode] = useState<'clips' | 'sequential' | 'storyboard'>('clips');

    // Load moodboard versions on mount
    useEffect(() => {
        loadMoodboardVersions();
    }, [projectId]);

    // Load animation versions when moodboard changes
    useEffect(() => {
        if (selectedMoodboardId) {
            loadAnimationVersions();
        }
    }, [selectedMoodboardId]);

    // Load clips when animation version changes
    useEffect(() => {
        if (selectedAnimationVersion) {
            loadClips();
        }
    }, [selectedAnimationVersion?.id]);

    const loadMoodboardVersions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/versions`);
            if (res.ok) {
                const data = await res.json();
                setMoodboardVersions(data.versions || []);

                // Auto-select active moodboard
                const active = data.versions?.find((v: MoodboardVersion) => v.isActive);
                if (active) {
                    setSelectedMoodboardId(active.id);
                } else if (data.versions?.length > 0) {
                    setSelectedMoodboardId(data.versions[0].id);
                }
            }
        } catch (e) {
            console.error('Failed to load moodboard versions:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAnimationVersions = async () => {
        if (!selectedMoodboardId) return;

        try {
            const res = await fetch(`/api/animation-versions?moodboardId=${selectedMoodboardId}&includeDeleted=true`);
            if (res.ok) {
                const data = await res.json();
                const active = (data.versions || []).filter((v: AnimationVersion) => !v.deletedAt);
                const deleted = (data.versions || []).filter((v: AnimationVersion) => v.deletedAt);

                setAnimationVersions(active);
                setDeletedAnimationVersions(deleted);

                // Auto-select first version
                if (active.length > 0 && !selectedAnimationVersion) {
                    setSelectedAnimationVersion(active[0]);
                }
            }
        } catch (e) {
            console.error('Failed to load animation versions:', e);
        }
    };

    const loadClips = async () => {
        if (!selectedAnimationVersion) return;

        try {
            console.log('[AnimationStudioV2] Loading clips for version:', selectedAnimationVersion.id);
            const res = await fetch(`/api/animation-clips?animationVersionId=${selectedAnimationVersion.id}`);
            if (res.ok) {
                const data = await res.json();
                console.log('[AnimationStudioV2] Loaded clips:', data.clips?.length, data.clips);
                setClips(data.clips || []);

                // Auto-expand first beat
                const beats = [...new Set((data.clips || []).map((c: AnimationClip) => c.beatKey))];
                if (beats.length > 0) {
                    setExpandedBeats({ [beats[0] as string]: true });
                }
            } else {
                console.error('[AnimationStudioV2] Failed to load clips:', res.status, await res.text());
            }
        } catch (e) {
            console.error('Failed to load clips:', e);
        }
    };

    const createAnimationVersion = async () => {
        if (!selectedMoodboardId) return;

        setIsGenerating(prev => ({ ...prev, create: true }));
        try {
            const res = await fetch('/api/animation-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: selectedMoodboardId,
                    name: newVersionName || undefined,
                    copyFromMoodboard: true,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Animation version created!');
                setShowCreateDialog(false);
                setNewVersionName('');
                await loadAnimationVersions();

                // Select the new version
                if (data.version) {
                    setSelectedAnimationVersion(data.version);
                }
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to create version');
            }
        } catch (e) {
            toast.error('Failed to create animation version');
        } finally {
            setIsGenerating(prev => ({ ...prev, create: false }));
        }
    };

    const deleteAnimationVersion = async (id: string) => {
        const result = await swalAlert.confirm(
            'Delete Animation Version',
            'This will delete this animation version. You can restore it later.',
            'Delete',
            'Cancel'
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/animation-versions?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Animation version deleted');
                await loadAnimationVersions();
                if (selectedAnimationVersion?.id === id) {
                    setSelectedAnimationVersion(animationVersions.find(v => v.id !== id) || null);
                }
            }
        } catch (e) {
            toast.error('Failed to delete version');
        }
    };

    const restoreAnimationVersion = async (id: string) => {
        try {
            const res = await fetch('/api/animation-versions/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                toast.success('Animation version restored');
                await loadAnimationVersions();
            }
        } catch (e) {
            toast.error('Failed to restore version');
        }
    };

    const syncFromMoodboard = async () => {
        if (!selectedAnimationVersion || !selectedMoodboardId) return;

        const result = await swalAlert.confirm(
            'Sync from Moodboard',
            'This will replace all clips with the latest images from the moodboard. Continue?',
            'Sync',
            'Cancel'
        );
        if (!result.isConfirmed) return;

        setIsGenerating(prev => ({ ...prev, sync: true }));
        try {
            const res = await fetch('/api/animation-clips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId: selectedAnimationVersion.id,
                    syncFromMoodboard: true,
                    moodboardId: selectedMoodboardId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Synced from moodboard');
                await loadClips();
            }
        } catch (e) {
            toast.error('Failed to sync from moodboard');
        } finally {
            setIsGenerating(prev => ({ ...prev, sync: false }));
        }
    };

    // Group clips by beat, maintaining order from API (which is sorted by clip_order)
    const clipsByBeat: Record<string, { beatLabel: string; clips: AnimationClip[] }> = {};
    const sortedBeatKeys: string[] = []; // Track order of beats as they appear in API response

    clips.forEach(clip => {
        const key = clip.beatKey;
        if (!clipsByBeat[key]) {
            clipsByBeat[key] = {
                beatLabel: clip.beatLabel,
                clips: []
            };
            sortedBeatKeys.push(key); // Preserve API order
        }
        clipsByBeat[key].clips.push(clip);
    });

    const toggleBeat = (beatKey: string) => {
        setExpandedBeats(prev => ({ ...prev, [beatKey]: !prev[beatKey] }));
    };

    // Generate video prompts for a specific beat
    const generatePromptsForBeat = async (beatKey: string) => {
        if (!selectedAnimationVersion) return;

        setIsGenerating(prev => ({ ...prev, [`prompt_${beatKey}`]: true }));
        try {
            const res = await fetch('/api/generate/animation-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId: selectedAnimationVersion.id,
                    beatKey,
                    userId,
                    projectId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Generated ${data.succeeded}/${data.processed} prompts`);
                await loadClips();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to generate prompts');
            }
        } catch (e) {
            toast.error('Failed to generate prompts');
        } finally {
            setIsGenerating(prev => ({ ...prev, [`prompt_${beatKey}`]: false }));
        }
    };

    // Generate video prompts for all clips
    const generateAllPrompts = async () => {
        if (!selectedAnimationVersion) return;

        setIsGenerating(prev => ({ ...prev, promptAll: true }));
        try {
            const res = await fetch('/api/generate/animation-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId: selectedAnimationVersion.id,
                    userId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Generated ${data.succeeded}/${data.processed} prompts`);
                await loadClips();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to generate prompts');
            }
        } catch (e) {
            toast.error('Failed to generate prompts');
        } finally {
            setIsGenerating(prev => ({ ...prev, promptAll: false }));
        }
    };

    // Generate videos for a specific beat
    const generateVideosForBeat = async (beatKey: string) => {
        if (!selectedAnimationVersion) return;

        setIsGenerating(prev => ({ ...prev, [`video_${beatKey}`]: true }));
        try {
            const res = await fetch('/api/generate/animation-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId: selectedAnimationVersion.id,
                    beatKey,
                    userId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.succeeded > 0) {
                    toast.success(`Started generating ${data.succeeded} videos`);
                    // Start polling for status
                    startPollingForStatus();
                } else {
                    toast.error(data.error || 'No clips ready for video generation');
                }
                await loadClips();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to generate videos');
            }
        } catch (e) {
            toast.error('Failed to generate videos');
        } finally {
            setIsGenerating(prev => ({ ...prev, [`video_${beatKey}`]: false }));
        }
    };

    // Generate videos for all clips with prompts ready
    const generateAllVideos = async () => {
        if (!selectedAnimationVersion) return;

        setIsGenerating(prev => ({ ...prev, videoAll: true }));
        try {
            const res = await fetch('/api/generate/animation-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animationVersionId: selectedAnimationVersion.id,
                    userId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.succeeded > 0) {
                    toast.success(`Started generating ${data.succeeded} videos`);
                    startPollingForStatus();
                } else {
                    toast.error(data.error || 'No clips ready for video generation');
                }
                await loadClips();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to generate videos');
            }
        } catch (e) {
            toast.error('Failed to generate videos');
        } finally {
            setIsGenerating(prev => ({ ...prev, videoAll: false }));
        }
    };

    // Poll for video generation status
    const startPollingForStatus = () => {
        if (!selectedAnimationVersion) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/generate/animation-video/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        animationVersionId: selectedAnimationVersion.id,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();

                    if (data.completed > 0) {
                        toast.success(`${data.completed} videos completed!`);
                        await loadClips();
                        await loadAnimationVersions();
                    }

                    // Stop polling if no more processing clips
                    const stillProcessing = data.results?.filter((r: any) => r.status === 'processing').length || 0;
                    if (stillProcessing === 0) {
                        clearInterval(pollInterval);
                    }
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 10000); // Poll every 10 seconds

        // Auto-stop after 10 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
        }, 600000);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // No moodboard versions
    if (moodboardVersions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-orange-200">
                <Film className="h-16 w-16 text-orange-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Moodboards Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mb-4">
                    Create a moodboard first to generate animation clips from your key action images.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl border border-orange-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Film className="h-6 w-6 text-orange-500" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Animation Studio</h2>
                            <p className="text-xs text-gray-500">Generate videos from moodboard images</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Moodboard Selector */}
                        <Select
                            value={selectedMoodboardId || ''}
                            onValueChange={(v) => {
                                setSelectedMoodboardId(v);
                                setSelectedAnimationVersion(null);
                                setClips([]);
                            }}
                        >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Select Moodboard" />
                            </SelectTrigger>
                            <SelectContent>
                                {moodboardVersions.map(v => (
                                    <SelectItem key={v.id} value={v.id} className="text-xs">
                                        v{v.versionNumber} - {v.versionName || v.artStyle}
                                        {v.isActive && <Badge className="ml-2 text-[8px]">Active</Badge>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Animation Version Selector */}
                        {selectedMoodboardId && (
                            <Select
                                value={selectedAnimationVersion?.id || ''}
                                onValueChange={(v) => {
                                    const version = animationVersions.find(av => av.id === v);
                                    setSelectedAnimationVersion(version || null);
                                }}
                            >
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                    <SelectValue placeholder="Select Animation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {animationVersions.length === 0 ? (
                                        <div className="text-xs text-gray-500 p-2">No animation versions</div>
                                    ) : (
                                        animationVersions.map(v => (
                                            <SelectItem key={v.id} value={v.id} className="text-xs">
                                                v{v.versionNumber} - {v.name}
                                                <span className="text-gray-400 ml-2">
                                                    ({v.completedClips}/{v.totalClips})
                                                </span>
                                            </SelectItem>
                                        ))
                                    )}

                                    {deletedAnimationVersions.length > 0 && (
                                        <>
                                            <div className="border-t my-1" />
                                            <div className="text-[10px] text-gray-400 px-2 py-1">Deleted</div>
                                            {deletedAnimationVersions.map(v => (
                                                <div key={v.id} className="flex items-center justify-between px-2 py-1 text-xs text-gray-400">
                                                    <span>v{v.versionNumber} - {v.name}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 text-xs text-orange-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            restoreAnimationVersion(v.id);
                                                        }}
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Actions */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCreateDialog(true)}
                            className="h-8 text-xs"
                            disabled={!selectedMoodboardId}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            New Animation
                        </Button>

                        {selectedAnimationVersion && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={syncFromMoodboard}
                                    disabled={isGenerating['sync']}
                                    className="h-8 text-xs"
                                >
                                    {isGenerating['sync'] ? (
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                    )}
                                    Sync
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowSettings(true)}
                                    className="h-8 text-xs"
                                >
                                    <Settings2 className="h-3 w-3 mr-1" />
                                    Settings
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteAnimationVersion(selectedAnimationVersion.id)}
                                    className="h-8 text-xs text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress */}
                {selectedAnimationVersion && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <span className="text-xs text-gray-500">Progress</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                                style={{
                                    width: `${selectedAnimationVersion.totalClips > 0
                                        ? (selectedAnimationVersion.completedClips / selectedAnimationVersion.totalClips) * 100
                                        : 0}%`
                                }}
                            />
                        </div>
                        <span className="text-xs font-medium text-orange-600">
                            {selectedAnimationVersion.completedClips}/{selectedAnimationVersion.totalClips} clips
                        </span>
                    </div>
                )}
            </div>

            {/* View Mode Toggle */}
            {selectedAnimationVersion && clips.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <Button
                            size="sm"
                            variant={viewMode === 'clips' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('clips')}
                            className={`h-8 px-3 ${viewMode === 'clips' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        >
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Clips
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'sequential' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('sequential')}
                            className={`h-8 px-3 ${viewMode === 'sequential' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        >
                            <ListVideo className="h-4 w-4 mr-1" />
                            Sequential
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'storyboard' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('storyboard')}
                            className={`h-8 px-3 ${viewMode === 'storyboard' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        >
                            <Rows className="h-4 w-4 mr-1" />
                            Storyboard
                        </Button>
                    </div>
                    <span className="text-xs text-gray-500">
                        {clips.filter(c => c.videoUrl).length}/{clips.length} videos ready
                    </span>
                </div>
            )}

            {/* View Modes Content */}
            {selectedAnimationVersion ? (
                clips.length > 0 ? (
                    <>
                        {/* CLIPS VIEW - Grid by Beat */}
                        {viewMode === 'clips' && (
                            <div className="space-y-3">
                                {sortedBeatKeys.map((beatKey) => {
                                    const { beatLabel, clips: beatClips } = clipsByBeat[beatKey];
                                    return (
                                        <Collapsible
                                            key={beatKey}
                                            open={expandedBeats[beatKey]}
                                            onOpenChange={() => toggleBeat(beatKey)}
                                        >
                                            <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                                                <CollapsibleTrigger className="w-full">
                                                    <div className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            {expandedBeats[beatKey] ? (
                                                                <ChevronDown className="h-4 w-4 text-orange-500" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-orange-500" />
                                                            )}
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-gray-900">{beatLabel || beatKey}</h3>
                                                                <p className="text-xs text-gray-500">
                                                                    {beatClips.length} clips •
                                                                    {beatClips.filter(c => c.videoUrl).length} completed
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs"
                                                                disabled={isGenerating[`prompt_${beatKey}`]}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    generatePromptsForBeat(beatKey);
                                                                }}
                                                            >
                                                                {isGenerating[`prompt_${beatKey}`] ? (
                                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Wand2 className="h-3 w-3 mr-1" />
                                                                )}
                                                                Gen Prompts
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={isGenerating[`video_${beatKey}`] || beatClips.filter(c => c.status === 'prompt_ready').length === 0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    generateVideosForBeat(beatKey);
                                                                }}
                                                            >
                                                                {isGenerating[`video_${beatKey}`] ? (
                                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Video className="h-3 w-3 mr-1" />
                                                                )}
                                                                Gen Videos
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <div className="p-4 pt-0">
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                                            {beatClips.map(clip => (
                                                                <Card
                                                                    key={clip.id}
                                                                    className="bg-gray-50 hover:shadow-md transition-shadow cursor-pointer group relative"
                                                                    onClick={() => {
                                                                        setSelectedClip(clip);
                                                                        setShowClipModal(true);
                                                                    }}
                                                                >
                                                                    {/* Image/Video Preview */}
                                                                    <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-t-lg">
                                                                        {clip.videoUrl ? (
                                                                            <video
                                                                                src={clip.videoUrl}
                                                                                className="w-full h-full object-cover"
                                                                                muted
                                                                                loop
                                                                                onMouseEnter={(e) => e.currentTarget.play()}
                                                                                onMouseLeave={(e) => {
                                                                                    e.currentTarget.pause();
                                                                                    e.currentTarget.currentTime = 0;
                                                                                }}
                                                                            />
                                                                        ) : clip.sourceImageUrl ? (
                                                                            <img
                                                                                src={clip.sourceImageUrl}
                                                                                alt={clip.keyActionDescription || ''}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ImageIcon className="h-8 w-8 text-gray-300" />
                                                                            </div>
                                                                        )}

                                                                        {/* Status Badge */}
                                                                        <Badge className={`absolute top-2 right-2 text-[10px] ${STATUS_COLORS[clip.status]}`}>
                                                                            {clip.status === 'processing' && (
                                                                                <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                                                                            )}
                                                                            {clip.status}
                                                                        </Badge>

                                                                        {/* Clip Order */}
                                                                        <Badge className="absolute top-2 left-2 text-[10px] bg-black/50 text-white">
                                                                            #{clip.clipOrder + 1}
                                                                        </Badge>

                                                                        {/* Info button overlay */}
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <div className="bg-white/90 rounded-full p-2">
                                                                                <Info className="h-5 w-5 text-orange-500" />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <CardContent className="p-2">
                                                                        <p className="text-[10px] text-gray-600 line-clamp-2">
                                                                            {clip.keyActionDescription || 'No description'}
                                                                        </p>

                                                                        <div className="flex items-center gap-1 mt-2">
                                                                            {clip.videoPrompt && (
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <Badge variant="outline" className="text-[8px] py-0 px-1 text-blue-500 border-blue-200">
                                                                                                <Wand2 className="h-2.5 w-2.5" />
                                                                                            </Badge>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className="max-w-xs text-xs">
                                                                                            {clip.videoPrompt}
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            )}
                                                                            {clip.videoUrl && (
                                                                                <Badge variant="outline" className="text-[8px] py-0 px-1 text-green-500 border-green-200">
                                                                                    <Video className="h-2.5 w-2.5" />
                                                                                </Badge>
                                                                            )}
                                                                            <span className="text-[9px] text-gray-400 ml-auto">
                                                                                {clip.duration}s
                                                                            </span>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </div>
                                        </Collapsible>
                                    );
                                })}
                            </div>
                        )}

                        {/* SEQUENTIAL VIEW - Video Player with Timeline */}
                        {viewMode === 'sequential' && (
                            <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                                <div className="p-4 border-b bg-gray-50">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <ListVideo className="h-4 w-4 text-orange-500" />
                                        Sequential View
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Watch all videos in story order. Only clips with active videos are shown.
                                    </p>
                                </div>
                                <div className="p-4">
                                    {clips.filter(c => c.videoUrl).length > 0 ? (
                                        <div className="space-y-4">
                                            {clips.filter(c => c.videoUrl).map((clip, idx) => (
                                                <div key={clip.id} className="flex gap-4 items-start p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className="text-xs bg-orange-100 text-orange-600">
                                                                {clip.beatLabel || clip.beatKey}
                                                            </Badge>
                                                            <span className="text-xs text-gray-400">{clip.duration}s</span>
                                                        </div>
                                                        <video
                                                            src={clip.videoUrl || undefined}
                                                            controls
                                                            className="w-full max-w-2xl aspect-video rounded-lg bg-black"
                                                        />
                                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                            {clip.keyActionDescription}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No videos generated yet</p>
                                            <p className="text-xs mt-1">Generate video prompts and videos to see them here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STORYBOARD VIEW - Horizontal Timeline */}
                        {viewMode === 'storyboard' && (
                            <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                                <div className="p-4 border-b bg-gray-50">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Rows className="h-4 w-4 text-orange-500" />
                                        Storyboard View
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Horizontal timeline showing all clips in sequence. Scroll horizontally to see all clips.
                                    </p>
                                </div>
                                <div className="overflow-x-auto pb-4">
                                    <div className="p-4 flex gap-4" style={{ minWidth: 'max-content' }}>
                                        {clips.map((clip, idx) => (
                                            <div
                                                key={clip.id}
                                                className="flex-shrink-0 w-48 cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedClip(clip);
                                                    setShowClipModal(true);
                                                }}
                                            >
                                                {/* Connector Line */}
                                                <div className="flex items-center mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    {idx < clips.length - 1 && (
                                                        <div className="flex-1 h-0.5 bg-orange-200 ml-1" />
                                                    )}
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2 group-hover:ring-2 ring-orange-400 transition-all">
                                                    {clip.videoUrl ? (
                                                        <video
                                                            src={clip.videoUrl}
                                                            className="w-full h-full object-cover"
                                                            muted
                                                            onMouseEnter={(e) => e.currentTarget.play()}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.pause();
                                                                e.currentTarget.currentTime = 0;
                                                            }}
                                                        />
                                                    ) : clip.sourceImageUrl ? (
                                                        <img
                                                            src={clip.sourceImageUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <Badge className={`absolute top-1 right-1 text-[8px] ${STATUS_COLORS[clip.status]}`}>
                                                        {clip.status}
                                                    </Badge>
                                                </div>

                                                {/* Info */}
                                                <p className="text-[10px] font-medium text-gray-700 truncate">
                                                    {clip.beatLabel || clip.beatKey}
                                                </p>
                                                <p className="text-[9px] text-gray-500 line-clamp-2">
                                                    {clip.keyActionDescription || 'No description'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-orange-200">
                        <Video className="h-12 w-12 text-orange-300 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">No Clips Yet</h4>
                        <p className="text-xs text-gray-500 mb-4">
                            Sync from moodboard to create animation clips
                        </p>
                        <Button
                            onClick={syncFromMoodboard}
                            disabled={isGenerating['sync']}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isGenerating['sync'] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Sync from Moodboard
                        </Button>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-orange-200">
                    <Film className="h-12 w-12 text-orange-300 mb-3" />
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Create Animation Version</h4>
                    <p className="text-xs text-gray-500 mb-4">
                        Create an animation version to start generating video clips
                    </p>
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={!selectedMoodboardId}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Animation Version
                    </Button>
                </div>
            )
            }

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Animation Version</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Version Name (optional)</Label>
                            <Input
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                placeholder="e.g., Cinematic Style"
                                className="mt-1"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            This will create a new animation version and copy all images from the selected moodboard as clips.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={createAnimationVersion}
                            disabled={isGenerating['create']}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isGenerating['create'] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog - TODO: Implement full settings */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Animation Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Default Duration (seconds)</Label>
                                <Input
                                    type="number"
                                    defaultValue={selectedAnimationVersion?.defaultDuration || 6}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>FPS</Label>
                                <Select defaultValue={String(selectedAnimationVersion?.defaultFps || 25)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="24">24 fps</SelectItem>
                                        <SelectItem value="25">25 fps</SelectItem>
                                        <SelectItem value="30">30 fps</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Resolution</Label>
                            <Select defaultValue={selectedAnimationVersion?.defaultResolution || '1920x1080'}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                                    <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                                    <SelectItem value="2560x1440">2K (2560x1440)</SelectItem>
                                    <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Transition Type</Label>
                            <Select defaultValue={selectedAnimationVersion?.transitionType || 'fade'}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="fade">Fade</SelectItem>
                                    <SelectItem value="dissolve">Dissolve</SelectItem>
                                    <SelectItem value="wipe">Wipe</SelectItem>
                                    <SelectItem value="zoom">Zoom</SelectItem>
                                    <SelectItem value="slide">Slide</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clip Detail Modal */}
            <ClipDetailModal
                isOpen={showClipModal}
                onClose={() => {
                    setShowClipModal(false);
                    setSelectedClip(null);
                }}
                clip={selectedClip}
                userId={userId}
                projectId={projectId}
                animationVersionId={selectedAnimationVersion?.id || ''}
                onUpdate={loadClips}
            />
        </div >
    );
}
