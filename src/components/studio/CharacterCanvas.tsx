'use client';

import { useState } from 'react';
import { User, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interface (Simplified)
interface CharacterCanvasProps {
    characters: any[];
    onSelect: (id: string) => void;
    selectedId: string | null;
    onUpdatePosition?: (id: string, x: number, y: number) => void;
}

export function CharacterCanvas({ characters, onSelect, selectedId, onUpdatePosition }: CharacterCanvasProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Panning Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag canvas if clicking background
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

    // Character Node Drag Logic (Simple implementation)
    const handleNodeClick = (e: React.MouseEvent, charId: string) => {
        e.stopPropagation();
        onSelect(charId);
    };

    return (
        <div
            className="w-full h-full bg-[#0a0a0f] relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                    backgroundSize: `${40 * scale}px ${40 * scale}px`,
                    backgroundPosition: `${position.x}px ${position.y}px`
                }}
            />

            {/* Canvas Content Layer */}
            <div
                className="absolute w-full h-full pointer-events-none"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: '0 0'
                }}
            >
                {characters.map((char, index) => {
                    // Mock positions if not exist. Spiral layout by default for demo.
                    // We use a predefined visual layout generator as fallback
                    const angle = index * 0.8;
                    const radius = 150 + (index * 80);
                    // Center roughly at 400, 400 relative
                    const startX = 600;
                    const startY = 400;

                    const x = char.position?.x ?? (startX + Math.cos(angle) * radius);
                    const y = char.position?.y ?? (startY + Math.sin(angle) * radius);

                    const isSelected = selectedId === char.id;

                    return (
                        <div
                            key={char.id}
                            className={`character-node absolute pointer-events-auto transition-transform duration-200 hover:scale-110 group ${isSelected ? 'z-50 scale-125' : 'z-10'}`}
                            style={{ left: x, top: y }}
                            onMouseDown={(e) => handleNodeClick(e, char.id)}
                        >
                            {/* Node Body */}
                            <div className={`
                      relative w-24 h-24 rounded-full p-1 cursor-pointer
                      ${isSelected
                                    ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                                    : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl border border-white/10 group-hover:border-white/50'}
                   `}>
                                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative">
                                    {char.imageUrl || char.imagePoses?.portrait ? (
                                        <img src={char.imageUrl || char.imagePoses?.portrait} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <User className="text-slate-500 h-8 w-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Name Badge */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-center min-w-[100px]">
                                    <p className="text-[10px] font-bold text-white whitespace-nowrap">{char.name || 'Unnamed'}</p>
                                    <p className="text-[8px] text-emerald-400 uppercase tracking-wider">{char.role || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
                <Button size="icon" variant="outline" className="bg-black/50 border-white/10 text-white hover:bg-white/10" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="bg-black/50 border-white/10 text-white hover:bg-white/10" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="bg-black/50 border-white/10 text-white hover:bg-white/10" onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}>
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
