'use client';

import { useState, useEffect } from 'react';
import {
    Film, Clapperboard, Camera, Plus, Trash2, ChevronDown, ChevronRight,
    Sparkles, Loader2, Edit2, Save, X, Video, MoveVertical, Clock,
    Volume2, Eye, MessageSquare, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/lib/sweetalert';

// ============ TYPES ============

export interface Shot {
    id?: string;
    shotNumber: number;
    shotType: string;      // wide, medium, close-up, extreme-close-up, over-shoulder
    shotSize: string;      // full, medium, cowboy, close
    shotAngle: string;     // eye-level, high, low, dutch, bird's-eye, worm's-eye
    shotDescription: string;
    durationSeconds: number;
    cameraMovement: string; // static, pan, tilt, dolly, tracking, crane, handheld
    audioNotes: string;
    visualNotes: string;
    dialogue: string;
    action: string;
}

export interface Scene {
    id?: string;
    beatKey: string;
    sceneNumber: number;
    sceneTitle: string;
    sceneDescription: string;
    sceneLocation: string;
    sceneTime: string;     // day, night, dawn, dusk, morning, afternoon, evening
    charactersPresent: string[];
    preference: string;
    shots: Shot[];
    isExpanded?: boolean;
}

interface ScenePlotStudioProps {
    storyVersionId: string;
    beatKey: string;
    beatLabel: string;
    beatContent: string;
    characters?: { id: string; name: string }[];
    onSave?: (scenes: Scene[]) => void;
    existingScenes?: Scene[];
}

// ============ CONSTANTS ============

const SHOT_TYPES = [
    { value: 'establishing', label: 'Establishing Shot', desc: 'Wide view to set location' },
    { value: 'wide', label: 'Wide Shot', desc: 'Full scene with environment' },
    { value: 'full', label: 'Full Shot', desc: 'Full body of subject' },
    { value: 'medium', label: 'Medium Shot', desc: 'Waist up' },
    { value: 'medium-close', label: 'Medium Close-Up', desc: 'Chest up' },
    { value: 'close-up', label: 'Close-Up', desc: 'Face or detail' },
    { value: 'extreme-close-up', label: 'Extreme Close-Up', desc: 'Part of face/small detail' },
    { value: 'over-shoulder', label: 'Over The Shoulder', desc: 'From behind one character' },
    { value: 'two-shot', label: 'Two Shot', desc: 'Two characters together' },
    { value: 'group', label: 'Group Shot', desc: 'Multiple characters' },
    { value: 'pov', label: 'POV Shot', desc: 'Point of view' },
    { value: 'insert', label: 'Insert/Cutaway', desc: 'Detail or reaction' },
];

const CAMERA_MOVEMENTS = [
    { value: 'static', label: 'Static', desc: 'No movement' },
    { value: 'pan-left', label: 'Pan Left', desc: 'Horizontal turn left' },
    { value: 'pan-right', label: 'Pan Right', desc: 'Horizontal turn right' },
    { value: 'tilt-up', label: 'Tilt Up', desc: 'Vertical turn up' },
    { value: 'tilt-down', label: 'Tilt Down', desc: 'Vertical turn down' },
    { value: 'dolly-in', label: 'Dolly In', desc: 'Move toward subject' },
    { value: 'dolly-out', label: 'Dolly Out', desc: 'Move away from subject' },
    { value: 'tracking', label: 'Tracking', desc: 'Follow subject movement' },
    { value: 'crane-up', label: 'Crane Up', desc: 'Rise vertically' },
    { value: 'crane-down', label: 'Crane Down', desc: 'Descend vertically' },
    { value: 'handheld', label: 'Handheld', desc: 'Natural shake' },
    { value: 'steadicam', label: 'Steadicam', desc: 'Smooth floating' },
    { value: 'zoom-in', label: 'Zoom In', desc: 'Lens zoom closer' },
    { value: 'zoom-out', label: 'Zoom Out', desc: 'Lens zoom wider' },
];

const SHOT_ANGLES = [
    { value: 'eye-level', label: 'Eye Level', desc: 'Natural perspective' },
    { value: 'high', label: 'High Angle', desc: 'Looking down' },
    { value: 'low', label: 'Low Angle', desc: 'Looking up' },
    { value: 'dutch', label: 'Dutch Angle', desc: 'Tilted/canted' },
    { value: 'birds-eye', label: "Bird's Eye", desc: 'Directly above' },
    { value: 'worms-eye', label: "Worm's Eye", desc: 'Directly below' },
];

const SCENE_TIMES = [
    { value: 'day', label: 'Day' },
    { value: 'night', label: 'Night' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'dusk', label: 'Dusk' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'continuous', label: 'Continuous' },
];

// ============ COMPONENT ============

export function ScenePlotStudio({
    storyVersionId,
    beatKey,
    beatLabel,
    beatContent,
    characters = [],
    onSave,
    existingScenes = []
}: ScenePlotStudioProps) {
    const [scenes, setScenes] = useState<Scene[]>(existingScenes);
    const [isGenerating, setIsGenerating] = useState(false);
    const [preference, setPreference] = useState('');
    const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set([0]));

    // Initialize with existing scenes or empty
    useEffect(() => {
        if (existingScenes.length > 0) {
            setScenes(existingScenes);
        }
    }, [existingScenes]);

    // Create empty shot
    const createEmptyShot = (shotNumber: number): Shot => ({
        shotNumber,
        shotType: 'medium',
        shotSize: '',
        shotAngle: 'eye-level',
        shotDescription: '',
        durationSeconds: 3,
        cameraMovement: 'static',
        audioNotes: '',
        visualNotes: '',
        dialogue: '',
        action: ''
    });

    // Create empty scene
    const createEmptyScene = (sceneNumber: number): Scene => ({
        beatKey,
        sceneNumber,
        sceneTitle: `Scene ${sceneNumber}`,
        sceneDescription: '',
        sceneLocation: '',
        sceneTime: 'day',
        charactersPresent: [],
        preference: '',
        shots: [createEmptyShot(1)],
        isExpanded: true
    });

    // Add new scene
    const handleAddScene = () => {
        const newScene = createEmptyScene(scenes.length + 1);
        setScenes([...scenes, newScene]);
        setExpandedScenes(prev => new Set([...prev, scenes.length]));
    };

    // Remove scene
    const handleRemoveScene = (sceneIndex: number) => {
        const updated = scenes.filter((_, i) => i !== sceneIndex)
            .map((s, i) => ({ ...s, sceneNumber: i + 1 }));
        setScenes(updated);
    };

    // Update scene
    const handleUpdateScene = (sceneIndex: number, updates: Partial<Scene>) => {
        const updated = [...scenes];
        updated[sceneIndex] = { ...updated[sceneIndex], ...updates };
        setScenes(updated);
    };

    // Add shot to scene
    const handleAddShot = (sceneIndex: number) => {
        const updated = [...scenes];
        const newShot = createEmptyShot(updated[sceneIndex].shots.length + 1);
        updated[sceneIndex].shots = [...updated[sceneIndex].shots, newShot];
        setScenes(updated);
    };

    // Remove shot from scene
    const handleRemoveShot = (sceneIndex: number, shotIndex: number) => {
        const updated = [...scenes];
        updated[sceneIndex].shots = updated[sceneIndex].shots
            .filter((_, i) => i !== shotIndex)
            .map((s, i) => ({ ...s, shotNumber: i + 1 }));
        setScenes(updated);
    };

    // Update shot
    const handleUpdateShot = (sceneIndex: number, shotIndex: number, updates: Partial<Shot>) => {
        const updated = [...scenes];
        updated[sceneIndex].shots[shotIndex] = {
            ...updated[sceneIndex].shots[shotIndex],
            ...updates
        };
        setScenes(updated);
    };

    // Toggle scene expand
    const toggleSceneExpand = (sceneIndex: number) => {
        setExpandedScenes(prev => {
            const next = new Set(prev);
            if (next.has(sceneIndex)) {
                next.delete(sceneIndex);
            } else {
                next.add(sceneIndex);
            }
            return next;
        });
    };

    // Generate scenes and shots from beat content
    const handleGenerate = async () => {
        if (!beatContent) {
            toast.warning('Beat content is empty. Please add beat description first.');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'sceneplot',
                    data: {
                        beatKey,
                        beatLabel,
                        beatContent,
                        characters: characters.map(c => c.name),
                        preference,
                        existingScenesCount: scenes.length
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const result = await response.json();

            if (result.scenes && Array.isArray(result.scenes)) {
                // Merge with existing or replace
                const newScenes: Scene[] = result.scenes.map((s: any, i: number) => ({
                    beatKey,
                    sceneNumber: scenes.length + i + 1,
                    sceneTitle: s.sceneTitle || `Scene ${scenes.length + i + 1}`,
                    sceneDescription: s.sceneDescription || '',
                    sceneLocation: s.sceneLocation || '',
                    sceneTime: s.sceneTime || 'day',
                    charactersPresent: s.charactersPresent || [],
                    preference: '',
                    shots: (s.shots || []).map((shot: any, j: number) => ({
                        shotNumber: j + 1,
                        shotType: shot.shotType || 'medium',
                        shotSize: shot.shotSize || '',
                        shotAngle: shot.shotAngle || 'eye-level',
                        shotDescription: shot.shotDescription || '',
                        durationSeconds: shot.durationSeconds || 3,
                        cameraMovement: shot.cameraMovement || 'static',
                        audioNotes: shot.audioNotes || '',
                        visualNotes: shot.visualNotes || '',
                        dialogue: shot.dialogue || '',
                        action: shot.action || ''
                    }))
                }));

                setScenes([...scenes, ...newScenes]);
                toast.success(`Generated ${newScenes.length} scene(s) with shots!`);
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate sceneplot');
        } finally {
            setIsGenerating(false);
        }
    };

    // Save all scenes
    const handleSave = async () => {
        if (onSave) {
            onSave(scenes);
        }

        try {
            const response = await fetch('/api/sceneplot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyVersionId,
                    beatKey,
                    scenes
                })
            });

            if (!response.ok) {
                throw new Error('Save failed');
            }

            toast.success('Sceneplot saved!');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save sceneplot');
        }
    };

    // Calculate total duration
    const totalDuration = scenes.reduce((total, scene) =>
        total + scene.shots.reduce((shotTotal, shot) => shotTotal + (shot.durationSeconds || 0), 0)
        , 0);

    const totalShots = scenes.reduce((total, scene) => total + scene.shots.length, 0);

    return (
        <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-violet-50/50 to-purple-50/30 border border-violet-200/50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                        <Clapperboard className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Sceneplot</h3>
                        <p className="text-xs text-gray-500">
                            Beat: <span className="font-medium">{beatLabel}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700">
                        {scenes.length} Scenes • {totalShots} Shots • {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                    </Badge>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={scenes.length === 0}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                    >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Beat Content Preview */}
            <div className="p-3 rounded-lg bg-white/50 border border-gray-200/50">
                <Label className="text-[10px] uppercase text-gray-400 tracking-wider">Beat Content</Label>
                <p className="text-xs text-gray-700 mt-1 line-clamp-3">{beatContent || 'No beat content yet...'}</p>
            </div>

            {/* Generation Controls */}
            <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">
                        Generation Preference
                    </Label>
                    <Textarea
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        placeholder="e.g., 'Film festival standard', 'Fast-paced action', 'Intimate drama', 'Documentary style'..."
                        className="min-h-[60px] text-xs bg-white border-gray-200 resize-none"
                    />
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !beatContent}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white h-10"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Shots
                        </>
                    )}
                </Button>
            </div>

            {/* Scenes List */}
            <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                    {scenes.map((scene, sceneIndex) => (
                        <Collapsible
                            key={sceneIndex}
                            open={expandedScenes.has(sceneIndex)}
                            onOpenChange={() => toggleSceneExpand(sceneIndex)}
                        >
                            <div className="rounded-lg border border-violet-200 bg-white overflow-hidden">
                                {/* Scene Header */}
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 cursor-pointer hover:from-violet-100 hover:to-purple-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {expandedScenes.has(sceneIndex) ? (
                                                <ChevronDown className="h-4 w-4 text-violet-500" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-violet-500" />
                                            )}
                                            <Badge className="bg-violet-600 text-white text-[10px]">
                                                Scene {scene.sceneNumber}
                                            </Badge>
                                            <Input
                                                value={scene.sceneTitle}
                                                onChange={(e) => handleUpdateScene(sceneIndex, { sceneTitle: e.target.value })}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-7 text-xs font-medium bg-white/50 border-violet-200 w-48"
                                                placeholder="Scene title..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] text-gray-500">
                                                {scene.shots.length} shots
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveScene(sceneIndex);
                                                }}
                                                className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <div className="p-3 space-y-3 border-t border-violet-100">
                                        {/* Scene Details */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Location</Label>
                                                <Input
                                                    value={scene.sceneLocation}
                                                    onChange={(e) => handleUpdateScene(sceneIndex, { sceneLocation: e.target.value })}
                                                    placeholder="INT/EXT - Location..."
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Time</Label>
                                                <Select
                                                    value={scene.sceneTime}
                                                    onValueChange={(value) => handleUpdateScene(sceneIndex, { sceneTime: value })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SCENE_TIMES.map(t => (
                                                            <SelectItem key={t.value} value={t.value} className="text-xs">
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Description</Label>
                                                <Input
                                                    value={scene.sceneDescription}
                                                    onChange={(e) => handleUpdateScene(sceneIndex, { sceneDescription: e.target.value })}
                                                    placeholder="Brief scene description..."
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Shots */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] uppercase text-violet-600 font-bold tracking-wider flex items-center gap-1">
                                                    <Camera className="h-3 w-3" />
                                                    Shots
                                                </Label>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAddShot(sceneIndex)}
                                                    className="h-6 text-[10px] border-violet-200 text-violet-600 hover:bg-violet-50"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Shot
                                                </Button>
                                            </div>

                                            {scene.shots.map((shot, shotIndex) => (
                                                <div
                                                    key={shotIndex}
                                                    className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[9px] bg-white">
                                                            Shot {shot.shotNumber}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveShot(sceneIndex, shotIndex)}
                                                            className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400">Type</Label>
                                                            <Select
                                                                value={shot.shotType}
                                                                onValueChange={(value) => handleUpdateShot(sceneIndex, shotIndex, { shotType: value })}
                                                            >
                                                                <SelectTrigger className="h-7 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {SHOT_TYPES.map(t => (
                                                                        <SelectItem key={t.value} value={t.value} className="text-xs">
                                                                            {t.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400">Angle</Label>
                                                            <Select
                                                                value={shot.shotAngle}
                                                                onValueChange={(value) => handleUpdateShot(sceneIndex, shotIndex, { shotAngle: value })}
                                                            >
                                                                <SelectTrigger className="h-7 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {SHOT_ANGLES.map(a => (
                                                                        <SelectItem key={a.value} value={a.value} className="text-xs">
                                                                            {a.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400">Movement</Label>
                                                            <Select
                                                                value={shot.cameraMovement}
                                                                onValueChange={(value) => handleUpdateShot(sceneIndex, shotIndex, { cameraMovement: value })}
                                                            >
                                                                <SelectTrigger className="h-7 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CAMERA_MOVEMENTS.map(m => (
                                                                        <SelectItem key={m.value} value={m.value} className="text-xs">
                                                                            {m.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400 flex items-center gap-1">
                                                                <Clock className="h-2.5 w-2.5" />
                                                                Duration (s)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={shot.durationSeconds}
                                                                onChange={(e) => handleUpdateShot(sceneIndex, shotIndex, { durationSeconds: parseInt(e.target.value) || 0 })}
                                                                className="h-7 text-[10px]"
                                                                min={1}
                                                                max={60}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400 flex items-center gap-1">
                                                                <Eye className="h-2.5 w-2.5" />
                                                                Visual Description
                                                            </Label>
                                                            <Textarea
                                                                value={shot.shotDescription}
                                                                onChange={(e) => handleUpdateShot(sceneIndex, shotIndex, { shotDescription: e.target.value })}
                                                                placeholder="What we see..."
                                                                className="min-h-[50px] text-[10px] resize-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400 flex items-center gap-1">
                                                                <MessageSquare className="h-2.5 w-2.5" />
                                                                Action / Dialogue
                                                            </Label>
                                                            <Textarea
                                                                value={shot.action || shot.dialogue}
                                                                onChange={(e) => handleUpdateShot(sceneIndex, shotIndex, { action: e.target.value })}
                                                                placeholder="Character actions or dialogue..."
                                                                className="min-h-[50px] text-[10px] resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    ))}
                </div>
            </ScrollArea>

            {/* Add Scene Button */}
            <Button
                variant="outline"
                onClick={handleAddScene}
                className="w-full border-dashed border-violet-300 text-violet-600 hover:bg-violet-50"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
            </Button>
        </div>
    );
}
