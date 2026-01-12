'use client';

import { useState } from 'react';
import { LayoutGrid, Columns3, Network, Sparkles, UserPlus, Palette, Upload, Users, Crown, Stars, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CharacterDeck } from './CharacterDeck';
import { CharacterKanban } from './CharacterKanban';
import { CharacterRelations } from './CharacterRelations';
import { CharacterConstellation } from './CharacterConstellation';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface CharacterStudioProps {
    characters: any[];
    deletedCharacters?: { id: string, name: string, role: string, imageUrl?: string, deletedAt: string }[];
    projectData: any;
    selectedId: string | null;
    characterRelations?: any[];
    onSelect: (id: string | null) => void;
    onAdd: () => void;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onRestore?: (id: string) => void;
    onCharacterRelationsChange?: (relations: any[]) => void;
    onGenerateRelations?: () => void;
    isGeneratingRelations?: boolean;
    onGenerateImage?: (id: string, type: string, style?: string) => void;
    isGeneratingImage?: boolean;
    onGenerateCharacters?: (prompt: string, role: string, count: number) => void;
    isGeneratingCharacters?: boolean;
    userId?: string;
    projectId?: string;
}

const ART_STYLES = [
    'Cinematic Reality',
    'Studio Ghibli Anime',
    'Disney Pixar 3D',
    'Cyberpunk Digital Art',
    'Oil Painting Classical',
    'Watercolor Sketch',
    'Dark Fantasy',
    'Retro Comic Book'
];

const CHARACTER_ROLES = [
    { value: 'Protagonist', label: 'Protagonist', desc: 'Hero utama cerita' },
    { value: 'Antagonist', label: 'Antagonist', desc: 'Penentang utama' },
    { value: 'Deuteragonist', label: 'Deuteragonist', desc: 'Karakter kedua penting' },
    { value: 'Confidant', label: 'Confidant', desc: 'Teman kepercayaan hero' },
    { value: 'Love Interest', label: 'Love Interest', desc: 'Pasangan romantis' },
    { value: 'Foil', label: 'Foil', desc: 'Kontras dengan hero' },
    { value: 'Mentor', label: 'Mentor', desc: 'Pembimbing / guru' },
    { value: 'Sidekick', label: 'Sidekick', desc: 'Pendamping hero' },
    { value: 'Comic Relief', label: 'Comic Relief', desc: 'Penyegar suasana' },
    { value: 'Supporting', label: 'Supporting', desc: 'Karakter pendukung' },
];

