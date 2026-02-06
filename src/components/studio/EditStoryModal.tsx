'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Edit3,
    BookOpen,
    Crown,
    User,
    Search
} from 'lucide-react';

interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
}

interface EditStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    characters: Character[];
    // Existing story data
    storyId: string;
    storyName: string;
    structureType: string;
    characterIds: string[];
    onUpdateStory: (data: {
        storyId: string;
        name: string;
        characterIds: string[];
    }) => Promise<void>;
    isLoading?: boolean;
}

// Map structure type to display name (handles both code format and DB format)
const getStructureDisplayName = (type: string) => {
    const normalizedType = type?.toLowerCase() || '';

    // Check for hero journey variants
    if (normalizedType.includes('hero') || normalizedType === 'hero-journey') {
        return "Hero's Journey (12 steps)";
    }
    // Check for dan harmon variants
    if (normalizedType.includes('harmon') || normalizedType === 'dan-harmon') {
        return 'Dan Harmon Story Circle (8 steps)';
    }
    // Check for three act variants
    if (normalizedType.includes('three') || normalizedType === 'three-act') {
        return 'Three Act Structure (8 steps)';
    }
    // Check for freytag variants
    if (normalizedType.includes('freytag') || normalizedType === 'freytag') {
        return "Freytag's Pyramid (5 steps)";
    }
    // Check for save the cat variants
    if (normalizedType.includes('cat') || normalizedType === 'save-the-cat') {
        return 'Save the Cat (15 steps)';
    }
    // Check for custom
    if (normalizedType.includes('custom') || normalizedType === 'custom') {
        return 'Custom Structure';
    }

    // Default: show the raw value or save the cat
    return type || 'Save the Cat (15 steps)';
};

export function EditStoryModal({
    open,
    onOpenChange,
    characters,
    storyId,
    storyName: initialStoryName,
    structureType,
    characterIds: initialCharacterIds,
    onUpdateStory,
    isLoading = false,
}: EditStoryModalProps) {
    const [storyName, setStoryName] = useState(initialStoryName);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(initialCharacterIds);
    const [searchQuery, setSearchQuery] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setStoryName(initialStoryName);
            setSelectedCharacterIds(initialCharacterIds);
            setSearchQuery('');
        }
    }, [open, initialStoryName, initialCharacterIds]);

    // Check if there's a protagonist
    const protagonist = useMemo(() =>
        characters.find(c => c.role?.toLowerCase() === 'protagonist'),
        [characters]
    );

    // Filter characters by search
    const filteredCharacters = useMemo(() =>
        characters.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [characters, searchQuery]
    );

    // Toggle character selection - protagonist can also be toggled
    const toggleCharacter = (charId: string) => {
        setSelectedCharacterIds(prev =>
            prev.includes(charId)
                ? prev.filter(id => id !== charId)
                : [...prev, charId]
        );
    };

    // Select all / deselect all
    const selectAll = () => {
        setSelectedCharacterIds(characters.map(c => c.id));
    };

    const deselectAll = () => {
        setSelectedCharacterIds([]);
    };

    // Handle update
    const handleUpdate = async () => {
        if (!storyName.trim()) {
            return;
        }

        await onUpdateStory({
            storyId,
            name: storyName.trim(),
            characterIds: selectedCharacterIds,
        });

        onOpenChange(false);
    };

    const hasChanges = storyName !== initialStoryName ||
        JSON.stringify(selectedCharacterIds.sort()) !== JSON.stringify(initialCharacterIds.sort());

    // Check if protagonist is selected (required)
    const protagonistSelected = protagonist ? selectedCharacterIds.includes(protagonist.id) : true;
    const isValid = storyName.trim() && selectedCharacterIds.length > 0 && protagonistSelected;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-visible flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Edit3 className="h-5 w-5 text-orange-500" />
                        Edit Story
                    </DialogTitle>
                    <DialogDescription>
                        Edit nama dan karakter untuk story ini
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto flex flex-col space-y-4 px-1">
                    {/* Story Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-story-name" className="text-sm font-medium">
                            Nama Story <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-story-name"
                            placeholder="Contoh: Main Story - The Beginning"
                            value={storyName}
                            onChange={(e) => setStoryName(e.target.value)}
                            className="border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                        />
                    </div>

                    {/* Structure Type - Read Only */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Story Structure</Label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">{getStructureDisplayName(structureType)}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                                Locked
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                            Structure tidak bisa diubah. Buat story baru jika ingin structure berbeda.
                        </p>
                    </div>

                    {/* Character Selection */}
                    <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                Pilih Karakter ({selectedCharacterIds.length} dipilih)
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={selectAll}
                                >
                                    Pilih Semua
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={deselectAll}
                                >
                                    Hapus Semua
                                </Button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari karakter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-sm border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                            />
                        </div>

                        {/* Character List - Fixed height with overflow scroll */}
                        <div className="border rounded-lg p-2 h-[180px] overflow-y-auto">
                            <div className="space-y-1">
                                {filteredCharacters.map((char) => {
                                    const isProtagonist = char.role?.toLowerCase() === 'protagonist';
                                    const isSelected = selectedCharacterIds.includes(char.id);

                                    return (
                                        <div
                                            key={char.id}
                                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected
                                                ? 'bg-orange-100 border border-orange-300'
                                                : 'hover:bg-gray-50'
                                                } ${isProtagonist ? 'ring-2 ring-orange-400' : ''}`}
                                            onClick={() => toggleCharacter(char.id)}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleCharacter(char.id)}
                                            />
                                            {char.imageUrl ? (
                                                <img
                                                    src={char.imageUrl}
                                                    alt={char.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-orange-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{char.name}</div>
                                            </div>
                                            <Badge
                                                variant={isProtagonist ? 'default' : 'secondary'}
                                                className={`text-xs ${isProtagonist ? 'bg-orange-500' : ''}`}
                                            >
                                                {isProtagonist && <Crown className="h-3 w-3 mr-1" />}
                                                {char.role || 'Unknown'}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={!isValid || !hasChanges || isLoading}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
