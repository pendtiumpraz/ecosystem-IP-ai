'use client';

import {
    AlertTriangle, ArrowDown, Image as ImageIcon, Video, FileText,
    Film, X, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContinuityWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sceneNumber: number;
    changeType: 'edit_plot' | 'regenerate_image' | 'regenerate_clip' | 'delete_scene';
    affectedItems: {
        images?: number;
        clips?: number;
        shots?: number;
        scripts?: number;
    };
}

export function ContinuityWarningModal({
    isOpen,
    onClose,
    onConfirm,
    sceneNumber,
    changeType,
    affectedItems
}: ContinuityWarningModalProps) {
    if (!isOpen) return null;

    // Get warning content based on change type
    const getContent = () => {
        switch (changeType) {
            case 'edit_plot':
                return {
                    title: 'Edit Scene Plot?',
                    description: 'Changing the plot may affect the continuity of dependent items. Consider regenerating them after editing.',
                    severity: 'warning' as const
                };
            case 'regenerate_image':
                return {
                    title: 'Regenerate Storyboard Image?',
                    description: 'A new image version will be created. The existing clip (if any) may no longer match the new image.',
                    severity: 'info' as const
                };
            case 'regenerate_clip':
                return {
                    title: 'Regenerate Video Clip?',
                    description: 'This will create a new clip version. Previous clips will be preserved in version history.',
                    severity: 'info' as const
                };
            case 'delete_scene':
                return {
                    title: 'Delete Scene?',
                    description: 'This will remove the scene and all associated content. This action cannot be undone.',
                    severity: 'danger' as const
                };
            default:
                return {
                    title: 'Confirm Action?',
                    description: 'This action may affect story continuity.',
                    severity: 'warning' as const
                };
        }
    };

    const content = getContent();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl border ${content.severity === 'danger'
                    ? 'bg-gradient-to-br from-red-900/90 to-gray-900 border-red-500/30'
                    : content.severity === 'warning'
                        ? 'bg-gradient-to-br from-amber-900/90 to-gray-900 border-amber-500/30'
                        : 'bg-gradient-to-br from-blue-900/90 to-gray-900 border-blue-500/30'
                }`}>
                {/* Header */}
                <div className="flex items-center gap-4 p-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${content.severity === 'danger' ? 'bg-red-500/20' :
                            content.severity === 'warning' ? 'bg-amber-500/20' :
                                'bg-blue-500/20'
                        }`}>
                        {content.severity === 'danger' ? (
                            <Trash2 className="w-6 h-6 text-red-400" />
                        ) : (
                            <AlertTriangle className={`w-6 h-6 ${content.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                                }`} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-white">{content.title}</h2>
                        <Badge className="mt-1 bg-white/10 text-white/60">
                            Scene {sceneNumber}
                        </Badge>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-4">
                    <p className="text-white/70 mb-4">{content.description}</p>

                    {/* Affected Items */}
                    {(affectedItems.images || affectedItems.clips || affectedItems.shots || affectedItems.scripts) && (
                        <Card className="bg-white/5 border-white/10 p-4">
                            <h4 className="text-sm font-medium text-white/60 mb-3">Affected Content</h4>

                            <div className="space-y-3">
                                {/* Scene Plot */}
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-white">
                                        <Film className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm">Scene Plot</span>
                                    </div>
                                    <Badge className="bg-purple-500/20 text-purple-400">Modified</Badge>
                                </div>

                                {/* Downstream arrow */}
                                <div className="flex justify-center">
                                    <ArrowDown className="w-4 h-4 text-white/30" />
                                </div>

                                {/* Affected items */}
                                <div className="space-y-2">
                                    {affectedItems.shots !== undefined && affectedItems.shots > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Film className="w-4 h-4 text-cyan-400" />
                                                <span className="text-sm">Shot List</span>
                                            </div>
                                            <Badge className="bg-amber-500/20 text-amber-400">
                                                {affectedItems.shots} shots may be outdated
                                            </Badge>
                                        </div>
                                    )}

                                    {affectedItems.images !== undefined && affectedItems.images > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm">Storyboard Images</span>
                                            </div>
                                            <Badge className="bg-amber-500/20 text-amber-400">
                                                {affectedItems.images} may be outdated
                                            </Badge>
                                        </div>
                                    )}

                                    {affectedItems.clips !== undefined && affectedItems.clips > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Video className="w-4 h-4 text-pink-400" />
                                                <span className="text-sm">Video Clips</span>
                                            </div>
                                            <Badge className="bg-amber-500/20 text-amber-400">
                                                {affectedItems.clips} may be outdated
                                            </Badge>
                                        </div>
                                    )}

                                    {affectedItems.scripts !== undefined && affectedItems.scripts > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <FileText className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm">Script Versions</span>
                                            </div>
                                            <Badge className="bg-amber-500/20 text-amber-400">
                                                {affectedItems.scripts} may be outdated
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="text-white/60"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={
                            content.severity === 'danger'
                                ? 'bg-red-600 hover:bg-red-700'
                                : content.severity === 'warning'
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                        }
                    >
                        {content.severity === 'danger' ? 'Delete' : 'Continue'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Cost Confirmation Modal
interface CostConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    operation: string;
    itemCount: number;
    creditsPerItem: number;
    estimatedTimeMinutes?: number;
}

export function CostConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    operation,
    itemCount,
    creditsPerItem,
    estimatedTimeMinutes
}: CostConfirmationModalProps) {
    if (!isOpen) return null;

    const totalCredits = itemCount * creditsPerItem;
    const estimatedCost = (totalCredits * 0.01).toFixed(2); // Assuming $0.01 per credit

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30">
                {/* Header */}
                <div className="p-5 text-center border-b border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-7 h-7 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Confirm {operation}</h2>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="bg-white/5 border-white/10 p-3 text-center">
                            <div className="text-2xl font-bold text-white">{itemCount}</div>
                            <div className="text-xs text-white/60">Items</div>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-3 text-center">
                            <div className="text-2xl font-bold text-amber-400">{totalCredits}</div>
                            <div className="text-xs text-white/60">Credits</div>
                        </Card>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                        <p className="text-sm text-amber-400">
                            Estimated cost: <span className="font-bold">${estimatedCost}</span>
                        </p>
                        {estimatedTimeMinutes && (
                            <p className="text-xs text-white/50 mt-1">
                                Est. time: {estimatedTimeMinutes} minutes
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-white/10 bg-white/5">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1 text-white/60"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
}
