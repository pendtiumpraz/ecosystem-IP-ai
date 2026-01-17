'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Wand2, Video, Save, Loader2, Image as ImageIcon, Play, Clock, Camera,
    Upload, Link, Trash2, RotateCcw, Check, History, ExternalLink
} from 'lucide-react';
import { toast, alert as swalAlert } from '@/lib/sweetalert';

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

interface VideoVersion {
    id: string;
    clip_id: string;
    version_number: number;
    source: 'generated' | 'uploaded' | 'external_link';
    video_url: string | null;
    external_url: string | null;
    original_file_name: string | null;
    prompt: string | null;
    camera_motion: string;
    duration: number;
    is_active: boolean;
    created_at: string;
    deleted_at: string | null;
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

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    generated: { label: 'AI Generated', color: 'bg-purple-100 text-purple-600' },
    uploaded: { label: 'Uploaded', color: 'bg-blue-100 text-blue-600' },
    external_link: { label: 'External Link', color: 'bg-green-100 text-green-600' },
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
    // Tab state
    const [activeTab, setActiveTab] = useState('prompt');

    // Prompt & Settings state
    const [editedPrompt, setEditedPrompt] = useState('');
    const [editedCameraMotion, setEditedCameraMotion] = useState('static');
    const [editedDuration, setEditedDuration] = useState(6);
    const [hasChanges, setHasChanges] = useState(false);

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isAddingLink, setIsAddingLink] = useState(false);

    // Video versions state
    const [videoVersions, setVideoVersions] = useState<VideoVersion[]>([]);
    const [deletedVersions, setDeletedVersions] = useState<VideoVersion[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    // External link input
    const [externalLinkUrl, setExternalLinkUrl] = useState('');

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load video versions when clip changes
    useEffect(() => {
        if (clip && isOpen) {
            loadVideoVersions();
        }
    }, [clip?.id, isOpen]);

    // Sync prompt state with clip data
    useEffect(() => {
        if (clip) {
            setEditedPrompt(clip.videoPrompt || '');
            setEditedCameraMotion(clip.cameraMotion || 'static');
            setEditedDuration(clip.duration || 6);
            setHasChanges(false);
        }
    }, [clip]);

    const loadVideoVersions = async () => {
        if (!clip) return;
        setIsLoadingVersions(true);
        try {
            const res = await fetch(`/api/clip-video-versions?clipId=${clip.id}&includeDeleted=true`);
            if (res.ok) {
                const data = await res.json();
                const all = data.versions || [];
                setVideoVersions(all.filter((v: VideoVersion) => !v.deleted_at));
                setDeletedVersions(all.filter((v: VideoVersion) => v.deleted_at));
            }
        } catch (e) {
            console.error('Failed to load video versions:', e);
        } finally {
            setIsLoadingVersions(false);
        }
    };

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
            console.log('Generating prompt with:', { clipId: clip.id, userId, projectId, animationVersionId });

            const res = await fetch('/api/generate/animation-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipIds: [clip.id],
                    animationVersionId,
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
                toast.success('Video generation started!');
                onUpdate();
                loadVideoVersions();
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

    const handleAddLink = async () => {
        if (!externalLinkUrl.trim()) {
            toast.error('Please enter a video URL');
            return;
        }

        setIsAddingLink(true);
        try {
            const res = await fetch('/api/clip-video-versions/from-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clipId: clip.id,
                    externalUrl: externalLinkUrl.trim(),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Video added from link!');
                setExternalLinkUrl('');
                onUpdate();
                loadVideoVersions();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to add video');
            }
        } catch (e) {
            toast.error('Error adding video from link');
        } finally {
            setIsAddingLink(false);
        }
    };

    const handleSetActiveVersion = async (versionId: string) => {
        try {
            const res = await fetch('/api/clip-video-versions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: versionId, setActive: true }),
            });

            if (res.ok) {
                toast.success('Version set as active');
                onUpdate();
                loadVideoVersions();
            }
        } catch (e) {
            toast.error('Failed to set active version');
        }
    };

    const handleDeleteVersion = async (versionId: string) => {
        const result = await swalAlert.confirm(
            'Delete Version',
            'This video version will be moved to trash. You can restore it later.',
            'Delete',
            'Cancel'
        );
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/clip-video-versions?id=${versionId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Version deleted');
                onUpdate();
                loadVideoVersions();
            }
        } catch (e) {
            toast.error('Failed to delete version');
        }
    };

    const handleRestoreVersion = async (versionId: string) => {
        try {
            const res = await fetch(`/api/clip-video-versions?id=${versionId}&restore=true`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Version restored');
                loadVideoVersions();
            }
        } catch (e) {
            toast.error('Failed to restore version');
        }
    };

    const activeVersion = videoVersions.find(v => v.is_active);
    const displayVideoUrl = activeVersion?.video_url || activeVersion?.external_url || clip.videoUrl;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span className="text-lg">Clip #{clip.clipOrder + 1}: {clip.beatLabel}</span>
                        <Badge className={STATUS_COLORS[clip.status] || STATUS_COLORS.pending}>
                            {clip.status}
                        </Badge>
                        {videoVersions.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                                <History className="h-3 w-3 mr-1" />
                                {videoVersions.length} version{videoVersions.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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

                            {/* Active Video */}
                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                <div className="px-3 py-2 bg-green-100 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-green-600" />
                                        <span className="text-xs font-medium text-green-600">
                                            {displayVideoUrl ? 'Active Video' : 'No Video Yet'}
                                        </span>
                                        {activeVersion && (
                                            <Badge className={SOURCE_LABELS[activeVersion.source]?.color || 'bg-gray-100'}>
                                                {SOURCE_LABELS[activeVersion.source]?.label}
                                            </Badge>
                                        )}
                                    </div>
                                    {activeVersion && (
                                        <span className="text-xs text-gray-500">v{activeVersion.version_number}</span>
                                    )}
                                </div>
                                {displayVideoUrl ? (
                                    <video
                                        key={displayVideoUrl}
                                        src={displayVideoUrl}
                                        controls
                                        className="w-full aspect-video bg-black"
                                    />
                                ) : (
                                    <div className="w-full aspect-video flex items-center justify-center text-gray-400 bg-gray-100">
                                        <div className="text-center">
                                            <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Generate or add a video</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Action Description */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <Label className="text-xs text-gray-500">Key Action Description</Label>
                                <p className="text-sm mt-1">{clip.keyActionDescription || 'No description'}</p>
                            </div>
                        </div>

                        {/* Right: Tabs */}
                        <div className="space-y-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                                    <TabsTrigger value="add">Add Video</TabsTrigger>
                                    <TabsTrigger value="versions">
                                        Versions {videoVersions.length > 0 && `(${videoVersions.length})`}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Prompt Tab */}
                                <TabsContent value="prompt" className="space-y-4 mt-4">
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
                                                {clip.videoPrompt ? 'Re-generate' : 'Generate'}
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={editedPrompt}
                                            onChange={(e) => handlePromptChange(e.target.value)}
                                            placeholder="Enter video prompt describing the motion and animation..."
                                            className="min-h-[120px] text-sm"
                                        />
                                        {hasChanges && (
                                            <p className="text-xs text-orange-500">* Unsaved changes</p>
                                        )}
                                    </div>

                                    {/* Settings */}
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
                                                <Clock className="h-3 w-3" /> Duration
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
                                                        <SelectItem key={d} value={String(d)}>{d}s</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-4 border-t">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save
                                        </Button>
                                        <Button
                                            onClick={handleGenerateVideo}
                                            disabled={isGeneratingVideo || !editedPrompt || clip.status === 'processing'}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                                        >
                                            {isGeneratingVideo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                                            Generate Video
                                        </Button>
                                    </div>
                                </TabsContent>

                                {/* Add Video Tab */}
                                <TabsContent value="add" className="space-y-4 mt-4">
                                    {/* From Link */}
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Link className="h-4 w-4 text-blue-500" />
                                            <Label className="text-sm font-medium">Add from URL</Label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Paste a video URL (Google Drive, direct link, etc.)
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                value={externalLinkUrl}
                                                onChange={(e) => setExternalLinkUrl(e.target.value)}
                                                placeholder="https://drive.google.com/file/d/..."
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleAddLink}
                                                disabled={isAddingLink || !externalLinkUrl.trim()}
                                            >
                                                {isAddingLink ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ExternalLink className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg opacity-50">
                                        <div className="flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-green-500" />
                                            <Label className="text-sm font-medium">Upload Video</Label>
                                            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Upload video file directly (will be stored in Google Drive)
                                        </p>
                                        <Button disabled variant="outline" className="w-full">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose File
                                        </Button>
                                    </div>
                                </TabsContent>

                                {/* Versions Tab */}
                                <TabsContent value="versions" className="space-y-4 mt-4">
                                    {isLoadingVersions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                                        </div>
                                    ) : videoVersions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No video versions yet</p>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[300px]">
                                            <div className="space-y-2 pr-4">
                                                {videoVersions.map(version => (
                                                    <div
                                                        key={version.id}
                                                        className={`p-3 rounded-lg border ${version.is_active ? 'border-green-300 bg-green-50' : 'bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm">v{version.version_number}</span>
                                                                <Badge className={SOURCE_LABELS[version.source]?.color || 'bg-gray-100'}>
                                                                    {SOURCE_LABELS[version.source]?.label}
                                                                </Badge>
                                                                {version.is_active && (
                                                                    <Badge className="bg-green-500 text-white">Active</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {!version.is_active && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleSetActiveVersion(version.id)}
                                                                        className="h-7 px-2"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteVersion(version.id)}
                                                                    className="h-7 px-2 text-red-500 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(version.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}

                                    {/* Deleted versions */}
                                    {deletedVersions.length > 0 && (
                                        <div className="border-t pt-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowDeleted(!showDeleted)}
                                                className="text-xs text-gray-500"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                {showDeleted ? 'Hide' : 'Show'} Deleted ({deletedVersions.length})
                                            </Button>
                                            {showDeleted && (
                                                <div className="mt-2 space-y-2">
                                                    {deletedVersions.map(version => (
                                                        <div
                                                            key={version.id}
                                                            className="p-3 rounded-lg bg-red-50 border border-red-100 opacity-60"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm line-through">v{version.version_number}</span>
                                                                    <Badge variant="outline" className="text-xs">Deleted</Badge>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleRestoreVersion(version.id)}
                                                                    className="h-7 px-2 text-green-600"
                                                                >
                                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                                    Restore
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Error Message */}
                            {clip.errorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-600">
                                        <strong>Error:</strong> {clip.errorMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
