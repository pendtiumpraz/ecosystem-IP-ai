'use client';

import { useState } from 'react';
import { Image as ImageIcon, Sparkles, AlertCircle, Loader2, Camera, Brush, Film, Grid3X3, Aperture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/sweetalert';

// Art Style Options - same as MoodboardStudioV2
const ART_STYLES = [
    { id: 'realistic', label: 'Realistic', icon: Camera, desc: 'Cinematic, photorealistic' },
    { id: 'anime', label: 'Anime', icon: Sparkles, desc: 'Japanese animation style' },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Brush, desc: 'Miyazaki-inspired watercolor' },
    { id: 'disney', label: 'Disney/Pixar', icon: Film, desc: '3D animated movie style' },
    { id: 'comic', label: 'Comic Book', icon: Grid3X3, desc: 'Bold lines, dynamic poses' },
    { id: 'noir', label: 'Film Noir', icon: Aperture, desc: 'High contrast, moody shadows' },
];

interface CreateMoodboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    storyVersionId: string;
    userId: string;
    onCreated?: (moodboardId: string) => void;
}

export function CreateMoodboardModal({
    isOpen,
    onClose,
    projectId,
    storyVersionId,
    userId,
    onCreated
}: CreateMoodboardModalProps) {
    const [versionName, setVersionName] = useState('');
    const [artStyle, setArtStyle] = useState('realistic');
    const [keyActionCount, setKeyActionCount] = useState(7);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!storyVersionId) {
            toast.warning('Please select a story version first.');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyVersionId,
                    versionName: versionName.trim() || 'Moodboard v1',
                    artStyle,
                    keyActionCount,
                    createNewVersion: true
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to create moodboard');
            }

            toast.success(`Moodboard "${versionName || 'v1'}" created!`);

            onCreated?.(result.moodboard?.id || result.id);
            onClose();
            setVersionName('');
        } catch (error: any) {
            toast.error(`Creation failed: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Moodboard</DialogTitle>
                    <DialogDescription>
                        Configure the settings for your new moodboard version.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Moodboard Name */}
                    <div>
                        <Label className="text-sm font-medium">Moodboard Name</Label>
                        <p className="text-xs text-gray-500 mb-2">
                            Optional - give your moodboard a memorable name.
                        </p>
                        <input
                            type="text"
                            placeholder="v1"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    {/* Art Style Selector */}
                    <div>
                        <Label className="text-sm font-medium">Art Style</Label>
                        <p className="text-xs text-gray-500 mb-2">
                            Choose the visual style for generated images.
                        </p>
                        <Select value={artStyle} onValueChange={setArtStyle}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ART_STYLES.map(style => (
                                    <SelectItem key={style.id} value={style.id}>
                                        <div className="flex items-center gap-2">
                                            <style.icon className="h-4 w-4" />
                                            <span className="font-medium">{style.label}</span>
                                            <span className="text-xs text-gray-500">- {style.desc}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Key Action Count Slider */}
                    <div>
                        <Label className="text-sm font-medium">
                            Key Actions per Beat: <span className="text-orange-600 font-semibold">{keyActionCount}</span>
                        </Label>
                        <p className="text-xs text-gray-500 mb-3">
                            Number of visual key actions to generate for each story beat.
                        </p>
                        <div className="px-1 py-2">
                            <Slider
                                value={[keyActionCount]}
                                onValueChange={([v]) => setKeyActionCount(v)}
                                min={3}
                                max={10}
                                step={1}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                            <span>3 (quick overview)</span>
                            <span>10 (detailed breakdown)</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-700">
                            <strong>Note:</strong> This will create your moodboard based on the story beats.
                        </p>
                    </div>

                    {/* No story version warning */}
                    {!storyVersionId && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    No story version selected. Please select or create a story first.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !storyVersionId}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
                    >
                        {isCreating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Create Moodboard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
