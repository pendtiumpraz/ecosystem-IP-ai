'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Film, Plus, Wand2, Loader2, RefreshCw, ChevronDown, ChevronRight,
    Clock, MapPin, Users, Sparkles, Check, AlertCircle, LayoutGrid, List,
    FileText, Camera, ScrollText, CheckCircle
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
        if (!synopsis || synopsis.trim().length === 0) {
            toast.warning('Please add a story synopsis first (in Idea view)');
            return;
        }

        if (storyBeats.length === 0) {
            toast.warning('Please define story beats first (in Beats view)');
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

            const result = await res.json();

            if (!res.ok) {
                // Handle specific error cases
                if (res.status === 402) {
                    throw new Error(`Insufficient credits. Required: ${result.required || 3} credits`);
                }
                throw new Error(result.error || 'Failed to generate distribution');
            }

            setDistribution(result.distribution.distribution);
            toast.success(`Created distribution for ${result.distribution.totalScenes} scenes`);

            // Reload to get any created scene placeholders
            await loadScenes();
        } catch (error: any) {
            console.error('Scene distribution error:', error);
            toast.error(error.message || 'An unexpected error occurred');
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
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                <span className="ml-3 text-gray-600">Loading scenes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats - Orange Brand Theme */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <Film className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700">{stats.total}</div>
                            <div className="text-xs text-orange-600/70 font-medium">Total Scenes</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700">{stats.plotted}</div>
                            <div className="text-xs text-orange-600/70 font-medium">With Plot</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <Camera className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700">{stats.withShots}</div>
                            <div className="text-xs text-orange-600/70 font-medium">With Shots</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <ScrollText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700">{stats.withScripts}</div>
                            <div className="text-xs text-orange-600/70 font-medium">With Script</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700">
                                {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                            </div>
                            <div className="text-xs text-orange-600/70 font-medium">Est. Duration</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress Bar - Orange */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-500 rounded-md">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-orange-700">Scene Plot Completion</span>
                    </div>
                    <span className="text-sm font-bold text-white bg-orange-500 px-2.5 py-0.5 rounded-full">{completionPercent}%</span>
                </div>
                <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </Card>

            {/* Actions - Empty State */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-200">
                            <Film className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Scene Distribution</h3>
                            <p className="text-sm text-gray-500">
                                {distribution && distribution.length > 0
                                    ? `${distribution.reduce((sum, d) => sum + d.sceneCount, 0)} scenes planned across ${distribution.length} story beats`
                                    : 'Generate a scene breakdown based on your story beats'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleGenerateDistribution}
                            disabled={isGeneratingDistribution || !synopsis}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-200"
                        >
                            {isGeneratingDistribution ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing Story...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    {distribution ? 'Regenerate Distribution' : 'Generate Distribution'}
                                </>
                            )}
                        </Button>
                        {distribution && distribution.length > 0 && (
                            <Button
                                onClick={handleInitializeScenes}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create {distribution.reduce((sum, d) => sum + d.sceneCount, 0)} Scenes
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Generate All Plots - Show when scenes exist */}
            {scenes.length > 0 && (
                <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-200">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Generate Scene Plots</h3>
                                <p className="text-sm text-gray-500">
                                    AI will create detailed plot, location, and character info for each scene
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleGenerateAllPlots}
                                disabled={isGeneratingPlots}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200"
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
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Scenes by Beat */}
            {scenes.length === 0 && !distribution ? (
                <Card className="bg-gradient-to-br from-orange-500 to-amber-500 border-orange-600 p-12 text-center shadow-lg">
                    <Film className="w-12 h-12 text-white/80 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Scenes Yet</h3>
                    <p className="text-white/80 mb-4 max-w-md mx-auto">
                        Generate a scene distribution based on your story beats to get started.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {scenesByBeat.map(({ beat, scenes: beatScenes }) => (
                        <Card key={beat.id} className="bg-gray-50 border-gray-200 overflow-hidden">
                            {/* Beat Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleBeat(beat.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedBeats.has(beat.id) ? (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-900">{beat.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{beat.description}</p>
                                    </div>
                                </div>
                                <Badge className={`${beatScenes.length > 0 ? 'bg-orange-500' : 'bg-gray-500'} text-gray-900`}>
                                    {beatScenes.length} scenes
                                </Badge>
                            </div>

                            {/* Beat Scenes */}
                            {expandedBeats.has(beat.id) && (
                                <div className="border-t border-gray-200 p-4 bg-black/20">
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
                                        <div className="text-center py-8 text-gray-400">
                                            <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No scenes for this beat</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )
            }

            {/* Edit Modal */}
            {
                showEditModal && selectedScene && (
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
                )
            }
        </div >
    );
}
