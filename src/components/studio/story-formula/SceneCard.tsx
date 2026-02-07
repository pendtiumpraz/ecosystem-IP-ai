'use client';

import { Film, MapPin, Clock, Users, Check, AlertCircle, FileText, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScenePlot, ScenePlotStatus } from '@/types/storyboard';

interface SceneCardProps {
    scene: ScenePlot;
    viewMode: 'grid' | 'list';
    onClick: () => void;
}

const STATUS_CONFIG: Record<ScenePlotStatus, { label: string; color: string; icon: any }> = {
    empty: { label: 'Empty', color: 'bg-gray-400', icon: AlertCircle },
    plotted: { label: 'Plotted', color: 'bg-orange-500', icon: FileText },
    shot_listed: { label: 'Shot Listed', color: 'bg-amber-500', icon: Camera },
    storyboarded: { label: 'Storyboarded', color: 'bg-orange-600', icon: Film },
    scripted: { label: 'Scripted', color: 'bg-orange-400', icon: Check },
    complete: { label: 'Complete', color: 'bg-orange-700', icon: Check }
};

export function SceneCard({ scene, viewMode, onClick }: SceneCardProps) {
    const statusConfig = STATUS_CONFIG[scene.status] || STATUS_CONFIG.empty;
    const StatusIcon = statusConfig.icon;

    if (viewMode === 'list') {
        return (
            <div
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-500/50 cursor-pointer transition-all"
                onClick={onClick}
            >
                {/* Scene Number */}
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 font-bold">{scene.scene_number}</span>
                </div>

                {/* Title & Synopsis */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                            {scene.title || `Scene ${scene.scene_number}`}
                        </h4>
                        <Badge className={`${statusConfig.color} text-white text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                        {scene.synopsis || 'No plot yet'}
                    </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    {scene.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {scene.location}
                        </span>
                    )}
                    {scene.estimated_duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scene.estimated_duration}s
                        </span>
                    )}
                    {scene.characters_involved && scene.characters_involved.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {scene.characters_involved.length}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <Card
            className="bg-gray-50 border-gray-200 hover:border-orange-500/50 cursor-pointer transition-all overflow-hidden"
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">{scene.scene_number}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                        {scene.title || `Scene ${scene.scene_number}`}
                    </h4>
                </div>
                <Badge className={`${statusConfig.color} text-white text-xs`}>
                    <StatusIcon className="w-3 h-3" />
                </Badge>
            </div>

            {/* Body */}
            <div className="p-3 space-y-3">
                {/* Scene Plot */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                    {scene.synopsis || 'No plot yet. Click to add or generate.'}
                </p>

                {/* Emotional Beat */}
                {scene.emotional_beat && (
                    <div className="text-xs text-orange-400 italic">
                        "{scene.emotional_beat}"
                    </div>
                )}

                {/* Metadata Row */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    {scene.location && (
                        <span className="flex items-center gap-1 truncate max-w-[100px]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {scene.location}
                        </span>
                    )}
                    {scene.time_of_day && (
                        <span className="capitalize">{scene.time_of_day}</span>
                    )}
                </div>

                {/* Characters */}
                {scene.characters_involved && scene.characters_involved.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <div className="flex -space-x-1">
                            {scene.characters_involved.slice(0, 3).map((char, idx) => (
                                <div
                                    key={char.id || idx}
                                    className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center"
                                    title={char.name}
                                >
                                    {char.imageUrl ? (
                                        <img src={char.imageUrl} alt={char.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] text-gray-900 font-bold">
                                            {char.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {scene.characters_involved.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-slate-900 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-600">+{scene.characters_involved.length - 3}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Duration */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scene.estimated_duration || 60}s
                    </span>
                    {scene.shots && scene.shots.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {scene.shots.length} shots
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
