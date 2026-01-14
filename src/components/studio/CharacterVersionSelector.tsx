'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    History, Check, Pencil, Trash2, Plus, ChevronDown,
    Loader2, X, Sparkles, Copy, RotateCcw, Archive, Save, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
    const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');

    // Search and lazy load
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState(5);
    const ITEMS_PER_PAGE = 5;
    const MAX_HEIGHT = 320; // Max height in pixels

    // Filter versions by search
    const filteredVersions = useMemo(() => {
        if (!searchTerm) return versions;
        return versions.filter(v =>
            (v.versionName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            `v${v.versionNumber}`.includes(searchTerm)
        );
    }, [versions, searchTerm]);

    // Display limited versions
    const displayedVersions = useMemo(() =>
        filteredVersions.slice(0, displayLimit),
        [filteredVersions, displayLimit]);

    const hasMore = filteredVersions.length > displayLimit;

    // Reset display limit on search
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setDisplayLimit(ITEMS_PER_PAGE);
    };

    // Load more
    const loadMore = () => {
        setDisplayLimit(prev => prev + ITEMS_PER_PAGE);
    };

    // Auto-create original version if none exists
    const createOriginalVersion = async () => {
        try {
            const response = await fetch('/api/characters/versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId,
                    projectId,
                    userId,
                    characterData: currentCharacterData,
                    versionName: 'Original',
                    generatedBy: 'manual',
                    setAsCurrent: true,
                }),
            });

            const result = await response.json();
            if (result.success) {
                return result.version;
            }
        } catch (error) {
            console.error('Failed to create original version:', error);
        }
        return null;
    };

    // Fetch versions
    const fetchVersions = async () => {
        try {
            const response = await fetch(
                `/api/characters/versions?characterId=${characterId}&userId=${userId}&includeDeleted=true`
            );
            const data = await response.json();

            if (data.success) {
                // If no versions exist, auto-create Original
                if (data.versions.length === 0 && data.deletedVersions.length === 0) {
                    const originalVersion = await createOriginalVersion();
                    if (originalVersion) {
                        setVersions([originalVersion]);
                        setCurrentVersion(originalVersion);
                    }
                } else {
                    setVersions(data.versions);
                    setDeletedVersions(data.deletedVersions || []);
                    setCurrentVersion(data.currentVersion || null);
                }
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

    // Save current state as new version (name is required)
    const handleSaveNewVersion = async () => {
        if (!newVersionName.trim()) {
            toast.error('Please enter a version name');
            return;
        }

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
                    versionName: newVersionName.trim(),
                    generatedBy: 'manual',
                    setAsCurrent: true,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Saved as "${result.version.versionName}"`);
                setShowNewVersionDialog(false);
                setNewVersionName('');
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

    // Delete version (soft delete - can delete current, will auto-switch)
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

                // If there's a new current version, apply its data
                if (result.newCurrentVersion) {
                    setCurrentVersion(result.newCurrentVersion);
                    onVersionChange?.(result.newCurrentVersion.characterData);
                    toast.success(result.message);
                } else {
                    toast.success('Version deleted');
                }

                // Refresh to get updated state
                fetchVersions();
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
                <DropdownMenuContent align="start" className="w-80" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
                    {/* Search Input */}
                    {versions.length > 3 && (
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    placeholder="Search versions..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="h-8 pl-7 text-xs"
                                />
                                {searchTerm && (
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => handleSearchChange('')}
                                    >
                                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active versions */}
                    <DropdownMenuLabel className="text-xs text-gray-500">
                        {searchTerm
                            ? `${filteredVersions.length} of ${versions.length} versions`
                            : `Active Versions (${versions.length})`
                        }
                    </DropdownMenuLabel>

                    <div className="overflow-y-auto" style={{ maxHeight: `${MAX_HEIGHT - 120}px` }}>
                        {versions.length === 0 ? (
                            <div className="px-2 py-3 text-center text-gray-400 text-sm">
                                No versions saved yet
                            </div>
                        ) : filteredVersions.length === 0 ? (
                            <div className="px-2 py-3 text-center text-gray-400 text-sm">
                                No versions match "{searchTerm}"
                            </div>
                        ) : (
                            <>
                                {displayedVersions.map(version => (
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteVersion(version.id);
                                                    }}
                                                    className="p-1 hover:bg-red-100 rounded"
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-400" />
                                                </button>
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                ))}

                                {/* Load More */}
                                {hasMore && (
                                    <div className="p-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                loadMore();
                                            }}
                                        >
                                            Load more ({filteredVersions.length - displayLimit} remaining)
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <DropdownMenuSeparator />

                    {/* Actions */}
                    <DropdownMenuItem
                        onSelect={() => setShowNewVersionDialog(true)}
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
                onClick={() => setShowNewVersionDialog(true)}
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

            {/* New Version Dialog */}
            <Dialog open={showNewVersionDialog} onOpenChange={setShowNewVersionDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5 text-orange-500" />
                            Save New Version
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="versionName" className="text-sm font-medium">
                                Version Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="versionName"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                placeholder="e.g., Initial Design, Battle Armor, Casual Look"
                                className="w-full"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                Give a descriptive name to easily identify this version later.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowNewVersionDialog(false);
                                setNewVersionName('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveNewVersion}
                            disabled={isSaving || !newVersionName.trim()}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Version
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
