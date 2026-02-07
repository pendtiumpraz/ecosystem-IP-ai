'use client';

import { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut, Maximize2,
    Film, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScenePlot } from '@/types/storyboard';

interface SequentialViewProps {
    scenes: ScenePlot[];
    onSceneClick: (scene: ScenePlot) => void;
}

export function SequentialView({ scenes, onSceneClick }: SequentialViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [zoom, setZoom] = useState<'small' | 'medium' | 'large'>('medium');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Calculate scroll state
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const element = scrollRef.current;
        if (element) {
            element.addEventListener('scroll', checkScroll);
            return () => element.removeEventListener('scroll', checkScroll);
        }
    }, [scenes]);

    // Scroll handlers
    const scrollBy = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Zoom level sizing
    const getSceneWidth = () => {
        switch (zoom) {
            case 'small': return 'w-40';
            case 'medium': return 'w-56';
            case 'large': return 'w-80';
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'complete': return 'bg-emerald-500';
            case 'scripted': return 'bg-green-500';
            case 'shot_listed': return 'bg-cyan-500';
            case 'storyboarded': return 'bg-blue-500';
            case 'plotted': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Sequential Timeline</h3>
                    <Badge className="bg-blue-500/20 text-blue-400">{scenes.length} scenes</Badge>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom('small')}
                        className={zoom === 'small' ? 'bg-white/10' : 'text-white/60'}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom('medium')}
                        className={zoom === 'medium' ? 'bg-white/10' : 'text-white/60'}
                    >
                        <span className="text-xs">100%</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom('large')}
                        className={zoom === 'large' ? 'bg-white/10' : 'text-white/60'}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Timeline Container */}
            <Card className="bg-white/5 border-white/10 p-4 relative">
                {/* Scroll Left Button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scrollBy('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Scroll Right Button */}
                {canScrollRight && (
                    <button
                        onClick={() => scrollBy('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Scrollable Timeline */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {scenes.map((scene, index) => {
                        const hasImage = !!scene.active_image_version?.image_url;
                        const isSelected = selectedIndex === index;

                        return (
                            <div
                                key={scene.id}
                                className={`flex-shrink-0 ${getSceneWidth()} cursor-pointer group transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-[1.02]'
                                    }`}
                                onClick={() => {
                                    setSelectedIndex(index);
                                    onSceneClick(scene);
                                }}
                            >
                                {/* Scene Card */}
                                <div className={`rounded-xl overflow-hidden border-2 transition-colors ${isSelected ? 'border-blue-500' : 'border-white/10 group-hover:border-white/30'
                                    }`}>
                                    {/* Image */}
                                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                                        {hasImage ? (
                                            <img
                                                src={scene.active_image_version!.image_url}
                                                alt={scene.title || `Scene ${scene.scene_number}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-gray-600" />
                                            </div>
                                        )}

                                        {/* Scene Number */}
                                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${getStatusColor(scene.status)}`}>
                                            {scene.scene_number}
                                        </div>

                                        {/* Play Overlay for clips */}
                                        {scene.active_clip && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Play className="w-5 h-5 text-white fill-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Duration */}
                                        {scene.estimated_duration && (
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
                                                {Math.floor(scene.estimated_duration / 60)}:{String(scene.estimated_duration % 60).padStart(2, '0')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scene Info Below */}
                                <div className="mt-2 px-1">
                                    <p className="text-xs font-medium text-white truncate">
                                        {scene.title || `Scene ${scene.scene_number}`}
                                    </p>
                                    {scene.location && (
                                        <p className="text-[10px] text-white/50 truncate">
                                            📍 {scene.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Timeline Ruler */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                    <span>Scene 1</span>
                    <div className="flex-1 mx-4 h-px bg-gradient-to-r from-white/20 via-white/10 to-white/20" />
                    <span>Scene {scenes.length}</span>
                </div>
            </Card>

            {/* Selected Scene Quick Info */}
            {selectedIndex !== null && scenes[selectedIndex] && (
                <Card className="bg-blue-500/10 border-blue-500/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium">
                                Scene {scenes[selectedIndex].scene_number}: {scenes[selectedIndex].title || 'Untitled'}
                            </h4>
                            {scenes[selectedIndex].synopsis && (
                                <p className="text-sm text-white/60 line-clamp-1 mt-1">
                                    {scenes[selectedIndex].synopsis}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={() => onSceneClick(scenes[selectedIndex])}
                            size="sm"
                            className="bg-blue-500/20 text-blue-400"
                        >
                            <Maximize2 className="w-4 h-4 mr-1" />
                            View Details
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
