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
import { AssetGallery } from './AssetGallery';
import { CharacterImageVersions } from './CharacterImageVersions';
import { GenerateCharacterImageModal } from './GenerateCharacterImageModal';
import { GenerateCharacterImageModalV2 } from './GenerateCharacterImageModalV2';
import { CharacterImageVersionSelector } from './CharacterImageVersionSelector';
import { CharacterVersionSelector } from './CharacterVersionSelector';
import {
    CharacterVisualGrid,
    KEY_POSES_ITEMS,
    FACIAL_EXPRESSION_ITEMS,
    EMOTION_GESTURE_ITEMS
} from './CharacterVisualGrid';

// Compatible interface with page.tsx
export interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    imagePoses?: Record<string, string>;

    // NEW: Visual grid fields (Deck Slide 8)
    keyPoses?: Record<string, string>; // { front, right, left, back, three_quarter }
    facialExpressions?: Record<string, string>; // { happy, sad, angry, scared }
    emotionGestures?: Record<string, string>; // { greeting, bow, dance, run }

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
    userId?: string;
    projectId?: string;
}

const ROLES = ['Protagonist', 'Antagonist', 'Deuteragonist', 'Confidant', 'Love Interest', 'Foil', 'Mentor', 'Sidekick', 'Comic Relief', 'Supporting'];
const ARCHETYPES = ['The Hero', 'The Mentor', 'The Shadow', 'The Trickster', 'The Herald', 'The Threshold Guardian', 'The Shapeshifter'];

