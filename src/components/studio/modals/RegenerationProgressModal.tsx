'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    Circle,
    Loader2,
    XCircle,
    ArrowUp,
    ArrowDown,
    Coins
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type StepStatus = 'pending' | 'generating' | 'complete' | 'error';

interface BeatProgress {
    beatKey: string;
    beatLabel: string;
    previousTension: number;
    newTension: number;
    status: 'pending' | 'in_progress' | 'complete' | 'error';
    steps: {
        beatContent: StepStatus;
        keyAction: StepStatus;
        scenePlots: { status: StepStatus; current: number; total: number };
        scripts: { status: StepStatus; current: number; total: number };
    };
}

interface RegenerationProgressModalProps {
    isOpen: boolean;
    beats: BeatProgress[];
    currentBeatIndex: number;
    totalProgress: number;
    creditsUsed: number;
    estimatedCredits: number;
    onCancel: () => void;
    error?: string;
    isComplete?: boolean;
}

function StepStatusIcon({ status }: { status: StepStatus }) {
    switch (status) {
        case 'complete':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'generating':
            return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
        case 'error':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Circle className="h-4 w-4 text-gray-300" />;
    }
}

function StepLine({
    label,
    status,
    progress
}: {
    label: string;
    status: StepStatus;
    progress?: { current: number; total: number }
}) {
    return (
        <div className="flex items-center gap-2 text-sm py-1">
            <StepStatusIcon status={status} />
            <span className={status === 'generating' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                {label}
            </span>
            {progress && status === 'generating' && (
                <span className="text-xs text-gray-400">
                    ({progress.current}/{progress.total})
                </span>
            )}
            {status === 'complete' && (
                <span className="text-xs text-green-500 ml-auto">✓</span>
            )}
        </div>
    );
}

export function RegenerationProgressModal({
    isOpen,
    beats,
    currentBeatIndex,
    totalProgress,
    creditsUsed,
    estimatedCredits,
    onCancel,
    error,
    isComplete = false,
}: RegenerationProgressModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isComplete ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Regeneration Complete
                            </>
                        ) : error ? (
                            <>
                                <XCircle className="h-5 w-5 text-red-500" />
                                Regeneration Error
                            </>
                        ) : (
                            <>
                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                Regenerating {beats.length} Beat{beats.length > 1 ? 's' : ''}...
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {beats.map((beat, index) => (
                        <div
                            key={beat.beatKey}
                            className={`rounded-lg border p-3 ${index === currentBeatIndex
                                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                                    : beat.status === 'complete'
                                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-400">
                                    Beat {index + 1}/{beats.length}
                                </span>
                                <span className="font-medium">{beat.beatLabel}</span>
                                {beat.newTension > beat.previousTension ? (
                                    <ArrowUp className="h-4 w-4 text-red-500" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="text-xs text-gray-500">
                                    {beat.previousTension} → {beat.newTension}
                                </span>
                            </div>

                            {(beat.status === 'in_progress' || beat.status === 'complete') && (
                                <div className="ml-2 border-l-2 border-gray-200 pl-3 space-y-0">
                                    <StepLine label="Beat Content" status={beat.steps.beatContent} />
                                    <StepLine label="Key Action" status={beat.steps.keyAction} />
                                    <StepLine
                                        label="Scene Plots"
                                        status={beat.steps.scenePlots.status}
                                        progress={beat.steps.scenePlots}
                                    />
                                    <StepLine
                                        label="Scripts"
                                        status={beat.steps.scripts.status}
                                        progress={beat.steps.scripts}
                                    />
                                </div>
                            )}

                            {beat.status === 'pending' && (
                                <div className="text-xs text-gray-400 italic">Pending...</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-2 border-t">
                    <Progress value={totalProgress} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-gray-600">
                                Credits: {creditsUsed} / ~{estimatedCredits}
                            </span>
                        </div>
                        <span className="text-gray-500">
                            {Math.round(totalProgress)}%
                        </span>
                    </div>

                    <div className="flex justify-end">
                        {isComplete ? (
                            <Button onClick={onCancel}>
                                Done
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={onCancel}>
                                Cancel Process
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
