'use client';

import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface PrerequisiteWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'moodboard' | 'keyactions' | 'animationVersion';
    onAction?: () => void;
    stats?: {
        total: number;
        filled: number;
        percentage: number;
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
            icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
            title: 'Moodboard Required',
            description: 'You need to create a moodboard before you can access this feature.',
            details: 'The moodboard contains the key action images that will be used for animation.',
            actionLabel: 'Create Moodboard',
            actionIcon: <Zap className="w-4 h-4 mr-2" />,
            buttonStyle: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500'
        },
        keyactions: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
            title: 'Key Actions Incomplete',
            description: 'Please complete all key actions in your moodboard first.',
            details: stats
                ? `Only ${stats.filled}/${stats.total} key actions are filled (${stats.percentage}% complete).`
                : 'Some key action slots are empty or missing images.',
            actionLabel: 'Go to Moodboard',
            actionIcon: <ArrowRight className="w-4 h-4 mr-2" />,
            buttonStyle: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500'
        },
        animationVersion: {
            icon: <AlertTriangle className="w-12 h-12 text-purple-500" />,
            title: 'Animation Version Required',
            description: 'You need to create an animation version to access this feature.',
            details: 'An animation version will be created from your moodboard key actions.',
            actionLabel: 'Create Animation Version',
            actionIcon: <Zap className="w-4 h-4 mr-2" />,
            buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
        }
    };

    const c = content[type];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {c.icon}
                    </div>
                    <DialogTitle className="text-xl text-center">
                        {c.title}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {c.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            {c.details}
                        </p>
                    </div>

                    {stats && type === 'keyactions' && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">Progress</span>
                                <span className="text-sm text-amber-600 font-medium">{stats.percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                                    style={{ width: `${stats.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    {onAction && (
                        <Button
                            onClick={() => {
                                onAction();
                                onClose();
                            }}
                            className={c.buttonStyle}
                        >
                            {c.actionIcon}
                            {c.actionLabel}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
