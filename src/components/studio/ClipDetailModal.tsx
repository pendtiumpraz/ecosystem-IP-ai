'use client';

import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Wand2, Video, RefreshCw, Save, X, Loader2, Image as ImageIcon, Play, Clock, Camera
} from 'lucide-react';
import { toast } from '@/lib/sweetalert';

interface AnimationClip {
    id: string;
    beatKey: string;
    beatLabel: string;
    clipOrder: number;
    sourceImageUrl: string;
    keyActionDescription: string;
    videoPrompt: string | null;
    negativePrompt: string | null;
    duration: number;
    fps: number;
    resolution: string;
    cameraMotion: string;
    cameraAngle: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
    errorMessage: string | null;
}

interface ClipDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    clip: AnimationClip | null;
    userId: string;
    projectId: string;
    animationVersionId: string;
    onUpdate: () => void;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    prompt_ready: 'bg-blue-100 text-blue-600',
    queued: 'bg-yellow-100 text-yellow-600',
    processing: 'bg-purple-100 text-purple-600',
    completed: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600',
};

const CAMERA_MOTIONS = [
    { value: 'static', label: 'Static' },
    { value: 'orbit', label: 'Orbit' },
    { value: 'zoom_in', label: 'Zoom In' },
    { value: 'zoom_out', label: 'Zoom Out' },
    { value: 'pan_left', label: 'Pan Left' },
    { value: 'pan_right', label: 'Pan Right' },
    { value: 'ken_burns', label: 'Ken Burns' },
    { value: 'parallax', label: 'Parallax' },
];

export function ClipDetailModal({
    isOpen,
    onClose,
    clip,
    userId,
    projectId,
    animationVersionId,
    onUpdate,
}: ClipDetailModalProps) {
    const [editedPrompt, setEditedPrompt] = useState('');
    const [editedCameraMotion, setEditedCameraMotion] = useState('static');
    const [editedDuration, setEditedDuration] = useState(6);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync local state with clip data
    useEffect(() => {
        if (clip) {
            setEditedPrompt(clip.videoPrompt || '');
            setEditedCameraMotion(clip.cameraMotion || 'static');
            setEditedDuration(clip.duration || 6);
            setHasChanges(false);
        }
    }, [clip]);

    if (!clip) return null;

    const handlePromptChange = (value: string) => {
        setEditedPrompt(value);
        setHasChanges(value !== (clip.videoPrompt || ''));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/animation-clips', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: clip.id,
                    videoPrompt: editedPrompt,
                    cameraMotion: editedCameraMotion,
                    duration: editedDuration,
                    status: editedPrompt ? 'prompt_ready' : clip.status,
                }),
            });

            if (res.ok) {
                toast.success('Saved successfully');
                setHasChanges(false);
                onUpdate();
            } else {
                toast.error('Failed to save');
            }
        } catch (e) {
            toast.error('Error saving changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGeneratePrompt = async () => {
        setIsGeneratingPrompt(true);
        try {
            const res = await fetch('/api/generate/animation-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipIds: [clip.id],
                    userId,
                    projectId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.results?.[0]?.prompt) {
                    setEditedPrompt(data.results[0].prompt);
                    setHasChanges(true);
                }
                toast.success('Prompt generated!');
                onUpdate();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to generate prompt');
            }
        } catch (e) {
            toast.error('Error generating prompt');
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!editedPrompt) {
            toast.error('Please generate or add a prompt first');
            return;
        }

        // Save changes first if any
        if (hasChanges) {
            await handleSave();
        }

        setIsGeneratingVideo(true);
        try {
            const res = await fetch('/api/generate/animation-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipIds: [clip.id],
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Video generation started!');
                onUpdate();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to start video generation');
            }
        } catch (e) {
            toast.error('Error generating video');
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span className="text-lg">{clip.beatLabel}</span>
                        <Badge className={STATUS_COLORS[clip.status] || STATUS_COLORS.pending}>
                            {clip.status}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Left: Image/Video Preview */}
                    <div className="space-y-4">
                        {/* Source Image */}
                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                            <div className="px-3 py-2 bg-gray-100 border-b flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">Source Image</span>
                            </div>
                            {clip.sourceImageUrl ? (
                                <img
                                    src={clip.sourceImageUrl}
                                    alt={clip.keyActionDescription}
                                    className="w-full aspect-video object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* Generated Video */}
                        {clip.videoUrl && (
                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                <div className="px-3 py-2 bg-green-100 border-b flex items-center gap-2">
                                    <Video className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-600">Generated Video</span>
                                </div>
                                <video
                                    src={clip.videoUrl}
                                    controls
                                    className="w-full aspect-video"
                                />
                            </div>
                        )}

                        {/* Key Action Description */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <Label className="text-xs text-gray-500">Key Action Description</Label>
                            <p className="text-sm mt-1">{clip.keyActionDescription || 'No description'}</p>
                        </div>
                    </div>

                    {/* Right: Prompt & Settings */}
                    <div className="space-y-4">
                        {/* Video Prompt */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Video Prompt</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGeneratePrompt}
                                    disabled={isGeneratingPrompt}
                                    className="h-7 text-xs"
                                >
                                    {isGeneratingPrompt ? (
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                        <Wand2 className="h-3 w-3 mr-1" />
                                    )}
                                    {clip.videoPrompt ? 'Re-generate' : 'Generate'} Prompt
                                </Button>
                            </div>
                            <Textarea
                                value={editedPrompt}
                                onChange={(e) => handlePromptChange(e.target.value)}
                                placeholder="Enter video prompt describing the motion and animation..."
                                className="min-h-[150px] text-sm"
                            />
                            {hasChanges && (
                                <p className="text-xs text-orange-500">* Unsaved changes</p>
                            )}
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500 flex items-center gap-1">
                                    <Camera className="h-3 w-3" /> Camera Motion
                                </Label>
                                <Select
                                    value={editedCameraMotion}
                                    onValueChange={(value) => {
                                        setEditedCameraMotion(value);
                                        setHasChanges(true);
                                    }}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CAMERA_MOTIONS.map(m => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Duration (seconds)
                                </Label>
                                <Select
                                    value={String(editedDuration)}
                                    onValueChange={(value) => {
                                        setEditedDuration(parseInt(value));
                                        setHasChanges(true);
                                    }}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                                            <SelectItem key={d} value={String(d)}>
                                                {d}s
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Error Message */}
                        {clip.errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600">
                                    <strong>Error:</strong> {clip.errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="flex-1"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>

                            <Button
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo || !editedPrompt || clip.status === 'processing'}
                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                            >
                                {isGeneratingVideo || clip.status === 'processing' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                )}
                                {clip.videoUrl ? 'Re-generate Video' : 'Generate Video'}
                            </Button>
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-2">
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">{clip.duration || 6}s</div>
                                <div>Duration</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">{clip.fps || 25}</div>
                                <div>FPS</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">{clip.resolution || '1080p'}</div>
                                <div>Resolution</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
