'use client';

import {
    Film, Image as ImageIcon, Video, FileText, Clapperboard, Plus,
    AlertCircle, RefreshCw, Wand2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

// Generic Empty State
export function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction
}: EmptyStateProps) {
    return (
        <Card className="bg-white/5 border-white/10 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                {icon || <Film className="w-8 h-8 text-blue-400" />}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">{description}</p>
            <div className="flex items-center justify-center gap-3">
                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                        {actionLabel}
                    </Button>
                )}
                {secondaryActionLabel && onSecondaryAction && (
                    <Button
                        onClick={onSecondaryAction}
                        variant="outline"
                        className="border-white/20 text-white"
                    >
                        {secondaryActionLabel}
                    </Button>
                )}
            </div>
        </Card>
    );
}

// Empty Scenes State
export function EmptyScenesState({ onCreateFirst }: { onCreateFirst?: () => void }) {
    return (
        <EmptyState
            icon={<Clapperboard className="w-8 h-8 text-blue-400" />}
            title="No Scenes Yet"
            description="Start by creating your first scene. You can add a synopsis, location, and characters to bring your story to life."
            actionLabel="Create First Scene"
            onAction={onCreateFirst}
        />
    );
}

// Empty Storyboard Images State
export function EmptyStoryboardState({ onGenerateAll }: { onGenerateAll?: () => void }) {
    return (
        <EmptyState
            icon={<ImageIcon className="w-8 h-8 text-purple-400" />}
            title="No Storyboard Images"
            description="Generate storyboard images to visualize your scenes. Each scene with a plot can have an AI-generated image."
            actionLabel="Generate All Images"
            onAction={onGenerateAll}
        />
    );
}

// Empty Clips State
export function EmptyClipsState({ onGenerateAll }: { onGenerateAll?: () => void }) {
    return (
        <EmptyState
            icon={<Video className="w-8 h-8 text-pink-400" />}
            title="No Video Clips"
            description="Generate video clips from your storyboard images. Each clip uses AI to add cinematic movement to still images."
            actionLabel="Generate All Clips"
            onAction={onGenerateAll}
            secondaryActionLabel="Learn More"
        />
    );
}

// Empty Shots State
export function EmptyShotsState({ onGenerate }: { onGenerate?: () => void }) {
    return (
        <EmptyState
            icon={<Film className="w-8 h-8 text-cyan-400" />}
            title="No Shots in This Scene"
            description="Generate a shot list to break down this scene into camera shots. This helps plan your visual storytelling."
            actionLabel="Generate Shot List"
            onAction={onGenerate}
        />
    );
}

// Empty Script State
export function EmptyScriptState({ onGenerate }: { onGenerate?: () => void }) {
    return (
        <EmptyState
            icon={<FileText className="w-8 h-8 text-amber-400" />}
            title="No Script Yet"
            description="Generate a screenplay script for this scene based on the plot and shot list. Scripts are formatted in standard screenplay format."
            actionLabel="Generate Script"
            onAction={onGenerate}
        />
    );
}

// Error State
interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message,
    onRetry
}: ErrorStateProps) {
    return (
        <Card className="bg-red-500/5 border-red-500/20 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/60 mb-4 max-w-sm mx-auto">{message}</p>
            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            )}
        </Card>
    );
}

// Processing State (for async operations)
interface ProcessingStateProps {
    title: string;
    description?: string;
    progress?: number;
}

export function ProcessingState({ title, description, progress }: ProcessingStateProps) {
    return (
        <Card className="bg-blue-500/5 border-blue-500/20 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Wand2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-white/60 mb-4">{description}</p>
            )}
            {progress !== undefined && (
                <div className="max-w-xs mx-auto">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}

// Success State
interface SuccessStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function SuccessState({ title, description, actionLabel, onAction }: SuccessStateProps) {
    return (
        <Card className="bg-emerald-500/5 border-emerald-500/20 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-white/60 mb-4">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {actionLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </Card>
    );
}
