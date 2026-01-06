'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, ZoomIn, ZoomOut, Maximize, Stars, Crown, Swords, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CharacterConstellationProps {
    characters: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

// Orbit configurations by role
const ORBITS = [
    { id: 'protagonist', label: 'Heroes', roles: ['protagonist', 'hero'], color: '#f97316', radius: 0, scale: 1.3 },
    { id: 'core', label: 'Core Cast', roles: ['love interest', 'deuteragonist', 'confidant'], color: '#ec4899', radius: 120, scale: 1.1 },
    { id: 'support', label: 'Support', roles: ['mentor', 'sidekick', 'supporting', 'foil', 'comic relief'], color: '#3b82f6', radius: 220, scale: 1 },
    { id: 'antagonist', label: 'Opposition', roles: ['antagonist', 'villain'], color: '#ef4444', radius: 320, scale: 1 },
    { id: 'other', label: 'Others', roles: [], color: '#6b7280', radius: 400, scale: 0.9 },
];

const getOrbit = (role: string) => {
    if (!role) return ORBITS[4]; // others
    const normalized = role.toLowerCase();
    for (const orbit of ORBITS) {
        if (orbit.roles.some(r => normalized.includes(r))) {
            return orbit;
        }
    }
    return ORBITS[4]; // others
};

