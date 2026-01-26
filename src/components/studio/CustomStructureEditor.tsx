'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, GripVertical, Save, X, Edit3, Sparkles,
    ChevronUp, ChevronDown, Settings2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/select";

// Custom beat definition
export interface CustomBeat {
    key: string;
    label: string;
    desc: string;
    act: 1 | 2 | 3;
}

// Custom structure definition
export interface CustomStructureDefinition {
    name: string;
    description?: string;
    beats: CustomBeat[];
    createdAt?: string;
    updatedAt?: string;
}

interface CustomStructureEditorProps {
    isOpen: boolean;
    onClose: () => void;
    customStructure?: CustomStructureDefinition;
    onSave: (structure: CustomStructureDefinition) => void;
}

// Generate unique key from label
function generateKey(label: string): string {
    return label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30);
}

// Default empty beat
const createEmptyBeat = (index: number): CustomBeat => ({
    key: `beat${index}`,
    label: `Beat ${index}`,
    desc: '',
    act: 1,
});

// Preset templates for quick start
const PRESET_TEMPLATES = [
    {
        name: 'Blank',
        beats: [],
    },
    {
        name: 'Simple 3-Beat',
        beats: [
            { key: 'beginning', label: 'Beginning', desc: 'Introduction and setup', act: 1 as const },
            { key: 'middle', label: 'Middle', desc: 'Conflict and development', act: 2 as const },
            { key: 'end', label: 'End', desc: 'Resolution and conclusion', act: 3 as const },
        ],
    },
    {
        name: 'Seven Point Structure',
        beats: [
            { key: 'hook', label: 'Hook', desc: 'Opening scene that grabs attention', act: 1 as const },
            { key: 'plotTurn1', label: 'Plot Turn 1', desc: 'Call to action, entering new world', act: 1 as const },
            { key: 'pinch1', label: 'Pinch Point 1', desc: 'Apply pressure, raise stakes', act: 2 as const },
            { key: 'midpoint', label: 'Midpoint', desc: 'From reaction to action', act: 2 as const },
            { key: 'pinch2', label: 'Pinch Point 2', desc: 'Apply more pressure, darkest moment', act: 2 as const },
            { key: 'plotTurn2', label: 'Plot Turn 2', desc: 'Final piece of the puzzle falls into place', act: 3 as const },
            { key: 'resolution', label: 'Resolution', desc: 'Final conflict and ending', act: 3 as const },
        ],
    },
    {
        name: 'Kishotenketsu (4-Act)',
        beats: [
            { key: 'ki', label: 'Ki (Introduction)', desc: 'Introduce characters and setting', act: 1 as const },
            { key: 'sho', label: 'Shō (Development)', desc: 'Develop the story without major conflict', act: 2 as const },
            { key: 'ten', label: 'Ten (Twist)', desc: 'Unexpected development or twist', act: 2 as const },
            { key: 'ketsu', label: 'Ketsu (Conclusion)', desc: 'Wrap up and resolve', act: 3 as const },
        ],
    },
];

