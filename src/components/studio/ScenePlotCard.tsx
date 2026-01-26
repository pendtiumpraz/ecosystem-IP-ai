'use client';

import { useState } from 'react';
import {
    Camera, Film, Clock, ChevronDown, ChevronUp,
    Wand2, Loader2, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';

interface Shot {
    shotNumber: number;
    shotType: string;
    shotAngle: string;
    cameraMovement: string;
    durationSeconds: number;
    shotDescription: string;
    action: string;
}

interface ScenePlot {
    shots: Shot[];
    preference?: string;
    generatedAt?: string;
}

interface ScenePlotCardProps {
    clipId: string;
    scenePlot: ScenePlot | null;
    keyActionDescription: string | null;
    userId: string;
    preference?: string;
    onGenerated?: (scenePlot: ScenePlot) => void;
    onGeneratePrompt?: () => void;
    compact?: boolean;
}

// Shot type display labels
const SHOT_TYPE_LABELS: Record<string, string> = {
    'establishing': 'EST',
    'wide': 'WIDE',
    'full': 'FULL',
    'medium': 'MED',
    'medium-close': 'MCU',
    'close-up': 'CU',
    'extreme-close-up': 'ECU',
    'over-shoulder': 'OTS',
    'two-shot': '2S',
    'group': 'GRP',
    'pov': 'POV',
    'insert': 'INS'
};

// Camera movement symbols
const MOVEMENT_LABELS: Record<string, string> = {
    'static': '⊙ Static',
    'pan-left': '← Pan Left',
    'pan-right': '→ Pan Right',
    'tilt-up': '↑ Tilt Up',
    'tilt-down': '↓ Tilt Down',
    'dolly-in': '⟿ Dolly In',
    'dolly-out': '⟾ Dolly Out',
    'tracking': '↠ Tracking',
    'crane-up': '⤊ Crane Up',
    'crane-down': '⤋ Crane Down',
    'handheld': '≋ Handheld',
    'steadicam': '≈ Steadicam',
    'zoom-in': '⊕ Zoom In',
    'zoom-out': '⊖ Zoom Out'
};

export function ScenePlotCard({
    clipId,
    scenePlot,
    keyActionDescription,
    userId,
    preference = '',
    onGenerated,
    onGeneratePrompt,
    compact = false
}: ScenePlotCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const hasScenePlot = scenePlot && scenePlot.shots && scenePlot.shots.length > 0;
    const totalDuration = hasScenePlot
        ? scenePlot.shots.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)
        : 0;

    // Generate scene plot for this single clip
    const handleGenerateScenePlot = async () => {
        if (!keyActionDescription) {
            toast.warning('No key action description available.');
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch('/api/animation-clips/generate-scene-plots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipIds: [clipId],
                    preference,
                    userId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Generation failed');
            }

            const result = await res.json();
            if (result.results && result.results[0]?.success && result.results[0]?.scenePlot) {
                onGenerated?.(result.results[0].scenePlot);
                toast.success('Scene plot generated!');
            } else {
                throw new Error('No scene plot in response');
            }
        } catch (error: any) {
            toast.error(`Failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Compact mode - just show a badge
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {hasScenePlot ? (
                    <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs">
                        <Camera className="w-3 h-3 mr-1" />
                        {scenePlot.shots.length} shots · {totalDuration}s
                    </Badge>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleGenerateScenePlot}
                        disabled={isGenerating || !keyActionDescription}
                        className="h-6 px-2 text-xs text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                            <Camera className="w-3 h-3 mr-1" />
                        )}
                        Gen Scene
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div
                className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-gray-700">Scene Plot</span>
                    {hasScenePlot ? (
                        <Badge className="bg-green-100 text-green-600 border-green-200 text-[10px]">
                            <Check className="w-3 h-3 mr-0.5" />
                            {scenePlot.shots.length} shots
                        </Badge>
                    ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[10px]">
                            <X className="w-3 h-3 mr-0.5" />
                            Not Generated
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasScenePlot && (
                        <span className="text-[10px] text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {totalDuration}s
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-3 border-t border-gray-100 space-y-3">
                    {hasScenePlot ? (
                        <>
                            {/* Shots List */}
                            <div className="space-y-2">
                                {scenePlot.shots.map((shot, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-2 p-2 bg-purple-50/50 rounded border border-purple-100"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className="bg-purple-100 text-purple-600 border-purple-200 text-[10px]">
                                                    {SHOT_TYPE_LABELS[shot.shotType] || shot.shotType}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] border-gray-300">
                                                    {shot.shotAngle || 'eye-level'}
                                                </Badge>
                                                <span className="text-[10px] text-gray-500">
                                                    {MOVEMENT_LABELS[shot.cameraMovement] || shot.cameraMovement}
                                                </span>
                                                <span className="text-[10px] text-amber-600 font-medium">
                                                    {shot.durationSeconds}s
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                                                {shot.shotDescription || shot.action}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGenerateScenePlot}
                                    disabled={isGenerating}
                                    className="h-7 text-xs flex-1"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-3 h-3 mr-1" />
                                    )}
                                    Regenerate
                                </Button>
                                {onGeneratePrompt && (
                                    <Button
                                        size="sm"
                                        onClick={onGeneratePrompt}
                                        className="h-7 text-xs flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                        <Film className="w-3 h-3 mr-1" />
                                        Generate Prompt
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 mb-3">
                                No scene plot yet. Generate one to plan your shots.
                            </p>
                            <Button
                                size="sm"
                                onClick={handleGenerateScenePlot}
                                disabled={isGenerating || !keyActionDescription}
                                className="bg-purple-500 hover:bg-purple-600 text-white h-8"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-3 h-3 mr-1" />
                                        Generate Scene Plot
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
