'use client';

import { useState, useRef } from 'react';
import { User, GripVertical, Sparkles, Crown, Users, Swords, Heart, UserCheck, Smile, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterKanbanProps {
    characters: any[];
    onSelect: (id: string) => void;
    selectedId: string | null;
    onUpdateRole?: (id: string, newRole: string) => void;
}

// Role columns configuration
const ROLE_COLUMNS = [
    { id: 'Protagonist', label: 'Protagonists', icon: Crown, color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-600' },
    { id: 'Antagonist', label: 'Antagonists', icon: Swords, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-600' },
    { id: 'Love Interest', label: 'Love Interest', icon: Heart, color: 'pink', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-600' },
    { id: 'Mentor', label: 'Mentors', icon: UserCheck, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600' },
    { id: 'Supporting', label: 'Supporting', icon: Users, color: 'gray', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-600' },
    { id: 'Other', label: 'Others', icon: HelpCircle, color: 'slate', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', textColor: 'text-slate-600' },
];

// Map character roles to column IDs
const getRoleColumn = (role: string): string => {
    if (!role) return 'Other';
    const normalized = role.toLowerCase();
    if (normalized.includes('protagonist') || normalized.includes('hero')) return 'Protagonist';
    if (normalized.includes('antagonist') || normalized.includes('villain')) return 'Antagonist';
    if (normalized.includes('love') || normalized.includes('romance')) return 'Love Interest';
    if (normalized.includes('mentor') || normalized.includes('guide')) return 'Mentor';
    if (normalized.includes('deuteragonist') || normalized.includes('confidant') || normalized.includes('sidekick') || normalized.includes('foil') || normalized.includes('supporting') || normalized.includes('comic')) return 'Supporting';
    return 'Other';
};

export function CharacterKanban({ characters, onSelect, selectedId, onUpdateRole }: CharacterKanbanProps) {
    const [draggedChar, setDraggedChar] = useState<any>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Group characters by role column
    const charactersByColumn = ROLE_COLUMNS.reduce((acc, col) => {
        acc[col.id] = characters.filter(c => getRoleColumn(c.role) === col.id);
        return acc;
    }, {} as Record<string, any[]>);

    const handleDragStart = (e: React.DragEvent, char: any) => {
        setDraggedChar(char);
        e.dataTransfer.effectAllowed = 'move';
        // Set a ghost image
        const ghost = document.createElement('div');
        ghost.className = 'opacity-50';
        e.dataTransfer.setDragImage(ghost, 0, 0);
    };

    const handleDragEnd = () => {
        setDraggedChar(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (draggedChar && onUpdateRole) {
            // Map column ID back to actual role value
            const newRole = columnId;
            if (draggedChar.role !== newRole) {
                onUpdateRole(draggedChar.id, newRole);
            }
        }
        setDraggedChar(null);
        setDragOverColumn(null);
    };

    return (
        <div className="w-full h-full bg-gray-50/50 p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Character Board</h2>
                        <p className="text-[11px] text-gray-500">Drag characters to change their role</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-white border-gray-200 text-gray-600 text-xs">
                    {characters.length} Total
                </Badge>
            </div>

            {/* Kanban Columns */}
            <div className="flex gap-3 h-[calc(100%-50px)] overflow-x-auto pb-2">
                {ROLE_COLUMNS.map(column => {
                    const columnChars = charactersByColumn[column.id] || [];
                    const Icon = column.icon;
                    const isDropTarget = dragOverColumn === column.id;

                    return (
                        <div
                            key={column.id}
                            className={`
                                flex-shrink-0 w-[240px] rounded-xl border transition-all duration-200 overflow-hidden
                                ${column.bgColor} ${column.borderColor}
                                ${isDropTarget ? 'ring-2 ring-orange-400 ring-offset-1 scale-[1.01]' : ''}
                            `}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className={`px-2.5 py-2 border-b ${column.borderColor} flex items-center justify-between`}>
                                <div className="flex items-center gap-1.5">
                                    <div className={`p-1 rounded-md bg-white/80 ${column.textColor}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className={`text-xs font-bold ${column.textColor}`}>{column.label}</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs h-5 ${column.bgColor} ${column.textColor} border ${column.borderColor}`}
                                >
                                    {columnChars.length}
                                </Badge>
                            </div>

                            {/* Column Content */}
                            <ScrollArea className="h-[calc(100%-52px)] p-2">
                                <div className="space-y-2">
                                    {columnChars.length === 0 ? (
                                        <div className={`
                                            p-4 rounded-xl border-2 border-dashed ${column.borderColor}
                                            flex flex-col items-center justify-center text-center
                                            ${isDropTarget ? 'bg-white/50' : 'bg-white/30'}
                                        `}>
                                            <Icon className={`h-8 w-8 ${column.textColor} opacity-30 mb-2`} />
                                            <p className="text-xs text-gray-400">
                                                Drop characters here
                                            </p>
                                        </div>
                                    ) : (
                                        columnChars.map(char => {
                                            const isSelected = selectedId === char.id;
                                            const isDragging = draggedChar?.id === char.id;

                                            return (
                                                <div
                                                    key={char.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, char)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => onSelect(char.id)}
                                                    className={`
                                                        group relative bg-white rounded-xl p-3 cursor-pointer
                                                        border-2 transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-orange-400 ring-2 ring-orange-200 shadow-lg'
                                                            : `${column.borderColor} hover:border-orange-300 hover:shadow-md`
                                                        }
                                                        ${isDragging ? 'opacity-50 scale-95' : ''}
                                                    `}
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <GripVertical className="h-4 w-4 text-gray-300" />
                                                    </div>

                                                    {/* Character Avatar */}
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                            w-12 h-12 rounded-xl overflow-hidden flex-shrink-0
                                                            ${isSelected ? 'ring-2 ring-orange-400' : 'ring-1 ring-gray-200'}
                                                        `}>
                                                            {char.imageUrl || char.imagePoses?.portrait ? (
                                                                <img
                                                                    src={char.imageUrl || char.imagePoses?.portrait}
                                                                    className="w-full h-full object-cover"
                                                                    alt={char.name}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                    <User className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <p className="text-sm font-bold text-gray-900 truncate" title={char.name || 'Unnamed'}>
                                                                {char.name || 'Unnamed'}
                                                            </p>
                                                            <p className={`text-[10px] uppercase tracking-wider truncate ${column.textColor}`}>
                                                                {char.psychological?.archetype || char.role || 'No archetype'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quick Info */}
                                                    {(char.physiological?.gender || char.physiological?.ethnicity) && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-[10px] text-gray-500 truncate" title={[
                                                                char.physiological?.gender,
                                                                char.physiological?.ethnicity,
                                                                char.physiological?.bodyType
                                                            ].filter(Boolean).join(' • ')}>
                                                                {[
                                                                    char.physiological?.gender,
                                                                    char.physiological?.ethnicity,
                                                                    char.physiological?.bodyType
                                                                ].filter(Boolean).join(' • ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    );
                })}
            </div>

            {/* Drag Indicator */}
            {draggedChar && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 z-50">
                    <Sparkles className="h-4 w-4" />
                    Moving "{draggedChar.name}" - Drop on a column to change role
                </div>
            )}
        </div>
    );
}