export function CharacterConstellation({ characters, selectedId, onSelect }: CharacterConstellationProps) {
    const [scale, setScale] = useState(0.9);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [animationOffset, setAnimationOffset] = useState(0);

    // Subtle animation
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationOffset(prev => (prev + 0.002) % (2 * Math.PI));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Group characters by orbit
    const charactersByOrbit = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        ORBITS.forEach(orbit => {
            grouped[orbit.id] = [];
        });
        characters.forEach(char => {
            const orbit = getOrbit(char.role);
            grouped[orbit.id].push(char);
        });
        return grouped;
    }, [characters]);

    // Calculate positions
    const getCharacterPosition = (char: any, index: number, orbitChars: any[], orbit: typeof ORBITS[0]) => {
        const centerX = 450;
        const centerY = 350;

        if (orbit.id === 'protagonist') {
            // Heroes at center, arranged in small cluster
            const heroAngle = (index / Math.max(orbitChars.length, 1)) * 2 * Math.PI;
            const heroRadius = orbitChars.length > 1 ? 50 : 0;
            return {
                x: centerX + Math.cos(heroAngle + animationOffset * 0.5) * heroRadius,
                y: centerY + Math.sin(heroAngle + animationOffset * 0.5) * heroRadius
            };
        }

        // Others in orbital rings
        const angle = (index / orbitChars.length) * 2 * Math.PI - Math.PI / 2;
        const wobble = Math.sin(animationOffset * 3 + index) * 5;
        return {
            x: centerX + Math.cos(angle + animationOffset * (0.3 - orbit.radius * 0.0005)) * (orbit.radius + wobble),
            y: centerY + Math.sin(angle + animationOffset * (0.3 - orbit.radius * 0.0005)) * (orbit.radius + wobble)
        };
    };

    // Pan handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.character-node')) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div
            className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Starfield Background */}
            <div className="absolute inset-0 opacity-40">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: Math.random() * 0.7 + 0.3
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-400/30">
                    <Stars className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Character Constellation</h2>
                    <p className="text-xs text-purple-300">Visualizing your cast hierarchy</p>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-20 z-10 flex items-center gap-2">
                {ORBITS.slice(0, 4).map(orbit => (
                    <Badge
                        key={orbit.id}
                        variant="outline"
                        className="text-[10px] border-0 backdrop-blur-sm"
                        style={{ backgroundColor: orbit.color + '30', color: orbit.color }}
                    >
                        {orbit.label}: {charactersByOrbit[orbit.id].length}
                    </Badge>
                ))}
            </div>

            {/* Canvas Content */}
            <div
                className="absolute w-full h-full"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center'
                }}
            >
                {/* Orbital Rings */}
                {ORBITS.filter(o => o.radius > 0).map(orbit => (
                    <div
                        key={orbit.id}
                        className="absolute rounded-full border border-dashed pointer-events-none"
                        style={{
                            width: orbit.radius * 2,
                            height: orbit.radius * 2,
                            left: 450 - orbit.radius,
                            top: 350 - orbit.radius,
                            borderColor: orbit.color + '40',
                        }}
                    />
                ))}

                {/* Center Glow */}
                <div
                    className="absolute w-64 h-64 rounded-full pointer-events-none"
                    style={{
                        left: 450 - 128,
                        top: 350 - 128,
                        background: `radial-gradient(circle, ${ORBITS[0].color}20 0%, transparent 70%)`
                    }}
                />

                {/* Character Nodes */}
                {ORBITS.map(orbit =>
                    charactersByOrbit[orbit.id].map((char, index) => {
                        const pos = getCharacterPosition(char, index, charactersByOrbit[orbit.id], orbit);
                        const isSelected = selectedId === char.id;
                        const nodeSize = 70 * orbit.scale;

                        return (
                            <div
                                key={char.id}
                                className="character-node absolute pointer-events-auto transition-transform duration-300 hover:scale-110 cursor-pointer group"
                                style={{
                                    left: pos.x - nodeSize / 2,
                                    top: pos.y - nodeSize / 2,
                                    zIndex: isSelected ? 50 : orbit.id === 'protagonist' ? 40 : 10
                                }}
                                onClick={() => onSelect(char.id)}
                            >
                                {/* Glow Effect */}
                                <div
                                    className={`absolute inset-0 rounded-full blur-xl transition-opacity ${isSelected ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}
                                    style={{ backgroundColor: orbit.color }}
                                />

                                {/* Node Body */}
                                <div
                                    className={`
                                        relative rounded-full overflow-hidden border-2 transition-all duration-300
                                        ${isSelected ? 'ring-4 ring-offset-2 ring-offset-transparent' : ''}
                                    `}
                                    style={{
                                        width: nodeSize,
                                        height: nodeSize,
                                        borderColor: orbit.color,
                                        boxShadow: `0 0 20px ${orbit.color}60`
                                    }}
                                >
                                    {char.imageUrl || char.imagePoses?.portrait ? (
                                        <img
                                            src={char.imageUrl || char.imagePoses?.portrait}
                                            className="w-full h-full object-cover"
                                            alt={char.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                            <User className="text-slate-400" style={{ width: nodeSize * 0.4, height: nodeSize * 0.4 }} />
                                        </div>
                                    )}
                                </div>

                                {/* Name Label */}
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                                    style={{ top: nodeSize + 8 }}
                                >
                                    <p className="text-sm font-bold text-white drop-shadow-lg">
                                        {char.name || 'Unnamed'}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] border-0 mt-0.5"
                                        style={{ backgroundColor: orbit.color + '40', color: 'white' }}
                                    >
                                        {char.role || orbit.label}
                                    </Badge>
                                </div>

                                {/* Role Icon */}
                                <div
                                    className="absolute -top-1 -right-1 p-1 rounded-full"
                                    style={{ backgroundColor: orbit.color }}
                                >
                                    {orbit.id === 'protagonist' && <Crown className="h-3 w-3 text-white" />}
                                    {orbit.id === 'antagonist' && <Swords className="h-3 w-3 text-white" />}
                                    {orbit.id === 'core' && <Heart className="h-3 w-3 text-white" />}
                                    {(orbit.id === 'support' || orbit.id === 'other') && <Users className="h-3 w-3 text-white" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
                <Button
                    size="icon"
                    variant="outline"
                    className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 backdrop-blur-sm"
                    onClick={() => setScale(s => Math.min(s + 0.1, 1.5))}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 backdrop-blur-sm"
                    onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 backdrop-blur-sm"
                    onClick={() => { setScale(0.9); setPosition({ x: 0, y: 0 }); }}
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>

            {/* Info Panel for Selected Character */}
            {selectedId && (() => {
                const char = characters.find(c => c.id === selectedId);
                if (!char) return null;
                const orbit = getOrbit(char.role);

                return (
                    <div className="absolute bottom-6 left-6 z-50 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600 w-[280px]">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: orbit.color }}>
                                {char.imageUrl || char.imagePoses?.portrait ? (
                                    <img src={char.imageUrl || char.imagePoses?.portrait} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                        <User className="h-6 w-6 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{char.name || 'Unnamed'}</h3>
                                <Badge
                                    variant="outline"
                                    className="text-xs border-0"
                                    style={{ backgroundColor: orbit.color + '40', color: 'white' }}
                                >
                                    {char.role} • {char.psychological?.archetype || 'Unknown Archetype'}
                                </Badge>
                            </div>
                        </div>
                        {(char.psychological?.fears || char.psychological?.wants) && (
                            <div className="mt-3 pt-3 border-t border-slate-600 text-xs text-slate-300 space-y-1">
                                {char.psychological?.fears && <p><span className="text-slate-500">Fears:</span> {char.psychological.fears}</p>}
                                {char.psychological?.wants && <p><span className="text-slate-500">Wants:</span> {char.psychological.wants}</p>}
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}
