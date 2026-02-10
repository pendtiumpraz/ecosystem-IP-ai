'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Camera, Film, Plus, Wand2, Loader2, RefreshCw, ChevronDown, ChevronRight,
    Clock, Trash2, Edit3, Save, X, Check, Settings, GripVertical,
    Video, Move, Eye, Clapperboard, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/sweetalert';
import { ScenePlot, SceneShot } from '@/types/storyboard';

// Camera type options
const CAMERA_TYPES = [
    { value: 'establishing', label: 'Establishing (EST)', short: 'EST' },
    { value: 'wide', label: 'Wide Shot (WS)', short: 'WS' },
    { value: 'full', label: 'Full Shot (FS)', short: 'FS' },
    { value: 'medium', label: 'Medium Shot (MS)', short: 'MS' },
    { value: 'medium-close', label: 'Medium Close-Up (MCU)', short: 'MCU' },
    { value: 'close-up', label: 'Close-Up (CU)', short: 'CU' },
    { value: 'extreme-close-up', label: 'Extreme Close-Up (ECU)', short: 'ECU' },
    { value: 'over-shoulder', label: 'Over-the-Shoulder (OTS)', short: 'OTS' },
    { value: 'two-shot', label: 'Two Shot (2S)', short: '2S' },
    { value: 'pov', label: 'Point of View (POV)', short: 'POV' },
    { value: 'insert', label: 'Insert Shot', short: 'INS' },
];

const CAMERA_ANGLES = [
    { value: 'eye-level', label: 'Eye Level' },
    { value: 'high', label: 'High Angle' },
    { value: 'low', label: 'Low Angle' },
    { value: 'dutch', label: 'Dutch Angle' },
    { value: 'birds-eye', label: "Bird's Eye" },
    { value: 'worms-eye', label: "Worm's Eye" },
];

const CAMERA_MOVEMENTS = [
    { value: 'static', label: 'Static', icon: '⊙' },
    { value: 'pan-left', label: 'Pan Left', icon: '←' },
    { value: 'pan-right', label: 'Pan Right', icon: '→' },
    { value: 'tilt-up', label: 'Tilt Up', icon: '↑' },
    { value: 'tilt-down', label: 'Tilt Down', icon: '↓' },
    { value: 'dolly-in', label: 'Dolly In', icon: '⟿' },
    { value: 'dolly-out', label: 'Dolly Out', icon: '⟾' },
    { value: 'tracking', label: 'Tracking', icon: '↠' },
    { value: 'crane-up', label: 'Crane Up', icon: '⤊' },
    { value: 'crane-down', label: 'Crane Down', icon: '⤋' },
    { value: 'handheld', label: 'Handheld', icon: '≋' },
    { value: 'steadicam', label: 'Steadicam', icon: '≈' },
    { value: 'zoom-in', label: 'Zoom In', icon: '⊕' },
    { value: 'zoom-out', label: 'Zoom Out', icon: '⊖' },
];

// Helper functions
const getShotType = (shot: any) => shot.camera_type || shot.shot_type || 'medium';
const getShotAngle = (shot: any) => shot.camera_angle || shot.shot_angle || 'eye-level';
const getShotDuration = (shot: any) => {
    const d = parseFloat(shot.duration) || parseFloat(shot.duration_seconds) || 0;
    return isNaN(d) ? 5 : (d || 5);
};
const getShotAction = (shot: any) => shot.shot_description || shot.action || shot.framing || '';
const getShotDialogue = (shot: any) => shot.dialogue || null;
const getCameraTypeLabel = (value: string) => CAMERA_TYPES.find(t => t.value === value)?.label || value;
const getCameraTypeShort = (value: string) => CAMERA_TYPES.find(t => t.value === value)?.short || value?.toUpperCase();
const getMovementIcon = (value: string) => CAMERA_MOVEMENTS.find(m => m.value === value)?.icon || '⊙';

interface ShotListViewProps {
    projectId: string;
    userId: string;
    storyVersionId?: string;
    onRefresh?: () => void;
}

interface SceneShotsMap {
    [sceneId: string]: SceneShot[];
}

