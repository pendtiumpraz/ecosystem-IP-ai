'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Image as ImageIcon, Camera, Brush, Palette, Info, Clock, Sparkles,
    Grid3X3, User, Move, Zap, Square, RectangleHorizontal, X, Loader2,
    ChevronLeft, ChevronRight, Check, Trash2, Download, ExternalLink,
    ChevronDown, RotateCcw, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/sweetalert';

interface ImageVersion {
    id: string;
    version_name: string;
    version_number: number;
    is_active: boolean;
    image_url: string;
    thumbnail_url?: string;
    template?: string;
    art_style?: string;
    aspect_ratio?: string;
    action_pose?: string;
    character_ref_url?: string;
    background_ref_url?: string;
    additional_prompt?: string;
    full_prompt_used?: string;
    character_data_snapshot?: Record<string, any>;
    model_used?: string;
    model_provider?: string;
    credit_cost?: number;
    generation_time_ms?: number;
    created_at: string;
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
const STYLE_LABELS: Record<string, string> = {
    realistic: 'Cinematic Realistic',
    anime: 'Anime',
    ghibli: 'Studio Ghibli',
    disney: 'Disney/Pixar 3D',
    comic: 'Comic Book',
    cyberpunk: 'Cyberpunk',
    watercolor: 'Watercolor',
    oil_painting: 'Oil Painting',
};

const TEMPLATE_LABELS: Record<string, string> = {
    portrait: 'Portrait',
    headshot: 'Headshot',
    medium_shot: 'Medium Shot',
    full_body: 'Full Body',
    expression_sheet: 'Expression Sheet',
    action_poses: 'Action Poses',
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
    const [loading, setLoading] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [activeVersion, setActiveVersion] = useState<ImageVersion | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailVersion, setDetailVersion] = useState<ImageVersion | null>(null);

