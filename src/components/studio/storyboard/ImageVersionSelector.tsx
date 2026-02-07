'use client';

import { useState, useEffect } from 'react';
import {
    Image as ImageIcon, Check, Trash2, RotateCcw, ChevronDown,
    ChevronUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/sweetalert';
import { SceneImageVersion } from '@/types/storyboard';

interface ImageVersionSelectorProps {
    sceneId: string;
    activeVersionId?: string;
    onVersionChange: (versionId: string) => void;
}

export function ImageVersionSelector({
    sceneId,
    activeVersionId,
    onVersionChange
}: ImageVersionSelectorProps) {
    const [versions, setVersions] = useState<SceneImageVersion[]>([]);
    const [deletedVersions, setDeletedVersions] = useState<SceneImageVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Load versions
    const loadVersions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-images?sceneId=${sceneId}`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data.versions || []);
                setDeletedVersions(data.deletedVersions || []);
            }
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, [sceneId]);

    // Set active version
    const handleSetActive = async (versionId: string) => {
        try {
            const res = await fetch(`/api/scene-images/${versionId}/activate`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to activate version');

            toast.success('Version activated!');
            onVersionChange(versionId);
            await loadVersions();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Soft delete version
    const handleDelete = async (versionId: string) => {
        try {
            const res = await fetch(`/api/scene-images/${versionId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete version');

            toast.success('Version deleted');
            await loadVersions();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Restore version
    const handleRestore = async (versionId: string) => {
        try {
            const res = await fetch(`/api/scene-images/${versionId}/restore`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to restore version');

            toast.success('Version restored');
            await loadVersions();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (versions.length === 0 && !isLoading) {
        return null;
    }

    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Image Versions</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {versions.length}
                    </Badge>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-white/60" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 pt-0">
                    {/* Active Versions */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {versions.map(version => (
                            <div
                                key={version.id}
                                className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all ${version.is_active ? 'ring-2 ring-blue-500' : 'ring-1 ring-white/10 hover:ring-white/30'
                                    }`}
                                onClick={() => handleSetActive(version.id)}
                            >
                                <div className="aspect-video bg-gray-800">
                                    <img
                                        src={version.image_url}
                                        alt={`Version ${version.version_number}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Version Number */}
                                <div className="absolute top-1 left-1">
                                    <Badge className={`text-[10px] ${version.is_active ? 'bg-blue-500' : 'bg-black/60'
                                        }`}>
                                        v{version.version_number}
                                    </Badge>
                                </div>

                                {/* Active Indicator */}
                                {version.is_active && (
                                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}

                                {/* Delete Button */}
                                {!version.is_active && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(version.id);
                                        }}
                                        className="absolute bottom-1 right-1 p-1 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Deleted Versions Toggle */}
                    {deletedVersions.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowDeleted(!showDeleted)}
                                className="w-full flex items-center justify-between py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                            >
                                <span>Deleted ({deletedVersions.length})</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showDeleted ? 'rotate-180' : ''}`} />
                            </button>

                            {showDeleted && (
                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                                    {deletedVersions.map(version => (
                                        <div
                                            key={version.id}
                                            className="relative group rounded-lg overflow-hidden opacity-50 hover:opacity-100 transition-opacity"
                                        >
                                            <div className="aspect-video bg-gray-800">
                                                <img
                                                    src={version.image_url}
                                                    alt={`Deleted v${version.version_number}`}
                                                    className="w-full h-full object-cover grayscale"
                                                />
                                            </div>

                                            <Badge className="absolute top-1 left-1 text-[10px] bg-red-500/60">
                                                v{version.version_number}
                                            </Badge>

                                            {/* Restore Button */}
                                            <button
                                                onClick={() => handleRestore(version.id)}
                                                className="absolute bottom-1 right-1 p-1 rounded bg-green-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
