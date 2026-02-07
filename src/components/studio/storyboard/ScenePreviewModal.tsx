'use client';

import {
    X, MapPin, Clock, Users, Film, Wand2, Loader2, ExternalLink,
    ChevronLeft, ChevronRight, Image as ImageIcon, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScenePlot } from '@/types/storyboard';

interface ScenePreviewModalProps {
    scene: ScenePlot;
    isOpen: boolean;
    onClose: () => void;
    onEditInStoryFormula?: () => void;
    onGenerateImage?: () => void;
}

export function ScenePreviewModal({
    scene,
    isOpen,
    onClose,
    onEditInStoryFormula,
    onGenerateImage
}: ScenePreviewModalProps) {
    if (!isOpen) return null;

    const activeImage = scene.active_image_version;
    const hasImage = !!activeImage?.image_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-5xl mx-4 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col lg:flex-row">
                    {/* Left - Large Image Preview */}
                    <div className="lg:w-2/3 relative">
                        <div className="aspect-video lg:aspect-auto lg:h-[600px] bg-gradient-to-br from-gray-800 to-gray-900">
                            {hasImage ? (
                                <img
                                    src={activeImage!.image_url}
                                    alt={scene.title || `Scene ${scene.scene_number}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">No storyboard image generated yet</p>
                                        {scene.synopsis && (
                                            <Button
                                                onClick={onGenerateImage}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600"
                                            >
                                                <Wand2 className="w-4 h-4 mr-2" />
                                                Generate Storyboard Image
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Version Indicator */}
                        {activeImage && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <Badge className="bg-black/60 text-white">
                                    Version {activeImage.version_number}
                                </Badge>
                                <Badge className="bg-black/60 text-white">
                                    {activeImage.generation_mode === 'i2i' ? 'Image to Image' : 'Text to Image'}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Right - Scene Info */}
                    <div className="lg:w-1/3 p-6 overflow-y-auto max-h-[600px]">
                        {/* Scene Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold">{scene.scene_number}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {scene.title || `Scene ${scene.scene_number}`}
                                    </h2>
                                    <Badge variant="outline" className="text-xs capitalize border-white/20 text-white/60">
                                        {scene.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Scene Details */}
                        <div className="space-y-4">
                            {/* Location */}
                            {scene.location && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>Location</span>
                                    </div>
                                    <p className="text-white">{scene.location}</p>
                                </div>
                            )}

                            {/* Time */}
                            {scene.time_of_day && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Time of Day</span>
                                    </div>
                                    <p className="text-white">{scene.time_of_day}</p>
                                </div>
                            )}

                            {/* Characters */}
                            {scene.characters_involved && scene.characters_involved.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                        <Users className="w-4 h-4" />
                                        <span>Characters ({scene.characters_involved.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {scene.characters_involved.map((char, idx) => (
                                            <Badge
                                                key={idx}
                                                className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                                            >
                                                {char.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Synopsis */}
                            {scene.synopsis && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                                        <Film className="w-4 h-4" />
                                        <span>Synopsis</span>
                                    </div>
                                    <p className="text-white text-sm leading-relaxed">{scene.synopsis}</p>
                                </div>
                            )}

                            {/* No Plot Message */}
                            {!scene.synopsis && (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                                    <p className="text-amber-400 text-sm mb-2">
                                        This scene doesn't have a plot yet.
                                    </p>
                                    <Button
                                        onClick={onEditInStoryFormula}
                                        variant="outline"
                                        size="sm"
                                        className="border-amber-500/50 text-amber-400"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Add Plot in Story Formula
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            {scene.synopsis && (
                                <Button
                                    onClick={onGenerateImage}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    {hasImage ? 'Regenerate Image' : 'Generate Image'}
                                </Button>
                            )}

                            <Button
                                onClick={onEditInStoryFormula}
                                variant="outline"
                                className="w-full border-white/20 text-white"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Edit in Story Formula
                            </Button>
                        </div>

                        {/* Image Metadata */}
                        {activeImage && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-sm font-medium text-white/60 mb-2">Generation Details</h4>
                                <div className="space-y-1 text-xs text-white/40">
                                    {activeImage.provider && (
                                        <div>Provider: {activeImage.provider}</div>
                                    )}
                                    {activeImage.model && (
                                        <div>Model: {activeImage.model}</div>
                                    )}
                                    {activeImage.credit_cost > 0 && (
                                        <div>Credits Used: {activeImage.credit_cost}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
