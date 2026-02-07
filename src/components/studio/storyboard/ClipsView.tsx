'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Video, Wand2, Loader2, RefreshCw, Play, Pause, AlertTriangle,
    Film, Clock, DollarSign, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';
import { ClipGenerationModal } from './ClipGenerationModal';
import { ClipVersionSelector } from './ClipVersionSelector';
import { ScenePlot, SceneClip } from '@/types/storyboard';

interface ClipsViewProps {
    projectId: string;
    userId: string;
    scenes: ScenePlot[];
    onRefresh: () => void;
}

export function ClipsView({ projectId, userId, scenes, onRefresh }: ClipsViewProps) {
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });
    const [selectedScene, setSelectedScene] = useState<ScenePlot | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [playingClipId, setPlayingClipId] = useState<string | null>(null);

    // Calculate stats
    const stats = {
        total: scenes.length,
        withClips: scenes.filter(s => s.active_clip?.video_url).length,
        withImages: scenes.filter(s => s.active_image_version?.image_url).length,
        pending: scenes.filter(s => s.active_clip?.status === 'pending' || s.active_clip?.status === 'processing').length,
        failed: scenes.filter(s => s.active_clip?.status === 'failed').length
    };

    // Estimated total cost
    const estimatedCredits = (stats.withImages - stats.withClips) * 50;

    // Generate clip for a scene
    const handleGenerateClip = async (scene: ScenePlot, options?: {
        movementDirection?: string;
        movementSpeed?: string;
        movementPrompt?: string;
    }) => {
        if (!scene.active_image_version?.image_url) {
            toast.error('Scene must have an image first');
            return;
        }

        try {
            const res = await fetch('/api/scene-clips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: scene.id,
                    shot_id: scene.shots?.[0]?.id,
                    source_image_url: scene.active_image_version.image_url,
                    source_image_version_id: scene.active_image_version.id,
                    userId,
                    ...options
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate clip');
            }

            toast.success('Clip generation started! This may take 2-3 minutes.');
            onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Generate clips for all scenes with images
    const handleGenerateAllClips = async () => {
        const scenesWithImages = scenes.filter(s =>
            s.active_image_version?.image_url && !s.active_clip?.video_url
        );

        if (scenesWithImages.length === 0) {
            toast.info('All scenes with images already have clips.');
            return;
        }

        // Confirm cost
        const confirmed = window.confirm(
            `Generate ${scenesWithImages.length} clips?\n\nThis will use approximately ${scenesWithImages.length * 50} credits (~$${(scenesWithImages.length * 0.50).toFixed(2)}).`
        );

        if (!confirmed) return;

        setIsGeneratingAll(true);
        setGenerateProgress({ current: 0, total: scenesWithImages.length });

        try {
            for (let i = 0; i < scenesWithImages.length; i++) {
                const scene = scenesWithImages[i];
                await handleGenerateClip(scene);
                setGenerateProgress({ current: i + 1, total: scenesWithImages.length });

                // Small delay between requests
                await new Promise(r => setTimeout(r, 1000));
            }

            toast.success(`Started generation for ${scenesWithImages.length} clips!`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingAll(false);
            setGenerateProgress({ current: 0, total: 0 });
        }
    };

    // Open generation modal for a scene
    const openGenerateModal = (scene: ScenePlot) => {
        setSelectedScene(scene);
        setShowGenerateModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-sm text-white/60">Total Scenes</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.withImages}</div>
                    <div className="text-sm text-white/60">With Images</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.withClips}</div>
                    <div className="text-sm text-white/60">With Clips</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
                    <div className="text-sm text-white/60">Processing</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                    <div className="text-sm text-white/60">Failed</div>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Scene Clips</h2>
                        <Badge className="bg-purple-500/20 text-purple-400">
                            {stats.withClips}/{stats.total} clips
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Cost Indicator */}
                        {estimatedCredits > 0 && (
                            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                                <DollarSign className="w-4 h-4" />
                                <span>~{estimatedCredits} credits remaining</span>
                            </div>
                        )}

                        <Button
                            onClick={handleGenerateAllClips}
                            disabled={isGeneratingAll || stats.withImages === stats.withClips}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                            {isGeneratingAll ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {generateProgress.current}/{generateProgress.total}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate All Clips
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={onRefresh}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                {isGeneratingAll && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                            <span>Generating clips...</span>
                            <span>{Math.round((generateProgress.current / generateProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${(generateProgress.current / generateProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Clips Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {scenes.map(scene => {
                    const hasImage = !!scene.active_image_version?.image_url;
                    const hasClip = !!scene.active_clip?.video_url;
                    const clipStatus = scene.active_clip?.status;
                    const isPlaying = playingClipId === scene.id;

                    return (
                        <Card
                            key={scene.id}
                            className="bg-white/5 border-white/10 overflow-hidden group hover:border-purple-500/50 transition-all"
                        >
                            {/* Video/Image Container */}
                            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                {hasClip ? (
                                    <>
                                        <video
                                            src={scene.active_clip!.video_url!}
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                            playsInline
                                            autoPlay={isPlaying}
                                            onMouseEnter={(e) => {
                                                setPlayingClipId(scene.id);
                                                e.currentTarget.play();
                                            }}
                                            onMouseLeave={(e) => {
                                                setPlayingClipId(null);
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                        {/* Play Indicator */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white fill-white" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : hasImage ? (
                                    <img
                                        src={scene.active_image_version!.image_url}
                                        alt={scene.title || `Scene ${scene.scene_number}`}
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Film className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}

                                {/* Scene Number */}
                                <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                    {scene.scene_number}
                                </div>

                                {/* Status Badge */}
                                {clipStatus === 'pending' && (
                                    <Badge className="absolute top-2 right-2 bg-amber-500/80 text-black">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Pending
                                    </Badge>
                                )}
                                {clipStatus === 'processing' && (
                                    <Badge className="absolute top-2 right-2 bg-blue-500/80">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Processing
                                    </Badge>
                                )}
                                {clipStatus === 'failed' && (
                                    <Badge className="absolute top-2 right-2 bg-red-500/80">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Failed
                                    </Badge>
                                )}
                                {clipStatus === 'complete' && (
                                    <Badge className="absolute top-2 right-2 bg-emerald-500/80">
                                        <Video className="w-3 h-3 mr-1" />
                                        Ready
                                    </Badge>
                                )}

                                {/* Generate Overlay */}
                                {hasImage && !hasClip && clipStatus !== 'processing' && clipStatus !== 'pending' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            onClick={() => openGenerateModal(scene)}
                                            size="sm"
                                            className="bg-purple-500/80 backdrop-blur-sm"
                                        >
                                            <Wand2 className="w-4 h-4 mr-1" />
                                            Generate Clip
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Scene Info */}
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-white truncate">
                                        {scene.title || `Scene ${scene.scene_number}`}
                                    </h4>
                                    {scene.active_clip?.duration && (
                                        <div className="flex items-center gap-1 text-xs text-white/60">
                                            <Clock className="w-3 h-3" />
                                            {scene.active_clip.duration}s
                                        </div>
                                    )}
                                </div>

                                {/* Quick stats */}
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    {hasImage && <span>📷 Image</span>}
                                    {hasClip && <span>🎬 Clip</span>}
                                    {scene.shots && scene.shots.length > 0 && (
                                        <span>🎯 {scene.shots.length} shots</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* No Scenes Message */}
            {scenes.length === 0 && (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                    <Video className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Scenes Yet</h3>
                    <p className="text-white/60 mb-4 max-w-md mx-auto">
                        Create scenes and generate storyboard images first, then you can generate video clips.
                    </p>
                </Card>
            )}

            {/* Generation Modal */}
            {showGenerateModal && selectedScene && (
                <ClipGenerationModal
                    scene={selectedScene}
                    isOpen={showGenerateModal}
                    onClose={() => {
                        setShowGenerateModal(false);
                        setSelectedScene(null);
                    }}
                    onGenerate={(options) => {
                        handleGenerateClip(selectedScene, options);
                        setShowGenerateModal(false);
                        setSelectedScene(null);
                    }}
                />
            )}
        </div>
    );
}
