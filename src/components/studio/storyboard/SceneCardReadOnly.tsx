'use client';

import { useState } from 'react';
import {
    Image as ImageIcon, Eye, Wand2, Loader2, Check, AlertCircle,
    ChevronDown, Film, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScenePlot, SceneImageVersion } from '@/types/storyboard';

interface SceneCardReadOnlyProps {
    scene: ScenePlot;
    onPreview: () => void;
    onGenerateImage: () => void;
    onSetActiveVersion: (versionId: string) => void;
}

export function SceneCardReadOnly({
    scene,
    onPreview,
    onGenerateImage,
    onSetActiveVersion
}: SceneCardReadOnlyProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Get active image
    const activeImage = scene.active_image_version;
    const hasImage = !!activeImage?.image_url;
    const hasPlot = scene.status !== 'empty';

    // Handle generate with loading state
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerateImage();
        } finally {
            setIsGenerating(false);
        }
    };

    // Status color
    const getStatusColor = () => {
        switch (scene.status) {
            case 'complete': return 'bg-emerald-500';
            case 'scripted': return 'bg-green-500';
            case 'shot_listed': return 'bg-cyan-500';
            case 'storyboarded': return 'bg-blue-500';
            case 'plotted': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Card
            className="bg-white/5 border-white/10 overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onPreview}
        >
            {/* Image Container */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                {hasImage ? (
                    <img
                        src={activeImage!.image_url}
                        alt={scene.title || `Scene ${scene.scene_number}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {hasPlot ? (
                            <div className="text-center p-4">
                                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">No image yet</p>
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <Film className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">No plot</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scene Number Badge */}
                <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${getStatusColor()}`}>
                    {scene.scene_number.toString().padStart(2, '0')}
                </div>

                {/* Version Badge */}
                {activeImage && (
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-black/60 text-white text-xs">
                            v{activeImage.version_number}
                        </Badge>
                    </div>
                )}

                {/* Hover Overlay */}
                {isHovering && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                            onClick={onPreview}
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                        </Button>
                        {hasPlot && (
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                size="sm"
                                className="bg-blue-500/80 backdrop-blur-sm"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-1" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {/* Status Indicator */}
                {scene.status === 'complete' && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                        {scene.title || `Scene ${scene.scene_number}`}
                    </h4>
                    {/* Version Dropdown - if multiple versions exist */}
                    {/* TODO: Add when image_versions are loaded */}
                </div>

                {scene.synopsis && (
                    <p className="text-xs text-white/60 line-clamp-2 mb-2">
                        {scene.synopsis}
                    </p>
                )}

                {/* Quick Stats */}
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                        {scene.status.replace('_', ' ')}
                    </Badge>
                    {scene.location && (
                        <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                            📍 {scene.location}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}
