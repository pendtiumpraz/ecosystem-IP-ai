'use client';

import { useState } from 'react';
import {
    BookOpen, Target, Zap, Mountain, Activity,
    ChevronRight, AlignLeft, Layout, MousePointerClick,
    RefreshCcw, MoveRight, Star, Heart, Skull, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

// Interfaces matching page.tsx Story structure
export interface StoryData {
    premise: string;
    theme: string;
    tone: string;
    genre: string;
    structure: string;

    // Beats
    catBeats: Record<string, string>;
    heroBeats: Record<string, string>;
    harmonBeats: Record<string, string>;

    // New visual fields that might not be in page.tsx yet
    // We handle them gracefully
    [key: string]: any;
}

interface StoryArcStudioProps {
    story: StoryData;
    onUpdate: (updates: Partial<StoryData>) => void;
    onGenerate?: (field: string) => void;
    isGenerating?: boolean;
}

// BEAT DEFINITIONS
const STC_BEATS = [
    { key: 'openingImage', label: 'Opening Image', desc: 'A snapshot of the hero\'s world before the adventure.' },
    { key: 'themeStated', label: 'Theme Stated', desc: 'What the story is really about.' },
    { key: 'setup', label: 'Set-up', desc: 'Expand on the "before" world.' },
    { key: 'catalyst', label: 'Catalyst', desc: 'The life-changing event.' },
    { key: 'debate', label: 'Debate', desc: 'The hero resists the call.' },
    { key: 'breakIntoTwo', label: 'Break into 2', desc: 'The hero enters the new world.' },
    { key: 'bStory', label: 'B Story', desc: 'The love story or helper story.' },
    { key: 'funAndGames', label: 'Fun and Games', desc: 'The promise of the premise.' },
    { key: 'midpoint', label: 'Midpoint', desc: 'False victory or false defeat.' },
    { key: 'badGuysCloseIn', label: 'Bad Guys Close In', desc: 'The stakes get higher.' },
    { key: 'allIsLost', label: 'All is Lost', desc: 'Rock bottom.' },
    { key: 'darkNightOfTheSoul', label: 'Dark Night of the Soul', desc: 'The hero reflects and gathers strength.' },
    { key: 'breakIntoThree', label: 'Break into 3', desc: 'The solution is found.' },
    { key: 'finale', label: 'Finale', desc: 'The final showdown.' },
    { key: 'finalImage', label: 'Final Image', desc: 'Change has occurred.' },
];

const HERO_BEATS = [
    { key: 'ordinaryWorld', label: 'Ordinary World', desc: 'The hero in their normal life.' },
    { key: 'callToAdventure', label: 'Call to Adventure', desc: 'Something shakes up the situation.' },
    { key: 'refusalOfCall', label: 'Refusal of Call', desc: 'The hero fears the unknown.' },
    { key: 'meetingMentor', label: 'Meeting the Mentor', desc: 'Hero gets supplies or advice.' },
    { key: 'crossingThreshold', label: 'Crossing Threshold', desc: 'Committing to the journey.' },
    { key: 'testsAlliesEnemies', label: 'Tests, Allies, Enemies', desc: 'Exploring the new world.' },
    { key: 'approachCave', label: 'Approach to Inmost Cave', desc: 'Preparing for the main danger.' },
    { key: 'ordeal', label: 'The Ordeal', desc: 'The central crisis.' },
    { key: 'reward', label: 'The Reward', desc: 'Seizing the sword.' },
    { key: 'roadBack', label: 'The Road Back', desc: 'Recommitment to complete the journey.' },
    { key: 'resurrection', label: 'Resurrection', desc: 'Final exam where hero is tested once more.' },
    { key: 'returnElixir', label: 'Return with Elixir', desc: 'Hero returns home changed.' },
];

export function StoryArcStudio({ story, onUpdate, onGenerate, isGenerating }: StoryArcStudioProps) {
    const [activeBeat, setActiveBeat] = useState<string | null>(null);

    const currentStructure = story.structure || 'Save the Cat';

    const getBeatsConfig = () => {
        switch (currentStructure) {
            case 'The Hero\'s Journey': return HERO_BEATS;
            case 'Dan Harmon Story Circle': return []; // Todo: Implement Harmon
            default: return STC_BEATS;
        }
    };

    const beats = getBeatsConfig();
    const beatData = currentStructure === 'The Hero\'s Journey' ? (story.heroBeats || {}) : (story.catBeats || {});

    const updateBeat = (key: string, value: string) => {
        const fieldName = currentStructure === 'The Hero\'s Journey' ? 'heroBeats' : 'catBeats';
        onUpdate({
            [fieldName]: {
                ...beatData,
                [key]: value
            }
        });
    };

    return (
        <div className="h-full flex flex-col gap-6 relative">

            {/* 1. TOP BAR: STORY DNA */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl glass-panel">

                {/* Row 1: Premise & AI Trigger */}
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Logline / Premise</Label>
                    <div className="relative">
                        <Input
                            value={story.premise || ''}
                            onChange={(e) => onUpdate({ premise: e.target.value })}
                            className=" bg-white/5 border-white/10 text-white pr-32"
                            placeholder="Start with a killer premise..."
                        />
                        <Button
                            size="sm"
                            className="absolute right-1.5 top-1.5 h-7 bg-indigo-500 hover:bg-indigo-600 text-white text-xs border border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            disabled={isGenerating || !story.premise}
                            onClick={() => onGenerate?.('all')}
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {isGenerating ? 'Dreaming...' : 'Auto-Generate'}
                        </Button>
                    </div>
                </div>

                {/* Row 2: Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Structure</Label>
                        <Select
                            value={currentStructure}
                            onValueChange={(v) => onUpdate({ structure: v })}
                        >
                            <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="Save the Cat">Save the Cat (Blake Snyder)</SelectItem>
                                <SelectItem value="The Hero's Journey">Hero's Journey (Campbell)</SelectItem>
                                <SelectItem value="Dan Harmon Story Circle">Dan Harmon Circle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Genre</Label>
                        <Input
                            value={story.genre || ''}
                            onChange={(e) => onUpdate({ genre: e.target.value })}
                            className="h-9 bg-white/5 border-white/10 text-white"
                            placeholder="Scifi, Horror..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Core Theme</Label>
                        <Input
                            value={story.theme || ''}
                            onChange={(e) => onUpdate({ theme: e.target.value })}
                            className="h-9 bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Tone</Label>
                        <Input
                            value={story.tone || ''}
                            onChange={(e) => onUpdate({ tone: e.target.value })}
                            className="h-9 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* 2. VISUAL ARC GRAPH (Interactive SVG) */}
            <div className="flex-1 min-h-[300px] relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="relative z-10 flex-1 flex items-center justify-center p-8">
                    {/* Simple CSS-based Curve Visualization */}
                    <div className="w-full max-w-5xl h-64 relative">
                        {/* Act Markers */}
                        <div className="absolute top-0 bottom-0 left-[20%] border-l border-dashed border-white/10">
                            <span className="absolute top-[-20px] left-2 text-[10px] uppercase text-slate-500 font-bold">Act 2 Begins</span>
                        </div>
                        <div className="absolute top-0 bottom-0 left-[50%] border-l border-emerald-500/20">
                            <span className="absolute top-[-20px] left-2 text-[10px] uppercase text-emerald-500 font-bold">Midpoint</span>
                        </div>
                        <div className="absolute top-0 bottom-0 left-[75%] border-l border-dashed border-white/10">
                            <span className="absolute top-[-20px] left-2 text-[10px] uppercase text-slate-500 font-bold">Act 3 Begins</span>
                        </div>

                        {/* The Curve (SVG) */}
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path
                                d="M 0,200 C 100,200 150,150 200,100 C 350,-50 650,250 800,50 C 900,150 1000,100 1000,100"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="4"
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="50%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>

                            {/* Nodes for Beats */}
                            {beats.map((beat, i) => {
                                const x = (i / (beats.length - 1)) * 100 + '%';
                                // Approx curve y height for visualization
                                const isActive = activeBeat === beat.key;
                                return (
                                    <foreignObject key={beat.key} x={x} y="40%" width="40" height="40" style={{ overflow: 'visible' }}>
                                        <button
                                            onClick={() => setActiveBeat(beat.key)}
                                            className={`w-6 h-6 -ml-3 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-white border-white shadow-[0_0_20px_white] scale-150' : 'bg-slate-900 border-white/50 hover:border-white hover:scale-125'}`}
                                        >
                                            <span className="sr-only">{beat.label}</span>
                                        </button>
                                        <div className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}>
                                            <span className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                                                {beat.label}
                                            </span>
                                        </div>
                                    </foreignObject>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* BEAT EDITOR (Bottom Panel) */}
                <div className="h-[280px] bg-white/5 border-t border-white/10 backdrop-blur-xl flex flex-col">
                    <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            STORY BEATS
                        </h3>
                        <div className="flex gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Act 1</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Act 2</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Act 3</span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 w-full whitespace-nowrap p-4">
                        <div className="flex gap-4">
                            {beats.map((beat, index) => {
                                const value = beatData[beat.key] || '';
                                const isActive = activeBeat === beat.key;
                                return (
                                    <div
                                        key={beat.key}
                                        onClick={() => setActiveBeat(beat.key)}
                                        className={`w-[300px] shrink-0 p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${isActive ? 'bg-white/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {index + 1}. {beat.label}
                                            </span>
                                            {value && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                        </div>

                                        <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 h-[32px] whitespace-normal">
                                            {beat.desc}
                                        </p>

                                        <Textarea
                                            value={value}
                                            onChange={(e) => updateBeat(beat.key, e.target.value)}
                                            placeholder={`Describe the ${beat.label}...`}
                                            className={`h-[100px] text-xs resize-none bg-black/30 border-white/5 focus:border-emerald-500/50 transition-colors whitespace-normal ${isActive ? 'text-white' : 'text-slate-300'}`}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <ScrollBar orientation="horizontal" className="bg-white/5" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
