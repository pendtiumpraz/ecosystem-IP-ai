'use client';

import { useState } from 'react';
import { Image as ImageIcon, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/lib/sweetalert';

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
    const [artStyle, setArtStyle] = useState('cinematic');
    const [keyActionCount, setKeyActionCount] = useState(3);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!storyVersionId) {
            toast.warning('Please select a story version first.');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/moodboards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    storyVersionId,
                    versionName: versionName.trim() || 'Moodboard v1',
                    artStyle,
                    keyActionCount,
                    createdBy: userId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create moodboard');
            }

            const result = await res.json();

            toast.success(`Moodboard "${versionName || 'v1'}" created!`);

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
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <ImageIcon className="w-5 h-5 text-cyan-400" />
                        Create Moodboard
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Create a moodboard to visualize your story beats with key action images.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Version Name */}
                    <div className="space-y-2">
                        <Label className="text-white/80">Moodboard Name</Label>
                        <Input
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            placeholder="e.g., Main Visual Style, Concept Art v1..."
                            className="bg-white/5 border-white/20 text-white"
                        />
                    </div>

                    {/* Art Style */}
                    <div className="space-y-2">
                        <Label className="text-white/80">Visual Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'cinematic', label: 'Cinematic' },
                                { value: 'anime', label: 'Anime' },
                                { value: '3d', label: '3D Render' },
                                { value: 'illustration', label: 'Illustration' }
                            ].map(style => (
                                <Button
                                    key={style.value}
                                    variant={artStyle === style.value ? 'default' : 'outline'}
                                    onClick={() => setArtStyle(style.value)}
                                    className={artStyle === style.value
                                        ? 'bg-cyan-600 hover:bg-cyan-500'
                                        : 'border-white/20 text-white/70 hover:bg-white/10'
                                    }
                                >
                                    {style.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Key Actions per Beat */}
                    <div className="space-y-2">
                        <Label className="text-white/80">Key Actions per Beat</Label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <Button
                                    key={num}
                                    variant={keyActionCount === num ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setKeyActionCount(num)}
                                    className={keyActionCount === num
                                        ? 'bg-cyan-600 hover:bg-cyan-500 w-10'
                                        : 'border-white/20 text-white/70 hover:bg-white/10 w-10'
                                    }
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-white/50">
                            How many key action images per story beat
                        </p>
                    </div>

                    {/* Info */}
                    <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <div className="text-sm text-white/70">
                                <p>This will create key action slots for each story beat.</p>
                                <p className="mt-1">Generate images using AI or upload your own.</p>
                            </div>
                        </div>
                    </div>

                    {/* No story version warning */}
                    {!storyVersionId && (
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                                <div className="text-sm text-amber-400">
                                    <p>No story version selected. Please select or create a story first.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/70 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !storyVersionId}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Create Moodboard
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
