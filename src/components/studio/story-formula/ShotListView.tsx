'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Camera, Film, Plus, Wand2, Loader2, RefreshCw, ChevronDown, ChevronUp,
    Clock, Trash2, Edit3, Save, X, Check, Settings
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
    storyVersionId?: string;
    onRefresh?: () => void;
}

export function ShotListView({
    projectId,
    userId,
    storyVersionId,
    onRefresh
}: ShotListViewProps) {
    const [scenes, setScenes] = useState<ScenePlot[]>([]);
    const [selectedSceneId, setSelectedSceneId] = useState<string>('');
    const [shots, setShots] = useState<SceneShot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingScenes, setIsLoadingScenes] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });

    // Shot Preferences state
    const [shotPreferences, setShotPreferences] = useState<any>(null);
    const [isGeneratingPrefs, setIsGeneratingPrefs] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    // Get selected scene
    const selectedScene = scenes.find(s => s.id === selectedSceneId);

    // Load scenes for this story version
    const loadScenes = useCallback(async () => {
        if (!projectId || !storyVersionId) {
            setScenes([]);
            return;
        }

        setIsLoadingScenes(true);
        try {
            const res = await fetch(`/api/scene-plots?projectId=${projectId}&storyVersionId=${storyVersionId}`);
            if (res.ok) {
                const data = await res.json();
                setScenes(data.scenes || []);
            }
        } catch (error) {
            console.error('Error loading scenes:', error);
        } finally {
            setIsLoadingScenes(false);
        }
    }, [projectId, storyVersionId]);

    useEffect(() => {
        loadScenes();
    }, [loadScenes]);

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

    // Load shot preferences for this project
    const loadShotPreferences = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/shot-preferences`);
            if (res.ok) {
                const data = await res.json();
                if (data.preferences) {
                    setShotPreferences(data.preferences);
                }
            }
        } catch (error) {
            console.error('Error loading shot preferences:', error);
        }
    }, [projectId]);

    useEffect(() => {
        loadShotPreferences();
    }, [loadShotPreferences]);

    // Generate shot preferences for this project
    const handleGeneratePreferences = async () => {
        setIsGeneratingPrefs(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shot-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || error.error || 'Failed to generate preferences');
            }

            const result = await res.json();
            setShotPreferences(result.preferences);
            setShowPreferences(true);
            toast.success('Shot preferences generated! These will guide all future shot generation.');
        } catch (error: any) {
            console.error('Generate preferences error:', error);
            toast.error(error.message || 'Failed to generate preferences');
        } finally {
            setIsGeneratingPrefs(false);
        }
    };

    // Calculate stats
    const stats = {
        totalScenes: scenes.length,
        withShots: scenes.filter(s => s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete').length,
        totalShots: shots.length,
        totalDuration: shots.reduce((sum, s: any) => sum + (s.duration || s.duration_seconds || 0), 0)
    };

    // Generate shots for selected scene (requires active script)
    const handleGenerateShots = async () => {
        if (!selectedSceneId) {
            toast.warning('Please select a scene first');
            return;
        }

        if (!selectedScene?.active_script_version) {
            toast.warning('Scene needs an active script first. Generate a script in the Script tab.');
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
                console.error('Generate shots error:', error);
                throw new Error(error.details || error.error || 'Failed to generate shots');
            }

            const result = await res.json();
            toast.success(`Generated ${result.count} shots!`);

            await loadShots();
            await loadScenes(); // Refresh scene badges
            onRefresh?.();
        } catch (error: any) {
            console.error('Generate shots catch:', error);
            toast.error(error.message || 'Failed to generate shots');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate shots for all scenes (only scenes with active scripts)
    const handleGenerateAllShots = async () => {
        // Filter scenes that have active script but no shots yet
        const scenesWithScript = scenes.filter(s =>
            s.active_script_version &&
            s.status !== 'shot_listed' &&
            s.status !== 'complete'
        );

        if (scenesWithScript.length === 0) {
            toast.info('No scenes with scripts ready for shot generation. Generate scripts first in the Script tab.');
            return;
        }

        setIsGeneratingAll(true);
        setGenerateProgress({ current: 0, total: scenesWithScript.length });

        const BATCH_SIZE = 3;
        let successCount = 0;

        try {
            // Process scenes in batches of 3
            for (let batchStart = 0; batchStart < scenesWithScript.length; batchStart += BATCH_SIZE) {
                const batch = scenesWithScript.slice(batchStart, batchStart + BATCH_SIZE);

                // Run batch in parallel
                const batchResults = await Promise.allSettled(
                    batch.map(scene =>
                        fetch(`/api/scene-plots/${scene.id}/generate-shots`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId })
                        })
                    )
                );

                // Count successes
                batchResults.forEach((result, idx) => {
                    if (result.status === 'fulfilled' && result.value.ok) {
                        successCount++;
                    } else {
                        console.error(`Failed to generate shots for scene ${batch[idx].scene_number}`);
                    }
                });

                setGenerateProgress({ current: batchStart + batch.length, total: scenesWithScript.length });
            }

            toast.success(`Generated shots for ${successCount}/${scenesWithScript.length} scenes!`);
            await loadShots();
            await loadScenes(); // Refresh scene list too
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
            {/* Shot Preferences */}
            <Card className="border-orange-200 bg-white">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-50/50 transition-colors"
                    onClick={() => setShowPreferences(!showPreferences)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Shot Direction Preferences</h3>
                            <p className="text-xs text-gray-500">
                                {shotPreferences
                                    ? `✓ Active — ${shotPreferences.pacingProfile || 'moderate'} pacing, ${shotPreferences.avgShotsPerMinute || '~10'} shots/min`
                                    : 'Generate AI cinematography guidelines based on your project'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={(e) => { e.stopPropagation(); handleGeneratePreferences(); }}
                            disabled={isGeneratingPrefs}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isGeneratingPrefs ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</>
                            ) : shotPreferences ? (
                                <><RefreshCw className="w-3 h-3 mr-1" /> Regenerate</>
                            ) : (
                                <><Wand2 className="w-3 h-3 mr-1" /> Generate</>
                            )}
                        </Button>
                        {showPreferences ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                </div>

                {showPreferences && shotPreferences && (
                    <div className="border-t border-orange-100 p-4 space-y-4">
                        {/* Visual Style */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">🎬 Visual Style</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.visualStyle}</p>
                        </div>

                        {/* Pacing & Duration */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-orange-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-orange-600">{shotPreferences.avgShotsPerMinute || '~10'}</div>
                                <div className="text-xs text-gray-500">Shots/Min</div>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-amber-600 capitalize">{shotPreferences.pacingProfile || 'moderate'}</div>
                                <div className="text-xs text-gray-500">Pacing</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-yellow-700">{shotPreferences.shotDurationRange?.min || 0.5}s—{shotPreferences.shotDurationRange?.max || 10}s</div>
                                <div className="text-xs text-gray-500">Duration Range</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg text-center">
                                <div className="text-lg font-bold text-orange-600">{shotPreferences.shotDurationRange?.actionAvg || 2}s / {shotPreferences.shotDurationRange?.dialogueAvg || 5}s</div>
                                <div className="text-xs text-gray-500">Action / Dialogue</div>
                            </div>
                        </div>

                        {/* Camera Types */}
                        {shotPreferences.preferredCameraTypes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">📷 Camera Type Preferences</h4>
                                <div className="flex flex-wrap gap-2">
                                    {shotPreferences.preferredCameraTypes.map((ct: any, i: number) => (
                                        <Badge
                                            key={i}
                                            className={`text-xs ${ct.frequency === 'always' ? 'bg-orange-500 text-white' :
                                                    ct.frequency === 'often' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                        ct.frequency === 'sometimes' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                            'bg-gray-50 text-gray-400 border border-gray-100'
                                                }`}
                                            title={ct.notes}
                                        >
                                            {ct.type} ({ct.frequency})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Genre & Editing Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {shotPreferences.genreSpecificNotes && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">🎭 Genre Notes</h4>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.genreSpecificNotes}</p>
                                </div>
                            )}
                            {shotPreferences.editingNotes && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">✂️ Editing Notes</h4>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.editingNotes}</p>
                                </div>
                            )}
                            {shotPreferences.lightingStyle && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">💡 Lighting</h4>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.lightingStyle}</p>
                                </div>
                            )}
                            {shotPreferences.colorPalette && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">🎨 Color Palette</h4>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.colorPalette}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-50 border-gray-200 p-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalScenes}</div>
                    <div className="text-sm text-gray-600">Total Scenes</div>
                </Card>
                <Card className="bg-gray-50 border-gray-200 p-4">
                    <div className="text-2xl font-bold text-orange-500">{stats.withShots}</div>
                    <div className="text-sm text-gray-600">With Shots</div>
                </Card>
                <Card className="bg-gray-50 border-gray-200 p-4">
                    <div className="text-2xl font-bold text-orange-400">{stats.totalShots}</div>
                    <div className="text-sm text-gray-600">Shots (Current Scene)</div>
                </Card>
                <Card className="bg-gray-50 border-gray-200 p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">Scene Duration</div>
                </Card>
            </div>

            {/* Scene Selector & Actions */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Scene Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm text-gray-700 mb-2">Select Scene</label>
                        <Select value={selectedSceneId} onValueChange={setSelectedSceneId}>
                            <SelectTrigger className="bg-gray-50 border-white/20 text-gray-900">
                                <SelectValue placeholder="Select a scene..." />
                            </SelectTrigger>
                            <SelectContent>
                                {scenes.map(scene => (
                                    <SelectItem key={scene.id} value={scene.id}>
                                        <div className="flex items-center gap-2">
                                            <span>Scene {scene.scene_number}</span>
                                            {scene.title && <span className="text-gray-600">- {scene.title}</span>}
                                            {scene.status === 'empty' && (
                                                <Badge variant="outline" className="text-xs ml-2">No Plot</Badge>
                                            )}
                                            {scene.active_script_version && !scene.status?.includes('shot') && (
                                                <Badge className="bg-amber-500 text-xs ml-2 text-white">Has Script</Badge>
                                            )}
                                            {(scene.status === 'shot_listed' || scene.status === 'scripted' || scene.status === 'complete') && (
                                                <Badge className="bg-orange-500 text-xs ml-2">Has Shots</Badge>
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
                            disabled={isGenerating || !selectedScene?.active_script_version}
                            className="bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300"
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
                            className="border-orange-400 text-orange-600 hover:bg-orange-50"
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
                            className="text-gray-600"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Selected Scene Info */}
                {selectedScene && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                        {selectedScene.active_script_version ? (
                            <p className="text-sm text-green-600">✓ Script ready - You can generate shots for this scene</p>
                        ) : (
                            <p className="text-sm text-amber-600">⚠ No script yet - Go to Script tab to generate a script first</p>
                        )}
                    </div>
                )}
            </Card>

            {/* Shot Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <span className="ml-3 text-gray-600">Loading shots...</span>
                </div>
            ) : shots.length === 0 ? (
                <Card className="bg-gray-50 border-gray-200 p-12 text-center">
                    <Camera className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shots Yet</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        {selectedScene?.synopsis
                            ? 'Generate a shot list to break down this scene into camera shots.'
                            : 'This scene needs a plot synopsis first.'}
                    </p>
                    {selectedScene?.synopsis && (
                        <Button
                            onClick={handleGenerateShots}
                            disabled={isGenerating}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
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
