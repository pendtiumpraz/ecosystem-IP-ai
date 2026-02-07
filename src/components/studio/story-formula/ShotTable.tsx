'use client';

import { useState } from 'react';
import {
    Camera, Trash2, Plus, Save, X, ChevronUp, ChevronDown,
    Clock, Move, Eye, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SceneShot } from '@/types/storyboard';

interface ShotTableProps {
    shots: SceneShot[];
    onUpdate: (shotId: string, updates: Partial<SceneShot>) => Promise<void>;
    onDelete: (shotId: string) => Promise<void>;
    onAdd: () => Promise<void>;
}

// Camera type options
const CAMERA_TYPES = [
    { value: 'establishing', label: 'Establishing (EST)' },
    { value: 'wide', label: 'Wide Shot (WS)' },
    { value: 'full', label: 'Full Shot (FS)' },
    { value: 'medium', label: 'Medium Shot (MS)' },
    { value: 'medium-close', label: 'Medium Close-Up (MCU)' },
    { value: 'close-up', label: 'Close-Up (CU)' },
    { value: 'extreme-close-up', label: 'Extreme Close-Up (ECU)' },
    { value: 'over-shoulder', label: 'Over-the-Shoulder (OTS)' },
    { value: 'two-shot', label: 'Two Shot (2S)' },
    { value: 'pov', label: 'Point of View (POV)' },
    { value: 'insert', label: 'Insert Shot' },
];

// Camera angle options
const CAMERA_ANGLES = [
    { value: 'eye-level', label: 'Eye Level' },
    { value: 'high', label: 'High Angle' },
    { value: 'low', label: 'Low Angle' },
    { value: 'dutch', label: 'Dutch Angle' },
    { value: 'birds-eye', label: "Bird's Eye" },
    { value: 'worms-eye', label: "Worm's Eye" },
];

// Camera movement options
const CAMERA_MOVEMENTS = [
    { value: 'static', label: 'Static', icon: '⊙' },
    { value: 'pan-left', label: 'Pan Left', icon: '←' },
    { value: 'pan-right', label: 'Pan Right', icon: '→' },
    { value: 'tilt-up', label: 'Tilt Up', icon: '↑' },
    { value: 'tilt-down', label: 'Tilt Down', icon: '↓' },
    { value: 'dolly-in', label: 'Dolly In', icon: '⟿' },
    { value: 'dolly-out', label: 'Dolly Out', icon: '⟾' },
    { value: 'tracking', label: 'Tracking', icon: '↠' },
    { value: 'crane-up', label: 'Crane Up', icon: '⤊' },
    { value: 'crane-down', label: 'Crane Down', icon: '⤋' },
    { value: 'handheld', label: 'Handheld', icon: '≋' },
    { value: 'steadicam', label: 'Steadicam', icon: '≈' },
    { value: 'zoom-in', label: 'Zoom In', icon: '⊕' },
    { value: 'zoom-out', label: 'Zoom Out', icon: '⊖' },
];

