'use client';

import { useState } from 'react';
import {
    BookOpen, Target, Zap, Mountain, Activity,
    ChevronRight, AlignLeft, Layout, MousePointerClick,
    RefreshCcw, MoveRight, Star, Heart, Skull, Sparkles,
    Users, User, FileText, Layers, Play, Eye, Plus, Loader2, Wand2, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Interfaces
export interface CharacterData {
    id: string;
    name: string;
    role: string;
    archetype?: string;
    imagePoses?: { portrait?: string };
    [key: string]: any;
}

export interface StoryData {
    premise: string;
    synopsis?: string;
    theme: string;
    tone: string;
    genre: string;
    structure: string;
    conflict?: string;

    // Beats
    catBeats: Record<string, string>;
    heroBeats: Record<string, string>;
    harmonBeats: Record<string, string>;

    // Character assignments per beat
    beatCharacters?: Record<string, string[]>;

    // Tension levels for Arc View graph (1-100 per beat)
    tensionLevels?: Record<string, number>;

    // Want/Need Matrix
    wantNeedMatrix?: {
        want?: { external?: string; known?: string; specific?: string; achieved?: string };
        need?: { internal?: string; unknown?: string; universal?: string; achieved?: string };
    };

    [key: string]: any;
}

interface StoryItem {
    id: string;
    name: string;
}

interface StoryArcStudioProps {
    story: StoryData;
    characters?: CharacterData[];
    projectDescription?: string;
    // Multiple stories support
    stories?: StoryItem[];
    selectedStoryId?: string;
    onSelectStory?: (storyId: string) => void;
    onNewStory?: () => void;
    // Updates
    onUpdate: (updates: Partial<StoryData>) => void;
    onGenerate?: (field: string) => void;
    onGeneratePremise?: () => void;
    isGenerating?: boolean;
    isGeneratingPremise?: boolean;
}

// BEAT DEFINITIONS
const STC_BEATS = [
    { key: 'openingImage', label: 'Opening Image', desc: 'A snapshot of the hero\'s world before the adventure.', act: 1 },
    { key: 'themeStated', label: 'Theme Stated', desc: 'What the story is really about.', act: 1 },
    { key: 'setup', label: 'Set-up', desc: 'Expand on the "before" world.', act: 1 },
    { key: 'catalyst', label: 'Catalyst', desc: 'The life-changing event.', act: 1 },
    { key: 'debate', label: 'Debate', desc: 'The hero resists the call.', act: 1 },
    { key: 'breakIntoTwo', label: 'Break into 2', desc: 'The hero enters the new world.', act: 2 },
    { key: 'bStory', label: 'B Story', desc: 'The love story or helper story.', act: 2 },
    { key: 'funAndGames', label: 'Fun and Games', desc: 'The promise of the premise.', act: 2 },
    { key: 'midpoint', label: 'Midpoint', desc: 'False victory or false defeat.', act: 2 },
    { key: 'badGuysCloseIn', label: 'Bad Guys Close In', desc: 'The stakes get higher.', act: 2 },
    { key: 'allIsLost', label: 'All is Lost', desc: 'Rock bottom.', act: 2 },
    { key: 'darkNightOfTheSoul', label: 'Dark Night of the Soul', desc: 'The hero reflects and gathers strength.', act: 2 },
    { key: 'breakIntoThree', label: 'Break into 3', desc: 'The solution is found.', act: 3 },
    { key: 'finale', label: 'Finale', desc: 'The final showdown.', act: 3 },
    { key: 'finalImage', label: 'Final Image', desc: 'Change has occurred.', act: 3 },
];

const HERO_BEATS = [
    { key: 'ordinaryWorld', label: 'Ordinary World', desc: 'The hero in their normal life.', act: 1 },
    { key: 'callToAdventure', label: 'Call to Adventure', desc: 'Something shakes up the situation.', act: 1 },
    { key: 'refusalOfCall', label: 'Refusal of Call', desc: 'The hero fears the unknown.', act: 1 },
    { key: 'meetingMentor', label: 'Meeting the Mentor', desc: 'Hero gets supplies or advice.', act: 1 },
    { key: 'crossingThreshold', label: 'Crossing Threshold', desc: 'Committing to the journey.', act: 2 },
    { key: 'testsAlliesEnemies', label: 'Tests, Allies, Enemies', desc: 'Exploring the new world.', act: 2 },
    { key: 'approachCave', label: 'Approach to Inmost Cave', desc: 'Preparing for the main danger.', act: 2 },
    { key: 'ordeal', label: 'The Ordeal', desc: 'The central crisis.', act: 2 },
    { key: 'reward', label: 'The Reward', desc: 'Seizing the sword.', act: 2 },
    { key: 'roadBack', label: 'The Road Back', desc: 'Recommitment to complete the journey.', act: 3 },
    { key: 'resurrection', label: 'Resurrection', desc: 'Final exam where hero is tested once more.', act: 3 },
    { key: 'returnElixir', label: 'Return with Elixir', desc: 'Hero returns home changed.', act: 3 },
];

type ViewMode = 'arc' | 'script' | 'beats';

export function StoryArcStudio({
    story,
    characters = [],
    projectDescription,
    stories = [],
    selectedStoryId,
    onSelectStory,
    onNewStory,
    onUpdate,
    onGenerate,
    onGeneratePremise,
    isGenerating,
    isGeneratingPremise
}: StoryArcStudioProps) {
    const [activeBeat, setActiveBeat] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('arc');
    const [isEditingTension, setIsEditingTension] = useState(false);

    const currentStructure = story.structure || 'Save the Cat';

    const getBeatsConfig = () => {
        switch (currentStructure) {
            case 'The Hero\'s Journey': return HERO_BEATS;
            case 'Dan Harmon Story Circle': return [];
            default: return STC_BEATS;
        }
    };

    const beats = getBeatsConfig();
    const beatData = currentStructure === 'The Hero\'s Journey' ? (story.heroBeats || {}) : (story.catBeats || {});
    const beatCharacters = story.beatCharacters || {};

    const updateBeat = (key: string, value: string) => {
        const fieldName = currentStructure === 'The Hero\'s Journey' ? 'heroBeats' : 'catBeats';
        onUpdate({
            [fieldName]: {
                ...beatData,
                [key]: value
            }
        });
    };

    const toggleCharacterInBeat = (beatKey: string, charId: string) => {
        const current = beatCharacters[beatKey] || [];
        const updated = current.includes(charId)
            ? current.filter(id => id !== charId)
            : [...current, charId];
        onUpdate({
            beatCharacters: {
                ...beatCharacters,
                [beatKey]: updated
            }
        });
    };

    const getActColor = (act: number) => {
        switch (act) {
            case 1: return 'from-blue-500 to-cyan-500';
            case 2: return 'from-purple-500 to-pink-500';
            case 3: return 'from-emerald-500 to-teal-500';
            default: return 'from-slate-500 to-gray-500';
        }
    };

    // Generate full script from beats
    const generateFullScript = () => {
        return beats.map((beat, idx) => {
            const content = beatData[beat.key] || '';
            const chars = (beatCharacters[beat.key] || [])
                .map(id => characters.find(c => c.id === id)?.name)
                .filter(Boolean);
            return `## ${idx + 1}. ${beat.label}\n${chars.length ? `*Characters: ${chars.join(', ')}*\n` : ''}${content || '*[Not written yet]*'}`;
        }).join('\n\n---\n\n');
    };

    return (
        <div className="flex flex-col gap-2 md:gap-4 relative">

            {/* TOP TOOLBAR - Responsive */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-3 rounded-xl glass-panel">

                {/* Left: View Mode Switcher */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'arc' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('arc')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'arc' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Activity className="h-3 w-3" /> Arc View
                        </Button>
                        <Button
                            variant={viewMode === 'beats' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('beats')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'beats' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Layers className="h-3 w-3" /> Beat Cards
                        </Button>
                        <Button
                            variant={viewMode === 'script' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('script')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'script' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <FileText className="h-3 w-3" /> Full Script
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    {/* Story Selector - Multiple stories per project */}
                    {stories.length > 0 && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-md">
                                    <BookOpen className="h-4 w-4 text-purple-500" />
                                </div>
                                <div className="flex flex-col">
                                    <Label className="text-[10px] text-gray-500 font-bold uppercase">Story</Label>
                                    <Select value={selectedStoryId} onValueChange={(v) => onSelectStory?.(v)}>
                                        <SelectTrigger className="h-6 w-[140px] text-xs border-0 bg-transparent px-1 focus:ring-0 text-gray-900 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200">
                                            {stories.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-xs">
                                                    {s.name || 'Untitled Story'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onNewStory}
                                className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                New Story
                            </Button>

                            <div className="h-8 w-px bg-gray-200" />
                        </>
                    )}

                    {/* Character Count */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-md">
                            <Users className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-[10px] text-gray-500 font-bold uppercase">Cast</Label>
                            <span className="text-xs text-gray-900 font-bold">{characters.length} Characters</span>
                        </div>
                    </div>
                </div>

                {/* Right: Generate Button */}
                <div className="flex items-center gap-3">
                    <Select value={currentStructure} onValueChange={(v) => onUpdate({ structure: v })}>
                        <SelectTrigger className="h-8 w-[180px] text-xs bg-white border-gray-200 text-gray-900 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                            <SelectItem value="Save the Cat">Save the Cat</SelectItem>
                            <SelectItem value="The Hero's Journey">Hero's Journey</SelectItem>
                            <SelectItem value="Dan Harmon Story Circle">Dan Harmon</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={() => onGenerate?.('synopsis')}
                        disabled={isGenerating || !story.premise || characters.length === 0}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-8 px-4 text-xs font-bold shadow-md shadow-indigo-200"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating Story...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Generate Story
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* STORY DNA PANEL - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 p-2 md:p-4 rounded-xl glass-panel border border-gray-100/50">
                <div className="lg:col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Premise / Logline</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onGeneratePremise}
                            disabled={isGeneratingPremise || characters.length === 0}
                            className="h-6 px-2 text-[10px] text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                            {isGeneratingPremise ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-3 w-3 mr-1" />
                                    Generate Premise
                                </>
                            )}
                        </Button>
                    </div>
                    <Textarea
                        value={story.premise || ''}
                        onChange={(e) => onUpdate({ premise: e.target.value })}
                        className="h-20 bg-white border-gray-200 text-gray-800 text-sm resize-none focus:ring-orange-200 focus:border-orange-400"
                        placeholder="A young wizard discovers he is the chosen one... (Generate from project & characters!)"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Genre</Label>
                    <Input value={story.genre || ''} onChange={(e) => onUpdate({ genre: e.target.value })} className="h-9 bg-white border-gray-200 text-gray-800 focus:ring-orange-200 focus:border-orange-400" placeholder="Fantasy, Sci-Fi..." />
                    <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mt-2">Theme</Label>
                    <Input value={story.theme || ''} onChange={(e) => onUpdate({ theme: e.target.value })} className="h-9 bg-white border-gray-200 text-gray-800 focus:ring-orange-200 focus:border-orange-400" placeholder="Good vs Evil..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Tone</Label>
                    <Input value={story.tone || ''} onChange={(e) => onUpdate({ tone: e.target.value })} className="h-9 bg-white border-gray-200 text-gray-800 focus:ring-orange-200 focus:border-orange-400" placeholder="Dark, Comedic..." />
                    <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mt-2">Core Conflict</Label>
                    <Input value={story.conflict || ''} onChange={(e) => onUpdate({ conflict: e.target.value })} className="h-9 bg-white border-gray-200 text-gray-800 focus:ring-orange-200 focus:border-orange-400" placeholder="Man vs Machine..." />
                </div>
            </div>

            {/* WANT/NEED MATRIX */}
            {(story.wantNeedMatrix?.want || story.wantNeedMatrix?.need) && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl glass-panel border border-gray-100/50">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                                <Target className="h-3 w-3 text-blue-600" />
                            </div>
                            <Label className="text-[10px] uppercase text-blue-600 font-bold">WANT (External Desire)</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-400 text-[10px]">External:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.want?.external || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Known:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.want?.known || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Specific:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.want?.specific || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Achieved:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.want?.achieved || '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded">
                                <Heart className="h-3 w-3 text-purple-600" />
                            </div>
                            <Label className="text-[10px] uppercase text-purple-600 font-bold">NEED (Internal Growth)</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-400 text-[10px]">Internal:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.need?.internal || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Unknown:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.need?.unknown || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Universal:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.need?.universal || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 text-[10px]">Achieved:</span>
                                <p className="text-gray-700">{story.wantNeedMatrix?.need?.achieved || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN VIEW AREA */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 relative">

                {/* ARC VIEW */}
                {viewMode === 'arc' && (
                    <div className="flex flex-col">
                        {/* Visual Arc */}
                        <div className="relative p-4 md:p-8 flex" style={{ minHeight: '250px' }}>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            {/* Toggle Button - Top Right */}
                            <div className="absolute top-2 right-2 z-20">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingTension(!isEditingTension)}
                                    className={`h-7 text-[10px] gap-1.5 ${isEditingTension ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white'}`}
                                >
                                    {isEditingTension ? (
                                        <>
                                            <Activity className="h-3 w-3" />
                                            Show Curve
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 className="h-3 w-3" />
                                            Edit Tension
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Tension Ruler - Only in Edit Mode */}
                            {isEditingTension && (
                                <div className="relative w-8 md:w-10 h-32 md:h-48 flex flex-col justify-between text-[9px] text-gray-400 pr-2 shrink-0 mt-8">
                                    <span className="text-right">100</span>
                                    <span className="text-right">75</span>
                                    <span className="text-right">50</span>
                                    <span className="text-right">25</span>
                                    <span className="text-right">0</span>
                                </div>
                            )}

                            <div className="flex-1 max-w-5xl h-32 md:h-48 relative z-10 mt-8">
                                {/* Act Markers */}
                                <div className="absolute bottom-0 left-[20%] top-0 border-l border-dashed border-gray-300">
                                    <span className="absolute -top-6 left-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-600 font-bold whitespace-nowrap">ACT 2</span>
                                </div>
                                <div className="absolute bottom-0 left-[75%] top-0 border-l border-dashed border-gray-300">
                                    <span className="absolute -top-6 left-1 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 font-bold whitespace-nowrap">ACT 3</span>
                                </div>

                                {/* CURVE VIEW - Read Only (when NOT editing) */}
                                {!isEditingTension && (
                                    <svg
                                        className="absolute inset-0 w-full h-full overflow-visible"
                                        style={{ padding: '0 10px' }}
                                    >
                                        <defs>
                                            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="50%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>

                                        {/* Smooth Bezier Curve */}
                                        <path
                                            d={(() => {
                                                const defaultHeights = [30, 35, 40, 60, 50, 65, 55, 70, 90, 75, 40, 30, 55, 95, 60];
                                                const points = beats.map((beat, i) => {
                                                    const tension = story.tensionLevels?.[beat.key] || defaultHeights[i % 15];
                                                    const x = beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50;
                                                    const y = 100 - tension;
                                                    return { x, y };
                                                });

                                                if (points.length < 2) return '';

                                                let path = `M ${points[0].x}% ${points[0].y}%`;

                                                for (let i = 0; i < points.length - 1; i++) {
                                                    const p0 = points[Math.max(0, i - 1)];
                                                    const p1 = points[i];
                                                    const p2 = points[i + 1];
                                                    const p3 = points[Math.min(points.length - 1, i + 2)];

                                                    const t = 0.3;
                                                    const cp1x = p1.x + (p2.x - p0.x) * t;
                                                    const cp1y = p1.y + (p2.y - p0.y) * t;
                                                    const cp2x = p2.x - (p3.x - p1.x) * t;
                                                    const cp2y = p2.y - (p3.y - p1.y) * t;

                                                    path += ` C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${p2.x}% ${p2.y}%`;
                                                }

                                                return path;
                                            })()}
                                            fill="none"
                                            stroke="url(#arcGradient)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Beat number labels along bottom */}
                                        {beats.map((beat, i) => {
                                            const x = beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50;
                                            return (
                                                <text
                                                    key={beat.key}
                                                    x={`${x}%`}
                                                    y="100%"
                                                    dy="12"
                                                    textAnchor="middle"
                                                    className="fill-gray-400 text-[8px] font-bold"
                                                >
                                                    {i + 1}
                                                </text>
                                            );
                                        })}
                                    </svg>
                                )}

                                {/* EDIT MODE - Draggable Bars (when editing) */}
                                {isEditingTension && (
                                    <div className="flex items-end justify-between h-full pb-4 relative z-10">
                                        {beats.map((beat, i) => {
                                            const defaultHeights = [30, 35, 40, 60, 50, 65, 55, 70, 90, 75, 40, 30, 55, 95, 60];
                                            const tension = story.tensionLevels?.[beat.key] || defaultHeights[i % 15];
                                            const isActive = activeBeat === beat.key;
                                            const hasBeatContent = !!beatData[beat.key];

                                            return (
                                                <div
                                                    key={beat.key}
                                                    className="flex flex-col items-center gap-1 group relative h-full justify-end"
                                                >
                                                    {/* Draggable Bar Container */}
                                                    <div
                                                        className="relative h-full flex items-end cursor-ns-resize"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setActiveBeat(beat.key);

                                                            const container = e.currentTarget.parentElement?.parentElement;
                                                            if (!container) return;

                                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                                const rect = container.getBoundingClientRect();
                                                                const relativeY = (moveEvent.clientY - rect.top) / rect.height;
                                                                const newTension = Math.max(5, Math.min(95, Math.round((1 - relativeY) * 100)));

                                                                onUpdate({
                                                                    tensionLevels: {
                                                                        ...story.tensionLevels,
                                                                        [beat.key]: newTension
                                                                    }
                                                                });
                                                            };

                                                            const handleMouseUp = () => {
                                                                document.removeEventListener('mousemove', handleMouseMove);
                                                                document.removeEventListener('mouseup', handleMouseUp);
                                                                document.body.style.cursor = '';
                                                            };

                                                            document.body.style.cursor = 'ns-resize';
                                                            document.addEventListener('mousemove', handleMouseMove);
                                                            document.addEventListener('mouseup', handleMouseUp);
                                                        }}
                                                    >
                                                        {/* The Bar */}
                                                        <div
                                                            className={`w-4 md:w-5 transition-all duration-150 rounded-t-md ${isActive
                                                                ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                                                                : hasBeatContent
                                                                    ? `bg-gradient-to-t ${getActColor(beat.act)} group-hover:opacity-80`
                                                                    : 'bg-gray-300 group-hover:bg-gray-400'
                                                                }`}
                                                            style={{ height: `${tension}%`, minHeight: '8px' }}
                                                        >
                                                            {/* Drag Handle */}
                                                            <div className={`w-full h-2 rounded-t-md flex items-center justify-center ${isActive ? 'bg-orange-600' : 'bg-black/10'}`}>
                                                                <div className="w-2 h-0.5 bg-white/50 rounded" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Beat Number */}
                                                    <span
                                                        className={`text-[8px] md:text-[9px] font-bold transition-colors cursor-pointer ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                                        onClick={() => setActiveBeat(beat.key)}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Beat Editor */}
                        <div className="h-[300px] bg-white border-t border-gray-200 p-4 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)]">
                            {activeBeat ? (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{beats.find(b => b.key === activeBeat)?.label}</h3>
                                            <p className="text-xs text-gray-500">{beats.find(b => b.key === activeBeat)?.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {characters.slice(0, 6).map(char => {
                                                const isInBeat = (beatCharacters[activeBeat] || []).includes(char.id);
                                                return (
                                                    <button
                                                        key={char.id}
                                                        onClick={() => toggleCharacterInBeat(activeBeat, char.id)}
                                                        className={`relative transition-all ${isInBeat ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                                        title={char.name}
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={char.imagePoses?.portrait} />
                                                            <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">{char.name?.slice(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <Textarea
                                        value={beatData[activeBeat] || ''}
                                        onChange={(e) => updateBeat(activeBeat, e.target.value)}
                                        placeholder={`Describe what happens in "${beats.find(b => b.key === activeBeat)?.label}"...`}
                                        className="flex-1 bg-gray-50 border-gray-200 text-gray-800 text-sm resize-none focus:bg-white focus:ring-orange-200 focus:border-orange-400"
                                    />
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Click a beat on the arc to edit</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BEATS CARD VIEW */}
                {viewMode === 'beats' && (
                    <ScrollArea className="h-full">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {beats.map((beat, idx) => {
                                const content = beatData[beat.key] || '';
                                const chars = (beatCharacters[beat.key] || []).map(id => characters.find(c => c.id === id)).filter(Boolean);
                                return (
                                    <Card
                                        key={beat.key}
                                        className={`p-4 bg-white border-gray-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer group`}
                                        onClick={() => { setActiveBeat(beat.key); setViewMode('arc'); }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className={`text-[10px] bg-gradient-to-r ${getActColor(beat.act)} text-white border-0 opacity-80 group-hover:opacity-100`}>
                                                {idx + 1}. {beat.label}
                                            </Badge>
                                            {content && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">{beat.desc}</p>
                                        <p className="text-xs text-gray-700 line-clamp-3 min-h-[48px] font-medium">{content || <span className="text-gray-400 italic">Not written yet...</span>}</p>
                                        {chars.length > 0 && (
                                            <div className="flex -space-x-2 mt-3">
                                                {chars.slice(0, 4).map((char: any) => (
                                                    <Avatar key={char.id} className="h-6 w-6 border-2 border-white ring-1 ring-gray-100">
                                                        <AvatarImage src={char.imagePoses?.portrait} />
                                                        <AvatarFallback className="text-[8px] bg-gray-100">{char.name?.slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* FULL SCRIPT VIEW */}
                {viewMode === 'script' && (
                    <ScrollArea className="h-full">
                        <div className="max-w-3xl mx-auto p-8">
                            <div className="mb-8 text-center">
                                <h1 className="text-2xl font-bold text-white mb-2">{story.premise?.slice(0, 50) || 'Untitled Story'}...</h1>
                                <p className="text-sm text-slate-400">Structure: {currentStructure} • {beats.length} Beats</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none">
                                {beats.map((beat, idx) => {
                                    const content = beatData[beat.key] || '';
                                    const chars = (beatCharacters[beat.key] || []).map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
                                    return (
                                        <div key={beat.key} className="mb-8 pb-8 border-b border-gray-100 last:border-0">
                                            <h3 className={`text-lg font-bold bg-gradient-to-r ${getActColor(beat.act)} bg-clip-text text-transparent mb-1`}>
                                                {idx + 1}. {beat.label}
                                            </h3>
                                            {chars.length > 0 && (
                                                <p className="text-xs text-indigo-500 mb-2 flex items-center gap-1 font-medium">
                                                    <Users className="h-3 w-3" /> {chars.join(', ')}
                                                </p>
                                            )}
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {content || <span className="text-gray-400 italic">This beat has not been written yet...</span>}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollArea>
                )}

            </div>
        </div>
    );
}
