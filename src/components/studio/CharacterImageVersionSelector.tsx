'use client';

import { useState, useEffect } from 'react';
import {
    Image as ImageIcon, Camera, Brush, Palette, Info, Clock, Sparkles,
    Grid3X3, User, Move, Zap, Square, RectangleHorizontal, X,
    ChevronLeft, ChevronRight, Check, Trash2, Download, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/sweetalert';

interface ImageVersion {
    id: string;
    versionName: string;
    versionNumber: number;
    isActive: boolean;
    imageUrl: string;
    thumbnailUrl?: string;
    template?: string;
    artStyle?: string;
    aspectRatio?: string;
    actionPose?: string;
    characterRefUrl?: string;
    backgroundRefUrl?: string;
    additionalPrompt?: string;
    fullPromptUsed?: string;
    characterDataSnapshot?: Record<string, any>;
    modelUsed?: string;
    modelProvider?: string;
    creditCost?: number;
    generationTimeMs?: number;
    createdAt: string;
}

interface CharacterImageVersionSelectorProps {
    characterId: string;
    projectId?: string;
    userId?: string;
    currentImageUrl?: string;
    onSelectVersion?: (version: ImageVersion) => void;
    onVersionChange?: (imageUrl: string) => void;
}

// Style mappings for display
const STYLE_LABELS: Record<string, { label: string; icon: any }> = {
    realistic: { label: 'Cinematic Realistic', icon: Camera },
    anime: { label: 'Anime', icon: Sparkles },
    ghibli: { label: 'Studio Ghibli', icon: Brush },
    disney: { label: 'Disney/Pixar 3D', icon: ImageIcon },
    comic: { label: 'Comic Book', icon: Grid3X3 },
    cyberpunk: { label: 'Cyberpunk', icon: Sparkles },
    watercolor: { label: 'Watercolor', icon: Palette },
    oil_painting: { label: 'Oil Painting', icon: Brush },
};

const TEMPLATE_LABELS: Record<string, { label: string; icon: any }> = {
    portrait: { label: 'Portrait', icon: User },
    headshot: { label: 'Headshot', icon: User },
    medium_shot: { label: 'Medium Shot', icon: User },
    full_body: { label: 'Full Body', icon: Move },
    expression_sheet: { label: 'Expression Sheet', icon: Grid3X3 },
    action_poses: { label: 'Action Poses', icon: Zap },
};

export function CharacterImageVersionSelector({
    characterId,
    projectId,
    userId,
    currentImageUrl,
    onSelectVersion,
    onVersionChange,
}: CharacterImageVersionSelectorProps) {
    const [versions, setVersions] = useState<ImageVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<ImageVersion | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailVersion, setDetailVersion] = useState<ImageVersion | null>(null);

    // Fetch versions
    useEffect(() => {
        if (!characterId) return;

        const fetchVersions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ characterId });
                if (projectId) params.append('projectId', projectId);
                if (userId) params.append('userId', userId);

                const response = await fetch(`/api/character-image-versions?${params}`);
                const data = await response.json();

                if (data.success) {
                    setVersions(data.versions || []);
                    // Set initial selected version
                    const active = data.activeVersion || data.versions?.[0];
                    if (active) {
                        setSelectedVersion(active);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch versions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [characterId, projectId, userId]);

    // Set version as active
    const handleSetActive = async (version: ImageVersion) => {
        try {
            const response = await fetch('/api/character-image-versions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    versionId: version.id,
                    characterId,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Update local state
                setVersions(prev => prev.map(v => ({
                    ...v,
                    isActive: v.id === version.id,
                })));
                setSelectedVersion(version);
                onSelectVersion?.(version);
                onVersionChange?.(version.imageUrl);
                toast.success(`Switched to "${version.versionName}"`);
            }
        } catch (error) {
            console.error('Failed to set active version:', error);
            toast.error('Failed to switch version');
        }
    };

    // Delete version
    const handleDelete = async (versionId: string) => {
        if (!confirm('Delete this image version?')) return;

        try {
            const response = await fetch(`/api/character-image-versions?versionId=${versionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setVersions(prev => prev.filter(v => v.id !== versionId));
                if (selectedVersion?.id === versionId) {
                    setSelectedVersion(versions[0] || null);
                }
                toast.success('Version deleted');
            }
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
        }
    };

    // Show version details
    const showDetails = (version: ImageVersion) => {
        setDetailVersion(version);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (versions.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 text-sm">
                No image versions yet. Generate your first image!
            </div>
        );
    }

    return (
        <>
            {/* Version Grid */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image Versions ({versions.length})
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedVersion?.id === version.id
                                    ? 'border-orange-500 ring-2 ring-orange-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleSetActive(version)}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-square">
                                <img
                                    src={version.thumbnailUrl || version.imageUrl}
                                    alt={version.versionName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-white hover:bg-white/20"
                                    onClick={(e) => { e.stopPropagation(); showDetails(version); }}
                                >
                                    <Info className="h-3 w-3 mr-1" />
                                    <span className="text-[10px]">Details</span>
                                </Button>
                                {!version.isActive && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-red-400 hover:bg-red-500/20"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(version.id); }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Active indicator */}
                            {version.isActive && (
                                <div className="absolute top-1 right-1 p-0.5 bg-orange-500 rounded-full">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}

                            {/* Version number */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-1 px-2">
                                <p className="text-[9px] text-white font-medium truncate">
                                    v{version.versionNumber}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Image Details
                        </DialogTitle>
                        <DialogDescription>
                            {detailVersion?.versionName}
                        </DialogDescription>
                    </DialogHeader>

                    {detailVersion && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                {/* Preview */}
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={detailVersion.imageUrl}
                                        alt={detailVersion.versionName}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => window.open(detailVersion.imageUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Open Full Size
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            const a = document.createElement('a');
                                            a.href = detailVersion.imageUrl;
                                            a.download = `${detailVersion.versionName}.png`;
                                            a.click();
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </div>

                                <Separator />

                                {/* Generation Settings */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-700">Generation Settings</h4>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {detailVersion.template && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500">Template:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {TEMPLATE_LABELS[detailVersion.template]?.label || detailVersion.template}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.artStyle && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500">Style:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {STYLE_LABELS[detailVersion.artStyle]?.label || detailVersion.artStyle}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.aspectRatio && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500">Size:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {detailVersion.aspectRatio}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.actionPose && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500">Pose:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {detailVersion.actionPose}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {detailVersion.additionalPrompt && (
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <span className="text-xs text-gray-500 block mb-1">Additional Details:</span>
                                            <p className="text-sm text-gray-700">{detailVersion.additionalPrompt}</p>
                                        </div>
                                    )}

                                    {detailVersion.characterRefUrl && (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                            <ImageIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-xs text-green-700">Character reference used</span>
                                        </div>
                                    )}

                                    {detailVersion.backgroundRefUrl && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                            <ImageIcon className="h-4 w-4 text-blue-500" />
                                            <span className="text-xs text-blue-700">Background reference used</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* AI Info */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-700">AI Information</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Model:</span>
                                            <span className="ml-1 font-medium">{detailVersion.modelUsed || 'Unknown'}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Provider:</span>
                                            <span className="ml-1 font-medium">{detailVersion.modelProvider || 'Unknown'}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Credits:</span>
                                            <span className="ml-1 font-medium">{detailVersion.creditCost || 0}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Time:</span>
                                            <span className="ml-1 font-medium">
                                                {detailVersion.generationTimeMs
                                                    ? `${(detailVersion.generationTimeMs / 1000).toFixed(1)}s`
                                                    : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Full Prompt */}
                                {detailVersion.fullPromptUsed && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700">Full Prompt Used</h4>
                                        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono max-h-32 overflow-auto">
                                            {detailVersion.fullPromptUsed}
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    Created: {new Date(detailVersion.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
