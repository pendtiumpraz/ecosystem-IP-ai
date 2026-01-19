'use client';

import React, { useState, useMemo } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sparkles,
    Users,
    BookOpen,
    AlertTriangle,
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

interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    characters: Character[];
    onCreateStory: (data: {
        name: string;
        structureType: string;
        theme?: string;
        characterIds: string[];
    }) => Promise<void>;
    isLoading?: boolean;
    canDismiss?: boolean; // If false, modal cannot be closed until story is created
}

const STRUCTURE_TYPES = [
    {
        id: 'hero-journey',
        name: "Hero's Journey",
        description: '12 langkah perjalanan pahlawan klasik',
        steps: 12,
        icon: '🦸',
    },
    {
        id: 'save-the-cat',
        name: 'Save the Cat',
        description: '15 beat untuk cerita yang engaging',
        steps: 15,
        icon: '🐱',
    },
    {
        id: 'dan-harmon',
        name: 'Dan Harmon Story Circle',
        description: '8 langkah storytelling sederhana tapi powerful',
        steps: 8,
        icon: '⭕',
    },
];

// Story Theme Options with detailed conflicts and story direction
const STORY_THEMES = [
    {
        id: 'redemption',
        name: 'Redemption',
        icon: '🙏',
        description: 'Karakter mencari penebusan dosa dari masa lalu',
        conflicts: ['Internal guilt', 'Society rejection', 'Self-forgiveness'],
        typicalEnding: 'hopeful',
        examples: 'Schindler\'s List, The Shawshank Redemption',
    },
    {
        id: 'coming-of-age',
        name: 'Coming of Age',
        icon: '🌱',
        description: 'Perjalanan kedewasaan dan menemukan jati diri',
        conflicts: ['Identity crisis', 'Parental expectations', 'First love/loss'],
        typicalEnding: 'bittersweet',
        examples: 'Stand By Me, The Breakfast Club',
    },
    {
        id: 'good-vs-evil',
        name: 'Good vs Evil',
        icon: '⚔️',
        description: 'Pertarungan antara kebaikan melawan kejahatan',
        conflicts: ['Moral dilemmas', 'Sacrifice for greater good', 'Corruption temptation'],
        typicalEnding: 'triumphant',
        examples: 'Lord of the Rings, Star Wars',
    },
    {
        id: 'love-sacrifice',
        name: 'Love & Sacrifice',
        icon: '💔',
        description: 'Cinta yang menuntut pengorbanan besar',
        conflicts: ['Forbidden love', 'Family opposition', 'Choosing between love and duty'],
        typicalEnding: 'tragic-beautiful',
        examples: 'Titanic, Romeo & Juliet',
    },
    {
        id: 'power-corruption',
        name: 'Power & Corruption',
        icon: '👑',
        description: 'Bagaimana kekuasaan mengubah seseorang',
        conflicts: ['Moral decay', 'Betrayal of ideals', 'Isolation at the top'],
        typicalEnding: 'tragic',
        examples: 'The Godfather, Breaking Bad',
    },
    {
        id: 'survival',
        name: 'Survival',
        icon: '🔥',
        description: 'Bertahan hidup dalam kondisi ekstrem',
        conflicts: ['Man vs Nature', 'Resource scarcity', 'Trust issues'],
        typicalEnding: 'ambiguous',
        examples: 'The Revenant, Cast Away',
    },
    {
        id: 'revenge',
        name: 'Revenge',
        icon: '⚡',
        description: 'Pencarian balas dendam yang mengubah karakter',
        conflicts: ['Justice vs vengeance', 'Becoming the villain', 'Collateral damage'],
        typicalEnding: 'pyrrhic-victory',
        examples: 'Kill Bill, The Count of Monte Cristo',
    },
    {
        id: 'family-bonds',
        name: 'Family Bonds',
        icon: '👨‍👩‍👧‍👦',
        description: 'Ikatan keluarga, konflik, dan rekonsiliasi',
        conflicts: ['Generational trauma', 'Sibling rivalry', 'Parental approval'],
        typicalEnding: 'heartwarming',
        examples: 'Coco, The Incredibles',
    },
    {
        id: 'identity-self',
        name: 'Identity & Self',
        icon: '🎭',
        description: 'Mencari siapa diri kita sebenarnya',
        conflicts: ['Dual identity', 'Impostor syndrome', 'Societal masks'],
        typicalEnding: 'self-acceptance',
        examples: 'The Matrix, Fight Club',
    },
    {
        id: 'hope-despair',
        name: 'Hope vs Despair',
        icon: '🌅',
        description: 'Menemukan harapan di tengah keputusasaan',
        conflicts: ['Systemic oppression', 'Personal tragedy', 'Loss of faith'],
        typicalEnding: 'uplifting',
        examples: 'The Pursuit of Happyness, Life is Beautiful',
    },
    {
        id: 'friendship-loyalty',
        name: 'Friendship & Loyalty',
        icon: '🤝',
        description: 'Kekuatan persahabatan dan kesetiaan',
        conflicts: ['Betrayal dilemma', 'Competing loyalties', 'Sacrifice for friends'],
        typicalEnding: 'poignant',
        examples: 'Toy Story, The Lord of the Rings',
    },
    {
        id: 'ambition-dream',
        name: 'Ambition & Dreams',
        icon: '⭐',
        description: 'Mengejar mimpi dengan segala konsekuensinya',
        conflicts: ['Cost of success', 'Compromising values', 'Fear of failure'],
        typicalEnding: 'complex',
        examples: 'Whiplash, La La Land',
    },
];

