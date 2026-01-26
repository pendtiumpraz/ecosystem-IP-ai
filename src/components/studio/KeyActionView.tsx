'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Zap, Check, X, AlertCircle, Loader2, Wand2,
    ChevronDown, ChevronRight, Eye, Edit3, RefreshCw,
    Film, Users, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/lib/sweetalert';

interface KeyAction {
    id: string;
    index: number;
    description: string | null;
    charactersInvolved: string[];
    hasPrompt: boolean;
    hasImage: boolean;
}

interface BeatWithKeyActions {
    beatKey: string;
    beatLabel: string;
    beatContent: string | null;
    beatIndex: number;
    keyActions: KeyAction[];
}

interface KeyActionViewProps {
    projectId: string;
    storyVersionId: string;
    userId: string;
    beats: { key: string; label: string; desc: string; act: number }[];
    beatContents: Record<string, string>;
    onRefresh?: () => void;
}

export function KeyActionView({
    projectId,
    storyVersionId,
    userId,
    beats,
    beatContents,
    onRefresh
}: KeyActionViewProps) {
    const [keyActionsByBeat, setKeyActionsByBeat] = useState<Record<string, BeatWithKeyActions>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0, beatLabel: '' });
    const [preference, setPreference] = useState('');
    const [expandedBeats, setExpandedBeats] = useState<Set<string>>(new Set());
    const [hasMoodboard, setHasMoodboard] = useState(false);
    const [moodboardId, setMoodboardId] = useState<string | null>(null);

    // Load key actions from API
    const loadKeyActions = useCallback(async () => {
        if (!projectId || !storyVersionId) return;

        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/creator/projects/${projectId}/story-key-actions?storyVersionId=${storyVersionId}`
            );
            if (res.ok) {
                const data = await res.json();
                setHasMoodboard(data.hasMoodboard);
                setMoodboardId(data.moodboardId || null);

                if (data.keyActionsByBeat) {
                    setKeyActionsByBeat(data.keyActionsByBeat);
                }
            }
        } catch (error) {
            console.error('Error loading key actions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, storyVersionId]);

    useEffect(() => {
        loadKeyActions();
    }, [loadKeyActions]);

    // Calculate stats
    const stats = {
        totalBeats: beats.length,
        beatsWithContent: Object.keys(beatContents).filter(k => beatContents[k]?.trim()).length,
        totalKeyActions: Object.values(keyActionsByBeat).reduce(
            (sum, b) => sum + b.keyActions.length, 0
        ),
        keyActionsWithDesc: Object.values(keyActionsByBeat).reduce(
            (sum, b) => sum + b.keyActions.filter(ka => ka.description).length, 0
        ),
        keyActionsWithImage: Object.values(keyActionsByBeat).reduce(
            (sum, b) => sum + b.keyActions.filter(ka => ka.hasImage).length, 0
        )
    };

    const completionPercent = stats.totalKeyActions > 0
        ? Math.round((stats.keyActionsWithDesc / stats.totalKeyActions) * 100)
        : 0;

    // Toggle beat expansion
    const toggleBeat = (beatKey: string) => {
        const newExpanded = new Set(expandedBeats);
        if (newExpanded.has(beatKey)) {
            newExpanded.delete(beatKey);
        } else {
            newExpanded.add(beatKey);
        }
        setExpandedBeats(newExpanded);
    };

    // Expand/collapse all
    const expandAll = () => {
        setExpandedBeats(new Set(beats.map(b => b.key)));
    };

    const collapseAll = () => {
        setExpandedBeats(new Set());
    };

    // Generate all key actions
    const handleGenerateAll = async () => {
        if (!hasMoodboard) {
            toast.warning('Please create a moodboard first to generate key actions.');
            return;
        }

        const beatsToGenerate = beats.filter(b => beatContents[b.key]?.trim());
        if (beatsToGenerate.length === 0) {
            toast.warning('Please fill in beat content before generating key actions.');
            return;
        }

        setIsGenerating(true);
        setGenerateProgress({ current: 0, total: beatsToGenerate.length, beatLabel: '' });

        try {
            for (let i = 0; i < beatsToGenerate.length; i++) {
                const beat = beatsToGenerate[i];
                setGenerateProgress({
                    current: i + 1,
                    total: beatsToGenerate.length,
                    beatLabel: beat.label
                });

                // Generate key actions for this beat
                const res = await fetch('/api/ai/generate-key-actions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        moodboardId,
                        beatKey: beat.key,
                        beatLabel: beat.label,
                        beatContent: beatContents[beat.key],
                        preference,
                        userId
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    console.error(`Error generating for ${beat.label}:`, error);
                }

                // Small delay between requests
                await new Promise(r => setTimeout(r, 500));
            }

            toast.success(`Generated key actions for ${beatsToGenerate.length} beats!`);

            // Reload data
            await loadKeyActions();
            onRefresh?.();
        } catch (error: any) {
            toast.error(`Generation failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setGenerateProgress({ current: 0, total: 0, beatLabel: '' });
        }
    };

    // Status badge for beat
    const getBeatStatus = (beatKey: string) => {
        const beatData = keyActionsByBeat[beatKey];
        if (!beatData || !beatData.keyActions.length) {
            return { status: 'empty', color: 'bg-gray-500', label: 'No Key Actions' };
        }

        const withDesc = beatData.keyActions.filter(ka => ka.description).length;
        const total = beatData.keyActions.length;

        if (withDesc === total) {
            return { status: 'complete', color: 'bg-green-500', label: `${withDesc}/${total} Complete` };
        } else if (withDesc > 0) {
            return { status: 'partial', color: 'bg-amber-500', label: `${withDesc}/${total} Complete` };
        }
        return { status: 'empty', color: 'bg-gray-500', label: `0/${total}` };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="ml-3 text-white/60">Loading key actions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{stats.totalBeats}</div>
                    <div className="text-sm text-white/60">Total Beats</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-cyan-400">{stats.beatsWithContent}</div>
                    <div className="text-sm text-white/60">With Content</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.keyActionsWithDesc}</div>
                    <div className="text-sm text-white/60">Key Actions Ready</div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.keyActionsWithImage}</div>
                    <div className="text-sm text-white/60">With Images</div>
                </Card>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Key Action Completion</span>
                    <span className="text-cyan-400 font-bold">{completionPercent}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>

            {/* Preference Input & Generate Button */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30 p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/80 mb-2">
                            <Sparkles className="w-4 h-4 inline mr-2 text-purple-400" />
                            Generation Preference (optional)
                        </label>
                        <Textarea
                            value={preference}
                            onChange={(e) => setPreference(e.target.value)}
                            placeholder="e.g., Focus on visual moments, cinematic actions, emotional beats..."
                            className="bg-white/5 border-white/20 text-white min-h-[60px]"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleGenerateAll}
                            disabled={isGenerating || !hasMoodboard}
                            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating {generateProgress.current}/{generateProgress.total}...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate All Key Actions
                                </>
                            )}
                        </Button>

                        {!hasMoodboard && (
                            <span className="text-amber-400 text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Create a moodboard first
                            </span>
                        )}
                    </div>

                    {isGenerating && (
                        <div className="bg-black/30 rounded-lg p-3">
                            <div className="text-sm text-white/80">
                                Processing: <span className="text-cyan-400">{generateProgress.beatLabel}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${(generateProgress.current / generateProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAll}
                        className="border-white/20 text-white/70 hover:bg-white/10"
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAll}
                        className="border-white/20 text-white/70 hover:bg-white/10"
                    >
                        Collapse All
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadKeyActions}
                    className="text-white/60 hover:text-white"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Beats List */}
            <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                    {beats.map((beat, idx) => {
                        const beatData = keyActionsByBeat[beat.key];
                        const status = getBeatStatus(beat.key);
                        const isExpanded = expandedBeats.has(beat.key);
                        const hasContent = beatContents[beat.key]?.trim();

                        return (
                            <Card
                                key={beat.key}
                                className={`bg-white/5 border transition-all ${isExpanded ? 'border-cyan-500/50' : 'border-white/10'
                                    }`}
                            >
                                {/* Beat Header */}
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                                    onClick={() => toggleBeat(beat.key)}
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-white/50" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-white/50" />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    {idx + 1}. {beat.label}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-white/20"
                                                >
                                                    Act {beat.act}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-white/50 mt-0.5">
                                                {hasContent ? (
                                                    beatContents[beat.key]?.slice(0, 80) + '...'
                                                ) : (
                                                    <span className="text-amber-400/60 italic">No content yet</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={`${status.color} text-white`}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-4 bg-black/20">
                                        {beatData?.keyActions?.length > 0 ? (
                                            <div className="space-y-3">
                                                {beatData.keyActions.map((ka, kaIdx) => (
                                                    <div
                                                        key={ka.id}
                                                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                                                    >
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                                                            {kaIdx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white/90">
                                                                {ka.description || (
                                                                    <span className="text-white/40 italic">
                                                                        No description generated yet
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {ka.charactersInvolved?.length > 0 && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Users className="w-3 h-3 text-purple-400" />
                                                                    <span className="text-sm text-purple-400">
                                                                        {ka.charactersInvolved.join(', ')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {ka.hasPrompt && (
                                                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                                                    Prompt
                                                                </Badge>
                                                            )}
                                                            {ka.hasImage && (
                                                                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                                                    Image
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-white/40">
                                                <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p>No key actions for this beat yet</p>
                                                <p className="text-sm mt-1">
                                                    Click "Generate All Key Actions" to create them
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
