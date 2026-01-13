'use client';

import { useState, useEffect } from 'react';
import {
    Star, Pencil, Trash2, Check, X, Image as ImageIcon,
    Loader2, Plus, Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/lib/sweetalert';

interface MediaVersion {
    id: string;
    thumbnailUrl: string | null;
    publicUrl: string | null;
    versionName: string | null;
    generationVersion: number | null;
    styleUsed: string | null;
    variantType: string | null;
    variantName: string | null;
    isPrimary: boolean | null;
    isPrimaryForStyle: boolean | null;
    createdAt: string;
}

interface CharacterImageVersionsProps {
    characterId: string;
    userId: string;
    onGenerateClick?: () => void;
    onImageSelect?: (media: MediaVersion) => void;
    compact?: boolean;
}

const STYLE_LABELS: Record<string, string> = {
    realistic: 'Realistic',
    anime: 'Anime',
    ghibli: 'Ghibli',
    disney: 'Disney',
    comic: 'Comic',
    cyberpunk: 'Cyberpunk',
    painterly: 'Painterly',
};

export function CharacterImageVersions({
    characterId,
    userId,
    onGenerateClick,
    onImageSelect,
    compact = false,
}: CharacterImageVersionsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [versions, setVersions] = useState<MediaVersion[]>([]);
    const [styles, setStyles] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<string>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Fetch versions
    const fetchVersions = async () => {
        try {
            const response = await fetch(
                `/api/generate/character-variants?characterId=${characterId}&userId=${userId}`
            );
            const data = await response.json();

            if (data.success) {
                // Flatten all versions
                const allVersions: MediaVersion[] = [];
                const styleList: string[] = [];

                for (const [style, group] of Object.entries(data.styles)) {
                    styleList.push(style);
                    allVersions.push(...(group as { versions: MediaVersion[] }).versions);
                }

                setVersions(allVersions);
                setStyles(styleList);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, [characterId, userId]);

    // Filter versions by style
    const filteredVersions = selectedStyle === 'all'
        ? versions
        : versions.filter(v => v.styleUsed === selectedStyle);

    // Handle rename
    const handleSaveRename = async (id: string) => {
        try {
            const response = await fetch(`/api/generate/character-variants/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionName: editName }),
            });

            if (!response.ok) throw new Error('Rename failed');

            setVersions(prev => prev.map(v =>
                v.id === id ? { ...v, versionName: editName } : v
            ));
            setEditingId(null);
            toast.success('Version renamed');
        } catch (error) {
            toast.error('Failed to rename');
        }
    };

    // Handle set primary
    const handleSetPrimary = async (id: string) => {
        try {
            const response = await fetch(`/api/generate/character-variants/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPrimary: true }),
            });

            if (!response.ok) throw new Error('Failed');

            setVersions(prev => prev.map(v => ({
                ...v,
                isPrimary: v.id === id,
            })));
            toast.success('Set as primary');
        } catch (error) {
            toast.error('Failed to set primary');
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/generate/character-variants/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            setVersions(prev => prev.filter(v => v.id !== id));
            toast.success('Version deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className={compact ? '' : 'space-y-4'}>
            {/* Style Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedStyle('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStyle === 'all'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All ({versions.length})
                </button>
                {styles.map(style => {
                    const count = versions.filter(v => v.styleUsed === style).length;
                    return (
                        <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStyle === style
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {STYLE_LABELS[style] || style} ({count})
                        </button>
                    );
                })}
                {onGenerateClick && (
                    <Button size="sm" onClick={onGenerateClick} className="ml-auto h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Generate
                    </Button>
                )}
            </div>

            {/* Versions Grid */}
            {filteredVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm">No images yet</p>
                    {onGenerateClick && (
                        <Button size="sm" variant="outline" onClick={onGenerateClick} className="mt-2">
                            Generate First Image
                        </Button>
                    )}
                </div>
            ) : (
                <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
                    {filteredVersions.map(version => (
                        <div
                            key={version.id}
                            className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square"
                        >
                            {/* Image */}
                            {version.thumbnailUrl ? (
                                <img
                                    src={version.thumbnailUrl}
                                    alt={version.versionName || 'Character image'}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => onImageSelect?.(version)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-300" />
                                </div>
                            )}

                            {/* Primary badge */}
                            {version.isPrimary && (
                                <Badge className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0">
                                    <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                                    Primary
                                </Badge>
                            )}

                            {/* Expression badge */}
                            {version.variantType === 'expression' && version.variantName && (
                                <Badge className="absolute top-1 right-1 bg-purple-500 text-white text-[10px] px-1.5 py-0">
                                    {version.variantName}
                                </Badge>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                {/* Version name (editable) */}
                                {editingId === version.id ? (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-6 text-xs bg-white/90"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveRename(version.id)}
                                            className="p-1 rounded bg-green-500 text-white"
                                        >
                                            <Check className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1 rounded bg-gray-500 text-white"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <p
                                        className="text-white text-xs font-medium truncate mb-1 cursor-pointer"
                                        onClick={() => {
                                            setEditingId(version.id);
                                            setEditName(version.versionName || '');
                                        }}
                                    >
                                        {version.versionName || `v${version.generationVersion}`}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(version.id);
                                                        setEditName(version.versionName || '');
                                                    }}
                                                    className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>Rename</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {!version.isPrimary && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => handleSetPrimary(version.id)}
                                                        className="p-1.5 rounded bg-white/20 hover:bg-yellow-500/50 text-white"
                                                    >
                                                        <Star className="h-3 w-3" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>Set as Primary</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleDelete(version.id)}
                                                    className="p-1.5 rounded bg-white/20 hover:bg-red-500/50 text-white ml-auto"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
