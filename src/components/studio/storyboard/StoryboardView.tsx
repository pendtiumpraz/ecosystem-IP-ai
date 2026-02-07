'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Film, Image as ImageIcon, Wand2, Loader2, RefreshCw, Grid, List,
    Eye, ChevronDown, Sparkles, Check, AlertCircle, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';
import { SceneCardReadOnly } from './SceneCardReadOnly';
import { ScenePreviewModal } from './ScenePreviewModal';
import { ScenePlot, SceneImageVersion } from '@/types/storyboard';

interface StoryboardViewProps {
    projectId: string;
    userId: string;
    onEditInStoryFormula?: (sceneId: string) => void;
}

export function StoryboardView({
    projectId,
    userId,
    onEditInStoryFormula
}: StoryboardViewProps) {
    const [scenes, setScenes] = useState<ScenePlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });
    const [viewMode, setViewMode] = useState<'grid' | 'sequential'>('grid');
    const [previewScene, setPreviewScene] = useState<ScenePlot | null>(null);

    // Load all scenes
    const loadScenes = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-plots?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setScenes(data.scenes || []);
            }
        } catch (error) {
            console.error('Error loading scenes:', error);
            toast.error('Failed to load storyboard');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadScenes();
    }, [loadScenes]);

    // Calculate stats
    const stats = {
        total: scenes.length,
        withImages: scenes.filter(s => s.active_image_version).length,
        withPlots: scenes.filter(s => s.status !== 'empty').length,
        complete: scenes.filter(s => s.status === 'complete').length
    };

    // Generate image for a single scene
    const handleGenerateImage = async (sceneId: string) => {
        try {
            const res = await fetch(`/api/scene-plots/${sceneId}/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate image');
            }

            toast.success('Image generated!');
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Generate images for all scenes with plots
    const handleGenerateAllImages = async () => {
        const scenesWithPlots = scenes.filter(s =>
            s.status !== 'empty' && !s.active_image_version
        );

        if (scenesWithPlots.length === 0) {
            toast.info('All scenes with plots already have images.');
            return;
        }

        setIsGeneratingAll(true);
        setGenerateProgress({ current: 0, total: scenesWithPlots.length });

        try {
            for (let i = 0; i < scenesWithPlots.length; i++) {
                const scene = scenesWithPlots[i];

                const res = await fetch(`/api/scene-plots/${scene.id}/generate-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                if (!res.ok) {
                    console.error(`Failed to generate image for scene ${scene.scene_number}`);
                }

                setGenerateProgress({ current: i + 1, total: scenesWithPlots.length });
            }

            toast.success(`Generated ${scenesWithPlots.length} images!`);
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingAll(false);
            setGenerateProgress({ current: 0, total: 0 });
        }
    };

    // Handle image version change
    const handleSetActiveVersion = async (sceneId: string, versionId: string) => {
        try {
            const res = await fetch(`/api/scene-images/${versionId}/activate`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to set active version');

            toast.success('Version activated!');
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-sm text-white/60">Total Scenes</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.withPlots}</div>
                    <div className="text-sm text-white/60">With Plots</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.withImages}</div>
                    <div className="text-sm text-white/60">With Images</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-emerald-400">{stats.complete}</div>
                    <div className="text-sm text-white/60">Complete</div>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Scene Storyboard</h2>
                        <Badge className="bg-blue-500/20 text-blue-400">
                            {stats.withImages}/{stats.total} images
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            <Button
                                onClick={() => setViewMode('grid')}
                                variant="ghost"
                                size="sm"
                                className={viewMode === 'grid' ? 'bg-white/10' : ''}
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => setViewMode('sequential')}
                                variant="ghost"
                                size="sm"
                                className={viewMode === 'sequential' ? 'bg-white/10' : ''}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleGenerateAllImages}
                            disabled={isGeneratingAll}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            {isGeneratingAll ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {generateProgress.current}/{generateProgress.total}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate All Images
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={loadScenes}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar for Batch Generation */}
                {isGeneratingAll && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                            <span>Generating images...</span>
                            <span>{Math.round((generateProgress.current / generateProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${(generateProgress.current / generateProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Scene Grid/List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="ml-3 text-white/60">Loading storyboard...</span>
                </div>
            ) : scenes.length === 0 ? (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                    <ImageIcon className="w-12 h-12 text-blue-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Scenes Yet</h3>
                    <p className="text-white/60 mb-4 max-w-md mx-auto">
                        Create scenes in the Story Formula tab first, then generate storyboard images here.
                    </p>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {scenes.map(scene => (
                        <SceneCardReadOnly
                            key={scene.id}
                            scene={scene}
                            onPreview={() => setPreviewScene(scene)}
                            onGenerateImage={() => handleGenerateImage(scene.id)}
                            onSetActiveVersion={(versionId) => handleSetActiveVersion(scene.id, versionId)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {scenes.map(scene => (
                        <div key={scene.id} className="flex-shrink-0 w-64">
                            <SceneCardReadOnly
                                scene={scene}
                                onPreview={() => setPreviewScene(scene)}
                                onGenerateImage={() => handleGenerateImage(scene.id)}
                                onSetActiveVersion={(versionId) => handleSetActiveVersion(scene.id, versionId)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewScene && (
                <ScenePreviewModal
                    scene={previewScene}
                    isOpen={!!previewScene}
                    onClose={() => setPreviewScene(null)}
                    onEditInStoryFormula={() => {
                        onEditInStoryFormula?.(previewScene.id);
                        setPreviewScene(null);
                    }}
                    onGenerateImage={() => handleGenerateImage(previewScene.id)}
                />
            )}
        </div>
    );
}
