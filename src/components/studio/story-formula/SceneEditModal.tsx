'use client';

import { useState } from 'react';
import {
    X, Save, Wand2, Loader2, MapPin, Clock, Users, Film,
    Camera, FileText, ChevronDown, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/sweetalert';
import { ScenePlot, SceneCharacter } from '@/types/storyboard';

interface SceneEditModalProps {
    scene: ScenePlot;
    characters: Array<{
        id: string;
        name: string;
        imageUrl?: string;
        role?: string;
    }>;
    storyBeats: Array<{
        id: string;
        name: string;
        description: string;
    }>;
    userId: string;
    onClose: () => void;
    onSave: (sceneId: string, updates: Partial<ScenePlot>) => Promise<void>;
    onRefresh: () => void;
}

export function SceneEditModal({
    scene,
    characters,
    storyBeats,
    userId,
    onClose,
    onSave,
    onRefresh
}: SceneEditModalProps) {
    const [formData, setFormData] = useState({
        title: scene.title || '',
        synopsis: scene.synopsis || '',
        emotional_beat: scene.emotional_beat || '',
        location: scene.location || '',
        location_description: scene.location_description || '',
        time_of_day: scene.time_of_day || 'day',
        story_beat_id: scene.story_beat_id || '',
        estimated_duration: scene.estimated_duration || 60,
        characters_involved: scene.characters_involved || []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPlot, setIsGeneratingPlot] = useState(false);
    const [isGeneratingShots, setIsGeneratingShots] = useState(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    // Handle field change
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle character toggle
    const handleCharacterToggle = (charId: string) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;

        const isSelected = formData.characters_involved.some(c => c.id === charId);

        if (isSelected) {
            handleChange(
                'characters_involved',
                formData.characters_involved.filter(c => c.id !== charId)
            );
        } else {
            handleChange(
                'characters_involved',
                [...formData.characters_involved, { id: char.id, name: char.name, imageUrl: char.imageUrl, role: char.role }]
            );
        }
    };

    // Save changes
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(scene.id, formData);
        } finally {
            setIsSaving(false);
        }
    };

    // Generate single scene plot
    const handleGeneratePlot = async () => {
        const beat = storyBeats.find(b => b.id === formData.story_beat_id);

        setIsGeneratingPlot(true);
        try {
            const res = await fetch('/api/scene-plots/generate-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: scene.project_id,
                    userId,
                    sceneNumbers: [scene.scene_number],
                    synopsis: formData.synopsis || 'Generate based on story context',
                    storyBeats: beat ? {
                        [scene.scene_number]: {
                            beatId: beat.id,
                            beatName: beat.name,
                            beatDescription: beat.description
                        }
                    } : {},
                    characters: formData.characters_involved
                })
            });

            if (!res.ok) throw new Error('Failed to generate plot');

            const result = await res.json();
            if (result.scenes && result.scenes[0]) {
                const generated = result.scenes[0];
                setFormData(prev => ({
                    ...prev,
                    title: generated.title || prev.title,
                    synopsis: generated.synopsis || prev.synopsis,
                    emotional_beat: generated.emotional_beat || prev.emotional_beat,
                    location: generated.location || prev.location,
                    estimated_duration: generated.estimated_duration || prev.estimated_duration
                }));
                toast.success('Plot generated!');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingPlot(false);
        }
    };

    // Generate shots for this scene
    const handleGenerateShots = async () => {
        setIsGeneratingShots(true);
        try {
            const res = await fetch(`/api/scene-plots/${scene.id}/generate-shots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) throw new Error('Failed to generate shots');

            const result = await res.json();
            toast.success(`Generated ${result.count} shots!`);
            onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingShots(false);
        }
    };

    // Generate script for this scene
    const handleGenerateScript = async () => {
        setIsGeneratingScript(true);
        try {
            const res = await fetch(`/api/scene-plots/${scene.id}/generate-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) throw new Error('Failed to generate script');

            const result = await res.json();
            toast.success(`Script generated (v${result.versionNumber})!`);
            onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGeneratingScript(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center">
                            <Film className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Scene {scene.scene_number}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {scene.story_beat_name || 'No beat assigned'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Scene title..."
                            className="bg-gray-50 border-white/20 text-gray-900"
                        />
                    </div>

                    {/* Scene Plot */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Scene Plot</label>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleGeneratePlot}
                                disabled={isGeneratingPlot}
                                className="text-orange-400 hover:text-orange-300"
                            >
                                {isGeneratingPlot ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                <span className="ml-1">Generate</span>
                            </Button>
                        </div>
                        <Textarea
                            value={formData.synopsis}
                            onChange={(e) => handleChange('synopsis', e.target.value)}
                            placeholder="Describe what happens in this scene..."
                            rows={6}
                            className="bg-gray-50 border-gray-300 text-gray-900 min-h-[150px]"
                        />
                    </div>

                    {/* Emotional Beat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emotional Beat</label>
                        <Input
                            value={formData.emotional_beat}
                            onChange={(e) => handleChange('emotional_beat', e.target.value)}
                            placeholder="What should the audience feel..."
                            className="bg-gray-50 border-white/20 text-gray-900"
                        />
                    </div>

                    {/* Location & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Location
                            </label>
                            <Input
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="Where does it happen..."
                                className="bg-gray-50 border-white/20 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Time of Day
                            </label>
                            <Select
                                value={formData.time_of_day}
                                onValueChange={(value) => handleChange('time_of_day', value)}
                            >
                                <SelectTrigger className="bg-gray-50 border-white/20 text-gray-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="night">Night</SelectItem>
                                    <SelectItem value="dawn">Dawn</SelectItem>
                                    <SelectItem value="dusk">Dusk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Story Beat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Story Beat</label>
                        <Select
                            value={formData.story_beat_id || ''}
                            onValueChange={(value) => handleChange('story_beat_id', value)}
                        >
                            <SelectTrigger className="bg-gray-50 border-white/20 text-gray-900">
                                <SelectValue placeholder="Select story beat..." />
                            </SelectTrigger>
                            <SelectContent>
                                {storyBeats.map(beat => (
                                    <SelectItem key={beat.id} value={beat.id}>
                                        {beat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration (seconds)
                        </label>
                        <Input
                            type="number"
                            value={formData.estimated_duration}
                            onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value) || 60)}
                            min={10}
                            max={300}
                            className="bg-gray-50 border-white/20 text-gray-900 w-32"
                        />
                    </div>

                    {/* Characters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users className="w-4 h-4 inline mr-1" />
                            Characters in Scene
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {characters.map(char => {
                                const isSelected = formData.characters_involved.some(c => c.id === char.id);
                                return (
                                    <Badge
                                        key={char.id}
                                        className={`cursor-pointer transition-all ${isSelected
                                            ? 'bg-orange-500 text-gray-900'
                                            : 'bg-gray-100 text-gray-600 hover:bg-white/20'
                                            }`}
                                        onClick={() => handleCharacterToggle(char.id)}
                                    >
                                        {char.name}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Generation Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">AI Generation</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleGenerateShots}
                                disabled={isGeneratingShots || !formData.synopsis}
                                variant="outline"
                                className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                            >
                                {isGeneratingShots ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4 mr-2" />
                                )}
                                Generate Shot List
                            </Button>
                            <Button
                                onClick={handleGenerateScript}
                                disabled={isGeneratingScript || !formData.synopsis}
                                variant="outline"
                                className="border-orange-400 text-orange-500 hover:bg-orange-400 hover:text-white"
                            >
                                {isGeneratingScript ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="w-4 h-4 mr-2" />
                                )}
                                Generate Script
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                    <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-900">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
