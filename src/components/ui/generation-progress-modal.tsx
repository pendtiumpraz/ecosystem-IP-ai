'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface GenerationStep {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}

interface GenerationProgressModalProps {
    isOpen: boolean;
    title: string;
    steps: GenerationStep[];
    currentStepIndex: number;
    onClose?: () => void;
}

export function GenerationProgressModal({
    isOpen,
    title,
    steps,
    currentStepIndex,
    onClose,
}: GenerationProgressModalProps) {
    const completedCount = steps.filter(s => s.status === 'completed').length;
    const hasErrors = steps.some(s => s.status === 'error');
    const isComplete = currentStepIndex >= steps.length && steps.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isComplete ? (
                            hasErrors ? (
                                <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )
                        ) : (
                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                        )}
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{completedCount} / {steps.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${hasErrors
                                        ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                        : 'bg-gradient-to-r from-orange-400 to-orange-600'
                                    }`}
                                style={{ width: `${(completedCount / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps list */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${step.status === 'processing'
                                        ? 'bg-orange-50 border border-orange-200'
                                        : step.status === 'completed'
                                            ? 'bg-green-50'
                                            : step.status === 'error'
                                                ? 'bg-red-50'
                                                : 'bg-gray-50'
                                    }`}
                            >
                                {/* Status icon */}
                                <div className="flex-shrink-0">
                                    {step.status === 'processing' && (
                                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                    )}
                                    {step.status === 'completed' && (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {step.status === 'error' && (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    {step.status === 'pending' && (
                                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${step.status === 'processing'
                                            ? 'text-orange-700'
                                            : step.status === 'completed'
                                                ? 'text-green-700'
                                                : step.status === 'error'
                                                    ? 'text-red-700'
                                                    : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </p>
                                    {step.error && (
                                        <p className="text-xs text-red-500 truncate">{step.error}</p>
                                    )}
                                </div>

                                {/* Step number */}
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                    {index + 1}/{steps.length}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Footer message */}
                    {!isComplete && (
                        <p className="text-xs text-gray-400 text-center mt-4">
                            Please wait while AI generates content...
                        </p>
                    )}

                    {isComplete && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                {hasErrors ? 'Close (with errors)' : 'Done'}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper hook for managing generation progress
export function useGenerationProgress() {
    const initialState = {
        isActive: false,
        title: '',
        steps: [] as GenerationStep[],
        currentIndex: 0,
    };

    return {
        initialState,
        createSteps: (labels: string[]): GenerationStep[] =>
            labels.map((label, i) => ({
                id: `step-${i}`,
                label,
                status: 'pending' as const,
            })),
        updateStep: (steps: GenerationStep[], index: number, status: GenerationStep['status'], error?: string) => {
            const newSteps = [...steps];
            if (newSteps[index]) {
                newSteps[index] = { ...newSteps[index], status, error };
            }
            return newSteps;
        },
    };
}