    // Fetch versions function
    const fetchVersions = useCallback(async (showLoader = true) => {
        if (!characterId) return;

        if (showLoader) setLoading(true);
        try {
            const params = new URLSearchParams({ characterId });
            if (projectId) params.append('projectId', projectId);
            if (userId) params.append('userId', userId);

            const response = await fetch(`/api/character-image-versions?${params}`);
            const data = await response.json();

            if (data.success) {
                setVersions(data.versions || []);
                const active = data.versions?.find((v: ImageVersion) => v.is_active) || data.versions?.[0];
                if (active) {
                    setActiveVersion(active);
                }
            }
            setInitialLoaded(true);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    }, [characterId, projectId, userId]);

    // Auto-load versions on mount
    useEffect(() => {
        if (characterId && !initialLoaded) {
            fetchVersions(false); // Don't show loader on initial load
        }
    }, [characterId, initialLoaded, fetchVersions]);

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
                    is_active: v.id === version.id,
                })));
                setActiveVersion(version);
                onSelectVersion?.(version);
                onVersionChange?.(version.image_url);
                toast.success(`Switched to "${version.version_name}"`);
            }
        } catch (error) {
            console.error('Failed to set active version:', error);
            toast.error('Failed to switch version');
        }
    };

    // Delete version
    const handleDelete = async (versionId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm('Delete this image version? This cannot be undone.')) return;

        try {
            const response = await fetch(`/api/character-image-versions?versionId=${versionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setVersions(prev => prev.filter(v => v.id !== versionId));
                if (activeVersion?.id === versionId) {
                    const remaining = versions.filter(v => v.id !== versionId);
                    setActiveVersion(remaining[0] || null);
                    if (remaining[0]) {
                        onVersionChange?.(remaining[0].image_url);
                    }
                }
                toast.success('Version deleted');
            }
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
        }
    };

    // Show version details
    const showDetails = (version: ImageVersion, e: React.MouseEvent) => {
        e.stopPropagation();
        setDetailVersion(version);
        setShowDetailModal(true);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Version Dropdown */}
            <DropdownMenu onOpenChange={(open) => open && fetchVersions(true)}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs h-8"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="h-3 w-3 text-orange-500" />
                            <span className="truncate">
                                {activeVersion
                                    ? `v${activeVersion.version_number}: ${activeVersion.version_name}`
                                    : 'No versions yet'
                                }
                            </span>
                        </div>
                        <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64" align="start">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                            <span className="ml-2 text-xs text-gray-500">Loading versions...</span>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="py-4 text-center text-xs text-gray-500">
                            No image versions yet.<br />
                            Generate your first image!
                        </div>
                    ) : (
                        <ScrollArea className="max-h-64">
                            {versions.map((version) => (
                                <DropdownMenuItem
                                    key={version.id}
                                    className={`flex items-center gap-2 py-2 cursor-pointer ${version.is_active ? 'bg-orange-50' : ''
                                        }`}
                                    onClick={() => handleSetActive(version)}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                                        <img
                                            src={version.thumbnail_url || version.image_url}
                                            alt={version.version_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-medium truncate">
                                                v{version.version_number}
                                            </span>
                                            {version.is_active && (
                                                <Check className="h-3 w-3 text-orange-500" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            {version.version_name}
                                        </p>
                                        <p className="text-[9px] text-gray-400">
                                            {formatDate(version.created_at)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => showDetails(version, e)}
                                        >
                                            <Info className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={(e) => handleDelete(version.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </ScrollArea>
                    )}

                    {versions.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1 text-[10px] text-gray-400">
                                {versions.length} version{versions.length > 1 ? 's' : ''} • Click to switch
                            </div>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Image Details
                        </DialogTitle>
                        <DialogDescription>
                            {detailVersion?.version_name} (v{detailVersion?.version_number})
                        </DialogDescription>
                    </DialogHeader>

                    {detailVersion && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                                {/* Preview */}
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={detailVersion.image_url}
                                        alt={detailVersion.version_name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => window.open(detailVersion.image_url, '_blank')}
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
                                            a.href = detailVersion.image_url;
                                            a.download = `${detailVersion.version_name}.png`;
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
                                                <span className="text-gray-500 text-xs">Template:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {TEMPLATE_LABELS[detailVersion.template] || detailVersion.template}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.art_style && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500 text-xs">Style:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {STYLE_LABELS[detailVersion.art_style] || detailVersion.art_style}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.aspect_ratio && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500 text-xs">Size:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {detailVersion.aspect_ratio}
                                                </Badge>
                                            </div>
                                        )}

                                        {detailVersion.action_pose && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-500 text-xs">Pose:</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {detailVersion.action_pose}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {detailVersion.additional_prompt && (
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <span className="text-xs text-gray-500 block mb-1">Additional Details:</span>
                                            <p className="text-sm text-gray-700">{detailVersion.additional_prompt}</p>
                                        </div>
                                    )}

                                    {detailVersion.character_ref_url && (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                            <ImageIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-xs text-green-700">Character reference used</span>
                                        </div>
                                    )}

                                    {detailVersion.background_ref_url && (
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
                                            <span className="ml-1 font-medium">{detailVersion.model_used || 'Unknown'}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Provider:</span>
                                            <span className="ml-1 font-medium">{detailVersion.model_provider || 'Unknown'}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Credits:</span>
                                            <span className="ml-1 font-medium">{detailVersion.credit_cost || 0}</span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500">Time:</span>
                                            <span className="ml-1 font-medium">
                                                {detailVersion.generation_time_ms
                                                    ? `${(detailVersion.generation_time_ms / 1000).toFixed(1)}s`
                                                    : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Full Prompt */}
                                {detailVersion.full_prompt_used && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700">Full Prompt Used</h4>
                                        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono max-h-32 overflow-auto">
                                            {detailVersion.full_prompt_used}
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    Created: {formatDate(detailVersion.created_at)}
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
