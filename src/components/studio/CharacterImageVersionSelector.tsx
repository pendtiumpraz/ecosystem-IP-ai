'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Image as ImageIcon, Info, Clock, Loader2,
    Check, Trash2, Download, ExternalLink,
    ChevronDown, Plus, Upload, Link2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
    manual: 'Manual Upload',
};

const TEMPLATE_LABELS: Record<string, string> = {
    portrait: 'Portrait',
    headshot: 'Headshot',
    medium_shot: 'Medium Shot',
    full_body: 'Full Body',
    expression_sheet: 'Expression Sheet',
    action_poses: 'Action Poses',
    manual: 'Manual Upload',
};

// Convert Google Drive URL to thumbnail
function getGoogleDriveThumbnail(url: string): string {
    // Extract file ID from various Google Drive URL formats
    const patterns = [
        /\/file\/d\/([^\/]+)/,  // /file/d/FILE_ID/
        /id=([^&]+)/,           // ?id=FILE_ID
        /\/d\/([^\/]+)/,        // /d/FILE_ID/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            const fileId = match[1];
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
        }
    }

    return url; // Return original if not a Google Drive URL
}

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
    const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
    const [activeVersion, setActiveVersion] = useState<ImageVersion | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailVersion, setDetailVersion] = useState<ImageVersion | null>(null);

    // Add version modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addVersionName, setAddVersionName] = useState('');
    const [addImageUrl, setAddImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                setActiveVersion(active || null);
            } else {
                setVersions([]);
                setActiveVersion(null);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
            setVersions([]);
            setActiveVersion(null);
        } finally {
            setLoading(false);
        }
    }, [characterId, projectId, userId]);

    // Reset and refetch when characterId changes
    useEffect(() => {
        if (characterId && characterId !== currentCharacterId) {
            setVersions([]);
            setActiveVersion(null);
            setCurrentCharacterId(characterId);
            fetchVersions(false);
        }
    }, [characterId, currentCharacterId, fetchVersions]);

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
                const remaining = versions.filter(v => v.id !== versionId);
                setVersions(remaining);
                if (activeVersion?.id === versionId) {
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

    // Handle file upload to Google Drive
    const handleFileUpload = async (file: File) => {
        if (!file || !projectId || !userId) {
            toast.error('Missing required data for upload');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);
            formData.append('userId', userId);
            formData.append('entityType', 'character');
            formData.append('entityId', characterId);

            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success && (data.thumbnailUrl || data.publicUrl)) {
                // Use thumbnail URL from Google Drive
                const imageUrl = data.thumbnailUrl || data.publicUrl;
                setAddImageUrl(imageUrl);
                toast.success('Image uploaded!');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle URL input (convert Google Drive URLs)
    const handleUrlInput = (url: string) => {
        if (url.includes('drive.google.com')) {
            setAddImageUrl(getGoogleDriveThumbnail(url));
        } else {
            setAddImageUrl(url);
        }
    };

    // Create new version from manual upload/URL
    const handleCreateVersion = async () => {
        if (!addImageUrl) {
            toast.error('Please provide an image URL or upload a file');
            return;
        }

        try {
            const versionName = addVersionName || `Manual Upload ${new Date().toLocaleDateString()}`;

            const response = await fetch('/api/character-image-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId,
                    projectId,
                    userId,
                    versionName,
                    imageUrl: addImageUrl,
                    thumbnailUrl: addImageUrl,
                    template: 'manual',
                    artStyle: 'manual',
                    modelUsed: 'manual',
                    modelProvider: 'user',
                    creditCost: 0,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('New version created!');
                setShowAddModal(false);
                setAddVersionName('');
                setAddImageUrl('');
                // Refresh versions
                fetchVersions(true);
                // Update character image
                onVersionChange?.(addImageUrl);
            } else {
                throw new Error(data.error || 'Failed to create version');
            }
        } catch (error) {
            console.error('Create version error:', error);
            toast.error('Failed to create version');
        }
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
            <div className="flex gap-2">
                {/* Version Dropdown */}
                <DropdownMenu onOpenChange={(open) => open && fetchVersions(true)}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-between text-xs h-8"
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

                    <DropdownMenuContent className="w-72" align="start">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                <span className="ml-2 text-xs text-gray-500">Loading versions...</span>
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-500">
                                No image versions yet.<br />
                                Generate or upload your first image!
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
                                                {version.model_used === 'manual' && (
                                                    <Badge variant="outline" className="text-[8px] px-1 py-0">Upload</Badge>
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
                                        <div className="flex gap-0.5 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => showDetails(version, e)}
                                                title="View Details"
                                            >
                                                <Info className="h-3.5 w-3.5 text-blue-500" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => handleDelete(version.id, e)}
                                                title="Delete Version"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </ScrollArea>
                        )}

                        <DropdownMenuSeparator />
                        <div className="px-2 py-1 text-[10px] text-gray-400">
                            {versions.length} version{versions.length !== 1 ? 's' : ''} • Click to switch
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Version Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowAddModal(true)}
                    title="Add image from upload or URL"
                >
                    <Plus className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Add Version Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-orange-500" />
                            Add Image Version
                        </DialogTitle>
                        <DialogDescription>
                            Upload an image or paste a URL to create a new version
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Version Name */}
                        <div>
                            <Label className="text-sm">Version Name (optional)</Label>
                            <Input
                                placeholder="e.g., Concept Art v1"
                                value={addVersionName}
                                onChange={(e) => setAddVersionName(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        {/* Upload */}
                        <div>
                            <Label className="text-sm">Upload Image</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <Button
                                variant="outline"
                                className="w-full mt-1"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Separator className="flex-1" />
                            <span className="text-xs text-gray-400">OR</span>
                            <Separator className="flex-1" />
                        </div>

                        {/* URL Input */}
                        <div>
                            <Label className="text-sm">Image URL</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    placeholder="https://... or Google Drive link"
                                    value={addImageUrl}
                                    onChange={(e) => handleUrlInput(e.target.value)}
                                    className="flex-1"
                                />
                                {addImageUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAddImageUrl('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Google Drive links will be auto-converted to thumbnails
                            </p>
                        </div>

                        {/* Preview */}
                        {addImageUrl && (
                            <div className="border rounded-lg p-2">
                                <Label className="text-xs text-gray-500">Preview</Label>
                                <div className="mt-1 aspect-video bg-gray-100 rounded overflow-hidden">
                                    <img
                                        src={addImageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateVersion}
                            disabled={!addImageUrl}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Create Version
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                    <h4 className="font-semibold text-sm text-gray-700">Generation Info</h4>

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

                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500 text-xs">Source:</span>
                                            <span className="ml-1 font-medium text-xs">
                                                {detailVersion.model_used === 'manual' ? 'Manual Upload' : detailVersion.model_provider || 'AI'}
                                            </span>
                                        </div>

                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="text-gray-500 text-xs">Credits:</span>
                                            <span className="ml-1 font-medium text-xs">{detailVersion.credit_cost || 0}</span>
                                        </div>
                                    </div>

                                    {detailVersion.full_prompt_used && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-500">Prompt Used:</span>
                                            <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono max-h-24 overflow-auto">
                                                {detailVersion.full_prompt_used}
                                            </div>
                                        </div>
                                    )}
                                </div>

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
