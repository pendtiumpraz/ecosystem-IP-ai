'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FileText, Film, Wand2, Loader2, RefreshCw, ChevronLeft, ChevronRight,
    Clock, Save, History, Plus, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/sweetalert';
import { ScenePlot, SceneScriptVersion } from '@/types/storyboard';

interface ScriptViewProps {
    projectId: string;
    userId: string;
    scenes: ScenePlot[];
    onRefresh?: () => void;
}

interface ScriptStats {
    wordCount: number;
    dialogueCount: number;
    actionCount: number;
    estimatedDuration: number;
}

export function ScriptView({
    projectId,
    userId,
    scenes,
    onRefresh
}: ScriptViewProps) {
    const [selectedSceneId, setSelectedSceneId] = useState<string>('');
    const [scriptVersions, setScriptVersions] = useState<SceneScriptVersion[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('');
    const [scriptContent, setScriptContent] = useState<string>('');
    const [isEdited, setIsEdited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Get selected scene
    const selectedScene = scenes.find(s => s.id === selectedSceneId);
    const currentVersion = scriptVersions.find(v => v.id === selectedVersionId);

    // Calculate stats
    const stats: ScriptStats = {
        wordCount: scriptContent.split(/\s+/).filter(Boolean).length,
        dialogueCount: (scriptContent.match(/^[A-Z][A-Z\s]+$/gm) || []).length,
        actionCount: scriptContent.split('\n\n').filter(p => p.trim() && !p.match(/^[A-Z][A-Z\s]+$/)).length,
        estimatedDuration: Math.ceil(scriptContent.split(/\s+/).length / 150) // ~150 words per minute
    };

    // Load script versions for selected scene
    const loadScriptVersions = useCallback(async () => {
        if (!selectedSceneId) {
            setScriptVersions([]);
            setScriptContent('');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/scene-plots/${selectedSceneId}`);
            if (res.ok) {
                const data = await res.json();
                const versions = data.scene?.script_versions || [];
                setScriptVersions(versions);

                // Select active version or latest
                const activeVersion = versions.find((v: SceneScriptVersion) => v.is_active);
                if (activeVersion) {
                    setSelectedVersionId(activeVersion.id);
                    setScriptContent(activeVersion.script_content || '');
                } else if (versions.length > 0) {
                    setSelectedVersionId(versions[0].id);
                    setScriptContent(versions[0].script_content || '');
                } else {
                    setSelectedVersionId('');
                    setScriptContent('');
                }
                setIsEdited(false);
            }
        } catch (error) {
            console.error('Error loading script versions:', error);
            toast.error('Failed to load script');
        } finally {
            setIsLoading(false);
        }
    }, [selectedSceneId]);

    useEffect(() => {
        loadScriptVersions();
    }, [loadScriptVersions]);

    // Auto-select first scene with plot if none selected
    useEffect(() => {
        if (!selectedSceneId && scenes.length > 0) {
            const sceneWithShots = scenes.find(s => s.status === 'shot_listed' || s.status === 'scripted' || s.status === 'complete');
            if (sceneWithShots) {
                setSelectedSceneId(sceneWithShots.id);
            } else {
                const sceneWithPlot = scenes.find(s => s.status !== 'empty');
                if (sceneWithPlot) {
                    setSelectedSceneId(sceneWithPlot.id);
                } else {
                    setSelectedSceneId(scenes[0].id);
                }
            }
        }
    }, [scenes, selectedSceneId]);

    // Handle version change
    const handleVersionChange = (versionId: string) => {
        const version = scriptVersions.find(v => v.id === versionId);
        if (version) {
            setSelectedVersionId(versionId);
            setScriptContent(version.script_content || '');
            setIsEdited(false);
        }
    };

    // Navigate to previous/next scene
    const navigateScene = (direction: 'prev' | 'next') => {
        const currentIndex = scenes.findIndex(s => s.id === selectedSceneId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < scenes.length) {
            setSelectedSceneId(scenes[newIndex].id);
        }
    };

    // Generate script for selected scene
    const handleGenerateScript = async () => {
        if (!selectedSceneId || !selectedScene?.synopsis) {
            toast.warning('Scene needs a plot first');
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch(`/api/scene-plots/${selectedSceneId}/generate-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate script');
            }

            const result = await res.json();
            toast.success(`Script generated (v${result.versionNumber})!`);

            await loadScriptVersions();
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Save as new version
    const handleSaveAsNewVersion = async () => {
        if (!selectedSceneId || !scriptContent.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/scene-scripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene_id: selectedSceneId,
                    script_content: scriptContent,
                    generation_context_hash: 'manual-edit',
                    is_active: true
                })
            });

            if (!res.ok) throw new Error('Failed to save script');

            toast.success('Script saved as new version!');
            await loadScriptVersions();
            setIsEdited(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Save to current version (update)
    const handleSaveCurrentVersion = async () => {
        if (!selectedVersionId || !scriptContent.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/scene-scripts/${selectedVersionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script_content: scriptContent
                })
            });

            if (!res.ok) throw new Error('Failed to update script');

            toast.success('Script updated!');
            await loadScriptVersions();
            setIsEdited(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Set active version
    const handleSetActiveVersion = async (versionId: string) => {
        try {
            const res = await fetch(`/api/scene-scripts/${versionId}/activate`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to set active version');

            toast.success('Version activated!');
            await loadScriptVersions();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const currentSceneIndex = scenes.findIndex(s => s.id === selectedSceneId);
    const hasPrev = currentSceneIndex > 0;
    const hasNext = currentSceneIndex < scenes.length - 1;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.wordCount}</div>
                    <div className="text-sm text-white/60">Words</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.dialogueCount}</div>
                    <div className="text-sm text-white/60">Dialogue Lines</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-orange-400">{scriptVersions.length}</div>
                    <div className="text-sm text-white/60">Versions</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-amber-400">{stats.estimatedDuration}m</div>
                    <div className="text-sm text-white/60">Est. Duration</div>
                </Card>
            </div>

            {/* Scene Selector & Actions */}
            <Card className="bg-gradient-to-r from-green-900/30 to-orange-900/30 border-green-500/30 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigateScene('prev')}
                            disabled={!hasPrev}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={() => navigateScene('next')}
                            disabled={!hasNext}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Scene Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <Select value={selectedSceneId} onValueChange={setSelectedSceneId}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select a scene..." />
                            </SelectTrigger>
                            <SelectContent>
                                {scenes.map(scene => (
                                    <SelectItem key={scene.id} value={scene.id}>
                                        <div className="flex items-center gap-2">
                                            <span>Scene {scene.scene_number}</span>
                                            {scene.title && <span className="text-white/60">- {scene.title}</span>}
                                            {(scene.status === 'scripted' || scene.status === 'complete') && (
                                                <Badge className="bg-green-500 text-xs ml-2">Has Script</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Version Selector */}
                    {scriptVersions.length > 0 && (
                        <Select value={selectedVersionId} onValueChange={handleVersionChange}>
                            <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Version..." />
                            </SelectTrigger>
                            <SelectContent>
                                {scriptVersions.map(version => (
                                    <SelectItem key={version.id} value={version.id}>
                                        <div className="flex items-center gap-2">
                                            <span>v{version.version_number}</span>
                                            {version.is_active && <Badge className="bg-green-500 text-xs">Active</Badge>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            onClick={handleGenerateScript}
                            disabled={isGenerating || !selectedScene?.synopsis}
                            className="bg-gradient-to-r from-green-600 to-orange-600"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Script
                                </>
                            )}
                        </Button>

                        {isEdited && (
                            <>
                                <Button
                                    onClick={handleSaveCurrentVersion}
                                    disabled={isSaving}
                                    variant="outline"
                                    className="border-green-500/50 text-green-400"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button
                                    onClick={handleSaveAsNewVersion}
                                    disabled={isSaving}
                                    variant="outline"
                                    className="border-orange-500/50 text-orange-400"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Save as New Version
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={loadScriptVersions}
                            variant="ghost"
                            size="icon"
                            className="text-white/60"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Script Editor */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                    <span className="ml-3 text-white/60">Loading script...</span>
                </div>
            ) : scriptVersions.length === 0 ? (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                    <FileText className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Script Yet</h3>
                    <p className="text-white/60 mb-4 max-w-md mx-auto">
                        {selectedScene?.synopsis
                            ? 'Generate a screenplay script for this scene.'
                            : 'This scene needs a plot synopsis first.'}
                    </p>
                    {selectedScene?.synopsis && (
                        <Button
                            onClick={handleGenerateScript}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-green-600 to-orange-600"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Script
                        </Button>
                    )}
                </Card>
            ) : (
                <Card className="bg-white/5 border-white/10 overflow-hidden">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-400" />
                            <span className="font-medium text-white">
                                Scene {selectedScene?.scene_number} Script
                            </span>
                            {currentVersion && (
                                <Badge className={currentVersion.is_active ? 'bg-green-500' : 'bg-white/20'}>
                                    v{currentVersion.version_number}
                                    {currentVersion.is_active && ' (Active)'}
                                </Badge>
                            )}
                            {isEdited && (
                                <Badge className="bg-amber-500 animate-pulse">Unsaved</Badge>
                            )}
                        </div>
                        {currentVersion && !currentVersion.is_active && (
                            <Button
                                onClick={() => handleSetActiveVersion(currentVersion.id)}
                                variant="outline"
                                size="sm"
                                className="border-green-500/50 text-green-400"
                            >
                                Set as Active
                            </Button>
                        )}
                    </div>

                    {/* Script Content */}
                    <div className="p-4">
                        <Textarea
                            value={scriptContent}
                            onChange={(e) => {
                                setScriptContent(e.target.value);
                                setIsEdited(true);
                            }}
                            placeholder="Script content..."
                            className="bg-slate-950 border-white/10 text-white font-mono text-sm min-h-[400px] resize-y"
                            style={{ lineHeight: '1.8' }}
                        />
                    </div>

                    {/* Editor Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                        <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{stats.wordCount} words</span>
                            <span>•</span>
                            <span>{stats.dialogueCount} dialogues</span>
                            <span>•</span>
                            <span>~{stats.estimatedDuration} min reading</span>
                        </div>
                        <div className="text-sm text-white/40">
                            Screenplay Format (monospace)
                        </div>
                    </div>
                </Card>
            )}

            {/* Version History */}
            {scriptVersions.length > 1 && (
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-white/60" />
                        <h4 className="text-sm font-medium text-white/80">Version History</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {scriptVersions.map(version => (
                            <Button
                                key={version.id}
                                onClick={() => handleVersionChange(version.id)}
                                variant={selectedVersionId === version.id ? 'default' : 'outline'}
                                size="sm"
                                className={selectedVersionId === version.id
                                    ? 'bg-green-600'
                                    : 'border-white/20 text-white/70'}
                            >
                                v{version.version_number}
                                {version.is_active && ' ✓'}
                            </Button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
