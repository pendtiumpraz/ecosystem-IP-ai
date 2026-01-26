'use client';

import { useState } from 'react';
import {
    Film, Video, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/lib/sweetalert';

interface CreateAnimationVersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    storyVersionId: string;
    moodboardId: string | null;
    userId: string;
    onCreated?: (animationVersionId: string) => void;
}

export function CreateAnimationVersionModal({
    isOpen,
    onClose,
    projectId,
    storyVersionId,
    moodboardId,
    userId,
    onCreated
}: CreateAnimationVersionModalProps) {
    const [versionName, setVersionName] = useState('');
    const [artStyle, setArtStyle] = useState('cinematic');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!versionName.trim()) {
            toast.warning('Please enter a name for the animation version.');
            return;
        }

        if (!moodboardId) {
            toast.warning('Please create a moodboard with key actions first.');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/animation-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    storyVersionId,
                    moodboardId,
                    name: versionName.trim(),
                    artStyle,
                    createClipsFromMoodboard: true, // Auto-create clips from moodboard items
                    createdBy: userId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create animation version');
            }

            const result = await res.json();

            toast.success(`Created "${versionName}" with ${result.clipsCreated || 0} clips!`);

            onCreated?.(result.id);
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
                    <DialogTitle className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-purple-600" />
                        Create Animation Version
                    </DialogTitle>
                    <DialogDescription>
                        Create an animation version to generate scene plots and animations for your story.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Version Name */}
                    <div>
                        <Label className="text-sm font-medium">Version Name</Label>
                        <p className="text-xs text-gray-500 mb-2">
                            Give your animation version a descriptive name.
                        </p>
                        <input
                            type="text"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            placeholder="e.g., Trailer Cut v1, Full Scene Animation..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    {/* Art Style */}
                    <div>
                        <Label className="text-sm font-medium">Animation Style</Label>
                        <p className="text-xs text-gray-500 mb-2">
                            Choose the visual style for your animations.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'cinematic', label: 'Cinematic' },
                                { value: 'anime', label: 'Anime' },
                                { value: 'realistic', label: 'Realistic' },
                                { value: 'stylized', label: 'Stylized' }
                            ].map(style => (
                                <Button
                                    key={style.value}
                                    variant={artStyle === style.value ? 'default' : 'outline'}
                                    onClick={() => setArtStyle(style.value)}
                                    className={artStyle === style.value
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                        : ''
                                    }
                                >
                                    {style.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div className="text-sm text-purple-700">
                                <p>This will create animation clips from your moodboard key action images.</p>
                                <p className="mt-1">Each key action = 1 animation clip.</p>
                            </div>
                        </div>
                    </div>

                    {/* Missing moodboard warning */}
                    {!moodboardId && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    No moodboard found. Please create a moodboard with key action images first.
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
                        disabled={isCreating || !moodboardId || !versionName.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Video className="w-4 h-4 mr-2" />
                                Create Animation Version
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
