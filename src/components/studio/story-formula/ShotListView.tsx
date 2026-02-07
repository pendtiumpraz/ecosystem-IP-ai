'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Camera, Film, Plus, Wand2, Loader2, RefreshCw, ChevronDown,
    Clock, Trash2, Edit3, Save, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/sweetalert';
import { ShotTable } from './ShotTable';
import { ScenePlot, SceneShot } from '@/types/storyboard';

interface ShotListViewProps {
    projectId: string;
    userId: string;
    scenes: ScenePlot[];
    onRefresh?: () => void;
}

export function ShotListView({
    projectId,
    userId,
    scenes,
    onRefresh
}: ShotListViewProps) {
    const [selectedSceneId, setSelectedSceneId] = useState<string>('');
    const [shots, setShots] = useState<SceneShot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });

    // Get selected scene
    const selectedScene = scenes.find(s => s.id === selectedSceneId);

    // Load shots for selected scene
    const loadShots = useCallback(async () => {
        if (!selectedSceneId) {
            setShots([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-plots/${selectedSceneId}`);
            if (res.ok) {
                const data = await res.json();
                setShots(data.scene?.shots || []);
            }
        } catch (error) {
            console.error('Error loading shots:', error);
            toast.error('Failed to load shots');
        } finally {
            setIsLoading(false);
        }
    }, [selectedSceneId]);

    useEffect(() => {
        loadShots();
    }, [loadShots]);

    // Auto-select first scene with plot if none selected
    useEffect(() => {
        if (!selectedSceneId && scenes.length > 0) {
            const sceneWithPlot = scenes.find(s => s.status !== 'empty');
            if (sceneWithPlot) {
                setSelectedSceneId(sceneWithPlot.id);
            } else {
                setSelectedSceneId(scenes[0].id);
            }
        }
    }, [scenes, selectedSceneId]);

    // Calculate stats
    const stats = {
        totalScenes: scenes.length,
        withShots: scenes.filter(s => s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete').length,
        totalShots: shots.length,
        totalDuration: shots.reduce((sum, s) => sum + (s.duration || 0), 0)
    };

    // Generate shots for selected scene
    const handleGenerateShots = async () => {
        if (!selectedSceneId || !selectedScene?.synopsis) {
            toast.warning('Scene needs a plot first');
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch(`/api/scene-plots/${selectedSceneId}/generate-shots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate shots');
            }

            const result = await res.json();
            toast.success(`Generated ${result.count} shots!`);

            await loadShots();
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate shots for all scenes
    const handleGenerateAllShots = async () => {
        const scenesWithPlot = scenes.filter(s => s.status === 'plotted');
        if (scenesWithPlot.length === 0) {
            toast.info('All scenes with plots already have shots, or no scenes have plots yet.');
            return;
        }

        setIsGeneratingAll(true);
        setGenerateProgress({ current: 0, total: scenesWithPlot.length });

        try {
            for (let i = 0; i < scenesWithPlot.length; i++) {
                const scene = scenesWithPlot[i];

                const res = await fetch(`/api/scene-plots/${scene.id}/generate-shots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                if (!res.ok) {
                    console.error(`Failed to generate shots for scene ${scene.scene_number}`);
                }

                setGenerateProgress({ current: i + 1, total: scenesWithPlot.length });
            }

            toast.success(`Generated shots for ${scenesWithPlot.length} scenes!`);
            await loadShots();
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingAll(false);
            setGenerateProgress({ current: 0, total: 0 });
        }
    };

    // Handle shot update
    const handleShotUpdate = async (shotId: string, updates: Partial<SceneShot>) => {
        try {
            const res = await fetch(`/api/scene-shots/${shotId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update shot');

            await loadShots();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Handle shot delete
    const handleShotDelete = async (shotId: string) => {
        try {
            const res = await fetch(`/api/scene-shots/${shotId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete shot');

            toast.success('Shot deleted');
            await loadShots();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Handle add new shot
    const handleAddShot = async () => {
        if (!selectedSceneId) return;

        try {
            const newShotNumber = shots.length > 0
                ? Math.max(...shots.map(s => s.shot_number)) + 1
                : 1;

            const res = await fetch('/api/scene-shots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: selectedSceneId,
                    shot_number: newShotNumber,
                    camera_type: 'medium',
                    camera_angle: 'eye-level',
                    camera_movement: 'static',
                    duration_seconds: 3,
                    action: ''
                })
            });

            if (!res.ok) throw new Error('Failed to add shot');

            toast.success('Shot added');
            await loadShots();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.totalScenes}</div>
                    <div className="text-sm text-white/60">Total Scenes</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-cyan-400">{stats.withShots}</div>
                    <div className="text-sm text-white/60">With Shots</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.totalShots}</div>
                    <div className="text-sm text-white/60">Shots (Current Scene)</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-white/60">Scene Duration</div>
                </Card>
            </div>

            {/* Scene Selector & Actions */}
            <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Scene Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm text-white/80 mb-2">Select Scene</label>
                        <Select value={selectedSceneId} onValueChange={setSelectedSceneId}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select a scene..." />
                            </SelectTrigger>
                            <SelectContent>
                                {scenes.map(scene => (
                                    <SelectItem key={scene.id} value={scene.id}>
                                        <div className="flex items-center gap-2">
                                            <span>Scene {scene.scene_number}</span>
                                            {scene.title && <span className="text-white/60">- {scene.title}</span>}
                                            {scene.status === 'empty' && (
                                                <Badge variant="outline" className="text-xs ml-2">No Plot</Badge>
                                            )}
                                            {(scene.status === 'shot_listed' || scene.status === 'scripted' || scene.status === 'complete') && (
                                                <Badge className="bg-cyan-500 text-xs ml-2">Has Shots</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleGenerateShots}
                            disabled={isGenerating || !selectedScene?.synopsis}
                            className="bg-gradient-to-r from-cyan-600 to-purple-600"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Shots
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleGenerateAllShots}
                            disabled={isGeneratingAll}
                            variant="outline"
                            className="border-cyan-500/50 text-cyan-400"
                        >
                            {isGeneratingAll ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {generateProgress.current}/{generateProgress.total}
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Generate All
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={loadShots}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Selected Scene Info */}
                {selectedScene && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-white/60 line-clamp-2">
                            {selectedScene.synopsis || 'No plot synopsis. Generate or add a plot first.'}
                        </p>
                    </div>
                )}
            </Card>

            {/* Shot Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    <span className="ml-3 text-white/60">Loading shots...</span>
                </div>
            ) : shots.length === 0 ? (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                    <Camera className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Shots Yet</h3>
                    <p className="text-white/60 mb-4 max-w-md mx-auto">
                        {selectedScene?.synopsis
                            ? 'Generate a shot list to break down this scene into camera shots.'
                            : 'This scene needs a plot synopsis first.'}
                    </p>
                    {selectedScene?.synopsis && (
                        <Button
                            onClick={handleGenerateShots}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-cyan-600 to-purple-600"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Shots
                        </Button>
                    )}
                </Card>
            ) : (
                <ShotTable
                    shots={shots}
                    onUpdate={handleShotUpdate}
                    onDelete={handleShotDelete}
                    onAdd={handleAddShot}
                />
            )}
        </div>
    );
}