export function CustomStructureEditor({
    isOpen,
    onClose,
    customStructure,
    onSave,
}: CustomStructureEditorProps) {
    const [structureName, setStructureName] = useState('My Custom Structure');
    const [structureDescription, setStructureDescription] = useState('');
    const [beats, setBeats] = useState<CustomBeat[]>([createEmptyBeat(1)]);
    const [editingBeatIndex, setEditingBeatIndex] = useState<number | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    // Load existing structure when editing
    useEffect(() => {
        if (customStructure) {
            setStructureName(customStructure.name);
            setStructureDescription(customStructure.description || '');
            setBeats(customStructure.beats.length > 0 ? customStructure.beats : [createEmptyBeat(1)]);
        } else {
            setStructureName('My Custom Structure');
            setStructureDescription('');
            setBeats([createEmptyBeat(1)]);
        }
    }, [customStructure, isOpen]);

    // Add new beat
    const addBeat = () => {
        const newBeat = createEmptyBeat(beats.length + 1);
        // Set act based on position (roughly)
        if (beats.length < 3) {
            newBeat.act = 1;
        } else if (beats.length < 6) {
            newBeat.act = 2;
        } else {
            newBeat.act = 3;
        }
        setBeats([...beats, newBeat]);
        setEditingBeatIndex(beats.length);
    };

    // Remove beat
    const removeBeat = (index: number) => {
        if (beats.length <= 1) return; // Keep at least one beat
        setBeats(beats.filter((_, i) => i !== index));
        if (editingBeatIndex === index) {
            setEditingBeatIndex(null);
        }
    };

    // Update beat
    const updateBeat = (index: number, field: keyof CustomBeat, value: any) => {
        const updated = [...beats];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        // Auto-generate key from label
        if (field === 'label') {
            updated[index].key = generateKey(value);
        }
        setBeats(updated);
    };

    // Move beat up/down
    const moveBeat = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= beats.length) return;

        const updated = [...beats];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setBeats(updated);
        setEditingBeatIndex(newIndex);
    };

    // Apply preset template
    const applyTemplate = (templateName: string) => {
        const template = PRESET_TEMPLATES.find(t => t.name === templateName);
        if (template) {
            if (template.beats.length === 0) {
                setBeats([createEmptyBeat(1)]);
            } else {
                setBeats([...template.beats]);
            }
        }
    };

    // Validate before save
    const validate = (): boolean => {
        const newErrors: string[] = [];

        if (!structureName.trim()) {
            newErrors.push('Structure name is required');
        }

        if (beats.length === 0) {
            newErrors.push('At least one beat is required');
        }

        // Check for duplicate keys
        const keys = beats.map(b => b.key);
        const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
        if (duplicates.length > 0) {
            newErrors.push(`Duplicate beat keys: ${duplicates.join(', ')}`);
        }

        // Check for empty labels
        const emptyLabels = beats.filter(b => !b.label.trim());
        if (emptyLabels.length > 0) {
            newErrors.push('All beats must have a label');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Handle save
    const handleSave = () => {
        if (!validate()) return;

        const structure: CustomStructureDefinition = {
            name: structureName.trim(),
            description: structureDescription.trim() || undefined,
            beats: beats.map((b, i) => ({
                ...b,
                key: b.key || `beat${i + 1}`,
                label: b.label.trim() || `Beat ${i + 1}`,
            })),
            createdAt: customStructure?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSave(structure);
        onClose();
    };

    // Get act color
    const getActColor = (act: number) => {
        switch (act) {
            case 1: return 'bg-blue-100 text-blue-700 border-blue-200';
            case 2: return 'bg-orange-100 text-orange-700 border-orange-200';
            case 3: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-orange-500" />
                        Custom Story Structure Editor
                    </DialogTitle>
                    <DialogDescription>
                        Create your own beat structure for storytelling. Define the rhythm and flow of your story.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Structure Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-600">Structure Name *</Label>
                            <Input
                                value={structureName}
                                onChange={(e) => setStructureName(e.target.value)}
                                placeholder="e.g., My Epic Journey"
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-600">Start from Template</Label>
                            <Select onValueChange={applyTemplate}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Choose template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRESET_TEMPLATES.map((template) => (
                                        <SelectItem key={template.name} value={template.name}>
                                            {template.name} ({template.beats.length} beats)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-xs font-bold text-gray-600">Description (Optional)</Label>
                            <Textarea
                                value={structureDescription}
                                onChange={(e) => setStructureDescription(e.target.value)}
                                placeholder="Describe when to use this structure..."
                                className="bg-white resize-none h-16"
                            />
                        </div>
                    </div>

                    {/* Beats List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Story Beats ({beats.length})
                            </Label>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={addBeat}
                                className="h-7 text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                                <Plus className="h-3 w-3" />
                                Add Beat
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                            {beats.map((beat, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border transition-all ${editingBeatIndex === index
                                            ? 'border-orange-300 bg-orange-50/50 ring-2 ring-orange-100'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {/* Drag handle & number */}
                                        <div className="flex flex-col items-center pt-1">
                                            <GripVertical className="h-4 w-4 text-gray-300" />
                                            <span className="text-xs font-bold text-gray-400 mt-1">
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Beat content */}
                                        <div className="flex-1 min-w-0">
                                            {editingBeatIndex === index ? (
                                                // Editing mode
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-[10px] font-bold text-gray-500">Label *</Label>
                                                            <Input
                                                                value={beat.label}
                                                                onChange={(e) => updateBeat(index, 'label', e.target.value)}
                                                                placeholder="Beat name"
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] font-bold text-gray-500">Act</Label>
                                                            <Select
                                                                value={beat.act.toString()}
                                                                onValueChange={(v) => updateBeat(index, 'act', parseInt(v) as 1 | 2 | 3)}
                                                            >
                                                                <SelectTrigger className="h-8 text-sm">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="1">Act 1 (Setup)</SelectItem>
                                                                    <SelectItem value="2">Act 2 (Confrontation)</SelectItem>
                                                                    <SelectItem value="3">Act 3 (Resolution)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-bold text-gray-500">Description</Label>
                                                        <Textarea
                                                            value={beat.desc}
                                                            onChange={(e) => updateBeat(index, 'desc', e.target.value)}
                                                            placeholder="Describe what happens in this beat..."
                                                            className="h-16 text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        Key: <code className="bg-gray-100 px-1 rounded">{beat.key}</code>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View mode
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={() => setEditingBeatIndex(index)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800">{beat.label}</span>
                                                        <Badge className={`text-[9px] h-4 px-1.5 ${getActColor(beat.act)}`}>
                                                            Act {beat.act}
                                                        </Badge>
                                                    </div>
                                                    {beat.desc && (
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{beat.desc}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => moveBeat(index, 'up')}
                                                disabled={index === 0}
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => moveBeat(index, 'down')}
                                                disabled={index === beats.length - 1}
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                            {editingBeatIndex === index ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingBeatIndex(null)}
                                                    className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600"
                                                >
                                                    <Save className="h-3 w-3" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingBeatIndex(index)}
                                                    className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeBeat(index)}
                                                disabled={beats.length <= 1}
                                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 disabled:opacity-30"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1">
                            <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                                Act 1: {beats.filter(b => b.act === 1).length}
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                                Act 2: {beats.filter(b => b.act === 2).length}
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                                Act 3: {beats.filter(b => b.act === 3).length}
                            </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                            Total: {beats.length} beats
                        </span>
                    </div>

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <ul className="text-xs text-red-600 space-y-1">
                                {errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-1"
                    >
                        <Save className="h-4 w-4" />
                        Save Structure
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
