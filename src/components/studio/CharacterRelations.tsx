'use client';

import { useState, useMemo } from 'react';
import { User, Heart, Swords, Users, BookOpen, Link2, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/lib/sweetalert';

interface CharacterRelation {
    id: string;
    fromCharId: string;
    toCharId: string;
    type: string;
    label?: string;
}

interface CharacterRelationsProps {
    characters: any[];
    relations: CharacterRelation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRelationsChange: (relations: CharacterRelation[]) => void;
    onGenerateRelations?: () => void;
    isGenerating?: boolean;
}

// Relationship types with colors
const RELATIONSHIP_TYPES = [
    { id: 'loves', label: 'Loves', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-100', lineColor: '#ec4899' },
    { id: 'hates', label: 'Hates', icon: Swords, color: 'text-red-500', bgColor: 'bg-red-100', lineColor: '#ef4444' },
    { id: 'friends', label: 'Friends', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100', lineColor: '#3b82f6' },
    { id: 'rivals', label: 'Rivals', icon: Swords, color: 'text-orange-500', bgColor: 'bg-orange-100', lineColor: '#f97316' },
    { id: 'mentor', label: 'Mentors', icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-100', lineColor: '#a855f7' },
    { id: 'sibling', label: 'Siblings', icon: Users, color: 'text-green-500', bgColor: 'bg-green-100', lineColor: '#22c55e' },
    { id: 'parent', label: 'Parent Of', icon: Users, color: 'text-amber-500', bgColor: 'bg-amber-100', lineColor: '#f59e0b' },
    { id: 'ally', label: 'Allies', icon: Link2, color: 'text-cyan-500', bgColor: 'bg-cyan-100', lineColor: '#06b6d4' },
];

export function CharacterRelations({
    characters,
    relations,
    selectedId,
    onSelect,
    onRelationsChange,
    onGenerateRelations,
    isGenerating
}: CharacterRelationsProps) {
    const [fromCharId, setFromCharId] = useState<string>('');
    const [toCharId, setToCharId] = useState<string>('');
    const [relationType, setRelationType] = useState<string>('friends');

    // Group relations by character for display
    const relationsByChar = useMemo(() => {
        const grouped: Record<string, CharacterRelation[]> = {};
        characters.forEach(c => {
            grouped[c.id] = relations.filter(r => r.fromCharId === c.id || r.toCharId === c.id);
        });
        return grouped;
    }, [characters, relations]);

    const handleAddRelation = () => {
        if (!fromCharId || !toCharId || fromCharId === toCharId) {
            toast.error('Please select two different characters');
            return;
        }

        // Check if relation already exists
        const exists = relations.some(r =>
            (r.fromCharId === fromCharId && r.toCharId === toCharId) ||
            (r.fromCharId === toCharId && r.toCharId === fromCharId)
        );
        if (exists) {
            toast.error('This relationship already exists');
            return;
        }

        const newRelation: CharacterRelation = {
            id: `rel-${Date.now()}`,
            fromCharId,
            toCharId,
            type: relationType,
            label: RELATIONSHIP_TYPES.find(t => t.id === relationType)?.label
        };

        console.log('Adding relation:', newRelation);
        onRelationsChange([...relations, newRelation]);
        setFromCharId('');
        setToCharId('');
        toast.success('Relationship added!');
    };

    const handleRemoveRelation = (relationId: string) => {
        onRelationsChange(relations.filter(r => r.id !== relationId));
        toast.success('Relationship removed');
    };

    const getCharName = (charId: string) => {
        const char = characters.find(c => c.id === charId);
        return char?.name || 'Unknown';
    };

    const getRelType = (typeId: string) => RELATIONSHIP_TYPES.find(t => t.id === typeId);

    return (
        <div className="h-full flex bg-gradient-to-br from-slate-50 to-gray-100">
            {/* LEFT: Character Grid with Relations */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Character Relations</h2>
                        <p className="text-xs text-gray-500">Manage relationships between characters</p>
                    </div>
                    <Button
                        onClick={onGenerateRelations}
                        disabled={isGenerating || characters.length < 2}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Auto Generate
                            </>
                        )}
                    </Button>
                </div>

                {/* Add Relation Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Relationship
                    </h3>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[150px]">
                            <label className="text-xs text-gray-500 mb-1 block">From</label>
                            <Select value={fromCharId} onValueChange={setFromCharId}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select character" />
                                </SelectTrigger>
                                <SelectContent>
                                    {characters.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs">
                                            {c.name || 'Unnamed'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="text-xs text-gray-500 mb-1 block">Relation</label>
                            <Select value={relationType} onValueChange={setRelationType}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RELATIONSHIP_TYPES.map(t => {
                                        const Icon = t.icon;
                                        return (
                                            <SelectItem key={t.id} value={t.id} className="text-xs">
                                                <span className="flex items-center gap-2">
                                                    <Icon className={`h-3 w-3 ${t.color}`} />
                                                    {t.label}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="text-xs text-gray-500 mb-1 block">To</label>
                            <Select value={toCharId} onValueChange={setToCharId}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select character" />
                                </SelectTrigger>
                                <SelectContent>
                                    {characters.filter(c => c.id !== fromCharId).map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs">
                                            {c.name || 'Unnamed'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddRelation}
                            disabled={!fromCharId || !toCharId || fromCharId === toCharId}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white h-9"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>

                {/* Relations List */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        All Relationships ({relations.length})
                    </h3>

                    {relations.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Link2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No relationships yet</p>
                            <p className="text-xs">Add manually or use Auto Generate</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {relations.map(rel => {
                                const relType = getRelType(rel.type);
                                const Icon = relType?.icon || Link2;
                                return (
                                    <div
                                        key={rel.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]" title={getCharName(rel.fromCharId)}>
                                                {getCharName(rel.fromCharId)}
                                            </span>
                                            <Badge className={`${relType?.bgColor} ${relType?.color} text-[10px] gap-1`}>
                                                <Icon className="h-3 w-3" />
                                                {relType?.label}
                                            </Badge>
                                            <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]" title={getCharName(rel.toCharId)}>
                                                {getCharName(rel.toCharId)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveRelation(rel.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Character List */}
            <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Characters</h3>
                    <p className="text-xs text-gray-500">{characters.length} characters</p>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {characters.map(char => {
                            const charRels = relationsByChar[char.id] || [];
                            const isSelected = selectedId === char.id;
                            return (
                                <div
                                    key={char.id}
                                    onClick={() => onSelect(char.id)}
                                    className={`
                                        p-3 rounded-xl cursor-pointer transition-all
                                        ${isSelected
                                            ? 'bg-orange-50 border-2 border-orange-400 shadow-md'
                                            : 'bg-gray-50 border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
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
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                {char.name || 'Unnamed'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase">
                                                {char.role || 'No role'}
                                            </p>
                                        </div>
                                        {charRels.length > 0 && (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                {charRels.length}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
