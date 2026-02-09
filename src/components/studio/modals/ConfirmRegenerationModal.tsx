'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUp, ArrowDown, Coins, RefreshCw } from 'lucide-react';

interface TensionChange {
    beatKey: string;
    beatLabel: string;
    previousTension: number;
    newTension: number;
}

interface ConfirmRegenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    changes: TensionChange[];
    affectedKeyActions: number;
    affectedScenes: number;
    estimatedCredits: number;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function ConfirmRegenerationModal({
    isOpen,
    onClose,
    changes,
    affectedKeyActions,
    affectedScenes,
    estimatedCredits,
    onConfirm,
    isLoading = false,
}: ConfirmRegenerationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Confirm Regeneration
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Anda akan menyimpan perubahan tension level berikut:
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                        {changes.map((change) => (
                            <div
                                key={change.beatKey}
                                className="flex items-center gap-2 text-sm"
                            >
                                {change.newTension > change.previousTension ? (
                                    <ArrowUp className="h-4 w-4 text-red-500 flex-shrink-0" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                )}
                                <span className="font-medium truncate">{change.beatLabel}</span>
                                <span className="text-gray-500 flex-shrink-0">
                                    {change.previousTension} → {change.newTension}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                    (
                                    {change.newTension > change.previousTension
                                        ? 'More Dramatic'
                                        : 'Less Intense'}
                                    )
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                            ⚠️ Ini akan REGENERATE:
                        </p>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                            <li>• Beat Content ({changes.length} beats)</li>
                            <li>• Key Actions ({affectedKeyActions} key actions)</li>
                            <li>• Scene Plots ({affectedScenes} scenes)</li>
                            <li>• Scripts ({affectedScenes} scripts)</li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span>Estimasi credit: ~{estimatedCredits} credits</span>
                    </div>

                    <p className="text-xs text-gray-500">
                        Konten lama akan diganti dengan konten baru sesuai tension level.
                        Proses ini tidak bisa di-undo.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Regenerate & Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
