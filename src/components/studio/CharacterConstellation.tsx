'use client';

import { useState, useMemo } from 'react';
import { User, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CharacterConstellationProps {
    characters: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

// Faction configurations - static positions based on story role
const FACTIONS = [
    { id: 'protagonist', label: 'Protagonists', roles: ['protagonist', 'hero'], color: '#f97316', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: 'ally', label: 'Allies', roles: ['sidekick', 'mentor', 'supporting', 'ally', 'confidant'], color: '#3b82f6', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'neutral', label: 'Neutral', roles: ['love interest', 'love-interest', 'comic relief', 'comic-relief', 'deuteragonist'], color: '#8b5cf6', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { id: 'antagonist', label: 'Antagonists', roles: ['antagonist', 'villain', 'shadow'], color: '#ef4444', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { id: 'other', label: 'Others', roles: [], color: '#6b7280', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

const getFaction = (role: string) => {
    if (!role) return FACTIONS[4];
    const normalized = role.toLowerCase();
    for (const faction of FACTIONS) {
        if (faction.roles.some(r => normalized.includes(r))) {
            return faction;
        }
    }
    return FACTIONS[4];
};

export function CharacterConstellation({ characters, selectedId, onSelect }: CharacterConstellationProps) {
    const [scale, setScale] = useState(1);
    const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

    // Group characters by faction
    const charactersByFaction = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        FACTIONS.forEach(faction => {
            grouped[faction.id] = [];
        });
        characters.forEach(char => {
            const faction = getFaction(char.role);
            grouped[faction.id].push(char);
        });
        return grouped;
    }, [characters]);

    // Get selected character
    const selectedCharacter = characters.find(c => c.id === selectedId);

    return (
        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden flex">
            {/* LEFT: Faction Grid Layout */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Title */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Character Constellation</h2>
                        <p className="text-xs text-gray-500">Characters grouped by their story faction</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(1.5, s + 0.1))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setScale(1)}>
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Faction Grid - 3 Column Layout */}
                <div
                    className="grid grid-cols-3 gap-4 transition-transform"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                >
                    {/* Row 1: Protagonists in center-top */}
                    <div className="col-start-2">
                        <FactionBox
                            faction={FACTIONS[0]}
                            characters={charactersByFaction['protagonist']}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            isHighlighted={selectedFaction === 'protagonist'}
                            onHover={() => setSelectedFaction('protagonist')}
                            onLeave={() => setSelectedFaction(null)}
                        />
                    </div>

                    {/* Row 2: Allies on left, Neutral in center, Antagonists on right */}
                    <FactionBox
                        faction={FACTIONS[1]}
                        characters={charactersByFaction['ally']}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        isHighlighted={selectedFaction === 'ally'}
                        onHover={() => setSelectedFaction('ally')}
                        onLeave={() => setSelectedFaction(null)}
                    />
                    <FactionBox
                        faction={FACTIONS[2]}
                        characters={charactersByFaction['neutral']}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        isHighlighted={selectedFaction === 'neutral'}
                        onHover={() => setSelectedFaction('neutral')}
                        onLeave={() => setSelectedFaction(null)}
                    />
                    <FactionBox
                        faction={FACTIONS[3]}
                        characters={charactersByFaction['antagonist']}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        isHighlighted={selectedFaction === 'antagonist'}
                        onHover={() => setSelectedFaction('antagonist')}
                        onLeave={() => setSelectedFaction(null)}
                    />

                    {/* Row 3: Others in center-bottom */}
                    <div className="col-start-2">
                        <FactionBox
                            faction={FACTIONS[4]}
                            characters={charactersByFaction['other']}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            isHighlighted={selectedFaction === 'other'}
                            onHover={() => setSelectedFaction('other')}
                            onLeave={() => setSelectedFaction(null)}
                        />
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    {FACTIONS.map(faction => (
                        <div key={faction.id} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: faction.color }}
                            />
                            <span className="text-xs text-gray-600">{faction.label}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                {charactersByFaction[faction.id]?.length || 0}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Selected Character Info */}
            {selectedCharacter && (
                <div className="w-[280px] bg-white border-l border-gray-200 p-4 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-16 h-16 rounded-xl overflow-hidden border-2"
                            style={{ borderColor: getFaction(selectedCharacter.role).color }}
                        >
                            {selectedCharacter.imageUrl || selectedCharacter.imagePoses?.portrait ? (
                                <img
                                    src={selectedCharacter.imageUrl || selectedCharacter.imagePoses?.portrait}
                                    className="w-full h-full object-cover"
                                    alt={selectedCharacter.name}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{selectedCharacter.name}</h3>
                            <Badge
                                style={{
                                    backgroundColor: getFaction(selectedCharacter.role).color + '20',
                                    color: getFaction(selectedCharacter.role).color,
                                    borderColor: getFaction(selectedCharacter.role).color
                                }}
                                className="text-[10px]"
                            >
                                {selectedCharacter.role || 'No Role'}
                            </Badge>
                        </div>
                    </div>

                    {/* Character Details */}
                    <div className="space-y-3 text-sm flex-1 overflow-auto">
                        {selectedCharacter.psychological?.archetype && (
                            <div>
                                <span className="text-gray-500 text-xs">Archetype</span>
                                <p className="text-gray-900">{selectedCharacter.psychological.archetype}</p>
                            </div>
                        )}
                        {selectedCharacter.psychological?.wants && (
                            <div>
                                <span className="text-gray-500 text-xs">Wants</span>
                                <p className="text-gray-900 text-xs">{selectedCharacter.psychological.wants}</p>
                            </div>
                        )}
                        {selectedCharacter.psychological?.fears && (
                            <div>
                                <span className="text-gray-500 text-xs">Fears</span>
                                <p className="text-gray-900 text-xs">{selectedCharacter.psychological.fears}</p>
                            </div>
                        )}
                        {(selectedCharacter.swot?.strength || selectedCharacter.swot?.weakness) && (
                            <div className="grid grid-cols-2 gap-2">
                                {selectedCharacter.swot?.strength && (
                                    <div>
                                        <span className="text-green-600 text-xs">Strength</span>
                                        <p className="text-gray-900 text-xs">{selectedCharacter.swot.strength}</p>
                                    </div>
                                )}
                                {selectedCharacter.swot?.weakness && (
                                    <div>
                                        <span className="text-red-600 text-xs">Weakness</span>
                                        <p className="text-gray-900 text-xs">{selectedCharacter.swot.weakness}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Faction Box Component
function FactionBox({
    faction,
    characters,
    selectedId,
    onSelect,
    isHighlighted,
    onHover,
    onLeave
}: {
    faction: typeof FACTIONS[0];
    characters: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isHighlighted: boolean;
    onHover: () => void;
    onLeave: () => void;
}) {
    return (
        <div
            className={`
                rounded-xl border-2 p-3 min-h-[140px] transition-all
                ${faction.bgColor} ${faction.borderColor}
                ${isHighlighted ? 'ring-2 ring-offset-2' : ''}
            `}
            style={{
                boxShadow: isHighlighted ? `0 0 0 2px ${faction.color}40` : undefined
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: faction.color }}
                >
                    {faction.label}
                </span>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-white">
                    {characters.length}
                </Badge>
            </div>

            {/* Characters */}
            {characters.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-gray-400 text-xs">
                    No characters
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {characters.map(char => {
                        const isSelected = selectedId === char.id;
                        return (
                            <div
                                key={char.id}
                                onClick={() => onSelect(char.id)}
                                className={`
                                    flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer
                                    transition-all bg-white border
                                    ${isSelected
                                        ? 'border-orange-400 ring-2 ring-orange-200 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg overflow-hidden flex-shrink-0
                                    ${isSelected ? 'ring-2 ring-orange-400' : 'ring-1 ring-gray-200'}
                                `}>
                                    {char.imageUrl || char.imagePoses?.portrait ? (
                                        <img
                                            src={char.imageUrl || char.imagePoses?.portrait}
                                            className="w-full h-full object-cover"
                                            alt={char.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-gray-900 truncate max-w-[80px]" title={char.name}>
                                    {char.name || 'Unnamed'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
