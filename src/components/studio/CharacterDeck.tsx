'use client';

import { useState } from 'react';
import {
    User, Plus, Search, Filter, Trash2,
    Sparkles, Camera, X, Shield, Brain, Zap, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

// Compatible interface with page.tsx
export interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    imagePoses?: Record<string, string>;

    physiological: {
        age?: string;
        gender?: string;
        height?: string;
        bodyType?: string;
        hairStyle?: string;
        [key: string]: any;
    };

    psychological: {
        archetype?: string;
        fears?: string;
        wants?: string;
        needs?: string;
        personalityType?: string;
        [key: string]: any;
    };

    swot?: {
        strength?: string;
        weakness?: string;
        opportunity?: string;
        threat?: string;
    };

    [key: string]: any; // Allow loose typing for other sections
}

interface CharacterDeckProps {
    characters: any[]; // Use any[] to avoid strict type mismatch during integration
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
    onGenerateImage: (id: string, type: 'portrait') => void;
    isGeneratingImage?: boolean;
}

const ROLES = ['Protagonist', 'Antagonist', 'Deuteragonist', 'Confidant', 'Love Interest', 'Foil', 'Mentor'];
const ARCHETYPES = ['The Hero', 'The Mentor', 'The Shadow', 'The Trickster', 'The Herald', 'The Threshold Guardian', 'The Shapeshifter'];

