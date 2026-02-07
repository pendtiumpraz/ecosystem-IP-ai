'use client';

import { useState, useEffect } from 'react';
import {
    X, CheckCircle, XCircle, Loader2, AlertCircle, Clock,
    Image as ImageIcon, Video, Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export type GenerationType = 'image' | 'clip' | 'shot' | 'script';
export type ItemStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface GenerationItem {
    id: string;
    label: string;
    status: ItemStatus;
    error?: string;
    startTime?: number;
    endTime?: number;
}

interface GenerationProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: GenerationType;
    items: GenerationItem[];
    onRetryFailed?: () => void;
    onCancel?: () => void;
}

export function GenerationProgressModal({
    isOpen,
    onClose,
    title,
    type,
    items,
    onRetryFailed,
    onCancel
}: GenerationProgressModalProps) {
    const [elapsedTime, setElapsedTime] = useState(0);

    // Calculate stats
    const completedCount = items.filter(i => i.status === 'completed').length;
    const failedCount = items.filter(i => i.status === 'failed').length;
    const processingCount = items.filter(i => i.status === 'processing').length;
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const totalCount = items.length;

    const isComplete = completedCount + failedCount === totalCount;
    const progress = totalCount > 0 ? ((completedCount + failedCount) / totalCount) * 100 : 0;

    // Timer for elapsed time
    useEffect(() => {
        if (!isComplete && isOpen) {
            const timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isComplete, isOpen]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get icon for type
    const getTypeIcon = () => {
        switch (type) {
            case 'image': return <ImageIcon className="w-5 h-5" />;
            case 'clip': return <Video className="w-5 h-5" />;
            case 'shot': return <Film className="w-5 h-5" />;
            case 'script': return <Film className="w-5 h-5" />;
        }
    };

    // Get status icon
    const getStatusIcon = (status: ItemStatus) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'processing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
            case 'pending': return <Clock className="w-4 h-4 text-white/30" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete
                                ? failedCount > 0
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                            {isComplete ? (
                                failedCount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />
                            ) : (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(elapsedTime)}</span>
                            </div>
                        </div>
                    </div>
                    {isComplete && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Progress */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Overall Progress</span>
                        <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />

                    {/* Stats */}
                    <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-white/60">Completed: {completedCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-white/60">Processing: {processingCount}</span>
                        </div>
                        {failedCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-white/60">Failed: {failedCount}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                            <span className="text-white/60">Pending: {pendingCount}</span>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 ${item.status === 'processing' ? 'bg-blue-500/5' :
                                    item.status === 'failed' ? 'bg-red-500/5' : ''
                                }`}
                        >
                            {/* Index */}
                            <span className="w-6 text-center text-xs text-white/40">{index + 1}</span>

                            {/* Status Icon */}
                            {getStatusIcon(item.status)}

                            {/* Label */}
                            <span className={`flex-1 text-sm truncate ${item.status === 'completed' ? 'text-white' :
                                    item.status === 'failed' ? 'text-red-400' :
                                        item.status === 'processing' ? 'text-blue-400' :
                                            'text-white/40'
                                }`}>
                                {item.label}
                            </span>

                            {/* Error Message */}
                            {item.status === 'failed' && item.error && (
                                <span className="text-xs text-red-400 truncate max-w-[120px]" title={item.error}>
                                    {item.error}
                                </span>
                            )}

                            {/* Duration */}
                            {item.status === 'completed' && item.startTime && item.endTime && (
                                <span className="text-xs text-white/40">
                                    {formatTime(Math.round((item.endTime - item.startTime) / 1000))}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    {isComplete ? (
                        <>
                            {failedCount > 0 && onRetryFailed && (
                                <Button
                                    onClick={onRetryFailed}
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-500/30 text-amber-400"
                                >
                                    Retry {failedCount} Failed
                                </Button>
                            )}
                            <Button onClick={onClose} size="sm" className="ml-auto">
                                Done
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-white/40">
                                Please don't close this window
                            </p>
                            {onCancel && (
                                <Button
                                    onClick={onCancel}
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/60"
                                >
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