export function CharacterDeck({
    characters,
    selectedId,
    onSelect,
    onAdd,
    onUpdate,
    onDelete,
    onGenerateImage,
    isGeneratingImage = false,
    userId,
    projectId
}: CharacterDeckProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

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
        <div className="h-full flex overflow-hidden relative p-4">
            {/* LEFT: CHARACTER CATALOG (The Deck) */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ${selectedId ? 'mr-[420px]' : ''}`}>

                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search characters by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 focus:outline-none transition-all text-sm font-medium shadow-sm text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[180px] rounded-xl bg-white border-gray-200 text-gray-700 font-medium">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="All">All Roles</SelectItem>
                            {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={onAdd}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Character
                    </Button>
                </div>

                {/* Grid Display */}
                <ScrollArea className="flex-1 -mr-2 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                        {filteredCharacters.map(char => (
                            <div
                                key={char.id}
                                onClick={() => onSelect(char.id)}
                                className={`group relative glass-card p-4 rounded-2xl cursor-pointer flex flex-col gap-3 h-[320px] transition-all duration-300 ${selectedId === char.id ? 'ring-2 ring-offset-2 ring-orange-400 bg-orange-50/50 shadow-lg shadow-orange-200' : 'hover:shadow-md hover:bg-orange-50/30'}`}
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
                                        <span className="px-2 py-1 rounded-md bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            {char.role}
                                        </span>
                                    </div>

                                    {/* Archetype Badge (Bottom) */}
                                    {char.psychological?.archetype && (
                                        <div className="absolute bottom-2 right-2">
                                            <span className="px-2 py-1 rounded-md bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                                                {char.psychological.archetype}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info Area */}
                                <div className="flex flex-col justify-end">
                                    <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-orange-600 transition-colors truncate">
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
                            className="h-[320px] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group"
                        >
                            <div className="p-4 rounded-full bg-gray-100 group-hover:bg-orange-100 text-gray-400 group-hover:text-orange-500 transition-colors mb-4">
                                <Plus className="h-8 w-8" />
                            </div>
                            <p className="font-bold text-gray-500 group-hover:text-orange-600">Create Character</p>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT: DETAIL PANEL (Slide Over) */}
            <div
                className={`fixed top-[160px] bottom-6 right-6 w-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl z-20 flex flex-col transform transition-transform duration-500 ease-in-out ${selectedId ? 'translate-x-0' : 'translate-x-[120%]'}`}
            >
                {selectedCharacter && (
                    <>
                        {/* Panel Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border-2 border-orange-400 overflow-hidden shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                                    {selectedCharacter.imageUrl || (selectedCharacter.imagePoses && selectedCharacter.imagePoses.portrait) ? (
                                        <img src={selectedCharacter.imageUrl || selectedCharacter.imagePoses.portrait} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-orange-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 leading-none">{selectedCharacter.name}</h2>
                                    <p className="text-[10px] text-orange-600 uppercase tracking-widest mt-1">{selectedCharacter.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onDelete(selectedCharacter.id)} className="text-red-400 hover:bg-red-50 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onSelect('')} className="text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Character Version Selector */}
                        {userId && (
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                                <CharacterVersionSelector
                                    characterId={selectedCharacter.id}
                                    userId={userId}
                                    projectId={projectId}
                                    currentCharacterData={selectedCharacter as Record<string, unknown>}
                                    onVersionChange={(versionData) => {
                                        // Apply version data to current character
                                        onUpdate(selectedCharacter.id, versionData as Partial<Character>);
                                    }}
                                    compact
                                />
                            </div>
                        )}

                        {/* Panel Content - COMPLETE CHARACTER FORM */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* HERO SECTION - Name, Role, Archetype */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Name</Label>
                                            <Input
                                                value={selectedCharacter.name}
                                                onChange={(e) => onUpdate(selectedCharacter.id, { name: e.target.value })}
                                                className="bg-white border-gray-200 text-gray-900 focus:border-orange-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Role</Label>
                                            <Select
                                                value={selectedCharacter.role}
                                                onValueChange={(v) => onUpdate(selectedCharacter.id, { role: v })}
                                            >
                                                <SelectTrigger className="bg-white border-gray-200 text-gray-900"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 text-gray-900">
                                                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Archetype</Label>
                                            <Select
                                                value={selectedCharacter.psychological?.archetype || ''}
                                                onValueChange={(v) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'archetype'], v))}
                                            >
                                                <SelectTrigger className="bg-white border-gray-200 text-gray-900"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 text-gray-900">
                                                    {ARCHETYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Cast Reference</Label>
                                            <Input
                                                value={selectedCharacter.castReference || ''}
                                                onChange={(e) => onUpdate(selectedCharacter.id, { castReference: e.target.value })}
                                                placeholder="e.g. Tom Hanks, Anya Taylor-Joy"
                                                className="bg-white border-gray-200 text-gray-900 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Visual Portrait */}
                                    <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors group">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label className="text-[10px] uppercase text-orange-500 tracking-wider font-bold flex items-center gap-2">
                                                <Camera className="h-3 w-3" /> Visual Portrait
                                            </Label>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowGenerateModal(true)}
                                                disabled={isGeneratingImage || !selectedCharacter.name}
                                                className="h-6 text-[10px] bg-orange-100 text-orange-600 hover:bg-orange-200"
                                            >
                                                <Sparkles className="h-3 w-3 mr-1" /> Generate
                                            </Button>
                                        </div>
                                        <div className="min-h-[200px] max-h-[400px] rounded-lg bg-gray-200/50 overflow-hidden relative flex items-center justify-center">
                                            {selectedCharacter.imageUrl || (selectedCharacter.imagePoses && selectedCharacter.imagePoses.portrait) ? (
                                                <img
                                                    src={selectedCharacter.imageUrl || selectedCharacter.imagePoses.portrait}
                                                    className="max-w-full max-h-[400px] object-contain"
                                                    alt={selectedCharacter.name}
                                                />
                                            ) : (
                                                <div className="w-full h-[200px] flex items-center justify-center text-gray-300">
                                                    <User className="h-16 w-16" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Image Version Selector */}
                                        {userId && projectId && (
                                            <div className="mt-3">
                                                <CharacterImageVersionSelector
                                                    characterId={selectedCharacter.id}
                                                    projectId={projectId}
                                                    userId={userId}
                                                    currentImageUrl={selectedCharacter.imageUrl}
                                                    onVersionChange={(imageUrl) => {
                                                        onUpdate(selectedCharacter.id, { imageUrl });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Asset Gallery - Google Drive Linked Images */}
                                    {userId && (
                                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                            <AssetGallery
                                                entityType="character"
                                                entityId={selectedCharacter.id}
                                                userId={userId}
                                                projectId={projectId}
                                                mediaType="image"
                                                showAddButton={true}
                                                showGenerateButton={false}
                                                maxItems={4}
                                            />
                                        </div>
                                    )}

                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* KEY POSES - Generate character in different poses (Deck Slide 8) */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {userId && (
                                        <CharacterVisualGrid
                                            title="Generate Key Poses"
                                            description="Character poses for animation & design reference"
                                            items={KEY_POSES_ITEMS}
                                            characterId={selectedCharacter.id}
                                            characterData={{
                                                name: selectedCharacter.name,
                                                role: selectedCharacter.role,
                                                gender: selectedCharacter.physiological?.gender,
                                                ethnicity: selectedCharacter.physiological?.ethnicity,
                                                skinTone: selectedCharacter.physiological?.skinTone,
                                                hairStyle: selectedCharacter.physiological?.hairStyle,
                                                hairColor: selectedCharacter.physiological?.hairColor,
                                                eyeColor: selectedCharacter.physiological?.eyeColor,
                                                bodyType: selectedCharacter.physiological?.bodyType,
                                                height: selectedCharacter.physiological?.height,
                                                clothingStyle: selectedCharacter.clothingStyle,
                                                imageUrl: selectedCharacter.imageUrl,
                                            }}
                                            savedImages={selectedCharacter.keyPoses || {}}
                                            userId={userId}
                                            projectId={projectId}
                                            onSave={(itemId, imageUrl) => {
                                                onUpdate(selectedCharacter.id, {
                                                    keyPoses: {
                                                        ...selectedCharacter.keyPoses,
                                                        [itemId]: imageUrl
                                                    }
                                                });
                                            }}
                                            gridCols={5}
                                            aspectRatio="portrait"
                                        />
                                    )}

                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* FACIAL EXPRESSIONS - Generate expressions (Deck Slide 8) */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {userId && (
                                        <CharacterVisualGrid
                                            title="Generate Facial Expressions"
                                            description="Expressions for acting reference & storyboard"
                                            items={FACIAL_EXPRESSION_ITEMS}
                                            characterId={selectedCharacter.id}
                                            characterData={{
                                                name: selectedCharacter.name,
                                                role: selectedCharacter.role,
                                                gender: selectedCharacter.physiological?.gender,
                                                ethnicity: selectedCharacter.physiological?.ethnicity,
                                                skinTone: selectedCharacter.physiological?.skinTone,
                                                hairStyle: selectedCharacter.physiological?.hairStyle,
                                                hairColor: selectedCharacter.physiological?.hairColor,
                                                eyeColor: selectedCharacter.physiological?.eyeColor,
                                                bodyType: selectedCharacter.physiological?.bodyType,
                                                height: selectedCharacter.physiological?.height,
                                                clothingStyle: selectedCharacter.clothingStyle,
                                                imageUrl: selectedCharacter.imageUrl,
                                            }}
                                            savedImages={selectedCharacter.facialExpressions || {}}
                                            userId={userId}
                                            projectId={projectId}
                                            onSave={(itemId, imageUrl) => {
                                                onUpdate(selectedCharacter.id, {
                                                    facialExpressions: {
                                                        ...selectedCharacter.facialExpressions,
                                                        [itemId]: imageUrl
                                                    }
                                                });
                                            }}
                                            gridCols={4}
                                            aspectRatio="square"
                                        />
                                    )}

                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* EMOTION & GESTURE - Generate gestures (Deck Slide 8) */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {userId && (
                                        <CharacterVisualGrid
                                            title="Generate Emotion & Gesture"
                                            description="Body language & movement poses"
                                            items={EMOTION_GESTURE_ITEMS}
                                            characterId={selectedCharacter.id}
                                            characterData={{
                                                name: selectedCharacter.name,
                                                role: selectedCharacter.role,
                                                gender: selectedCharacter.physiological?.gender,
                                                ethnicity: selectedCharacter.physiological?.ethnicity,
                                                skinTone: selectedCharacter.physiological?.skinTone,
                                                hairStyle: selectedCharacter.physiological?.hairStyle,
                                                hairColor: selectedCharacter.physiological?.hairColor,
                                                eyeColor: selectedCharacter.physiological?.eyeColor,
                                                bodyType: selectedCharacter.physiological?.bodyType,
                                                height: selectedCharacter.physiological?.height,
                                                clothingStyle: selectedCharacter.clothingStyle,
                                                imageUrl: selectedCharacter.imageUrl,
                                            }}
                                            savedImages={selectedCharacter.emotionGestures || {}}
                                            userId={userId}
                                            projectId={projectId}
                                            onSave={(itemId, imageUrl) => {
                                                onUpdate(selectedCharacter.id, {
                                                    emotionGestures: {
                                                        ...selectedCharacter.emotionGestures,
                                                        [itemId]: imageUrl
                                                    }
                                                });
                                            }}
                                            gridCols={4}
                                            aspectRatio="portrait"
                                        />
                                    )}
                                </div>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* PHYSIOLOGICAL - Complete Physical Appearance */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Physiological" icon={Shield} color="cyan" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Gender" value={selectedCharacter.physiological?.gender} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'gender'], v))} />
                                        <MiniInput label="Ethnicity" value={selectedCharacter.physiological?.ethnicity} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'ethnicity'], v))} />
                                        <MiniInput label="Skin Tone" value={selectedCharacter.physiological?.skinTone} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'skinTone'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Face Shape" value={selectedCharacter.physiological?.faceShape} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'faceShape'], v))} />
                                        <MiniInput label="Eye Shape" value={selectedCharacter.physiological?.eyeShape} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'eyeShape'], v))} />
                                        <MiniInput label="Eye Color" value={selectedCharacter.physiological?.eyeColor} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'eyeColor'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Nose Shape" value={selectedCharacter.physiological?.noseShape} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'noseShape'], v))} />
                                        <MiniInput label="Lips Shape" value={selectedCharacter.physiological?.lipsShape} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'lipsShape'], v))} />
                                        <MiniInput label="Hair Style" value={selectedCharacter.physiological?.hairStyle} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'hairStyle'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Hair Color" value={selectedCharacter.physiological?.hairColor} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'hairColor'], v))} />
                                        <MiniInput label="Hijab/Headwear" value={selectedCharacter.physiological?.hijab} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'hijab'], v))} />
                                        <MiniInput label="Body Type" value={selectedCharacter.physiological?.bodyType} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'bodyType'], v))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Height" value={selectedCharacter.physiological?.height} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'height'], v))} />
                                        <MiniInput label="Uniqueness" value={selectedCharacter.physiological?.uniqueness} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['physiological', 'uniqueness'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* PSYCHOLOGICAL - Deep Psychology */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Psychological" icon={Brain} color="purple" fullWidth>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Fears" value={selectedCharacter.psychological?.fears} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'fears'], v))} />
                                        <MiniInput label="Wants" value={selectedCharacter.psychological?.wants} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'wants'], v))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Needs" value={selectedCharacter.psychological?.needs} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'needs'], v))} />
                                        <MiniInput label="Alter Ego" value={selectedCharacter.psychological?.alterEgo} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'alterEgo'], v))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Personality Type" value={selectedCharacter.psychological?.personalityType} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'personalityType'], v))} />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold mb-1 block">Traumatic Past</Label>
                                        <Textarea
                                            value={selectedCharacter.psychological?.traumatic || ''}
                                            onChange={(e) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['psychological', 'traumatic'], e.target.value))}
                                            className="bg-white border-gray-200 text-gray-900 min-h-[60px] text-xs resize-none"
                                            placeholder="Describe formative trauma or past events..."
                                        />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* EMOTIONAL - Logos, Ethos, Pathos */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Emotional Expression" icon={Zap} color="orange" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Logos (Logic)" value={selectedCharacter.emotional?.logos} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'logos'], v))} />
                                        <MiniInput label="Ethos (Ethics)" value={selectedCharacter.emotional?.ethos} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'ethos'], v))} />
                                        <MiniInput label="Pathos (Emotion)" value={selectedCharacter.emotional?.pathos} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'pathos'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Tone" value={selectedCharacter.emotional?.tone} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'tone'], v))} />
                                        <MiniInput label="Style" value={selectedCharacter.emotional?.style} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'style'], v))} />
                                        <MiniInput label="Mode" value={selectedCharacter.emotional?.mode} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['emotional', 'mode'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* FAMILY */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Family" icon={Crown} color="pink" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Spouse" value={selectedCharacter.family?.spouse} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['family', 'spouse'], v))} />
                                        <MiniInput label="Children" value={selectedCharacter.family?.children} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['family', 'children'], v))} />
                                        <MiniInput label="Parents" value={selectedCharacter.family?.parents} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['family', 'parents'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* SOCIOCULTURAL */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Sociocultural" icon={Shield} color="emerald" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Affiliation" value={selectedCharacter.sociocultural?.affiliation} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'affiliation'], v))} />
                                        <MiniInput label="Group Relationship" value={selectedCharacter.sociocultural?.groupRelationshipLevel} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'groupRelationshipLevel'], v))} />
                                        <MiniInput label="Culture/Tradition" value={selectedCharacter.sociocultural?.cultureTradition} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'cultureTradition'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Language" value={selectedCharacter.sociocultural?.language} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'language'], v))} />
                                        <MiniInput label="Tribe" value={selectedCharacter.sociocultural?.tribe} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'tribe'], v))} />
                                        <MiniInput label="Economic Class" value={selectedCharacter.sociocultural?.economicClass} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociocultural', 'economicClass'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* CORE BELIEFS */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Core Beliefs" icon={Brain} color="indigo" fullWidth>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Faith" value={selectedCharacter.coreBeliefs?.faith} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'faith'], v))} />
                                        <MiniInput label="Religion/Spirituality" value={selectedCharacter.coreBeliefs?.religionSpirituality} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'religionSpirituality'], v))} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Trustworthy" value={selectedCharacter.coreBeliefs?.trustworthy} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'trustworthy'], v))} />
                                        <MiniInput label="Willingness" value={selectedCharacter.coreBeliefs?.willingness} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'willingness'], v))} />
                                        <MiniInput label="Vulnerability" value={selectedCharacter.coreBeliefs?.vulnerability} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'vulnerability'], v))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Commitments" value={selectedCharacter.coreBeliefs?.commitments} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'commitments'], v))} />
                                        <MiniInput label="Integrity" value={selectedCharacter.coreBeliefs?.integrity} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['coreBeliefs', 'integrity'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* EDUCATIONAL */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Educational Background" icon={Shield} color="blue" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Graduate" value={selectedCharacter.educational?.graduate} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['educational', 'graduate'], v))} />
                                        <MiniInput label="Achievement" value={selectedCharacter.educational?.achievement} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['educational', 'achievement'], v))} />
                                        <MiniInput label="Fellowship" value={selectedCharacter.educational?.fellowship} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['educational', 'fellowship'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* SOCIOPOLITICS */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Sociopolitics" icon={Crown} color="red" fullWidth>
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniInput label="Party ID" value={selectedCharacter.sociopolitics?.partyId} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociopolitics', 'partyId'], v))} />
                                        <MiniInput label="Nationalism" value={selectedCharacter.sociopolitics?.nationalism} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociopolitics', 'nationalism'], v))} />
                                        <MiniInput label="Citizenship" value={selectedCharacter.sociopolitics?.citizenship} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['sociopolitics', 'citizenship'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* SWOT ANALYSIS */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="SWOT Analysis" icon={Zap} color="yellow" fullWidth>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Strength" value={selectedCharacter.swot?.strength} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['swot', 'strength'], v))} />
                                        <MiniInput label="Weakness" value={selectedCharacter.swot?.weakness} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['swot', 'weakness'], v))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Opportunity" value={selectedCharacter.swot?.opportunity} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['swot', 'opportunity'], v))} />
                                        <MiniInput label="Threat" value={selectedCharacter.swot?.threat} onChange={(v: string) => onUpdate(selectedCharacter.id, updateNested(selectedCharacter, ['swot', 'threat'], v))} />
                                    </div>
                                </CardSection>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* VISUAL STYLE & PROPS */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <CardSection title="Visual Style & Props" icon={Camera} color="orange" fullWidth>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniInput label="Clothing Style" placeholder="Elegant, casual, warrior..." value={selectedCharacter.clothingStyle} onChange={(v: string) => onUpdate(selectedCharacter.id, { clothingStyle: v })} />
                                        <MiniInput label="Accessories" placeholder="Watch, necklace, hat..." value={selectedCharacter.accessories?.join(', ')} onChange={(v: string) => onUpdate(selectedCharacter.id, { accessories: v.split(',').map((s: string) => s.trim()) })} />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold mb-1 block">Props</Label>
                                        <Textarea
                                            value={selectedCharacter.props || ''}
                                            onChange={(e) => onUpdate(selectedCharacter.id, { props: e.target.value })}
                                            className="bg-white border-gray-200 text-gray-900 min-h-[60px] text-xs resize-none"
                                            placeholder="Signature items, weapons, tools..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase text-gray-500 tracking-wider font-bold mb-1 block">Personality Traits</Label>
                                        <Input
                                            value={selectedCharacter.personalityTraits?.join(', ') || ''}
                                            onChange={(e) => onUpdate(selectedCharacter.id, { personalityTraits: e.target.value.split(',').map((s: string) => s.trim()) })}
                                            className="bg-white border-gray-200 text-gray-900 focus:border-orange-500"
                                            placeholder="brave, curious, stubborn..."
                                        />
                                    </div>
                                </CardSection>

                            </div>
                        </ScrollArea>
                    </>
                )}
            </div>

            {/* Generate Character Image Modal V2 */}
            {selectedCharacter && showGenerateModal && (
                <GenerateCharacterImageModalV2
                    isOpen={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    characterId={selectedCharacter.id}
                    characterData={{
                        name: selectedCharacter.name,
                        role: selectedCharacter.role,
                        gender: selectedCharacter.physiological?.gender,
                        age: selectedCharacter.physiological?.age,
                        ethnicity: selectedCharacter.physiological?.ethnicity,
                        skinTone: selectedCharacter.physiological?.skinTone,
                        hairStyle: selectedCharacter.physiological?.hairStyle,
                        hairColor: selectedCharacter.physiological?.hairColor,
                        eyeColor: selectedCharacter.physiological?.eyeColor,
                        bodyType: selectedCharacter.physiological?.bodyType,
                        height: selectedCharacter.physiological?.height,
                        clothingStyle: selectedCharacter.clothingStyle,
                        castReference: selectedCharacter.castReference,
                        physiological: selectedCharacter.physiological,
                    }}
                    userId={userId || ''}
                    projectId={projectId}
                    imageReferences={selectedCharacter.imageReferences || []}
                    onSuccess={async (result) => {
                        // Update local state
                        onUpdate(selectedCharacter.id, { imageUrl: result.imageUrl });

                        // Auto-save to database
                        if (projectId && selectedCharacter.id) {
                            try {
                                const updatedChar = {
                                    ...selectedCharacter,
                                    imageUrl: result.imageUrl,
                                };
                                const saveRes = await fetch(`/api/creator/projects/${projectId}/characters/${selectedCharacter.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(updatedChar)
                                });
                                if (!saveRes.ok) {
                                    console.error("Failed to auto-save character after image generation");
                                }
                            } catch (e) {
                                console.error("Auto-save error:", e);
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}

// Helpers
function CardSection({ title, icon: Icon, children, color = 'emerald', fullWidth = false }: any) {
    const colors: any = {
        cyan: 'text-cyan-600 border-cyan-200 from-cyan-50 bg-cyan-50/30',
        purple: 'text-purple-600 border-purple-200 from-purple-50 bg-purple-50/30',
        orange: 'text-orange-600 border-orange-200 from-orange-50 bg-orange-50/30',
        emerald: 'text-emerald-600 border-emerald-200 from-emerald-50 bg-emerald-50/30',
        pink: 'text-pink-600 border-pink-200 from-pink-50 bg-pink-50/30',
        indigo: 'text-indigo-600 border-indigo-200 from-indigo-50 bg-indigo-50/30',
        blue: 'text-blue-600 border-blue-200 from-blue-50 bg-blue-50/30',
        red: 'text-red-600 border-red-200 from-red-50 bg-red-50/30',
        yellow: 'text-yellow-600 border-yellow-200 from-yellow-50 bg-yellow-50/30',
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

function MiniInput({ label, value, onChange, placeholder }: any) {
    return (
        <div>
            <Label className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 block">{label}</Label>
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-7 text-xs bg-white border-gray-200 text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 rounded-lg px-2"
            />
        </div>
    )
}
