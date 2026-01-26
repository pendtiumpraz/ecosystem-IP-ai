'use client';

import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface PrerequisiteWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'moodboard' | 'keyactions' | 'animationVersion';
    onAction?: () => void; // Action to take (e.g., navigate to moodboard tab)
    stats?: {
        total?: number;
        filled?: number;
        percentage?: number;
    };
}

export function PrerequisiteWarningModal({
    isOpen,
    onClose,
    type,
    onAction,
    stats
}: PrerequisiteWarningModalProps) {
    const content = {
        moodboard: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-400" />,
            title: 'Moodboard Required',
            description: 'You need to create a moodboard before you can access this feature.',
            details: 'The moodboard contains the key action images that will be used for animation.',
            actionLabel: 'Create Moodboard',
            actionIcon: <Zap className="w-4 h-4 mr-2" />,
            gradient: 'from-amber-600 to-orange-600'
        },
        keyactions: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-400" />,
            title: 'Key Actions Incomplete',
            description: 'Please complete all key actions in your moodboard first.',
            details: stats
                ? `Only ${stats.filled}/${stats.total} key actions are filled (${stats.percentage}% complete).`
                : 'Some key action slots are empty or missing images.',
            actionLabel: 'Go to Moodboard',
            actionIcon: <ArrowRight className="w-4 h-4 mr-2" />,
            gradient: 'from-amber-600 to-orange-600'
        },
        animationVersion: {
            icon: <AlertTriangle className="w-12 h-12 text-purple-400" />,
            title: 'Animation Version Required',
            description: 'You need to create an animation version to access this feature.',
            details: 'An animation version will be created from your moodboard key actions.',
            actionLabel: 'Create Animation Version',
            actionIcon: <Zap className="w-4 h-4 mr-2" />,
            gradient: 'from-purple-600 to-cyan-600'
        }
    };

    const c = content[type];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/20 text-white max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {c.icon}
                    </div>
                    <DialogTitle className="text-xl text-center">
                        {c.title}
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-center">
                        {c.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-white/70 text-center">
                            {c.details}
                        </p>
                    </div>

                    {stats && type === 'keyactions' && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">Progress</span>
                                <span className="text-sm text-amber-400 font-medium">{stats.percentage}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                                    style={{ width: `${stats.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-3 pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/70 hover:text-white"
                    >
                        Cancel
                    </Button>
                    {onAction && (
                        <Button
                            onClick={() => {
                                onAction();
                                onClose();
                            }}
                            className={`bg-gradient-to-r ${c.gradient} hover:opacity-90`}
                        >
                            {c.actionIcon}
                            {c.actionLabel}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
