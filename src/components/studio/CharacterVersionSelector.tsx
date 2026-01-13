'use client';

import { useState, useEffect } from 'react';
import {
    History, Check, Pencil, Trash2, Plus, ChevronDown,
    Loader2, X, Sparkles, Copy, RotateCcw, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/sweetalert';

interface CharacterVersion {
    id: string;
    versionNumber: number;
    versionName: string | null;
    isCurrent: boolean;
    isDeleted?: boolean;
    generatedBy: string | null;
    characterData: Record<string, unknown>;
    createdAt: string;
}

interface CharacterVersionSelectorProps {
    characterId: string;
    userId: string;
    projectId?: string;
    currentCharacterData: Record<string, unknown>;
    onVersionChange?: (characterData: Record<string, unknown>) => void;
    onSaveVersion?: () => void;
    compact?: boolean;
}

export function CharacterVersionSelector({
    characterId,
    userId,
    projectId,
    currentCharacterData,
    onVersionChange,
    onSaveVersion,
    compact = false,
}: CharacterVersionSelectorProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [versions, setVersions] = useState<CharacterVersion[]>([]);
    const [deletedVersions, setDeletedVersions] = useState<CharacterVersion[]>([]);
    const [currentVersion, setCurrentVersion] = useState<CharacterVersion | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    // Fetch versions
    const fetchVersions = async () => {
        try {
            const response = await fetch(
                `/api/characters/versions?characterId=${characterId}&userId=${userId}&includeDeleted=true`
            );
            const data = await response.json();

            if (data.success) {
                setVersions(data.versions);
                setDeletedVersions(data.deletedVersions || []);
                setCurrentVersion(data.currentVersion || null);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (characterId && userId) {
            fetchVersions();
        }
    }, [characterId, userId]);

    // Save current state as new version
    const handleSaveNewVersion = async (name?: string) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/characters/versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId,
                    projectId,
                    userId,
                    characterData: currentCharacterData,
                    versionName: name,
                    generatedBy: 'manual',
                    setAsCurrent: true,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Saved as "${result.version.versionName}"`);
                fetchVersions();
                onSaveVersion?.();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error('Failed to save version');
        } finally {
            setIsSaving(false);
        }
    };

    // Switch to a version
    const handleActivateVersion = async (versionId: string) => {
        try {
            const response = await fetch(`/api/characters/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCurrent: true }),
            });

            const result = await response.json();

            if (result.success) {
                // Apply the version data
                const version = versions.find(v => v.id === versionId);
                if (version) {
                    onVersionChange?.(version.characterData);
                    toast.success(`Switched to "${version.versionName}"`);
                }
                fetchVersions();
            }
        } catch (error) {
            toast.error('Failed to switch version');
        }
    };

    // Rename version
    const handleRenameVersion = async (versionId: string) => {
        try {
            const response = await fetch(`/api/characters/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionName: editName }),
            });

            if (response.ok) {
                setVersions(prev => prev.map(v =>
                    v.id === versionId ? { ...v, versionName: editName } : v
                ));
                setEditingId(null);
                toast.success('Version renamed');
            }
        } catch (error) {
            toast.error('Failed to rename');
        }
    };

    // Delete version (soft delete)
    const handleDeleteVersion = async (versionId: string) => {
        try {
            const response = await fetch(`/api/characters/versions/${versionId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                // Move to deleted list
                const deletedVersion = versions.find(v => v.id === versionId);
                if (deletedVersion) {
                    setDeletedVersions(prev => [...prev, { ...deletedVersion, isDeleted: true }]);
                }
                setVersions(prev => prev.filter(v => v.id !== versionId));
                toast.success('Version deleted');
            } else {
                toast.error(result.error || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete version');
        }
    };

    // Restore version
    const handleRestoreVersion = async (versionId: string) => {
        try {
            const response = await fetch(`/api/characters/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            const result = await response.json();

            if (result.success) {
                // Move back to active list
                const restoredVersion = deletedVersions.find(v => v.id === versionId);
                if (restoredVersion) {
                    setVersions(prev => [...prev, { ...restoredVersion, isDeleted: false }]);
                }
                setDeletedVersions(prev => prev.filter(v => v.id !== versionId));
                toast.success('Version restored');
            } else {
                toast.error(result.error || 'Failed to restore');
            }
        } catch (error) {
            toast.error('Failed to restore version');
        }
    };

    // Duplicate current as new version
    const handleDuplicateVersion = async () => {
        if (!currentVersion) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/characters/versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId,
                    projectId,
                    userId,
                    characterData: currentVersion.characterData,
                    versionName: `${currentVersion.versionName} (copy)`,
                    generatedBy: 'duplicate',
                    setAsCurrent: false,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Duplicated as "${result.version.versionName}"`);
                fetchVersions();
            }
        } catch (error) {
            toast.error('Failed to duplicate');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading versions...
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${compact ? '' : 'p-2 bg-gray-50 rounded-lg'}`}>
            <History className="h-4 w-4 text-gray-400" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                        <span className="text-xs font-medium">
                            {currentVersion?.versionName || 'No versions'}
                        </span>
                        {currentVersion && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                v{currentVersion.versionNumber}
                            </Badge>
                        )}
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 max-h-[400px] overflow-y-auto">
                    {/* Active versions */}
                    <DropdownMenuLabel className="text-xs text-gray-500">
                        Active Versions ({versions.length})
                    </DropdownMenuLabel>

                    {versions.length === 0 ? (
                        <div className="px-2 py-3 text-center text-gray-400 text-sm">
                            No versions saved yet
                        </div>
                    ) : (
                        versions.map(version => (
                            <DropdownMenuItem
                                key={version.id}
                                className="flex items-center justify-between px-2 py-2 group"
                                onSelect={(e) => {
                                    if (editingId === version.id) {
                                        e.preventDefault();
                                        return;
                                    }
                                    if (!version.isCurrent) {
                                        handleActivateVersion(version.id);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {version.isCurrent && (
                                        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    )}
                                    {editingId === version.id ? (
                                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-6 text-xs"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleRenameVersion(version.id)}
                                                className="p-1 rounded bg-green-500 text-white"
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1 rounded bg-gray-400 text-white"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`text-sm truncate ${version.isCurrent ? 'font-medium' : ''}`}>
                                                {version.versionName || `Version ${version.versionNumber}`}
                                            </span>
                                            {version.generatedBy === 'ai' && (
                                                <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                            )}
                                        </>
                                    )}
                                </div>
                                {editingId !== version.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(version.id);
                                                setEditName(version.versionName || '');
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Pencil className="h-3 w-3 text-gray-400" />
                                        </button>
                                        {!version.isCurrent && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteVersion(version.id);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 className="h-3 w-3 text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}

                    <DropdownMenuSeparator />

                    {/* Actions */}
                    <DropdownMenuItem
                        onSelect={() => handleSaveNewVersion()}
                        disabled={isSaving}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Save Current as New Version
                    </DropdownMenuItem>

                    {currentVersion && (
                        <DropdownMenuItem
                            onSelect={handleDuplicateVersion}
                            disabled={isSaving}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Current Version
                        </DropdownMenuItem>
                    )}

                    {/* Deleted versions section */}
                    {deletedVersions.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setShowDeleted(!showDeleted);
                                }}
                                className="text-gray-500"
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                {showDeleted ? 'Hide' : 'Show'} Deleted ({deletedVersions.length})
                            </DropdownMenuItem>

                            {showDeleted && (
                                <>
                                    <DropdownMenuLabel className="text-xs text-red-400">
                                        Deleted Versions
                                    </DropdownMenuLabel>
                                    {deletedVersions.map(version => (
                                        <DropdownMenuItem
                                            key={version.id}
                                            className="flex items-center justify-between px-2 py-2 opacity-60 group"
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Trash2 className="h-3 w-3 text-red-400 flex-shrink-0" />
                                                <span className="text-sm truncate line-through">
                                                    {version.versionName || `Version ${version.versionNumber}`}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestoreVersion(version.id);
                                                }}
                                                className="p-1.5 hover:bg-green-100 rounded flex items-center gap-1 text-green-600 text-xs"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Restore
                                            </button>
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick save button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSaveNewVersion()}
                disabled={isSaving}
                className="h-8 text-xs"
            >
                {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Plus className="h-3 w-3" />
                )}
                <span className="ml-1">Save Version</span>
            </Button>
        </div>
    );
}