export function ShotListView({ projectId, userId, storyVersionId, onRefresh }: ShotListViewProps) {
    const [scenes, setScenes] = useState<ScenePlot[]>([]);
    const [sceneShotsMap, setSceneShotsMap] = useState<SceneShotsMap>({});
    const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
    const [loadingScenes, setLoadingScenes] = useState<Set<string>>(new Set());
    const [isLoadingScenes, setIsLoadingScenes] = useState(true);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generatingScenes, setGeneratingScenes] = useState<Set<string>>(new Set());
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });

    // Modal state
    const [editModalShot, setEditModalShot] = useState<any>(null);
    const [editData, setEditData] = useState<any>({});
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Shot Preferences state
    const [shotPreferences, setShotPreferences] = useState<any>(null);
    const [isGeneratingPrefs, setIsGeneratingPrefs] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    // Drag state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Load scenes
    const loadScenes = useCallback(async () => {
        if (!projectId || !storyVersionId) { setScenes([]); return; }
        setIsLoadingScenes(true);
        try {
            const res = await fetch('/api/scene-plots?projectId=' + projectId + '&storyVersionId=' + storyVersionId);
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

    useEffect(() => { loadScenes(); }, [loadScenes]);

    // Load shots for a scene
    const loadShotsForScene = useCallback(async (sceneId: string) => {
        setLoadingScenes(prev => new Set(prev).add(sceneId));
        try {
            const res = await fetch('/api/scene-plots/' + sceneId);
            if (res.ok) {
                const data = await res.json();
                const shots = data.scene?.shots || [];
                setSceneShotsMap(prev => ({ ...prev, [sceneId]: shots }));
            }
        } catch (error) {
            console.error('Error loading shots for scene:', error);
        } finally {
            setLoadingScenes(prev => {
                const next = new Set(prev);
                next.delete(sceneId);
                return next;
            });
        }
    }, []);

    // Toggle scene expand
    const toggleScene = (sceneId: string) => {
        setExpandedScenes(prev => {
            const next = new Set(prev);
            if (next.has(sceneId)) {
                next.delete(sceneId);
            } else {
                next.add(sceneId);
                // Load shots if not already loaded
                if (!sceneShotsMap[sceneId]) {
                    loadShotsForScene(sceneId);
                }
            }
            return next;
        });
    };

    // Load shot preferences
    const loadShotPreferences = useCallback(async () => {
        if (!projectId) return;
        try {
            const res = await fetch('/api/projects/' + projectId + '/shot-preferences');
            if (res.ok) {
                const data = await res.json();
                if (data.preferences) setShotPreferences(data.preferences);
            }
        } catch (error) {
            console.error('Error loading shot preferences:', error);
        }
    }, [projectId]);

    useEffect(() => { loadShotPreferences(); }, [loadShotPreferences]);

    // Generate shot preferences
    const handleGeneratePreferences = async () => {
        setIsGeneratingPrefs(true);
        try {
            const res = await fetch('/api/projects/' + projectId + '/shot-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || error.error || 'Failed');
            }
            const result = await res.json();
            setShotPreferences(result.preferences);
            setShowPreferences(true);
            toast.success('Shot preferences generated!');
        } catch (error: any) {
            console.error('Generate preferences error:', error);
            toast.error(error.message || 'Failed to generate preferences');
        } finally {
            setIsGeneratingPrefs(false);
        }
    };

    // Generate shots for a single scene
    const handleGenerateShots = async (sceneId: string) => {
        setGeneratingScenes(prev => new Set(prev).add(sceneId));
        try {
            const res = await fetch('/api/scene-plots/' + sceneId + '/generate-shots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || error.error || 'Failed');
            }
            const result = await res.json();
            toast.success('Generated ' + result.count + ' shots!');
            await loadShotsForScene(sceneId);
            await loadScenes();
            // Expand the scene to show results
            setExpandedScenes(prev => new Set(prev).add(sceneId));
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate shots');
        } finally {
            setGeneratingScenes(prev => {
                const next = new Set(prev);
                next.delete(sceneId);
                return next;
            });
        }
    };

    // Generate all shots
    const handleGenerateAllShots = async () => {
        const scenesWithScript = scenes.filter(s =>
            s.active_script_version && s.status !== 'shot_listed' && s.status !== 'complete'
        );
        if (scenesWithScript.length === 0) {
            toast.info('No scenes with scripts ready for shot generation.');
            return;
        }
        setIsGeneratingAll(true);
        setGenerateProgress({ current: 0, total: scenesWithScript.length });
        let successCount = 0;
        try {
            for (let i = 0; i < scenesWithScript.length; i += 3) {
                const batch = scenesWithScript.slice(i, i + 3);
                const batchResults = await Promise.allSettled(
                    batch.map(scene =>
                        fetch('/api/scene-plots/' + scene.id + '/generate-shots', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId })
                        })
                    )
                );
                batchResults.forEach((result) => {
                    if (result.status === 'fulfilled' && result.value.ok) successCount++;
                });
                setGenerateProgress({ current: i + batch.length, total: scenesWithScript.length });
            }
            toast.success('Generated shots for ' + successCount + '/' + scenesWithScript.length + ' scenes!');
            await loadScenes();
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingAll(false);
            setGenerateProgress({ current: 0, total: 0 });
        }
    };

    // Shot CRUD
    const handleShotUpdate = async (shotId: string, updates: any) => {
        try {
            const res = await fetch('/api/scene-shots/' + shotId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update shot');
            return true;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        }
    };

    const handleShotDelete = async (shotId: string, sceneId: string) => {
        try {
            const res = await fetch('/api/scene-shots/' + shotId, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete shot');
            toast.success('Shot deleted');
            await loadShotsForScene(sceneId);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddShot = async (sceneId: string) => {
        const existingShots = sceneShotsMap[sceneId] || [];
        const newNumber = existingShots.length > 0
            ? Math.max(...existingShots.map(s => s.shot_number)) + 1
            : 1;
        try {
            const res = await fetch('/api/scene-shots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: sceneId,
                    shot_number: newNumber,
                    camera_type: 'medium',
                    camera_angle: 'eye-level',
                    camera_movement: 'static',
                    duration_seconds: 3,
                    action: ''
                })
            });
            if (!res.ok) throw new Error('Failed to add shot');
            toast.success('Shot added');
            await loadShotsForScene(sceneId);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Modal edit
    const openEditModal = (shot: any) => {
        setEditModalShot(shot);
        setEditData({
            camera_type: getShotType(shot),
            camera_angle: getShotAngle(shot),
            camera_movement: shot.camera_movement || 'static',
            duration_seconds: getShotDuration(shot),
            action: getShotAction(shot),
            dialogue: getShotDialogue(shot) || '',
            audio_notes: shot.audio_notes || '',
            visual_notes: shot.visual_notes || '',
        });
    };

    const saveEditModal = async () => {
        if (!editModalShot) return;
        setIsSavingEdit(true);
        const success = await handleShotUpdate(editModalShot.id, editData);
        if (success) {
            toast.success('Shot updated!');
            const sceneId = editModalShot.scene_plot_id || editModalShot.scene_id;
            if (sceneId) await loadShotsForScene(sceneId);
            setEditModalShot(null);
        }
        setIsSavingEdit(false);
    };

    // Drag & Drop reorder
    const handleDragStart = (idx: number) => {
        setDragIndex(idx);
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setDragOverIndex(idx);
    };

    const handleDrop = async (sceneId: string) => {
        if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const shots = [...(sceneShotsMap[sceneId] || [])];
        const [moved] = shots.splice(dragIndex, 1);
        shots.splice(dragOverIndex, 0, moved);

        // Update local state immediately
        const reordered = shots.map((s, i) => ({ ...s, shot_number: i + 1 }));
        setSceneShotsMap(prev => ({ ...prev, [sceneId]: reordered }));
        setDragIndex(null);
        setDragOverIndex(null);

        // Save to DB
        try {
            const shotOrders = reordered.map(s => ({ id: s.id, shot_number: s.shot_number }));
            await fetch('/api/scene-shots/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shotOrders })
            });
        } catch (error) {
            console.error('Reorder failed:', error);
            await loadShotsForScene(sceneId);
        }
    };

    // Stats
    const totalScenes = scenes.length;
    const scenesWithShots = scenes.filter(s =>
        s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete'
    ).length;

    // Color for timeline bars
    const SHOT_COLORS = [
        'bg-gradient-to-r from-orange-400 to-orange-500',
        'bg-gradient-to-r from-amber-400 to-amber-500',
        'bg-gradient-to-r from-yellow-500 to-orange-400',
        'bg-gradient-to-r from-orange-500 to-red-400',
        'bg-gradient-to-r from-red-400 to-orange-500',
        'bg-gradient-to-r from-amber-500 to-yellow-400',
    ];

    return (
        <div className="space-y-4">
            {/* Shot Preferences Card */}
            <Card className="border-orange-200 bg-white overflow-hidden">
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
                                    ? '✓ Active — ' + (shotPreferences.pacingProfile || 'moderate') + ' pacing, ' + (shotPreferences.avgShotsPerMinute || '~10') + ' shots/min'
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
                        {showPreferences ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                </div>

                {showPreferences && shotPreferences && (
                    <div className="border-t border-orange-100 p-4 space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">🎬 Visual Style</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{shotPreferences.visualStyle}</p>
                        </div>
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
                        {shotPreferences.preferredCameraTypes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">📷 Camera Type Preferences</h4>
                                <div className="flex flex-wrap gap-2">
                                    {shotPreferences.preferredCameraTypes.map((ct: any, i: number) => (
                                        <Badge key={i} className={'text-xs ' + (
                                            ct.frequency === 'always' ? 'bg-orange-500 text-white' :
                                                ct.frequency === 'often' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                    ct.frequency === 'sometimes' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                        'bg-gray-50 text-gray-400 border border-gray-100'
                                        )} title={ct.notes}>
                                            {ct.type} ({ct.frequency})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        </div>
                    </div>
                )}
            </Card>

            {/* Stats Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-gray-300 text-gray-600 py-1 px-3">
                        <Film className="w-3 h-3 mr-1.5" /> {totalScenes} Scenes
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-600 py-1 px-3">
                        <Camera className="w-3 h-3 mr-1.5" /> {scenesWithShots} With Shots
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleGenerateAllShots}
                        disabled={isGeneratingAll}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                        {isGeneratingAll ? (
                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> {generateProgress.current}/{generateProgress.total}</>
                        ) : (
                            <><Wand2 className="w-3 h-3 mr-1.5" /> Generate All Shots</>
                        )}
                    </Button>
                    <Button onClick={loadScenes} variant="ghost" size="icon" className="text-gray-500">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Loading */}
            {isLoadingScenes && (
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
                    <span className="text-gray-500">Loading scenes...</span>
                </div>
            )}

            {/* Scene Accordion */}
            {!isLoadingScenes && scenes.map(scene => {
                const isExpanded = expandedScenes.has(scene.id);
                const shots = sceneShotsMap[scene.id] || [];
                const isLoadingShots = loadingScenes.has(scene.id);
                const isGeneratingThis = generatingScenes.has(scene.id);
                const hasShots = scene.status === 'shot_listed' || scene.status === 'scripted' || scene.status === 'complete';
                const hasScript = !!scene.active_script_version;
                const sceneDuration = shots.reduce((sum: number, s: any) => sum + getShotDuration(s), 0);

                return (
                    <Card key={scene.id} className="border-gray-200 overflow-hidden bg-white">
                        {/* Scene Header - clickable */}
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                            onClick={() => toggleScene(scene.id)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {isExpanded
                                    ? <ChevronDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    : <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
                                }
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">{scene.scene_number}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 truncate">
                                            Scene {scene.scene_number}
                                            {scene.title ? ' — ' + scene.title : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {scene.synopsis ? scene.synopsis.substring(0, 80) + (scene.synopsis.length > 80 ? '...' : '') : 'No synopsis'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                {hasShots && (
                                    <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs">
                                        <Camera className="w-3 h-3 mr-1" />
                                        {shots.length > 0 ? shots.length + ' shots' : 'Has Shots'}
                                    </Badge>
                                )}
                                {hasScript && !hasShots && (
                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                                        Has Script
                                    </Badge>
                                )}
                                {!hasScript && (
                                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">
                                        No Script
                                    </Badge>
                                )}
                                {shots.length > 0 && !isNaN(sceneDuration) && sceneDuration > 0 && (
                                    <span className="text-xs text-gray-400 hidden sm:inline">
                                        <Clock className="w-3 h-3 inline mr-0.5" />
                                        {Math.floor(sceneDuration / 60)}:{String(Math.round(sceneDuration) % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="border-t border-gray-100">
                                {/* Action bar */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {shots.length} shot{shots.length !== 1 ? 's' : ''} • {Math.round(sceneDuration)}s total
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {hasScript && (
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); handleGenerateShots(scene.id); }}
                                                disabled={isGeneratingThis}
                                                size="sm"
                                                variant="outline"
                                                className="border-orange-300 text-orange-600 hover:bg-orange-50 h-7 text-xs"
                                            >
                                                {isGeneratingThis ? (
                                                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                                                ) : shots.length > 0 ? (
                                                    <><RefreshCw className="w-3 h-3 mr-1" /> Regenerate</>
                                                ) : (
                                                    <><Wand2 className="w-3 h-3 mr-1" /> Generate Shots</>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); handleAddShot(scene.id); }}
                                            size="sm"
                                            variant="ghost"
                                            className="text-gray-500 hover:text-orange-600 h-7 text-xs"
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Loading shots */}
                                {isLoadingShots && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-orange-400 mr-2" />
                                        <span className="text-sm text-gray-500">Loading shots...</span>
                                    </div>
                                )}

                                {/* No shots */}
                                {!isLoadingShots && shots.length === 0 && (
                                    <div className="text-center py-8">
                                        <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 mb-2">No shots yet</p>
                                        {hasScript && (
                                            <Button
                                                onClick={() => handleGenerateShots(scene.id)}
                                                disabled={isGeneratingThis}
                                                size="sm"
                                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                            >
                                                <Wand2 className="w-3 h-3 mr-1.5" /> Generate Shots
                                            </Button>
                                        )}
                                        {!hasScript && (
                                            <p className="text-xs text-gray-400">Generate a script first</p>
                                        )}
                                    </div>
                                )}

                                {/* Timeline Bar */}
                                {!isLoadingShots && shots.length > 0 && (
                                    <div className="px-4 pt-3 pb-1">
                                        <div className="flex rounded-lg overflow-hidden h-6 bg-gray-100">
                                            {shots.map((shot: any, idx: number) => {
                                                const dur = getShotDuration(shot);
                                                const pct = sceneDuration > 0 ? (dur / sceneDuration) * 100 : 10;
                                                return (
                                                    <div
                                                        key={shot.id}
                                                        className={'flex items-center justify-center border-r border-white/30 cursor-pointer hover:brightness-110 transition-all ' + SHOT_COLORS[idx % SHOT_COLORS.length]}
                                                        style={{ width: Math.max(pct, 2) + '%' }}
                                                        title={'Shot ' + shot.shot_number + ': ' + getShotAction(shot) + ' (' + dur + 's)'}
                                                        onClick={(e) => { e.stopPropagation(); openEditModal(shot); }}
                                                    >
                                                        <span className="text-white text-[9px] font-bold truncate px-0.5">
                                                            {pct > 4 ? getCameraTypeShort(getShotType(shot)) : ''}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Shot List - draggable */}
                                {!isLoadingShots && shots.length > 0 && (
                                    <div className="divide-y divide-gray-50">
                                        {shots.map((shot: any, idx: number) => {
                                            const dur = getShotDuration(shot);
                                            const startTime = shots.slice(0, idx).reduce((sum: number, s: any) => sum + getShotDuration(s), 0);
                                            const isDragging = dragIndex === idx;
                                            const isDragOver = dragOverIndex === idx;

                                            return (
                                                <div
                                                    key={shot.id}
                                                    draggable
                                                    onDragStart={() => handleDragStart(idx)}
                                                    onDragOver={(e) => handleDragOver(e, idx)}
                                                    onDrop={() => handleDrop(scene.id)}
                                                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                                                    className={'flex items-center gap-3 px-4 py-2.5 transition-all cursor-pointer group/shot hover:bg-orange-50/40 '
                                                        + (isDragging ? 'opacity-40 ' : '')
                                                        + (isDragOver ? 'border-t-2 border-orange-400 ' : '')
                                                    }
                                                    onClick={() => openEditModal(shot)}
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="cursor-grab active:cursor-grabbing text-gray-300 group-hover/shot:text-gray-500 flex-shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>

                                                    {/* Shot Number */}
                                                    <div className={'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ' + SHOT_COLORS[idx % SHOT_COLORS.length].replace('bg-gradient-to-r ', '') + ' text-white'}>
                                                        {shot.shot_number}
                                                    </div>

                                                    {/* Camera Type Badge */}
                                                    <Badge className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] flex-shrink-0 font-medium">
                                                        {getCameraTypeShort(getShotType(shot))}
                                                    </Badge>

                                                    {/* Action text */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-700 truncate">
                                                            {getShotAction(shot) || 'No description'}
                                                        </p>
                                                        {getShotDialogue(shot) && (
                                                            <p className="text-[11px] text-orange-600 italic truncate mt-0.5">
                                                                💬 &quot;{getShotDialogue(shot)}&quot;
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Movement + Angle */}
                                                    <span className="text-xs text-gray-400 hidden md:inline flex-shrink-0">
                                                        {getMovementIcon(shot.camera_movement)} {(shot.camera_movement || 'static').replace('-', ' ')}
                                                    </span>

                                                    {/* Duration */}
                                                    <Badge variant="outline" className="border-gray-200 text-gray-500 text-[11px] flex-shrink-0 tabular-nums">
                                                        {dur}s
                                                    </Badge>

                                                    {/* Time position */}
                                                    <span className="text-[10px] text-gray-300 tabular-nums flex-shrink-0 hidden lg:inline w-16 text-right">
                                                        {Math.floor(startTime / 60)}:{String(Math.round(startTime) % 60).padStart(2, '0')} — {Math.floor((startTime + dur) / 60)}:{String(Math.round(startTime + dur) % 60).padStart(2, '0')}
                                                    </span>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleShotDelete(shot.id, scene.id); }}
                                                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover/shot:opacity-100 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                );
            })}

            {/* Empty state */}
            {!isLoadingScenes && scenes.length === 0 && (
                <Card className="p-12 text-center border-gray-200">
                    <Clapperboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Scenes Found</h3>
                    <p className="text-sm text-gray-500">Create scene plots first in the Scene tab.</p>
                </Card>
            )}

            {/* Edit Modal */}
            {editModalShot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModalShot(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Shot {editModalShot.shot_number}</h3>
                                    <p className="text-xs text-gray-500">Edit shot details</p>
                                </div>
                            </div>
                            <button onClick={() => setEditModalShot(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Camera Type */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Camera Type</label>
                                <Select value={editData.camera_type} onValueChange={(v) => setEditData({ ...editData, camera_type: v })}>
                                    <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CAMERA_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Angle + Movement */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Camera Angle</label>
                                    <Select value={editData.camera_angle} onValueChange={(v) => setEditData({ ...editData, camera_angle: v })}>
                                        <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CAMERA_ANGLES.map(a => (
                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Movement</label>
                                    <Select value={editData.camera_movement} onValueChange={(v) => setEditData({ ...editData, camera_movement: v })}>
                                        <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CAMERA_MOVEMENTS.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.icon} {m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Duration (seconds)</label>
                                <Input
                                    type="number"
                                    value={editData.duration_seconds}
                                    onChange={(e) => setEditData({ ...editData, duration_seconds: parseFloat(e.target.value) || 1 })}
                                    min={0.5}
                                    max={120}
                                    step={0.5}
                                    className="bg-gray-50"
                                />
                            </div>

                            {/* Action/Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Action / Description</label>
                                <textarea
                                    value={editData.action}
                                    onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    placeholder="Describe what happens in this shot..."
                                />
                            </div>

                            {/* Dialogue */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">💬 Dialogue</label>
                                <textarea
                                    value={editData.dialogue}
                                    onChange={(e) => setEditData({ ...editData, dialogue: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 bg-orange-50/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent italic"
                                    placeholder="Character dialogue..."
                                />
                            </div>

                            {/* Audio + Visual Notes */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">🔊 Audio Notes</label>
                                    <Input
                                        value={editData.audio_notes}
                                        onChange={(e) => setEditData({ ...editData, audio_notes: e.target.value })}
                                        className="bg-gray-50 text-sm"
                                        placeholder="SFX, music cue..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">👁 Visual Notes</label>
                                    <Input
                                        value={editData.visual_notes}
                                        onChange={(e) => setEditData({ ...editData, visual_notes: e.target.value })}
                                        className="bg-gray-50 text-sm"
                                        placeholder="Color grading, VFX..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                            <Button variant="ghost" onClick={() => setEditModalShot(null)} className="text-gray-500">
                                Cancel
                            </Button>
                            <Button
                                onClick={saveEditModal}
                                disabled={isSavingEdit}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6"
                            >
                                {isSavingEdit ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
