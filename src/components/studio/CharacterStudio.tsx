'use client';

import { useState } from 'react';
import { LayoutGrid, Map, Sparkles, UserPlus, Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CharacterDeck } from './CharacterDeck';
import { CharacterCanvas } from './CharacterCanvas';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface CharacterStudioProps {
    characters: any[];
    projectData: any;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onAdd: () => void;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onGenerateImage?: (id: string, type: string, style?: string) => void;
    isGeneratingImage?: boolean;
    onGenerateCharacters?: (prompt: string) => void;
    isGeneratingCharacters?: boolean;
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

export function CharacterStudio({
    characters, projectData, selectedId,
    onSelect, onAdd, onUpdate, onDelete,
    onGenerateImage, isGeneratingImage,
    onGenerateCharacters, isGeneratingCharacters
}: CharacterStudioProps) {

    const [viewMode, setViewMode] = useState<'deck' | 'canvas'>('deck');
    const [genPrompt, setGenPrompt] = useState('');
    const [artistStyle, setArtistStyle] = useState('Cinematic Reality');
    const [artistRefImage, setArtistRefImage] = useState<string | null>(null);

    const handleGenerateClick = () => {
        // Build context from Project Data including Visual Style
        const context = `
Context:
- Project Title: ${projectData.title}
- Studio: ${projectData.studioName}
- Description: ${projectData.description}
- Visual Style: ${artistStyle}
- User Instructions: ${genPrompt}

Create characters that fit this world. Focus on archetype and role.
Ensure visual descriptions match the '${artistStyle}' style.
      `;
        onGenerateCharacters?.(context);
    };

    const handleImageGenerate = (id: string, type: string) => {
        // Pass the style context
        const styleContext = `Style: ${artistStyle}. Reference: ${artistRefImage ? 'Use uploaded ref' : 'None'}`;
        onGenerateImage?.(id, type, styleContext);
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* COMMAND CENTER / TOOLBAR */}
            <div className="glass-panel p-3 rounded-xl flex flex-wrap items-center justify-between gap-4">

                {/* Left: View & Style */}
                <div className="flex items-center gap-4">
                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'deck' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('deck')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'deck' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <LayoutGrid className="h-3 w-3" /> Deck
                        </Button>
                        <Button
                            variant={viewMode === 'canvas' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('canvas')}
                            className={`gap-2 text-xs h-8 ${viewMode === 'canvas' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Map className="h-3 w-3" /> Canvas
                        </Button>
                    </div>

                    {/* Separator */}
                    <div className="h-8 w-px bg-gray-200" />

                    {/* Artist / Style Selector */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                            <Palette className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-[10px] text-gray-500 font-bold uppercase">Visual DNA</Label>
                            <Select value={artistStyle} onValueChange={setArtistStyle}>
                                <SelectTrigger className="h-6 w-[160px] text-xs border-0 bg-transparent p-0 focus:ring-0 text-gray-900 font-bold">
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

                    {/* Upload Ref (Mock) */}
                    <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed bg-transparent border-gray-300 text-gray-500 hover:text-orange-600 hover:border-orange-200" onClick={() => document.getElementById('ref-upload')?.click()}>
                        <Upload className="h-3 w-3" />
                        {artistRefImage ? 'Ref Loaded' : 'Ref Image'}
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-white">x</div>
                        </div>
                    )}
                </div>

                {/* Right: Generator */}
                <div className="flex-1 max-w-xl flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            placeholder="Describe new characters (e.g. 'A ninja squad')..."
                            className="h-9 bg-white border-gray-200 text-xs text-gray-900 focus:border-orange-500 focus:ring-orange-200"
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleGenerateClick}
                        disabled={isGeneratingCharacters || !genPrompt}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-9 px-4 text-xs font-bold shadow-lg shadow-orange-500/20"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {isGeneratingCharacters ? 'Generatinh...' : 'Generate Agent'}
                    </Button>
                </div>

                <Button size="sm" onClick={onAdd} className="bg-gray-100 hover:bg-orange-50 text-gray-600 border border-transparent hover:border-orange-200 h-9 px-3 text-xs">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>

            {/* MAIN VIEW */}
            <div className="flex-1 overflow-hidden relative rounded-2xl border border-gray-200 bg-gray-50/50 shadow-inner">
                {viewMode === 'deck' ? (
                    <CharacterDeck
                        characters={characters}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onAdd={onAdd}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onGenerateImage={handleImageGenerate} // Use wrapper to inject style
                        isGeneratingImage={isGeneratingImage}
                    />
                ) : (
                    <CharacterCanvas
                        characters={characters}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                )}
            </div>
        </div>
    );
}
