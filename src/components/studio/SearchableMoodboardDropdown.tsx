'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ChevronDown,
    Search,
    Palette,
    RotateCcw,
    Trash2,
    Check,
    Plus
} from 'lucide-react';

interface MoodboardItem {
    id: string;
    versionNumber: number;
    versionName: string;
    artStyle?: string;
    createdAt?: string;
    isActive?: boolean;
}

interface DeletedMoodboardItem {
    id: string;
    versionNumber: number;
    versionName: string;
    artStyle?: string;
    deletedAt?: string;
}

interface SearchableMoodboardDropdownProps {
    moodboards: MoodboardItem[];
    deletedMoodboards?: DeletedMoodboardItem[];
    selectedVersionNumber?: number | null;
    onSelect: (versionNumber: number) => void;
    onRestore?: (moodboardId: string) => void;
    onCreateNew?: () => void;
    placeholder?: string;
    showRestore?: boolean;
    showCreateNew?: boolean;
    className?: string;
    isCreating?: boolean;
}

export function SearchableMoodboardDropdown({
    moodboards,
    deletedMoodboards = [],
    selectedVersionNumber,
    onSelect,
    onRestore,
    onCreateNew,
    placeholder = 'Select Moodboard...',
    showRestore = true,
    showCreateNew = true,
    className = '',
    isCreating = false,
}: SearchableMoodboardDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get selected moodboard
    const selectedMoodboard = useMemo(() =>
        moodboards.find(m => m.versionNumber === selectedVersionNumber),
        [moodboards, selectedVersionNumber]
    );

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [isOpen]);

    // Auto-switch to active tab if deleted moodboards become empty
    useEffect(() => {
        if (deletedMoodboards.length === 0 && activeTab === 'deleted') {
            setActiveTab('active');
        }
    }, [deletedMoodboards.length, activeTab]);

    // Filter moodboards by search
    const filteredMoodboards = useMemo(() =>
        moodboards.filter(m =>
            m.versionName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [moodboards, searchQuery]
    );

    const filteredDeletedMoodboards = useMemo(() =>
        deletedMoodboards.filter(m =>
            m.versionName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [deletedMoodboards, searchQuery]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideTrigger = dropdownRef.current && !dropdownRef.current.contains(target);
            const isOutsidePortal = portalRef.current && !portalRef.current.contains(target);

            if (isOutsideTrigger && isOutsidePortal) {
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

    const handleSelect = (versionNumber: number) => {
        onSelect(versionNumber);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleRestore = (moodboardId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onRestore?.(moodboardId);
    };

    const handleCreateNew = () => {
        setIsOpen(false);
        onCreateNew?.();
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 px-2 text-xs justify-between min-w-[120px] bg-white border-gray-200"
            >
                <div className="flex items-center gap-2 truncate">
                    <Palette className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    <span className="truncate">
                        {selectedMoodboard?.versionName || placeholder}
                    </span>
                    {deletedMoodboards.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-red-100 text-red-600">
                            {deletedMoodboards.length}
                        </Badge>
                    )}
                </div>
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown Panel - Using Portal to escape stacking context */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={portalRef}
                    className="fixed bg-white rounded-lg border border-gray-200 shadow-xl"
                    style={{
                        zIndex: 99999,
                        width: 260,
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                    }}
                >
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={inputRef}
                                placeholder="Search moodboard..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                    </div>

                    {/* Tabs if has deleted moodboards */}
                    {showRestore && deletedMoodboards.length > 0 && (
                        <div className="flex border-b border-gray-100">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('active');
                                }}
                                className={`flex-1 py-2 text-xs font-medium ${activeTab === 'active'
                                    ? 'text-orange-600 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Active ({moodboards.length})
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('deleted');
                                }}
                                className={`flex-1 py-2 text-xs font-medium ${activeTab === 'deleted'
                                    ? 'text-orange-600 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Trash2 className="h-3 w-3 inline mr-1" />
                                Deleted ({deletedMoodboards.length})
                            </button>
                        </div>
                    )}

                    {/* Moodboard List */}
                    <div className="max-h-[250px] overflow-y-auto">
                        {activeTab === 'active' ? (
                            filteredMoodboards.length > 0 ? (
                                filteredMoodboards.map((moodboard) => (
                                    <div
                                        key={moodboard.id}
                                        onClick={() => handleSelect(moodboard.versionNumber)}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${moodboard.versionNumber === selectedVersionNumber ? 'bg-orange-50' : ''
                                            }`}
                                    >
                                        {moodboard.versionNumber === selectedVersionNumber && (
                                            <Check className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{moodboard.versionName}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {moodboard.artStyle && (
                                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                                        {moodboard.artStyle}
                                                    </Badge>
                                                )}
                                                {moodboard.isActive && (
                                                    <Badge className="text-[10px] px-1 py-0 bg-green-100 text-green-600">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No matching moodboard' : 'No moodboards yet'}
                                </div>
                            )
                        ) : (
                            filteredDeletedMoodboards.length > 0 ? (
                                filteredDeletedMoodboards.map((moodboard) => (
                                    <div
                                        key={moodboard.id}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate text-gray-500">{moodboard.versionName}</div>
                                            <div className="text-xs text-gray-400">
                                                {moodboard.deletedAt && `Deleted ${new Date(moodboard.deletedAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleRestore(moodboard.id, e)}
                                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Restore
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No matching moodboard' : 'No deleted moodboards'}
                                </div>
                            )
                        )}
                    </div>

                    {/* Create New Button */}
                    {showCreateNew && activeTab === 'active' && (
                        <div className="border-t border-gray-100 p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCreateNew}
                                disabled={isCreating}
                                className="w-full h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Create New Moodboard
                            </Button>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
