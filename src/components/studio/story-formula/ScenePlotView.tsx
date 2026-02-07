'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Film, Plus, Wand2, Loader2, RefreshCw, ChevronDown, ChevronRight,
    Clock, MapPin, Users, Sparkles, Check, AlertCircle, LayoutGrid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';
import { SceneCard } from './SceneCard';
import { SceneEditModal } from './SceneEditModal';
import { ScenePlot, SceneDistribution } from '@/types/storyboard';

interface ScenePlotViewProps {
    projectId: string;
    userId: string;
    storyVersionId?: string;
    synopsis: string;
    storyBeats: Array<{
        id: string;
        name: string;
        description: string;
        percentage?: number;
    }>;
    characters: Array<{
        id: string;
        name: string;
        imageUrl?: string;
        role?: string;
    }>;
    genre?: string;
    tone?: string;
    targetDuration?: number; // in minutes
    onRefresh?: () => void;
}

export function ScenePlotView({
    projectId,
    userId,
    storyVersionId,
    synopsis,
    storyBeats,
    characters,
    genre,
    tone,
    targetDuration = 60,
    onRefresh
}: ScenePlotViewProps) {
    const [scenes, setScenes] = useState<ScenePlot[]>([]);
    const [distribution, setDistribution] = useState<SceneDistribution[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingDistribution, setIsGeneratingDistribution] = useState(false);
    const [isGeneratingPlots, setIsGeneratingPlots] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });
    const [selectedScene, setSelectedScene] = useState<ScenePlot | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedBeats, setExpandedBeats] = useState<Set<string>>(new Set());

    // Load scenes from database
    const loadScenes = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-plots?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setScenes(data.scenes || []);
                if (data.distribution) {
                    setDistribution(data.distribution);
                }
            }
        } catch (error) {
            console.error('Error loading scenes:', error);
            toast.error('Failed to load scenes');
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
        plotted: scenes.filter(s => s.status !== 'empty').length,
        withShots: scenes.filter(s => s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete').length,
        withScripts: scenes.filter(s => s.status === 'scripted' || s.status === 'complete').length,
        totalDuration: scenes.reduce((sum, s) => sum + (s.estimated_duration || 0), 0)
    };

    const completionPercent = stats.total > 0
        ? Math.round((stats.plotted / stats.total) * 100)
        : 0;

    // Generate scene distribution
    const handleGenerateDistribution = async () => {
        if (!synopsis || storyBeats.length === 0) {
            toast.warning('Please add story synopsis and beats first');
            return;
        }

        setIsGeneratingDistribution(true);
        try {
            const res = await fetch('/api/scene-plots/generate-distribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    userId,
                    synopsis,
                    storyBeats,
                    targetDuration,
                    scenesPerMinute: 1,
                    genre,
                    tone
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate distribution');
            }

            const result = await res.json();
            setDistribution(result.distribution.distribution);
            toast.success(`Created distribution for ${result.distribution.totalScenes} scenes`);

            // Reload to get any created scene placeholders
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingDistribution(false);
        }
    };

    // Initialize empty scenes based on distribution
    const handleInitializeScenes = async () => {
        if (!distribution) {
            toast.warning('Generate distribution first');
            return;
        }

        try {
            const allSceneNumbers = distribution.flatMap(d => d.sceneNumbers);

            // Create empty scene plots
            const res = await fetch('/api/scene-plots/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    scenes: allSceneNumbers.map((num, idx) => {
                        const beat = distribution.find(d => d.sceneNumbers.includes(num));
                        return {
                            scene_number: num,
                            story_beat_id: beat?.beatId,
                            story_beat_name: beat?.beatName,
                            status: 'empty'
                        };
                    })
                })
            });

            if (!res.ok) throw new Error('Failed to initialize scenes');

            toast.success(`Initialized ${allSceneNumbers.length} scenes`);
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Generate all plots in batches
    const handleGenerateAllPlots = async () => {
        if (scenes.length === 0) {
            toast.warning('Initialize scenes first');
            return;
        }

        const emptyScenes = scenes.filter(s => s.status === 'empty');
        if (emptyScenes.length === 0) {
            toast.info('All scenes already have plots');
            return;
        }

        setIsGeneratingPlots(true);
        setGenerateProgress({ current: 0, total: emptyScenes.length });

        try {
            // Process in batches of 3
            const batchSize = 3;
            for (let i = 0; i < emptyScenes.length; i += batchSize) {
                const batch = emptyScenes.slice(i, i + batchSize);
                const sceneNumbers = batch.map(s => s.scene_number);

                // Build story beat mapping
                const beatMapping: Record<number, { beatId: string; beatName: string; beatDescription: string }> = {};
                for (const scene of batch) {
                    if (scene.story_beat_id) {
                        const beat = storyBeats.find(b => b.id === scene.story_beat_id);
                        if (beat) {
                            beatMapping[scene.scene_number] = {
                                beatId: beat.id,
                                beatName: beat.name,
                                beatDescription: beat.description
                            };
                        }
                    }
                }

                // Get summary of previous scenes
                const previousScenes = scenes
                    .filter(s => s.scene_number < Math.min(...sceneNumbers) && s.synopsis)
                    .sort((a, b) => a.scene_number - b.scene_number)
                    .slice(-3); // Last 3 scenes for context

                const previousScenesSummary = previousScenes.length > 0
                    ? previousScenes.map(s => `Scene ${s.scene_number}: ${s.synopsis?.substring(0, 100)}`).join('\n')
                    : undefined;

                const res = await fetch('/api/scene-plots/generate-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        userId,
                        sceneNumbers,
                        synopsis,
                        storyBeats: beatMapping,
                        previousScenesSummary,
                        characters,
                        genre,
                        tone
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    console.error('Batch failed:', error);
                }

                setGenerateProgress({ current: i + batch.length, total: emptyScenes.length });
            }

            toast.success('All scene plots generated!');
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingPlots(false);
            setGenerateProgress({ current: 0, total: 0 });
        }
    };

    // Toggle beat expansion
    const toggleBeat = (beatId: string) => {
        const newExpanded = new Set(expandedBeats);
        if (newExpanded.has(beatId)) {
            newExpanded.delete(beatId);
        } else {
            newExpanded.add(beatId);
        }
        setExpandedBeats(newExpanded);
    };

    // Group scenes by story beat
    const scenesByBeat = storyBeats.map(beat => ({
        beat,
        scenes: scenes.filter(s => s.story_beat_id === beat.id).sort((a, b) => a.scene_number - b.scene_number)
    }));

    // Handle scene click
    const handleSceneClick = (scene: ScenePlot) => {
        setSelectedScene(scene);
        setShowEditModal(true);
    };

    // Handle scene update
    const handleSceneUpdate = async (sceneId: string, updates: Partial<ScenePlot>) => {
        try {
            const res = await fetch(`/api/scene-plots/${sceneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update scene');

            toast.success('Scene updated');
            await loadScenes();
            setShowEditModal(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="ml-3 text-white/60">Loading scenes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-sm text-white/60">Total Scenes</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.plotted}</div>
                    <div className="text-sm text-white/60">With Plot</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-cyan-400">{stats.withShots}</div>
                    <div className="text-sm text-white/60">With Shots</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.withScripts}</div>
                    <div className="text-sm text-white/60">With Script</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-white/60">Est. Duration</div>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card className="bg-white/5 border-white/10 p-4">
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
            </Card>

            {/* Actions */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {scenes.length === 0 ? (
                        <>
                            <Button
                                onClick={handleGenerateDistribution}
                                disabled={isGeneratingDistribution || !synopsis}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600"
                            >
                                {isGeneratingDistribution ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Distribution...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate Scene Distribution
                                    </>
                                )}
                            </Button>
                            {distribution && distribution.length > 0 && (
                                <Button
                                    onClick={handleInitializeScenes}
                                    variant="outline"
                                    className="border-purple-500/50 text-purple-400"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Initialize {distribution.reduce((sum, d) => sum + d.sceneCount, 0)} Scenes
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleGenerateAllPlots}
                                disabled={isGeneratingPlots}
                                className="bg-gradient-to-r from-purple-600 to-cyan-600"
                            >
                                {isGeneratingPlots ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating ({generateProgress.current}/{generateProgress.total})...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate All Plots
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={loadScenes}
                                variant="outline"
                                className="border-white/20 text-white/70"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </>
                    )}

                    {/* View Mode Toggle */}
                    <div className="ml-auto flex items-center gap-1 bg-white/10 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-white/20' : ''}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-white/20' : ''}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Scenes by Beat */}
            {scenes.length === 0 && !distribution ? (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                    <Film className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Scenes Yet</h3>
                    <p className="text-white/60 mb-4 max-w-md mx-auto">
                        Generate a scene distribution based on your story beats to get started.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {scenesByBeat.map(({ beat, scenes: beatScenes }) => (
                        <Card key={beat.id} className="bg-white/5 border-white/10 overflow-hidden">
                            {/* Beat Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                                onClick={() => toggleBeat(beat.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedBeats.has(beat.id) ? (
                                        <ChevronDown className="w-5 h-5 text-white/50" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-white/50" />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-white">{beat.name}</h3>
                                        <p className="text-sm text-white/50 line-clamp-1">{beat.description}</p>
                                    </div>
                                </div>
                                <Badge className={`${beatScenes.length > 0 ? 'bg-purple-500' : 'bg-gray-500'} text-white`}>
                                    {beatScenes.length} scenes
                                </Badge>
                            </div>

                            {/* Beat Scenes */}
                            {expandedBeats.has(beat.id) && (
                                <div className="border-t border-white/10 p-4 bg-black/20">
                                    {beatScenes.length > 0 ? (
                                        <div className={viewMode === 'grid'
                                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                            : 'space-y-3'
                                        }>
                                            {beatScenes.map(scene => (
                                                <SceneCard
                                                    key={scene.id}
                                                    scene={scene}
                                                    viewMode={viewMode}
                                                    onClick={() => handleSceneClick(scene)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-white/40">
                                            <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No scenes for this beat</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedScene && (
                <SceneEditModal
                    scene={selectedScene}
                    characters={characters}
                    storyBeats={storyBeats}
                    userId={userId}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedScene(null);
                    }}
                    onSave={handleSceneUpdate}
                    onRefresh={loadScenes}
                />
            )}
        </div>
    );
}
