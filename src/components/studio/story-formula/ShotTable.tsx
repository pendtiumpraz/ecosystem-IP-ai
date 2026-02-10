'use client';

import { useState } from 'react';
import {
    Camera, Trash2, Plus, Save, X, ChevronUp, ChevronDown,
    Clock, Move, Eye, Video, Table2, LayoutList
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
    const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

    // Calculate totals (DB uses duration_seconds, type uses duration)
    const totalDuration = shots.reduce((sum, s: any) => sum + (s.duration || s.duration_seconds || 0), 0);

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

    // Helper to get shot values with fallbacks (DB uses different column names)
    const getShotType = (shot: any) => shot.camera_type || shot.shot_type || 'medium';
    const getShotAngle = (shot: any) => shot.camera_angle || shot.shot_angle || 'eye-level';
    const getShotDuration = (shot: any) => shot.duration || shot.duration_seconds || 5;
    const getShotAction = (shot: any) => shot.shot_description || shot.action || shot.framing || '';
    const getShotDialogue = (shot: any) => shot.dialogue || null;

    // Get display label for camera type
    const getCameraTypeLabel = (value: string) => {
        if (!value) return 'Unknown';
        return CAMERA_TYPES.find(t => t.value === value)?.label || value;
    };

    // Get movement icon
    const getMovementIcon = (value: string) => {
        return CAMERA_MOVEMENTS.find(m => m.value === value)?.icon || '⊙';
    };

    return (
        <Card className="bg-gray-50 border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Shot List</h3>
                    <Badge className="bg-orange-100 text-orange-600">
                        {shots.length} shots
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center rounded-lg bg-gray-200 p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table'
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="Table View"
                        >
                            <Table2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'timeline'
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            title="Timeline View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Total: {Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')}</span>
                    </div>
                    <Button onClick={onAdd} variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Shot
                    </Button>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Camera Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Angle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Movement</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action/Dialogue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shots.map((shot, idx) => (
                                <tr
                                    key={shot.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Shot Number */}
                                    <td className="px-4 py-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <span className="text-orange-600 font-bold text-sm">{shot.shot_number}</span>
                                        </div>
                                    </td>

                                    {/* Camera Type */}
                                    <td className="px-4 py-3">
                                        {editingId === shot.id ? (
                                            <Select
                                                value={editData.camera_type || getShotType(shot)}
                                                onValueChange={(v) => setEditData({ ...editData, camera_type: v as any })}
                                            >
                                                <SelectTrigger className="w-40 bg-gray-50 border-white/20 text-gray-900 text-sm">
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
                                            <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                                                {getCameraTypeLabel(getShotType(shot))}
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Angle */}
                                    <td className="px-4 py-3">
                                        {editingId === shot.id ? (
                                            <Select
                                                value={editData.camera_angle || getShotAngle(shot)}
                                                onValueChange={(v) => setEditData({ ...editData, camera_angle: v as any })}
                                            >
                                                <SelectTrigger className="w-32 bg-gray-50 border-white/20 text-gray-900 text-sm">
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
                                            <span className="text-gray-700 text-sm capitalize">
                                                {getShotAngle(shot)?.replace('-', ' ') || 'Eye Level'}
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
                                                <SelectTrigger className="w-36 bg-gray-50 border-white/20 text-gray-900 text-sm">
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
                                                <span className="text-gray-600 text-sm capitalize">
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
                                                value={editData.duration || getShotDuration(shot)}
                                                onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || 3 })}
                                                min={1}
                                                max={60}
                                                className="w-20 bg-gray-50 border-gray-300 text-gray-900 text-sm"
                                            />
                                        ) : (
                                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                                                {getShotDuration(shot)}s
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Action/Dialogue */}
                                    <td className="px-4 py-3 max-w-[300px]">
                                        {editingId === shot.id ? (
                                            <Input
                                                value={editData.action || getShotAction(shot)}
                                                onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                                placeholder="Action description..."
                                                className="bg-gray-50 border-gray-300 text-gray-900 text-sm"
                                            />
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-gray-700 text-sm line-clamp-2">
                                                    {getShotAction(shot) || '-'}
                                                </p>
                                                {getShotDialogue(shot) && (
                                                    <p className="text-orange-700 text-xs italic bg-orange-50 px-2 py-1 rounded border-l-2 border-orange-400 line-clamp-2">
                                                        💬 "{getShotDialogue(shot)}"
                                                    </p>
                                                )}
                                            </div>
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
                                                        className="text-gray-600"
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
                                                        className="text-gray-600 hover:text-gray-900"
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
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="p-4 space-y-4">
                    {/* Timeline ruler */}
                    <div className="flex items-center gap-2 px-2 text-xs text-gray-500 border-b border-gray-200 pb-2">
                        <span className="w-8 font-medium">#</span>
                        <div className="flex-1 flex justify-between">
                            <span>0s</span>
                            <span>{Math.ceil(totalDuration / 4)}s</span>
                            <span>{Math.ceil(totalDuration / 2)}s</span>
                            <span>{Math.ceil(totalDuration * 3 / 4)}s</span>
                            <span>{totalDuration}s</span>
                        </div>
                    </div>

                    {/* Stacked duration bar */}
                    <div className="flex rounded-lg overflow-hidden h-8 bg-gray-100">
                        {shots.map((shot: any, idx) => {
                            const duration = getShotDuration(shot);
                            const widthPercent = totalDuration > 0 ? (duration / totalDuration) * 100 : 10;
                            const colors = [
                                'from-orange-400 to-orange-500',
                                'from-amber-400 to-amber-500',
                                'from-yellow-500 to-orange-400',
                                'from-orange-500 to-red-400',
                                'from-red-400 to-orange-500',
                            ];
                            const colorClass = colors[idx % colors.length];
                            return (
                                <div
                                    key={shot.id}
                                    className={`bg-gradient-to-r ${colorClass} flex items-center justify-center border-r border-white/30 cursor-pointer hover:brightness-110 transition-all`}
                                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                                    title={`Shot ${shot.shot_number}: ${getShotAction(shot)} (${duration}s)`}
                                >
                                    <span className="text-white text-[10px] font-bold truncate px-1">
                                        {widthPercent > 5 ? `${shot.shot_number}` : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed shot cards */}
                    {shots.map((shot: any, idx) => {
                        const duration = getShotDuration(shot);
                        const startTime = shots.slice(0, idx).reduce((sum: number, s: any) => sum + getShotDuration(s), 0);

                        return (
                            <div key={shot.id} className="flex gap-3 items-start group">
                                {/* Timeline dot + line */}
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
                                        <span className="text-white text-xs font-bold">{shot.shot_number}</span>
                                    </div>
                                    {idx < shots.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-orange-200 mt-1 min-h-[20px]" />
                                    )}
                                </div>

                                {/* Shot card */}
                                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 shadow-sm group-hover:border-orange-300 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs">
                                                {getCameraTypeLabel(getShotType(shot))}
                                            </Badge>
                                            <span className="text-xs text-gray-500 capitalize">
                                                {getShotAngle(shot)?.replace('-', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {getMovementIcon(shot.camera_movement)} {shot.camera_movement}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{startTime}s—{startTime + duration}s</span>
                                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs">
                                                {duration}s
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">{getShotAction(shot)}</p>
                                    {getShotDialogue(shot) && (
                                        <p className="text-orange-700 text-xs italic bg-orange-50 px-2 py-1 rounded border-l-2 border-orange-400 mt-1">
                                            💬 "{getShotDialogue(shot)}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                    {shots.length} shot{shots.length !== 1 ? 's' : ''} • {totalDuration} seconds total
                </span>
                <Button onClick={onAdd} variant="outline" size="sm" className="border-orange-400 text-orange-600 hover:bg-orange-50">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Shot
                </Button>
            </div>
        </Card>
    );
}