export function CharacterDeck({
    characters,
    selectedId,
    onSelect,
    onAdd,
    onUpdate,
    onDelete,
    onGenerateImage,
    isGeneratingImage = false
}: CharacterDeckProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');

    const selectedCharacter = characters.find(c => c.id === selectedId);

    const filteredCharacters = characters.filter(char => {
        const matchesSearch = char.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || char.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Helper helper to update nested state safely
    const updateNested = (obj: any, path: string[], value: any) => {
        // This helper logic should be handled by the parent really, 
        // but 'onUpdate' expects a partial object that merges at root.
        // So we construct the root partial here.

        // Example: path=['psychological', 'fears']
        if (path.length === 1) {
            return { [path[0]]: value };
        }
        if (path.length === 2) {
            return {
                [path[0]]: {
                    ...obj[path[0]],
                    [path[1]]: value
                }
            };
        }
        return {};
    };

    return (
        <div className="h-full flex overflow-hidden relative">
            {/* LEFT: CHARACTER CATALOG (The Deck) */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ${selectedId ? 'mr-[500px]' : ''}`}>

                {/* Toolbar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search characters by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/40 focus:bg-white/90 focus:ring-2 focus:ring-emerald-400/30 focus:outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[180px] rounded-xl bg-white/50 border-white/40">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={onAdd}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Character
                    </Button>
                </div>

                {/* Grid Display */}
                <ScrollArea className="flex-1 -mr-4 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                        {filteredCharacters.map(char => (
                            <div
                                key={char.id}
                                onClick={() => onSelect(char.id)}
                                className={`group relative glass-card p-4 rounded-2xl cursor-pointer flex flex-col gap-3 h-[320px] transition-all duration-300 ${selectedId === char.id ? 'ring-2 ring-emerald-400 bg-white/80 scale-[1.02]' : 'hover:scale-[1.02] hover:bg-white/70'}`}
                            >
                                {/* Image Area */}
                                <div className="aspect-[3/4] rounded-xl bg-gray-100 relative overflow-hidden shadow-inner flex items-center justify-center">
                                    {char.imageUrl || (char.imagePoses && char.imagePoses.portrait) ? (
                                        <img
                                            src={char.imageUrl || char.imagePoses.portrait}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <User className="h-12 w-12 mb-2 opacity-20" />
                                            <span className="text-[10px] uppercase tracking-widest opacity-50">No Portrait</span>
                                        </div>
                                    )}

                                    {/* Role Badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                                            {char.role}
                                        </span>
                                    </div>

                                    {/* Archetype Badge (Bottom) */}
                                    {char.psychological?.archetype && (
                                        <div className="absolute bottom-2 right-2">
                                            <span className="px-2 py-1 rounded-md bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                                                {char.psychological.archetype}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info Area */}
                                <div className="flex flex-col justify-end">
                                    <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-emerald-600 transition-colors truncate">
                                        {char.name || "Unnamed"}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                        {char.psychological?.wants || "No motivation defined."}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Add New Ghost Card */}
                        <div
                            onClick={onAdd}
                            className="h-[320px] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                        >
                            <div className="p-4 rounded-full bg-gray-100 group-hover:bg-emerald-100 text-gray-400 group-hover:text-emerald-500 transition-colors mb-4">
                                <Plus className="h-8 w-8" />
                            </div>
                            <p className="font-bold text-gray-500 group-hover:text-emerald-600">Create Character</p>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT: DETAIL PANEL (Slide Over) */}
            <div
                className={`fixed top-[140px] bottom-0 right-0 w-[480px] glass-panel-dark border-l border-white/20 shadow-2xl z-20 flex flex-col transform transition-transform duration-500 ease-in-out ${selectedId ? 'translate-x-0' : 'translate-x-[120%]'}`}
            >
                {selectedCharacter && (
                    <>
                        {/* Panel Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border-2 border-emerald-400 overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                    {selectedCharacter.imageUrl || (selectedCharacter.imagePoses && selectedCharacter.imagePoses.portrait) ? (
                                        <img src={selectedCharacter.imageUrl || selectedCharacter.imagePoses.portrait} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <User className="h-5 w-5 text-emerald-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-none">{selectedCharacter.name}</h2>
                                    <p className="text-[10px] text-emerald-300 uppercase tracking-widest mt-1">{selectedCharacter.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onDelete(selectedCharacter.id)} className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onSelect('')} className="text-white/50 hover:bg-white/10 hover:text-white">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8">
                                {/* HERO SECTION */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Name</Label>
                                            <Input
                                                value={selectedCharacter.name}
                                                onChange={(e) => onUpdate(selectedCharacter.id, { name: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Role</Label>
                                            <Select
                                                value={selectedCharacter.role}
                                                onValueChange={(v) => onUpdate(selectedCharacter.id, { role: v })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Archetype</Label>
                                        <Select
                                            value={selectedCharacter.psychological?.archetype || ''}
                                            onValueChange={(v) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'archetype'], v))}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                                {ARCHETYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label className="text-[10px] uppercase text-emerald-400 tracking-wider font-bold flex items-center gap-2">
                                                <Camera className="h-3 w-3" /> Visual Portrait
                                            </Label>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onGenerateImage(selectedCharacter.id, 'portrait')}
                                                disabled={isGeneratingImage || !selectedCharacter.name}
                                                className="h-6 text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                            >
                                                <Sparkles className="h-3 w-3 mr-1" /> Generate
                                            </Button>
                                        </div>
                                        <div className="aspect-square rounded-lg bg-black/40 overflow-hidden relative">
                                            {selectedCharacter.imageUrl || (selectedCharacter.imagePoses && selectedCharacter.imagePoses.portrait) ? (
                                                <img src={selectedCharacter.imageUrl || selectedCharacter.imagePoses.portrait} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <User className="h-16 w-16" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* TABS FOR DEEP DIVE */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <CardSection
                                            title="Physiological"
                                            icon={Shield}
                                            color="cyan"
                                        >
                                            <MiniInput label="Age" value={selectedCharacter.physiological?.age} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'age'], v))} />
                                            <MiniInput label="Height" value={selectedCharacter.physiological?.height} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'height'], v))} />
                                            <MiniInput label="Body Type" value={selectedCharacter.physiological?.bodyType} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'bodyType'], v))} />
                                        </CardSection>

                                        <CardSection
                                            title="Psychological"
                                            icon={Brain}
                                            color="purple"
                                        >
                                            <MiniInput label="Fear" value={selectedCharacter.psychological?.fears} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'fears'], v))} />
                                            <MiniInput label="Wants" value={selectedCharacter.psychological?.wants} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'wants'], v))} />
                                            <MiniInput label="Needs" value={selectedCharacter.psychological?.needs} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'needs'], v))} />
                                        </CardSection>
                                    </div>

                                    <CardSection title="Character Arc" icon={Zap} color="orange" fullWidth>
                                        <div className="space-y-3">
                                            <div className='grid grid-cols-2 gap-3'>
                                                <MiniInput label="Personality Type" value={selectedCharacter.psychological?.personalityType} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'personalityType'], v))} />
                                                <MiniInput label="Weakness" value={selectedCharacter.swot?.weakness} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['swot', 'weakness'], v))} />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase text-slate-500 tracking-wider font-bold mb-1 block">Traumatic Past</Label>
                                                <Textarea
                                                    value={selectedCharacter.psychological?.traumatic || ''}
                                                    onChange={(e) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'traumatic'], e.target.value))}
                                                    className="bg-white/5 border-white/10 text-white min-h-[60px] text-xs resize-none"
                                                />
                                            </div>
                                        </div>
                                    </CardSection>
                                </div>

                            </div>
                        </ScrollArea>
                    </>
                )}
            </div>
        </div>
    );
}

// Helpers
function CardSection({ title, icon: Icon, children, color = 'emerald', fullWidth = false }: any) {
    const colors: any = {
        cyan: 'text-cyan-400 border-cyan-500/20 from-cyan-500/10',
        purple: 'text-purple-400 border-purple-500/20 from-purple-500/10',
        orange: 'text-orange-400 border-orange-500/20 from-orange-500/10',
        emerald: 'text-emerald-400 border-emerald-500/20 from-emerald-500/10',
    };

    return (
        <div className={`rounded-xl border bg-gradient-to-br to-transparent p-4 ${colors[color]} ${fullWidth ? 'col-span-2' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">{title}</span>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )
}

function MiniInput({ label, value, onChange }: any) {
    return (
        <div>
            <Label className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 block">{label}</Label>
            <Input
                value={value || ''}
                onChange={(e) => onChange(e)}
                className="h-7 text-xs bg-black/20 border-white/10 text-white focus:border-white/30 rounded-lg px-2"
            />
        </div>
    )
}