export function CharacterStudio({
    characters, deletedCharacters = [], projectData, selectedId,
    characterRelations = [],
    onSelect, onAdd, onUpdate, onDelete, onRestore,
    onCharacterRelationsChange, onGenerateRelations, isGeneratingRelations,
    onGenerateImage, isGeneratingImage,
    onGenerateCharacters, isGeneratingCharacters,
    userId, projectId
}: CharacterStudioProps) {

    const [viewMode, setViewMode] = useState<'deck' | 'kanban' | 'relations' | 'constellation'>('deck');
    const [showDeleted, setShowDeleted] = useState(false);
    const [genPrompt, setGenPrompt] = useState('');
    const [artistStyle, setArtistStyle] = useState('Cinematic Reality');
    const [artistRefImage, setArtistRefImage] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState('Protagonist');

    const handleGenerateClick = () => {
        // Build context from PROJECT DATA (not story)
        const roleInfo = CHARACTER_ROLES.find(r => r.value === selectedRole);

        // Get list of existing characters with name AND role to avoid duplicates
        const existingChars = characters
            .filter(c => c.name)
            .map(c => `- ${c.name} (${c.role || 'No role'})`);
        const existingCharsText = existingChars.length > 0
            ? `\n\nEXISTING CHARACTERS IN THIS PROJECT (DO NOT DUPLICATE - CREATE COMPLETELY DIFFERENT CHARACTER):\n${existingChars.join('\n')}`
            : '';

        const context = `
GENERATE 1 NEW UNIQUE ${roleInfo?.label?.toUpperCase()} CHARACTER:

PROJECT INFO:
- Title: ${projectData.title || 'Untitled Project'}
- Studio: ${projectData.studioName || 'Independent'}  
- Description: ${projectData.description || 'No description provided'}
${existingCharsText}

ROLE YANG DIMINTA USER: ${roleInfo?.label}
- Deskripsi role: ${roleInfo?.desc}
- WAJIB buat karakter dengan role "${selectedRole}" sesuai permintaan user

VISUAL STYLE: ${artistStyle}
INSTRUKSI TAMBAHAN: ${genPrompt || 'Buat karakter yang menarik dan cocok dengan dunia project ini'}

CRITICAL RULES:
1. Role HARUS "${selectedRole}" - ini ditentukan oleh user, jangan ubah
2. JANGAN buat karakter dengan nama yang sama dengan karakter existing di atas
3. JANGAN buat karakter yang mirip dengan karakter existing - HARUS BEDA walaupun role-nya sama
4. Jika sudah ada karakter ${roleInfo?.label} lain, buat karakter ${roleInfo?.label} yang BERBEDA total (nama, penampilan, kepribadian berbeda)
5. Setiap karakter harus UNIK dan tidak ada duplikasi

WAJIB ISI SEMUA FIELD:
- Physiological: gender, ethnicity, skinTone, faceShape, eyeShape, eyeColor, noseShape, lipsShape, hairStyle, hairColor, hijab, bodyType, height, uniqueness
- Psychological: archetype, fears, wants, needs, alterEgo, traumatic, personalityType
- Emotional: logos, ethos, pathos, emotionalTone, emotionalStyle, emotionalMode
- Family: spouse, children, parents
- Sociocultural: affiliation, groupRelationshipLevel, cultureTradition, language, tribe, economicClass
- Core Beliefs: faith, religionSpirituality, trustworthy, willingness, vulnerability, commitments, integrity
- Educational: graduate, achievement, fellowship
- Sociopolitics: partyId, nationalism, citizenship
- SWOT: strength, weakness, opportunity, threat
- Visual: clothingStyle, personalityTraits

Output dalam Bahasa Indonesia.
        `.trim();

        onGenerateCharacters?.(context, selectedRole, 1);
    };

    const handleImageGenerate = (id: string, type: string) => {
        const styleContext = `Style: ${artistStyle}. Reference: ${artistRefImage ? 'Use uploaded ref' : 'None'}`;
        onGenerateImage?.(id, type, styleContext);
    };

    // Count characters by role
    const roleCounts = CHARACTER_ROLES.reduce((acc, role) => {
        acc[role.value] = characters.filter(c => c.role === role.value).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="h-full flex flex-col gap-3 p-4">
            {/* COMMAND CENTER / TOOLBAR */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3">

                {/* Left: View & Style */}
                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'deck' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('deck')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'deck' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <LayoutGrid className="h-3 w-3" />
                            <span className="hidden sm:inline">Deck</span>
                        </Button>
                        <Button
                            variant={viewMode === 'kanban' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('kanban')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'kanban' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Columns3 className="h-3 w-3" />
                            <span className="hidden sm:inline">Kanban</span>
                        </Button>
                        <Button
                            variant={viewMode === 'relations' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('relations')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'relations' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Network className="h-3 w-3" />
                            <span className="hidden sm:inline">Relations</span>
                        </Button>
                        <Button
                            variant={viewMode === 'constellation' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('constellation')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'constellation' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Stars className="h-3 w-3" />
                            <span className="hidden sm:inline">Constellation</span>
                        </Button>
                    </div>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200" />

                    {/* Artist / Style Selector */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                            <Palette className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-[10px] text-gray-500 font-bold uppercase">Visual DNA</Label>
                            <Select value={artistStyle} onValueChange={setArtistStyle}>
                                <SelectTrigger className="h-7 w-[150px] text-xs border-0 bg-transparent px-2 focus:ring-0 text-gray-900 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ART_STYLES.map(style => (
                                        <SelectItem key={style} value={style}>{style}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Upload Ref */}
                    <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed bg-transparent border-gray-300 text-gray-500 hover:text-orange-600 hover:border-orange-200" onClick={() => document.getElementById('ref-upload')?.click()}>
                        <Upload className="h-3 w-3" />
                        {artistRefImage ? 'Ref ✓' : 'Ref'}
                    </Button>
                    <input
                        id="ref-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) setArtistRefImage(URL.createObjectURL(e.target.files[0]));
                        }}
                    />
                    {artistRefImage && (
                        <div className="h-8 w-8 rounded-md overflow-hidden border border-gray-200 relative group cursor-pointer" onClick={() => setArtistRefImage(null)}>
                            <img src={artistRefImage} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-white text-xs">×</div>
                        </div>
                    )}
                </div>

                {/* Right: Generator with Role Dropdown */}
                <div className="flex-1 max-w-2xl flex items-center gap-2">
                    {/* Role Selector */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                            <Crown className="h-4 w-4 text-orange-500" />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="h-9 w-[130px] text-xs bg-white border-gray-200 text-gray-900">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CHARACTER_ROLES.map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{role.label}</span>
                                            {roleCounts[role.value] > 0 && (
                                                <Badge variant="secondary" className="ml-2 text-[10px] h-4">{roleCounts[role.value]}</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Prompt Input */}
                    <div className="relative flex-1">
                        <Input
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            placeholder="Deskripsikan karakter (opsional)..."
                            className="h-9 bg-white border-gray-200 text-xs text-gray-900 focus:border-orange-500 focus:ring-orange-200"
                        />
                    </div>

                    {/* Generate Button */}
                    <Button
                        size="sm"
                        onClick={handleGenerateClick}
                        disabled={isGeneratingCharacters}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-9 px-4 text-xs font-bold shadow-lg shadow-orange-500/20"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {isGeneratingCharacters ? 'Generating...' : 'Generate'}
                    </Button>
                </div>

                {/* Manual Add */}
                <Button size="sm" onClick={onAdd} className="bg-gray-100 hover:bg-orange-50 text-gray-600 border border-transparent hover:border-orange-200 h-9 px-3 text-xs">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>

            {/* Role Stats Bar */}
            <div className="flex items-center justify-between gap-2 px-1 -mt-1">
                <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] text-gray-500 font-medium">{characters.length} Characters:</span>
                    <div className="flex gap-1 flex-wrap">
                        {CHARACTER_ROLES.filter(r => roleCounts[r.value] > 0).map(role => (
                            <Badge
                                key={role.value}
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 bg-white border-gray-200 text-gray-600"
                            >
                                {role.label}: {roleCounts[role.value]}
                            </Badge>
                        ))}
                    </div>
                </div>
                {deletedCharacters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`h-6 text-xs gap-1 ${showDeleted ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}
                    >
                        <Trash2 className="h-3 w-3" />
                        {deletedCharacters.length} Deleted
                    </Button>
                )}
            </div>

            {/* Deleted Characters Panel */}
            {showDeleted && deletedCharacters.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">Deleted Characters</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {deletedCharacters.map(char => (
                            <div key={char.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-red-200">
                                <span className="text-sm text-gray-700">{char.name}</span>
                                <Badge variant="outline" className="text-[10px] h-4">{char.role}</Badge>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRestore?.(char.id)}
                                    className="h-6 text-xs text-green-600 hover:bg-green-50 gap-1"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Restore
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MAIN VIEW */}
            <div className="flex-1 overflow-hidden relative rounded-xl border border-gray-200 bg-white shadow-sm">
                {viewMode === 'deck' && (
                    <CharacterDeck
                        characters={characters}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onAdd={onAdd}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onGenerateImage={handleImageGenerate}
                        isGeneratingImage={isGeneratingImage}
                        userId={userId}
                        projectId={projectId}
                    />
                )}
                {viewMode === 'kanban' && (
                    <CharacterKanban
                        characters={characters}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onUpdateRole={(id, newRole) => onUpdate(id, { role: newRole })}
                    />
                )}
                {viewMode === 'relations' && (
                    <CharacterRelations
                        characters={characters}
                        relations={characterRelations}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onRelationsChange={onCharacterRelationsChange || (() => { })}
                        onGenerateRelations={onGenerateRelations}
                        isGenerating={isGeneratingRelations}
                    />
                )}
                {viewMode === 'constellation' && (
                    <CharacterConstellation
                        characters={characters}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                )}
            </div>
        </div>
    );
}
