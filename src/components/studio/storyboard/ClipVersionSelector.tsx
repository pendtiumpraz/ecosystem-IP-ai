'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Video, Check, Trash2, RotateCcw, ChevronDown, ChevronUp,
    Play, Pause, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/sweetalert';
import { SceneClip } from '@/types/storyboard';

interface ClipVersionSelectorProps {
    sceneId: string;
    activeClipId?: string;
    onClipChange: (clipId: string) => void;
}

export function ClipVersionSelector({
    sceneId,
    activeClipId,
    onClipChange
}: ClipVersionSelectorProps) {
    const [clips, setClips] = useState<SceneClip[]>([]);
    const [deletedClips, setDeletedClips] = useState<SceneClip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

    // Load clips
    const loadClips = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-clips?sceneId=${sceneId}&includeDeleted=true`);
            if (res.ok) {
                const data = await res.json();
                setClips(data.clips || []);
                setDeletedClips(data.deletedClips || []);
            }
        } catch (error) {
            console.error('Error loading clips:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClips();
    }, [sceneId]);

    // Set active clip
    const handleSetActive = async (clipId: string) => {
        try {
            const res = await fetch(`/api/scene-clips/${clipId}/activate`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to activate clip');

            toast.success('Clip activated!');
            onClipChange(clipId);
            await loadClips();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Soft delete clip
    const handleDelete = async (clipId: string) => {
        try {
            const res = await fetch(`/api/scene-clips/${clipId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete clip');

            toast.success('Clip deleted');
            await loadClips();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Restore clip
    const handleRestore = async (clipId: string) => {
        try {
            const res = await fetch(`/api/scene-clips/${clipId}/restore`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to restore clip');

            toast.success('Clip restored');
            await loadClips();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Toggle video playback
    const togglePlay = (clipId: string) => {
        const video = videoRefs.current[clipId];
        if (!video) return;

        if (playingId === clipId) {
            video.pause();
            setPlayingId(null);
        } else {
            // Pause any currently playing video
            if (playingId && videoRefs.current[playingId]) {
                videoRefs.current[playingId]?.pause();
            }
            video.play();
            setPlayingId(clipId);
        }
    };

    if (clips.length === 0 && !isLoading) {
        return null;
    }

    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Clip Versions</span>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {clips.length}
                    </Badge>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-white/60" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 pt-0 space-y-3">
                    {/* Active Clips */}
                    {clips.map(clip => (
                        <div
                            key={clip.id}
                            className={`relative rounded-lg overflow-hidden transition-all ${clip.is_active ? 'ring-2 ring-purple-500' : 'ring-1 ring-white/10 hover:ring-white/30'
                                }`}
                        >
                            {/* Video Container */}
                            <div className="relative aspect-video bg-gray-800">
                                {clip.video_url ? (
                                    <>
                                        <video
                                            ref={el => { videoRefs.current[clip.id] = el; }}
                                            src={clip.video_url}
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                            playsInline
                                        />

                                        {/* Play/Pause Button */}
                                        <button
                                            onClick={() => togglePlay(clip.id)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                                        >
                                            {playingId === clip.id ? (
                                                <Pause className="w-8 h-8 text-white" />
                                            ) : (
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <Badge className={`absolute top-2 left-2 text-[10px] ${clip.status === 'complete' ? 'bg-emerald-500' :
                                    clip.status === 'processing' ? 'bg-blue-500' :
                                        clip.status === 'pending' ? 'bg-amber-500' :
                                            'bg-red-500'
                                    }`}>
                                    {clip.status}
                                </Badge>

                                {/* Active Indicator */}
                                {clip.is_active && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                {/* Duration */}
                                {clip.duration && (
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                                        <Clock className="w-3 h-3 text-white/60" />
                                        <span className="text-[10px] text-white">{clip.duration}s</span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between p-2 bg-white/5">
                                <div className="text-xs text-white/60">
                                    {clip.provider} • {clip.model || 'Default'}
                                </div>
                                <div className="flex items-center gap-1">
                                    {!clip.is_active && clip.status === 'complete' && (
                                        <Button
                                            onClick={() => handleSetActive(clip.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-purple-400"
                                        >
                                            Set Active
                                        </Button>
                                    )}
                                    {!clip.is_active && (
                                        <Button
                                            onClick={() => handleDelete(clip.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-red-400"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Deleted Clips Toggle */}
                    {deletedClips.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowDeleted(!showDeleted)}
                                className="w-full flex items-center justify-between py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                            >
                                <span>Deleted ({deletedClips.length})</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showDeleted ? 'rotate-180' : ''}`} />
                            </button>

                            {showDeleted && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    {deletedClips.map(clip => (
                                        <div
                                            key={clip.id}
                                            className="relative rounded-lg overflow-hidden opacity-50 hover:opacity-100 transition-opacity ring-1 ring-white/10"
                                        >
                                            <div className="aspect-video bg-gray-800 flex items-center justify-center">
                                                <Video className="w-8 h-8 text-gray-600" />
                                            </div>

                                            <Badge className="absolute top-2 left-2 text-[10px] bg-red-500/60">
                                                Deleted
                                            </Badge>

                                            {/* Restore Button */}
                                            <div className="flex items-center justify-end p-2 bg-white/5">
                                                <Button
                                                    onClick={() => handleRestore(clip.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-green-400"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Restore
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
