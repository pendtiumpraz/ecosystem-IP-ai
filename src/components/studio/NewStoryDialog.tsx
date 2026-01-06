'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Copy } from 'lucide-react';

interface StoryVersionListItem {
    id: string;
    versionName: string;
    structure: string;
    premise?: string;
    createdAt: string;
}

interface NewStoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingVersions: StoryVersionListItem[];
    onCreateStory: (params: {
        name?: string;
        structure: string;
        copyFromVersionId?: string;
        isDuplicate?: boolean;
    }) => Promise<void>;
    isCreating: boolean;
}

export function NewStoryDialog({
    open,
    onOpenChange,
    existingVersions,
    onCreateStory,
    isCreating,
}: NewStoryDialogProps) {
    const [structure, setStructure] = useState('Save the Cat');
    const [copyFromVersionId, setCopyFromVersionId] = useState<string>('');
    const [isDuplicate, setIsDuplicate] = useState(false);

    const handleCreate = async () => {
        await onCreateStory({
            structure,
            copyFromVersionId: copyFromVersionId || undefined,
            isDuplicate,
        });
        // Reset form
        setStructure('Save the Cat');
        setCopyFromVersionId('');
        setIsDuplicate(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-orange-500" />
                        Create New Story Version
                    </DialogTitle>
                    <DialogDescription>
                        Create a new story with a different structure, or duplicate an existing one.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Story Structure */}
                    <div className="space-y-2">
                        <Label htmlFor="structure">Story Structure</Label>
                        <Select value={structure} onValueChange={setStructure}>
                            <SelectTrigger id="structure">
                                <SelectValue placeholder="Select structure" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Save the Cat">
                                    Save the Cat (15 beats)
                                </SelectItem>
                                <SelectItem value="The Hero's Journey">
                                    Hero's Journey (12 beats)
                                </SelectItem>
                                <SelectItem value="Dan Harmon Story Circle">
                                    Dan Harmon Story Circle (8 beats)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Name will be auto-generated: "{structure} v{existingVersions.filter(v => v.structure === structure).length + 1}"
                        </p>
                    </div>

                    {/* Copy From Existing */}
                    {existingVersions.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="copyFrom">Copy From (Optional)</Label>
                            <Select
                                value={copyFromVersionId || 'none'}
                                onValueChange={(v) => setCopyFromVersionId(v === 'none' ? '' : v)}
                            >
                                <SelectTrigger id="copyFrom">
                                    <SelectValue placeholder="Start fresh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Start fresh (empty)</SelectItem>
                                    {existingVersions.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.versionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                {copyFromVersionId ? (
                                    isDuplicate
                                        ? "Will copy all data including beats"
                                        : "Will copy premise, genre, tone, theme only"
                                ) : (
                                    "Start with empty story"
                                )}
                            </p>
                        </div>
                    )}

                    {/* Duplicate Toggle */}
                    {copyFromVersionId && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDuplicate"
                                checked={isDuplicate}
                                onChange={(e) => setIsDuplicate(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDuplicate" className="text-sm font-normal cursor-pointer">
                                <div className="flex items-center gap-1">
                                    <Copy className="h-3 w-3" />
                                    Duplicate all content (including beats)
                                </div>
                            </Label>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Story
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
