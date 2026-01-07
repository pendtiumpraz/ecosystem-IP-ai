'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ChevronDown,
    Search,
    BookOpen,
    RotateCcw,
    Trash2,
    Check
} from 'lucide-react';

interface StoryItem {
    id: string;
    name: string;
    structureType?: string;
    episodeNumber?: number;
    characterCount?: number;
    isDeleted?: boolean;
    deletedAt?: string;
}

interface SearchableStoryDropdownProps {
    stories: StoryItem[];
    deletedStories?: StoryItem[];
    selectedId?: string;
    onSelect: (storyId: string) => void;
    onRestore?: (storyId: string) => void;
    placeholder?: string;
    showRestore?: boolean;
    className?: string;
}

// Map structure type to short name
const getStructureShortName = (type?: string) => {
    switch (type) {
        case 'hero-journey': return 'HJ';
        case 'dan-harmon': return 'DH';
        case 'save-the-cat':
        default: return 'STC';
    }
};

export function SearchableStoryDropdown({
    stories,
    deletedStories = [],
    selectedId,
    onSelect,
    onRestore,
    placeholder = 'Pilih Story...',
    showRestore = true,
    className = '',
}: SearchableStoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get selected story
    const selectedStory = useMemo(() =>
        stories.find(s => s.id === selectedId),
        [stories, selectedId]
    );

    // Filter stories by search
    const filteredStories = useMemo(() =>
        stories.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [stories, searchQuery]
    );

    const filteredDeletedStories = useMemo(() =>
        deletedStories.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [deletedStories, searchQuery]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (storyId: string) => {
        onSelect(storyId);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleRestore = (storyId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onRestore?.(storyId);
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 px-2 text-xs justify-between min-w-[160px] bg-white border-gray-200"
            >
                <div className="flex items-center gap-2 truncate">
                    <BookOpen className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    <span className="truncate">
                        {selectedStory?.name || placeholder}
                    </span>
                </div>
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown Panel - High z-index to appear above all elements */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-lg border border-gray-200 shadow-xl z-[9999]">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={inputRef}
                                placeholder="Cari story..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                    </div>

                    {/* Tabs if has deleted stories */}
                    {showRestore && deletedStories.length > 0 && (
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 py-2 text-xs font-medium ${activeTab === 'active'
                                    ? 'text-orange-600 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Active ({stories.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('deleted')}
                                className={`flex-1 py-2 text-xs font-medium ${activeTab === 'deleted'
                                    ? 'text-orange-600 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Trash2 className="h-3 w-3 inline mr-1" />
                                Deleted ({deletedStories.length})
                            </button>
                        </div>
                    )}

                    {/* Story List */}
                    <div className="max-h-[250px] overflow-y-auto">
                        {activeTab === 'active' ? (
                            filteredStories.length > 0 ? (
                                filteredStories.map((story) => (
                                    <div
                                        key={story.id}
                                        onClick={() => handleSelect(story.id)}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${story.id === selectedId ? 'bg-orange-50' : ''
                                            }`}
                                    >
                                        {story.id === selectedId && (
                                            <Check className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{story.name}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {story.structureType && (
                                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                                        {getStructureShortName(story.structureType)}
                                                    </Badge>
                                                )}
                                                {story.characterCount !== undefined && (
                                                    <span>{story.characterCount} chars</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">
                                    {searchQuery ? 'Tidak ada story yang cocok' : 'Belum ada story'}
                                </div>
                            )
                        ) : (
                            filteredDeletedStories.length > 0 ? (
                                filteredDeletedStories.map((story) => (
                                    <div
                                        key={story.id}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate text-gray-500">{story.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {story.deletedAt && `Deleted ${new Date(story.deletedAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleRestore(story.id, e)}
                                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Restore
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">
                                    {searchQuery ? 'Tidak ada story yang cocok' : 'Tidak ada story yang dihapus'}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
