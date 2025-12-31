'use client';

import { useState } from 'react';
import {
    Home, Map, Users, Landmark,
    ArrowRight, ArrowLeft, ZoomIn, ZoomOut,
    Sparkles, Globe, Sun, Scale,
    Building2, Gavel, BookOpen, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UniverseData {
    name: string;
    period: string;
    era: string;
    location: string;
    worldType: string;
    technologyLevel: string;
    magicSystem: string;
    environment: string;
    society: string;
    privateLife: string;
    government: string;
    economy: string;
    culture: string;
    [key: string]: any;
}

interface UniverseCosmosProps {
    universe: UniverseData;
    onUpdate: (updates: Partial<UniverseData>) => void;
    onGenerate?: (field: string) => void;
    isGenerating?: boolean;
}

const LEVELS = [
    {
        id: 'identity',
        title: 'LEVEL 1: IDENTITY',
        subtitle: 'Name & Era',
        description: "Define the core identity of your universe. When and where are we?",
        icon: Globe,
        color: 'from-blue-500 to-indigo-500',
        bg: 'bg-indigo-950/30'
    },
    {
        id: 'private',
        title: 'LEVEL 2: PRIVATE',
        subtitle: 'Interior & Home',
        description: "Zoom in to the smallest detail. Where do characters sleep? What does a room look like?",
        icon: Home,
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-950/30'
    },
    {
        id: 'neighborhood',
        title: 'LEVEL 3: NEIGHBORHOOD',
        subtitle: 'Environment & Town',
        description: "Step outside. What is the immediate surrounding? The streets, the neighbors?",
        icon: Map,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-950/30'
    },
    {
        id: 'institution',
        title: 'LEVEL 4: INSTITUTION',
        subtitle: 'Work & School',
        description: "Where do people spend their day? Schools, offices, factories?",
        icon: Building2,
        color: 'from-cyan-500 to-blue-500',
        bg: 'bg-cyan-950/30'
    },
    {
        id: 'regulation',
        title: 'LEVEL 5: REGULATION',
        subtitle: 'Laws & Rules',
        description: "What is forbidden? What laws govern the daily actions?",
        icon: Gavel,
        color: 'from-red-500 to-pink-500',
        bg: 'bg-red-950/30'
    },
    {
        id: 'nation',
        title: 'LEVEL 6: NATION',
        subtitle: 'Government & System',
        description: "Who rules? How is the power distributed across the land?",
        icon: Landmark,
        color: 'from-purple-500 to-violet-500',
        bg: 'bg-purple-950/30'
    },
    {
        id: 'geography',
        title: 'LEVEL 7: GEOGRAPHY',
        subtitle: 'Landscape & World',
        description: "The physical world. Continents, climates, resources.",
        icon: Sun,
        color: 'from-yellow-500 to-lime-500',
        bg: 'bg-yellow-950/30'
    },
    {
        id: 'sociology',
        title: 'LEVEL 8: SOCIOLOGY',
        subtitle: 'Culture & Systems',
        description: "Beliefs, traditions, class structures, and social norms.",
        icon: Users,
        color: 'from-fuchsia-500 to-rose-500',
        bg: 'bg-fuchsia-950/30'
    },
    {
        id: 'global',
        title: 'LEVEL 9: GLOBAL', // Was Macro 3
        subtitle: 'Politics & Economy',
        description: "The grand scale. Geopolitics, global trade, and macro-economics.",
        icon: Flag,
        color: 'from-slate-500 to-gray-500',
        bg: 'bg-slate-950/30'
    }
];

export function UniverseCosmos({ universe, onUpdate, onGenerate, isGenerating }: UniverseCosmosProps) {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const currentLevel = LEVELS[currentLevelIndex];

    const handleNext = () => {
        if (currentLevelIndex < LEVELS.length - 1) setCurrentLevelIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentLevelIndex > 0) setCurrentLevelIndex(prev => prev - 1);
    };

    return (
        <div className="h-full flex flex-col gap-6 relative">

            {/* HEADER: PROGRESS */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-panel">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <currentLevel.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{universe.name || 'Unnamed Universe'}</h2>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">{currentLevel.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {LEVELS.map((lvl, idx) => (
                            <div
                                key={lvl.id}
                                onClick={() => setCurrentLevelIndex(idx)}
                                className={`cursor-pointer h-2 w-8 rounded-full transition-all duration-300 ${idx === currentLevelIndex ? `bg-gradient-to-r ${lvl.color}` : idx < currentLevelIndex ? 'bg-white/40' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN STAGE: THE SLIDE */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">

                {/* LEFT: VISUAL CONTEXT & NAVIGATION */}
                <div className={`md:w-1/3 relative flex flex-col p-8 justify-between ${currentLevel.bg} transition-colors duration-700`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/80 pointer-events-none" />

                    {/* Background Decoration (Abstract) */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentLevel.color} opacity-20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 transition-all duration-700`} />

                    <div className="relative z-10 space-y-4">
                        <Badge variant="outline" className="bg-black/20 text-white border-white/20 backdrop-blur-md">
                            {currentLevel.id.toUpperCase()} ZONE
                        </Badge>
                        <h2 className="text-3xl font-black text-white leading-tight">
                            {currentLevel.subtitle}
                        </h2>
                        <p className="text-sm text-slate-300">
                            {currentLevel.description}
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 mt-8">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentLevelIndex === 0}
                            className="h-12 w-12 rounded-full border-white/20 bg-black/20 hover:bg-white/10 hover:text-white p-0"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                        <div className="flex-1 h-[1px] bg-white/20" />
                        <Button
                            onClick={handleNext}
                            disabled={currentLevelIndex === LEVELS.length - 1}
                            className={`h-12 px-6 rounded-full bg-gradient-to-r ${currentLevel.color} hover:contrast-125 text-white font-bold shadow-lg shadow-black/20`}
                        >
                            {currentLevelIndex === LEVELS.length - 1 ? 'Finish' : 'Zoom Out'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* RIGHT: CONTENT EDITOR (Dynamic per Level) */}
                <div className="flex-1 bg-slate-950/50 backdrop-blur-xl p-8 overflow-auto">
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500" key={currentLevel.id}>

                        {/* LEVEL 1: IDENTITY */}
                        {currentLevel.id === 'identity' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Universe Name">
                                        <Input value={universe.name || ''} onChange={(e) => onUpdate({ name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </InputGroup>
                                    <InputGroup label="Time Period / Year">
                                        <Input value={universe.period || ''} onChange={(e) => onUpdate({ period: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </InputGroup>
                                </div>
                                <InputGroup label="Era Description" desc="Cyberpunk, Victorian, Ancient Magic, etc.">
                                    <Textarea value={universe.era || ''} onChange={(e) => onUpdate({ era: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 2: PRIVATE */}
                        {currentLevel.id === 'private' && (
                            <div className="space-y-6">
                                <InputGroup label="Interior Design & Aesthetics" desc="How do the rooms look? Material, lighting, mood?">
                                    <Textarea value={universe.interior || ''} onChange={(e) => onUpdate({ interior: e.target.value })} className="min-h-[120px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Daily Routine" desc="What is the first thing a character does when waking up?">
                                    <Textarea value={universe.privateLife || ''} onChange={(e) => onUpdate({ privateLife: e.target.value })} className="min-h-[120px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 3: NEIGHBORHOOD */}
                        {currentLevel.id === 'neighborhood' && (
                            <div className="space-y-6">
                                <InputGroup label="Town / City Name">
                                    <Input value={universe.location || ''} onChange={(e) => onUpdate({ location: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Environment Detail" desc="Streets, buildings, weather, noise level, smells.">
                                    <Textarea value={universe.environment || ''} onChange={(e) => onUpdate({ environment: e.target.value })} className="min-h-[120px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 4: INSTITUTION */}
                        {currentLevel.id === 'institution' && (
                            <div className="space-y-6">
                                <InputGroup label="Education System">
                                    <Textarea value={universe.education || ''} onChange={(e) => onUpdate({ education: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Workplace & Industry">
                                    <Textarea value={universe.workplace || ''} onChange={(e) => onUpdate({ workplace: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 5: REGULATION */}
                        {currentLevel.id === 'regulation' && (
                            <div className="space-y-6">
                                <InputGroup label="Laws & Taboos" desc="What is illegal? What is socially unacceptable?">
                                    <Textarea value={universe.laws || ''} onChange={(e) => onUpdate({ laws: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Law Enforcement">
                                    <Textarea value={universe.enforcement || ''} onChange={(e) => onUpdate({ enforcement: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 6: NATION */}
                        {currentLevel.id === 'nation' && (
                            <div className="space-y-6">
                                <InputGroup label="Government System" desc="Monarchy, Democracy, AI Overlord?">
                                    <Textarea value={universe.government || ''} onChange={(e) => onUpdate({ government: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Rulers & Figures">
                                    <Textarea value={universe.rulers || ''} onChange={(e) => onUpdate({ rulers: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 7: GEOGRAPHY */}
                        {currentLevel.id === 'geography' && (
                            <div className="space-y-6">
                                <InputGroup label="Landscape & Climate">
                                    <Textarea value={universe.landscape || ''} onChange={(e) => onUpdate({ landscape: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Resources & Magic System">
                                    <Textarea value={universe.magicSystem || ''} onChange={(e) => onUpdate({ magicSystem: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 8: SOCIOLOGY */}
                        {currentLevel.id === 'sociology' && (
                            <div className="space-y-6">
                                <InputGroup label="Culture & Tradition">
                                    <Textarea value={universe.culture || ''} onChange={(e) => onUpdate({ culture: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Social Classes">
                                    <Textarea value={universe.society || ''} onChange={(e) => onUpdate({ society: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 9: GLOBAL */}
                        {currentLevel.id === 'global' && (
                            <div className="space-y-6">
                                <InputGroup label="Economy & Trade">
                                    <Textarea value={universe.economy || ''} onChange={(e) => onUpdate({ economy: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                                <InputGroup label="Geopolitics & Conflict">
                                    <Textarea value={universe.politics || ''} onChange={(e) => onUpdate({ politics: e.target.value })} className="min-h-[100px] bg-white/5 border-white/10 text-white" />
                                </InputGroup>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

function InputGroup({ label, desc, children }: any) {
    return (
        <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-400 font-bold tracking-wider">{label}</Label>
            {desc && <p className="text-[10px] text-slate-500 mb-2">{desc}</p>}
            {children}
        </div>
    )
}
