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
import { Input } from '@/components/ui/input';
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
    const [isSavingDistribution, setIsSavingDistribution] = useState(false);
    const [isClearingScenes, setIsClearingScenes] = useState(false);

    // Calculate total planned scenes from distribution
    const totalPlannedScenes = distribution?.reduce((sum, d) => sum + d.sceneCount, 0) || 0;
    const targetTotalScenes = targetDuration; // Assuming 1 scene per minute
    const isDistributionValid = totalPlannedScenes === targetTotalScenes;

    // Load scenes from database
    const loadScenes = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            const url = storyVersionId
                ? `/api/scene-plots?projectId=${projectId}&storyVersionId=${storyVersionId}`
                : `/api/scene-plots?projectId=${projectId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                console.log('[ScenePlotView] Loaded data:', {
                    scenesCount: data.scenes?.length || 0,
                    hasDistribution: !!data.distribution,
                    distributionLength: data.distribution?.length || 0
                });
                setScenes(data.scenes || []);
                // Always set distribution, even if null (to clear stale state)
                setDistribution(data.distribution || null);
            }
        } catch (error) {
            console.error('Error loading scenes:', error);
            toast.error('Failed to load scenes');
        } finally {
            setIsLoading(false);
        }
    }, [projectId, storyVersionId]);

    useEffect(() => {
        loadScenes();
    }, [loadScenes]);

    // Calculate stats
    const stats = {
        total: scenes.length,
        // With Plot = has title + description + emotional beat (all non-empty)
        plotted: scenes.filter(s =>
            s.title && s.title.trim() !== '' &&
            s.synopsis && s.synopsis.trim() !== '' &&
            s.emotional_beat && s.emotional_beat.trim() !== ''
        ).length,
        withShots: scenes.filter(s => s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete').length,
        // With Script = has active script version
        withScripts: scenes.filter(s => s.active_script_version != null).length,
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

    // Update scene count for a specific beat
    const handleUpdateBeatSceneCount = async (beatId: string, newCount: number) => {
        if (!distribution || newCount < 0) return;

        setIsSavingDistribution(true);
        try {
            // Update local distribution state
            const updatedDistribution = distribution.map(d => {
                if (d.beatId === beatId) {
                    // Recalculate scene numbers based on new count
                    const startNumber = distribution
                        .slice(0, distribution.indexOf(d))
                        .reduce((sum, prev) => sum + prev.sceneCount, 1);
                    const sceneNumbers = Array.from({ length: newCount }, (_, i) => startNumber + i);
                    return { ...d, sceneCount: newCount, sceneNumbers };
                }
                return d;
            });

            // Recalculate all scene numbers sequentially
            let currentSceneNum = 1;
            const finalDistribution = updatedDistribution.map(d => {
                const sceneNumbers = Array.from({ length: d.sceneCount }, (_, i) => currentSceneNum + i);
                currentSceneNum += d.sceneCount;
                return { ...d, sceneNumbers };
            });

            // Save to database via API
            const res = await fetch('/api/scene-plots/update-distribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    distribution: finalDistribution,
                    totalScenes: finalDistribution.reduce((sum, d) => sum + d.sceneCount, 0)
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save distribution');
            }

            setDistribution(finalDistribution);
        } catch (error: any) {
            console.error('Error updating distribution:', error);
            toast.error('Failed to save scene count');
        } finally {
            setIsSavingDistribution(false);
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
                    storyVersionId,
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

    // Clear all scene plots for this story version (temporary helper)
    const handleClearAllScenes = async () => {
        if (!storyVersionId) {
            toast.error('No story version selected');
            return;
        }

        const confirm = window.confirm(
            `Are you sure you want to delete ALL ${scenes.length} scene plots for this story? This cannot be undone.`
        );
        if (!confirm) return;

        setIsClearingScenes(true);
        try {
            const res = await fetch(`/api/scene-plots/clear?storyVersionId=${storyVersionId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to clear scenes');
            }

            const result = await res.json();
            toast.success(`Cleared ${result.deletedCount} scene plots`);

            // Also clear local distribution state
            setDistribution(null);
            await loadScenes();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsClearingScenes(false);
        }
    };

    // Generate all plots in batches - regenerates ALL scenes for continuity
    const handleGenerateAllPlots = async () => {
        if (scenes.length === 0) {
            toast.warning('Initialize scenes first');
            return;
        }

        // Generate ALL scenes from beginning for proper sequential continuity
        // Sort by scene_number to ensure correct order
        const allScenesSorted = [...scenes].sort((a, b) => a.scene_number - b.scene_number);

        setIsGeneratingPlots(true);
        setGenerateProgress({ current: 0, total: allScenesSorted.length });

        try {
            // Process in batches of 3 - STOP if any batch fails
            const batchSize = 3;
            let generatedScenesContext: string[] = []; // Track ALL generated scenes for context

            // Process ALL scenes in order

            for (let i = 0; i < allScenesSorted.length; i += batchSize) {
                const batch = allScenesSorted.slice(i, i + batchSize);
                const sceneNumbers = batch.map(s => s.scene_number);

                // Build story beat mapping - also try to match by index
                const beatMapping: Record<number, { beatId: string; beatName: string; beatDescription: string }> = {};
                for (const scene of batch) {
                    const beatKey = scene.story_beat_id;
                    let beat = storyBeats.find(b => b.id === beatKey);

                    // Try matching by index if not found by UUID
                    if (!beat && beatKey) {
                        const beatIndex = parseInt(beatKey, 10);
                        if (!isNaN(beatIndex) && beatIndex >= 1 && beatIndex <= storyBeats.length) {
                            beat = storyBeats[beatIndex - 1];
                        }
                    }

                    if (beat) {
                        beatMapping[scene.scene_number] = {
                            beatId: beat.id,
                            beatName: beat.name,
                            beatDescription: beat.description
                        };
                    }
                }

                // Get summary of ALL previously generated scenes (not just last 3)
                // Include scenes that already have synopsis + scenes we just generated
                const existingScenesWithPlot = scenes
                    .filter(s => s.scene_number < Math.min(...sceneNumbers) && s.synopsis && s.synopsis.trim() !== '')
                    .sort((a, b) => a.scene_number - b.scene_number);

                // Build comprehensive previous scenes summary
                const previousScenesSummary = [
                    ...existingScenesWithPlot.map(s => `Scene ${s.scene_number} (${s.title || 'Untitled'}): ${s.synopsis?.substring(0, 200)}`),
                    ...generatedScenesContext
                ].join('\n\n');

                const res = await fetch('/api/scene-plots/generate-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        userId,
                        storyVersionId,
                        sceneNumbers,
                        synopsis,
                        storyBeats: beatMapping,
                        previousScenesSummary: previousScenesSummary || 'This is the beginning of the story.',
                        characters,
                        genre,
                        tone
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    console.error('Batch failed:', error);
                    toast.error(`Failed at scenes ${sceneNumbers.join(', ')}: ${error.error}`);
                    // STOP on first error - don't continue with remaining batches
                    break;
                }

                // Parse response and add to context for next batch
                const result = await res.json();
                if (result.scenes) {
                    for (const scene of result.scenes) {
                        generatedScenesContext.push(
                            `Scene ${scene.scene_number} (${scene.scene_title || 'Untitled'}): ${scene.scene_description?.substring(0, 200) || ''}`
                        );
                    }
                }

                setGenerateProgress({ current: i + batch.length, total: allScenesSorted.length });

                // Reload scenes after each batch to get fresh data
                await loadScenes();
            }

            toast.success('Scene plot generation completed!');
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

    // Group scenes by story beat, with distribution info
    const scenesByBeat = storyBeats.map((beat, beatIndex) => {
        // Match scenes by beat key - could be stored as beat.id, beat index (1-based), or name
        const beatIndexStr = String(beatIndex + 1); // 1-indexed for matching "1", "2", etc.
        const beatScenes = scenes.filter(s =>
            s.story_beat_id === beat.id ||
            s.story_beat_id === beat.name ||
            s.story_beat_id === beatIndexStr ||
            String(s.story_beat_id) === String(beat.id) ||
            String(s.story_beat_id) === beatIndexStr
        ).sort((a, b) => a.scene_number - b.scene_number);

        // Get distribution info for this beat if available
        const distInfo = distribution?.find(d =>
            d.beatId === beat.id ||
            d.beatName === beat.name ||
            d.beatId === beatIndexStr
        );
        return {
            beat,
            scenes: beatScenes,
            distributionInfo: distInfo // { sceneCount, notes, pacing, etc }
        };
    });

    // Debug log
    console.log('[ScenePlotView] Scene matching:', {
        totalScenes: scenes.length,
        beatsWithScenes: scenesByBeat.filter(b => b.scenes.length > 0).length,
        firstScene: scenes[0],
        firstBeat: storyBeats[0]
    });

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
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Film className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Scenes</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.plotted}</div>
                            <div className="text-xs text-gray-500 font-medium">With Plot</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Camera className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.withShots}</div>
                            <div className="text-xs text-gray-500 font-medium">With Shots</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ScrollText className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.withScripts}</div>
                            <div className="text-xs text-gray-500 font-medium">With Script</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {targetDuration}:00
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Target Duration</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress Bar - Orange */}
            <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Scene Plot Completion</span>
                    </div>
                    <span className="text-sm font-bold text-white bg-orange-500 px-2.5 py-0.5 rounded-full">{completionPercent}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </Card>

            {/* Actions - Scene Distribution - Only show when no scenes created yet */}
            {scenes.length === 0 && (
                <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Film className="w-6 h-6 text-orange-600" />
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
                                className="bg-orange-500 hover:bg-orange-600 text-white"
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
                                <div className="flex items-center gap-3">
                                    {/* Show planned vs target info */}
                                    <div className={`text-sm px-3 py-1.5 rounded-lg ${isDistributionValid
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'}`}>
                                        {totalPlannedScenes} / {targetTotalScenes} scenes
                                        {!isDistributionValid && (
                                            <span className="ml-1">
                                                ({totalPlannedScenes > targetTotalScenes ? 'too many' : 'need more'})
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleInitializeScenes}
                                        disabled={!isDistributionValid || isSavingDistribution}
                                        className={`shadow-md ${isDistributionValid
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create {totalPlannedScenes} Scenes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Generate All Plots - Always show */}
            {(
                <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Sparkles className="w-6 h-6 text-orange-600" />
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
                                className="bg-orange-500 hover:bg-orange-600 text-white"
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
                            {scenes.length > 0 && (
                                <Button
                                    onClick={handleClearAllScenes}
                                    disabled={isClearingScenes}
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    {isClearingScenes ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Clear All ({scenes.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Scenes by Beat */}
            {scenes.length === 0 && !distribution ? (
                <Card className="bg-white border-gray-200 p-12 text-center shadow-lg">
                    <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Scenes Yet</h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        Generate a scene distribution based on your story beats to get started.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {scenesByBeat.map(({ beat, scenes: beatScenes, distributionInfo }) => (
                        <Card key={beat.id} className="bg-white border-gray-200 overflow-hidden shadow-lg">
                            {/* Beat Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleBeat(beat.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedBeats.has(beat.id) ? (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-800">{beat.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{beat.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Editable planned scene count */}
                                    {distributionInfo && beatScenes.length === 0 && (
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={20}
                                                key={`${beat.id}-${distributionInfo.sceneCount}`}
                                                defaultValue={distributionInfo.sceneCount}
                                                onBlur={(e) => {
                                                    const newVal = parseInt(e.target.value) || 0;
                                                    if (newVal !== distributionInfo.sceneCount) {
                                                        handleUpdateBeatSceneCount(beat.id, newVal);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                className="w-16 h-7 text-sm text-center bg-white border-gray-300"
                                                disabled={isSavingDistribution}
                                            />
                                            <span className="text-xs text-gray-500">planned</span>
                                        </div>
                                    )}
                                    <Badge className="bg-orange-500 text-white font-bold">
                                        {beatScenes.length} scenes
                                    </Badge>
                                </div>
                            </div>

                            {/* Beat Scenes */}
                            {expandedBeats.has(beat.id) && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                                    ) : distributionInfo ? (
                                        <div className="text-center py-8 text-gray-600">
                                            <Film className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="font-medium mb-1">{distributionInfo.sceneCount} scenes planned</p>
                                            {distributionInfo.notes && (
                                                <p className="text-sm text-gray-500 max-w-md mx-auto">{distributionInfo.notes}</p>
                                            )}
                                            {distributionInfo.pacing && (
                                                <Badge className="mt-2 bg-gray-200 text-gray-600 text-xs">
                                                    Pacing: {distributionInfo.pacing}
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Film className="w-8 h-8 mx-auto mb-2 opacity-70" />
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
