'use client';

import { useState } from 'react';
import {
    X, Video, Wand2, AlertTriangle, ArrowUp, ArrowDown, ArrowLeft,
    ArrowRight, RotateCcw, Zap, Play, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScenePlot } from '@/types/storyboard';

interface ClipGenerationModalProps {
    scene: ScenePlot;
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: {
        movementDirection?: string;
        movementSpeed?: string;
        movementPrompt?: string;
    }) => void;
}

// Movement direction options
const DIRECTIONS = [
    { value: 'static', label: 'Static', icon: '⊙', desc: 'Minimal movement, subtle motion' },
    { value: 'up', label: 'Pan Up', icon: '↑', desc: 'Camera pans upward' },
    { value: 'down', label: 'Pan Down', icon: '↓', desc: 'Camera pans downward' },
    { value: 'left', label: 'Pan Left', icon: '←', desc: 'Camera pans left' },
    { value: 'right', label: 'Pan Right', icon: '→', desc: 'Camera pans right' },
    { value: 'zoom-in', label: 'Zoom In', icon: '⊕', desc: 'Camera zooms into subject' },
    { value: 'zoom-out', label: 'Zoom Out', icon: '⊖', desc: 'Camera zooms out from subject' },
    { value: 'orbit-left', label: 'Orbit Left', icon: '↺', desc: 'Camera orbits left around subject' },
    { value: 'orbit-right', label: 'Orbit Right', icon: '↻', desc: 'Camera orbits right around subject' },
];

// Movement speed options
const SPEEDS = [
    { value: 'slow', label: 'Slow', desc: 'Smooth, cinematic motion' },
    { value: 'medium', label: 'Medium', desc: 'Natural pacing' },
    { value: 'fast', label: 'Fast', desc: 'Dynamic, energetic motion' },
];

export function ClipGenerationModal({
    scene,
    isOpen,
    onClose,
    onGenerate
}: ClipGenerationModalProps) {
    const [direction, setDirection] = useState('static');
    const [speed, setSpeed] = useState('medium');
    const [customPrompt, setCustomPrompt] = useState('');

    if (!isOpen) return null;

    // Build movement prompt
    const buildMovementPrompt = () => {
        const dirOption = DIRECTIONS.find(d => d.value === direction);
        const speedOption = SPEEDS.find(s => s.value === speed);

        let prompt = '';

        if (direction === 'static') {
            prompt = 'Subtle ambient motion, slight movement of elements, breathing camera.';
        } else {
            prompt = `${dirOption?.desc || 'Camera movement'}. ${speedOption?.label || 'Medium'} speed.`;
        }

        if (customPrompt) {
            prompt += ' ' + customPrompt;
        }

        return prompt;
    };

    // Get shot-based suggestion
    const getShotSuggestion = () => {
        const shot = scene.shots?.[0];
        if (!shot) return null;

        return {
            cameraType: shot.camera_type,
            cameraMovement: shot.camera_movement,
            action: shot.action
        };
    };

    const shotSuggestion = getShotSuggestion();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl mx-4 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Generate Video Clip</h2>
                            <p className="text-sm text-white/60">Scene {scene.scene_number}: {scene.title || 'Untitled'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Source Image Preview */}
                    <div className="flex gap-4">
                        <div className="w-40 aspect-video rounded-lg overflow-hidden bg-gray-800">
                            {scene.active_image_version?.image_url && (
                                <img
                                    src={scene.active_image_version.image_url}
                                    alt="Source"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            {shotSuggestion && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-purple-400 mb-2">Suggestion from Shot List</h4>
                                    <div className="space-y-1 text-xs text-white/60">
                                        {shotSuggestion.cameraType && (
                                            <div>Camera: {shotSuggestion.cameraType}</div>
                                        )}
                                        {shotSuggestion.cameraMovement && (
                                            <div>Movement: {shotSuggestion.cameraMovement}</div>
                                        )}
                                        {shotSuggestion.action && (
                                            <div className="line-clamp-2">Action: {shotSuggestion.action}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Movement Direction */}
                    <div>
                        <Label className="text-white mb-3 block">Movement Direction</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {DIRECTIONS.map(dir => (
                                <button
                                    key={dir.value}
                                    onClick={() => setDirection(dir.value)}
                                    className={`p-3 rounded-lg border transition-all text-left ${direction === dir.value
                                            ? 'bg-purple-500/20 border-purple-500 text-white'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{dir.icon}</span>
                                        <span className="text-sm font-medium">{dir.label}</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-1">{dir.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Movement Speed */}
                    <div>
                        <Label className="text-white mb-3 block">Movement Speed</Label>
                        <div className="flex gap-2">
                            {SPEEDS.map(spd => (
                                <button
                                    key={spd.value}
                                    onClick={() => setSpeed(spd.value)}
                                    className={`flex-1 p-3 rounded-lg border transition-all ${speed === spd.value
                                            ? 'bg-purple-500/20 border-purple-500 text-white'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{spd.label}</span>
                                    <p className="text-[10px] text-white/40 mt-1">{spd.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                        <Label className="text-white mb-2 block">Additional Motion Details (Optional)</Label>
                        <Textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="e.g., Character walks forward, wind blowing through hair..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
                        />
                    </div>

                    {/* Movement Prompt Preview */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-white">Movement Prompt</span>
                        </div>
                        <p className="text-sm text-white/60">{buildMovementPrompt()}</p>
                    </div>

                    {/* Cost Warning */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-amber-400">Credit Cost</h4>
                                <p className="text-xs text-white/60">
                                    This will use approximately <span className="text-amber-400 font-bold">50 credits</span> (~$0.50).
                                    Video generation typically takes 2-3 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="text-white/60"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onGenerate({
                            movementDirection: direction,
                            movementSpeed: speed,
                            movementPrompt: buildMovementPrompt()
                        })}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Clip (~50 credits)
                    </Button>
                </div>
            </div>
        </div>
    );
}
