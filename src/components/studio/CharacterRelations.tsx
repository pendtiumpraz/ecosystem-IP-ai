'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Heart, Swords, Users, BookOpen, Link2, Plus, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterRelationsProps {
    characters: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: any) => void;
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

interface Relationship {
    id: string;
    targetId: string;
    type: string;
}

export function CharacterRelations({ characters, selectedId, onSelect, onUpdate }: CharacterRelationsProps) {
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [connectingType, setConnectingType] = useState('friends');
    const canvasRef = useRef<HTMLDivElement>(null);
    const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

    // Initialize node positions in a circle layout
    useEffect(() => {
        if (characters.length > 0 && Object.keys(nodePositions).length !== characters.length) {
            const centerX = 400;
            const centerY = 300;
            const radius = Math.min(250, 80 + characters.length * 30);

            const positions: Record<string, { x: number, y: number }> = {};
            characters.forEach((char, i) => {
                const angle = (i / characters.length) * 2 * Math.PI - Math.PI / 2;
                positions[char.id] = {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                };
            });
            setNodePositions(positions);
        }
    }, [characters]);

    // Get all relationships from all characters
    const getAllRelationships = () => {
        const rels: { from: string, to: string, type: string }[] = [];
        characters.forEach(char => {
            if (char.relationships) {
                char.relationships.forEach((rel: Relationship) => {
                    rels.push({ from: char.id, to: rel.targetId, type: rel.type });
                });
            }
        });
        return rels;
    };

    const relationships = getAllRelationships();

    const handleNodeClick = (charId: string) => {
        if (connectingFrom) {
            if (connectingFrom !== charId) {
                // Create relationship
                const fromChar = characters.find(c => c.id === connectingFrom);
                if (fromChar) {
                    const existingRels = fromChar.relationships || [];
                    const newRel: Relationship = {
                        id: `rel-${Date.now()}`,
                        targetId: charId,
                        type: connectingType
                    };
                    onUpdate(connectingFrom, {
                        relationships: [...existingRels, newRel]
                    });
                }
            }
            setConnectingFrom(null);
        } else {
            onSelect(charId);
        }
    };

    const startConnecting = (charId: string) => {
        setConnectingFrom(charId);
    };

    const removeRelationship = (fromId: string, toId: string) => {
        const char = characters.find(c => c.id === fromId);
        if (char && char.relationships) {
            const updated = char.relationships.filter((r: Relationship) => r.targetId !== toId);
            onUpdate(fromId, { relationships: updated });
        }
    };

    const getRelTypeInfo = (type: string) => {
        return RELATIONSHIP_TYPES.find(t => t.id === type) || RELATIONSHIP_TYPES[2]; // default to friends
    };

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-purple-50/30 flex">
            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
                {/* Header */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Link2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Character Relations</h2>
                        <p className="text-xs text-gray-500">Click a character, then click another to connect</p>
                    </div>
                </div>

                {/* Relationship Type Selector */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 font-bold">Type:</span>
                    <Select value={connectingType} onValueChange={setConnectingType}>
                        <SelectTrigger className="h-8 w-[120px] text-xs border-0 bg-transparent">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {RELATIONSHIP_TYPES.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    <div className="flex items-center gap-2">
                                        <t.icon className={`h-3 w-3 ${t.color}`} />
                                        {t.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* SVG Lines for Relationships */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                        </marker>
                    </defs>
                    {relationships.map((rel, i) => {
                        const fromPos = nodePositions[rel.from];
                        const toPos = nodePositions[rel.to];
                        if (!fromPos || !toPos) return null;

                        const relType = getRelTypeInfo(rel.type);
                        const dx = toPos.x - fromPos.x;
                        const dy = toPos.y - fromPos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const offsetX = (dx / dist) * 40;
                        const offsetY = (dy / dist) * 40;

                        return (
                            <g key={`${rel.from}-${rel.to}-${i}`}>
                                <line
                                    x1={fromPos.x + offsetX}
                                    y1={fromPos.y + offsetY}
                                    x2={toPos.x - offsetX}
                                    y2={toPos.y - offsetY}
                                    stroke={relType.lineColor}
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                    markerEnd="url(#arrowhead)"
                                />
                                {/* Relationship label */}
                                <text
                                    x={(fromPos.x + toPos.x) / 2}
                                    y={(fromPos.y + toPos.y) / 2 - 8}
                                    fill={relType.lineColor}
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {relType.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Character Nodes */}
                {characters.map(char => {
                    const pos = nodePositions[char.id] || { x: 100, y: 100 };
                    const isSelected = selectedId === char.id;
                    const isConnecting = connectingFrom === char.id;

                    return (
                        <div
                            key={char.id}
                            className={`
                                absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                transition-all duration-200 group
                            `}
                            style={{ left: pos.x, top: pos.y }}
                            onClick={() => handleNodeClick(char.id)}
                        >
                            {/* Node Circle */}
                            <div className={`
                                relative w-20 h-20 rounded-full overflow-hidden border-4
                                transition-all duration-200
                                ${isConnecting ? 'border-purple-500 ring-4 ring-purple-200 scale-110' :
                                    isSelected ? 'border-orange-400 ring-4 ring-orange-200' :
                                        'border-white shadow-lg hover:scale-110'}
                            `}>
                                {char.imageUrl || char.imagePoses?.portrait ? (
                                    <img src={char.imageUrl || char.imagePoses?.portrait} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Name Label */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                                <p className="text-sm font-bold text-gray-900 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                                    {char.name || 'Unnamed'}
                                </p>
                                <p className="text-[10px] text-gray-500">{char.role}</p>
                            </div>

                            {/* Connect Button */}
                            <Button
                                size="icon"
                                variant="ghost"
                                className={`
                                    absolute -top-2 -right-2 h-6 w-6 rounded-full
                                    bg-purple-500 text-white opacity-0 group-hover:opacity-100
                                    hover:bg-purple-600 transition-opacity
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startConnecting(char.id);
                                }}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    );
                })}

                {/* Connecting Mode Indicator */}
                {connectingFrom && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 z-50">
                        <ArrowRight className="h-4 w-4" />
                        Click another character to create "{getRelTypeInfo(connectingType).label}" relationship
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 ml-2 hover:bg-purple-600"
                            onClick={() => setConnectingFrom(null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Relationship List Panel */}
            <div className="w-[280px] border-l border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">All Relationships</h3>
                    <p className="text-xs text-gray-500">{relationships.length} connections</p>
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                    <div className="p-2 space-y-2">
                        {relationships.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Link2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No relationships yet</p>
                                <p className="text-xs mt-1">Click + on a character to start connecting</p>
                            </div>
                        ) : (
                            relationships.map((rel, i) => {
                                const fromChar = characters.find(c => c.id === rel.from);
                                const toChar = characters.find(c => c.id === rel.to);
                                const relType = getRelTypeInfo(rel.type);
                                if (!fromChar || !toChar) return null;

                                return (
                                    <div
                                        key={`${rel.from}-${rel.to}-${i}`}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 group"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                            {fromChar.imageUrl || fromChar.imagePoses?.portrait ? (
                                                <img src={fromChar.imageUrl || fromChar.imagePoses?.portrait} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{fromChar.name}</p>
                                            <Badge variant="outline" className={`text-[9px] ${relType.color} ${relType.bgColor} border-0`}>
                                                {relType.label}
                                            </Badge>
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                            {toChar.imageUrl || toChar.imagePoses?.portrait ? (
                                                <img src={toChar.imageUrl || toChar.imagePoses?.portrait} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => removeRelationship(rel.from, rel.to)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