export function CreateStoryModal({
    open,
    onOpenChange,
    characters,
    onCreateStory,
    isLoading = false,
    canDismiss = true,
}: CreateStoryModalProps) {
    const [storyName, setStoryName] = useState('');
    const [structureType, setStructureType] = useState('hero-journey');
    const [storyTheme, setStoryTheme] = useState('');
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Check if there's a protagonist
    const protagonist = useMemo(() =>
        characters.find(c => c.role?.toLowerCase() === 'protagonist'),
        [characters]
    );

    const hasProtagonist = !!protagonist;
    const hasCharacters = characters.length > 0;

    // Filter characters by search
    const filteredCharacters = useMemo(() =>
        characters.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [characters, searchQuery]
    );

    // Toggle character selection
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
        // Keep protagonist selected
        if (protagonist) {
            setSelectedCharacterIds([protagonist.id]);
        } else {
            setSelectedCharacterIds([]);
        }
    };

    // Auto-select protagonist when available
    React.useEffect(() => {
        if (protagonist && !selectedCharacterIds.includes(protagonist.id)) {
            setSelectedCharacterIds([protagonist.id]);
        }
    }, [protagonist]);

    // Handle create
    const handleCreate = async () => {
        if (!storyName.trim()) {
            return;
        }

        await onCreateStory({
            name: storyName.trim(),
            structureType,
            theme: storyTheme || undefined,
            characterIds: selectedCharacterIds,
        });

        // Reset form
        setStoryName('');
        setStructureType('hero-journey');
        setStoryTheme('');
        setSelectedCharacterIds(protagonist ? [protagonist.id] : []);
        setSearchQuery('');
    };

    // Prevent closing if canDismiss is false
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !canDismiss) {
            return; // Don't allow closing
        }
        onOpenChange(newOpen);
    };

    const isValid = storyName.trim() && hasProtagonist && selectedCharacterIds.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        Create New Story / Episode
                    </DialogTitle>
                    <DialogDescription>
                        Buat cerita baru dengan memilih karakter dan struktur cerita
                    </DialogDescription>
                </DialogHeader>

                {/* No Characters Warning */}
                {!hasCharacters && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Belum ada karakter!</span>
                        </div>
                        <p className="text-sm text-amber-600 mt-1">
                            Buat karakter dulu di tab Character Formula sebelum membuat story.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                            onClick={() => onOpenChange(false)}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Pergi ke Character Formula
                        </Button>
                    </div>
                )}

                {/* No Protagonist Warning */}
                {hasCharacters && !hasProtagonist && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Belum ada Protagonist!</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                            Setiap cerita wajib memiliki karakter dengan role "Protagonist".
                            Ubah role salah satu karakter menjadi Protagonist di tab Character Formula.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                            onClick={() => onOpenChange(false)}
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            Pergi ke Character Formula
                        </Button>
                    </div>
                )}

                {/* Form - only show if has protagonist */}
                {hasProtagonist && (
                    <div className="flex flex-col space-y-4 px-1">
                        {/* Story Name */}
                        <div className="space-y-2">
                            <Label htmlFor="story-name" className="text-sm font-medium">
                                Nama Story / Episode <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="story-name"
                                placeholder="Contoh: Episode 1 - Pertemuan Pertama"
                                value={storyName}
                                onChange={(e) => setStoryName(e.target.value)}
                                className="border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                            />
                        </div>

                        {/* Structure Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Story Structure <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-gray-500">
                                Pilih struktur cerita. Tidak bisa diubah setelah dibuat.
                            </p>
                            <RadioGroup
                                value={structureType}
                                onValueChange={setStructureType}
                                className="grid grid-cols-1 gap-2"
                            >
                                {STRUCTURE_TYPES.map((st) => (
                                    <div
                                        key={st.id}
                                        className={`relative flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${structureType === st.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-200'
                                            }`}
                                        onClick={() => setStructureType(st.id)}
                                    >
                                        <RadioGroupItem value={st.id} id={st.id} className="sr-only" />
                                        <span className="text-2xl">{st.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{st.name}</div>
                                            <div className="text-xs text-gray-500">{st.description}</div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {st.steps} steps
                                        </Badge>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Story Theme Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Story Theme <span className="text-gray-400 text-xs">(optional)</span>
                            </Label>
                            <p className="text-xs text-gray-500">
                                Pilih tema utama cerita untuk membantu AI generate premise & conflict yang sesuai
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                                {STORY_THEMES.map((theme) => {
                                    const isSelected = storyTheme === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${isSelected
                                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-orange-200'
                                                }`}
                                            onClick={() => setStoryTheme(isSelected ? '' : theme.id)}
                                            title={`${theme.description}\n\nConflicts: ${theme.conflicts.join(', ')}\nTypical Ending: ${theme.typicalEnding}\nExamples: ${theme.examples}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{theme.icon}</span>
                                                <span className="text-xs font-medium text-gray-800 truncate">{theme.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {storyTheme && (
                                <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                                    {(() => {
                                        const selectedTheme = STORY_THEMES.find(t => t.id === storyTheme);
                                        return selectedTheme ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{selectedTheme.icon}</span>
                                                    <span className="font-semibold text-sm text-orange-800">{selectedTheme.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{selectedTheme.description}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTheme.conflicts.map((conflict, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-white">
                                                            {conflict}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-gray-500 italic">
                                                    Examples: {selectedTheme.examples}
                                                </p>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Character Selection */}
                        <div className="flex flex-col space-y-2">
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
                                                onClick={() => {
                                                    if (!isProtagonist) {
                                                        toggleCharacter(char.id);
                                                    }
                                                }}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={isProtagonist}
                                                    onCheckedChange={() => {
                                                        if (!isProtagonist) {
                                                            toggleCharacter(char.id);
                                                        }
                                                    }}
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

                        {/* Create Button */}
                        <Button
                            onClick={handleCreate}
                            disabled={!isValid || isLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Story
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
