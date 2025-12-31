'use client';

import { useState } from 'react';
import {
    Home, Map, Users, Landmark,
    ArrowRight, ArrowLeft, ZoomIn, ZoomOut,
    Sparkles, Globe, Sun, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Options imports (Should be passed or imported, but for standalone we assume standard strings for now or generic inputs)
// We will use standard select inputs for now to match page.tsx data

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
        id: 'micro',
        title: 'LEVEL 1: THE PERSONAL',
        subtitle: 'Microcosm / Daily Life',
        description: "Start small. What does the daily life look like inside a room?",
        icon: Home,
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-950/30'
    },
    {
        id: 'environment',
        title: 'LEVEL 2: THE ENVIRONMENT',
        subtitle: 'Geography / Setting',
        description: "Zoom out. What creates the atmosphere and physical world?",
        icon: Sun,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-950/30'
    },
    {
        id: 'society',
        title: 'LEVEL 3: THE SOCIETY',
        subtitle: 'Culture / Economy',
        description: "Zoom out further. How do people interact and trade?",
        icon: Users,
        color: 'from-blue-500 to-indigo-500',
        bg: 'bg-blue-950/30'
    },
    {
        id: 'macro',
        title: 'LEVEL 4: THE SYSTEM',
        subtitle: 'Politics / Cosmology',
        description: "The biggest picture. Rulers, laws of physics, and magic.",
        icon: Landmark,
        color: 'from-purple-500 to-violet-500',
        bg: 'bg-purple-950/30'
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

            {/* HEADER: UNIVERSE IDENTITY */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-panel">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1 flex-1 max-w-md">
                        <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Universe Name</Label>
                        <Input
                            value={universe.name || ''}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="h-8 bg-transparent border-none text-xl font-black text-white p-0 focus-visible:ring-0 placeholder:text-slate-600"
                            placeholder="Name your Universe..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-widest">
                        Zoom Level: {currentLevelIndex + 1}/{LEVELS.length}
                    </span>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                        {LEVELS.map((lvl, idx) => (
                            <div
                                key={lvl.id}
                                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${idx === currentLevelIndex ? `bg-gradient-to-r ${lvl.color}` : idx < currentLevelIndex ? 'bg-white/40' : 'bg-white/10'}`}
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
                            {currentLevel.title}
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

                        {/* LEVEL 1: PRIVATE */}
                        {currentLevel.id === 'micro' && (
                            <div className="space-y-6">
                                <InputGroup
                                    label="Private Life / Daily Routine"
                                    desc="How do inhabitants spend their private time? What defines their daily existence?"
                                >
                                    <Textarea
                                        value={universe.privateLife || ''}
                                        onChange={(e) => onUpdate({ privateLife: e.target.value })}
                                        className="min-h-[150px] bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. They wake up to artificial suns, consume ration bars..."
                                    />
                                </InputGroup>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Add props or specific micro items here if available in data */}
                                </div>
                            </div>
                        )}

                        {/* LEVEL 2: ENVIRONMENT */}
                        {currentLevel.id === 'environment' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Period / Time">
                                        <Input
                                            value={universe.period || ''}
                                            onChange={(e) => onUpdate({ period: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g. 2150 AD"
                                        />
                                    </InputGroup>
                                    <InputGroup label="Era Type">
                                        <Input
                                            value={universe.era || ''}
                                            onChange={(e) => onUpdate({ era: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g. Cyberpunk"
                                        />
                                    </InputGroup>
                                </div>
                                <InputGroup label="Location / Geography">
                                    <Input
                                        value={universe.location || ''}
                                        onChange={(e) => onUpdate({ location: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Neo-Jakarta"
                                    />
                                </InputGroup>
                                <InputGroup label="Environment Description" desc="Climate, Landscape, Architecture aesthetics.">
                                    <Textarea
                                        value={universe.environment || ''}
                                        onChange={(e) => onUpdate({ environment: e.target.value })}
                                        className="min-h-[150px] bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Neon-drenched streets with perpetual acid rain..."
                                    />
                                </InputGroup>
                            </div>
                        )}

                        {/* LEVEL 3: SOCIETY */}
                        {currentLevel.id === 'society' && (
                            <div className="space-y-6">
                                <InputGroup label="Culture & Tradition" desc="Beliefs, arts, customs, and social norms.">
                                    <Textarea
                                        value={universe.culture || ''}
                                        onChange={(e) => onUpdate({ culture: e.target.value })}
                                        className="min-h-[120px] bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Ancestral worship mixed with AI reverence..."
                                    />
                                </InputGroup>
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Society Structure">
                                        <Textarea
                                            value={universe.society || ''}
                                            onChange={(e) => onUpdate({ society: e.target.value })}
                                            className="min-h-[100px] bg-white/5 border-white/10 text-white"
                                            placeholder="Class systems..."
                                        />
                                    </InputGroup>
                                    <InputGroup label="Economy">
                                        <Textarea
                                            value={universe.economy || ''}
                                            onChange={(e) => onUpdate({ economy: e.target.value })}
                                            className="min-h-[100px] bg-white/5 border-white/10 text-white"
                                            placeholder="Currency, Trade..."
                                        />
                                    </InputGroup>
                                </div>
                            </div>
                        )}

                        {/* LEVEL 4: SYSTEM */}
                        {currentLevel.id === 'macro' && (
                            <div className="space-y-6">
                                <InputGroup label="Government & Politics" desc="Who rules? How is power distributed?">
                                    <Textarea
                                        value={universe.government || ''}
                                        onChange={(e) => onUpdate({ government: e.target.value })}
                                        className="min-h-[100px] bg-white/5 border-white/10 text-white"
                                        placeholder="e.g. Technocratic Council..."
                                    />
                                </InputGroup>

                                <div className="grid grid-cols-3 gap-4">
                                    <InputGroup label="World Type">
                                        <Input
                                            value={universe.worldType || ''}
                                            onChange={(e) => onUpdate({ worldType: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </InputGroup>
                                    <InputGroup label="Tech Level">
                                        <Input
                                            value={universe.technologyLevel || ''}
                                            onChange={(e) => onUpdate({ technologyLevel: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </InputGroup>
                                    <InputGroup label="Magic System">
                                        <Input
                                            value={universe.magicSystem || ''}
                                            onChange={(e) => onUpdate({ magicSystem: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </InputGroup>
                                </div>
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