export function ShotTable({ shots, onUpdate, onDelete, onAdd }: ShotTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SceneShot>>({});

    // Calculate totals
    const totalDuration = shots.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Start editing a shot
    const startEdit = (shot: SceneShot) => {
        setEditingId(shot.id);
        setEditData({
            camera_type: shot.camera_type,
            camera_angle: shot.camera_angle,
            camera_movement: shot.camera_movement,
            duration: shot.duration,
            action: shot.action || '',
            framing: shot.framing || ''
        });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    // Save edits
    const saveEdit = async (shotId: string) => {
        await onUpdate(shotId, editData);
        setEditingId(null);
        setEditData({});
    };

    // Get display label for camera type
    const getCameraTypeLabel = (value: string) => {
        return CAMERA_TYPES.find(t => t.value === value)?.label || value;
    };

    // Get movement icon
    const getMovementIcon = (value: string) => {
        return CAMERA_MOVEMENTS.find(m => m.value === value)?.icon || '⊙';
    };

    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Shot List</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                        {shots.length} shots
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="w-4 h-4" />
                        <span>Total: {Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')}</span>
                    </div>
                    <Button onClick={onAdd} variant="ghost" size="sm" className="text-cyan-400">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Shot
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Camera Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Angle</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Movement</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Action/Framing</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shots.map((shot, idx) => (
                            <tr
                                key={shot.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                {/* Shot Number */}
                                <td className="px-4 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                        <span className="text-cyan-400 font-bold text-sm">{shot.shot_number}</span>
                                    </div>
                                </td>

                                {/* Camera Type */}
                                <td className="px-4 py-3">
                                    {editingId === shot.id ? (
                                        <Select
                                            value={editData.camera_type || shot.camera_type}
                                            onValueChange={(v) => setEditData({ ...editData, camera_type: v as any })}
                                        >
                                            <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAMERA_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge className="bg-orange-500/20 text-orange-400">
                                            {getCameraTypeLabel(shot.camera_type)}
                                        </Badge>
                                    )}
                                </td>

                                {/* Angle */}
                                <td className="px-4 py-3">
                                    {editingId === shot.id ? (
                                        <Select
                                            value={editData.camera_angle || shot.camera_angle}
                                            onValueChange={(v) => setEditData({ ...editData, camera_angle: v as any })}
                                        >
                                            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAMERA_ANGLES.map(angle => (
                                                    <SelectItem key={angle.value} value={angle.value}>
                                                        {angle.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className="text-white/80 text-sm capitalize">
                                            {shot.camera_angle?.replace('-', ' ') || 'Eye Level'}
                                        </span>
                                    )}
                                </td>

                                {/* Movement */}
                                <td className="px-4 py-3">
                                    {editingId === shot.id ? (
                                        <Select
                                            value={editData.camera_movement || shot.camera_movement}
                                            onValueChange={(v) => setEditData({ ...editData, camera_movement: v as any })}
                                        >
                                            <SelectTrigger className="w-36 bg-white/5 border-white/20 text-white text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAMERA_MOVEMENTS.map(mov => (
                                                    <SelectItem key={mov.value} value={mov.value}>
                                                        <span className="mr-2">{mov.icon}</span>
                                                        {mov.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getMovementIcon(shot.camera_movement)}</span>
                                            <span className="text-white/60 text-sm capitalize">
                                                {shot.camera_movement?.replace('-', ' ') || 'Static'}
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Duration */}
                                <td className="px-4 py-3">
                                    {editingId === shot.id ? (
                                        <Input
                                            type="number"
                                            value={editData.duration || shot.duration || 3}
                                            onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || 3 })}
                                            min={1}
                                            max={60}
                                            className="w-20 bg-white/5 border-white/20 text-white text-sm"
                                        />
                                    ) : (
                                        <Badge variant="outline" className="border-white/20 text-white/80">
                                            {shot.duration || 3}s
                                        </Badge>
                                    )}
                                </td>

                                {/* Action/Framing */}
                                <td className="px-4 py-3 max-w-[200px]">
                                    {editingId === shot.id ? (
                                        <Input
                                            value={editData.action || shot.action || ''}
                                            onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                            placeholder="Action description..."
                                            className="bg-white/5 border-white/20 text-white text-sm"
                                        />
                                    ) : (
                                        <p className="text-white/70 text-sm line-clamp-2">
                                            {shot.action || shot.framing || '-'}
                                        </p>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        {editingId === shot.id ? (
                                            <>
                                                <Button
                                                    onClick={() => saveEdit(shot.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-400 hover:text-green-300"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/60"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => startEdit(shot)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/60 hover:text-white"
                                                >
                                                    <Video className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => onDelete(shot.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400/60 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                <span className="text-sm text-white/60">
                    {shots.length} shot{shots.length !== 1 ? 's' : ''} • {totalDuration} seconds total
                </span>
                <Button onClick={onAdd} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Shot
                </Button>
            </div>
        </Card>
    );
}
