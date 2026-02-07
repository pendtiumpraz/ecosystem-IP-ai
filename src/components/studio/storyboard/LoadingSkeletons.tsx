'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Scene Card Skeleton
export function SceneCardSkeleton() {
    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton className="aspect-video bg-white/10" />

            {/* Info Footer */}
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-3 w-full bg-white/10" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-20 bg-white/10 rounded-full" />
                </div>
            </div>
        </Card>
    );
}

// Scene Grid Skeleton
export function SceneGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SceneCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
    return (
        <Card className="bg-white/5 border-white/10 p-4">
            <Skeleton className="h-8 w-12 bg-white/10 mb-2" />
            <Skeleton className="h-4 w-20 bg-white/10" />
        </Card>
    );
}

// Stats Row Skeleton
export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <StatsCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Shot Table Skeleton
export function ShotTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 p-4 border-b border-white/10">
                <Skeleton className="h-6 w-8 bg-white/10" />
                <Skeleton className="h-6 w-24 bg-white/10" />
                <Skeleton className="h-6 w-20 bg-white/10" />
                <Skeleton className="h-6 w-24 bg-white/10" />
                <Skeleton className="h-6 w-16 bg-white/10" />
                <Skeleton className="h-6 flex-1 bg-white/10" />
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-white/5">
                    <Skeleton className="h-5 w-8 bg-white/10" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                    <Skeleton className="h-5 w-20 bg-white/10" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                    <Skeleton className="h-5 w-16 bg-white/10" />
                    <Skeleton className="h-5 flex-1 bg-white/10" />
                </div>
            ))}
        </Card>
    );
}

// Script View Skeleton
export function ScriptViewSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between">
                <Skeleton className="h-8 w-48 bg-white/10" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-32 bg-white/10" />
                    <Skeleton className="h-8 w-24 bg-white/10" />
                </div>
            </div>

            {/* Script Content */}
            <Card className="bg-white/5 border-white/10 p-6 space-y-4">
                <Skeleton className="h-4 w-1/4 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
                <Skeleton className="h-12 w-full bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-5/6 bg-white/10" />
            </Card>
        </div>
    );
}

// Timeline Skeleton
export function TimelineSkeleton({ count = 6 }: { count?: number }) {
    return (
        <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-56">
                        <Skeleton className="aspect-video rounded-lg bg-white/10" />
                        <div className="mt-2 space-y-1">
                            <Skeleton className="h-3 w-3/4 bg-white/10" />
                            <Skeleton className="h-2 w-1/2 bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// Full Page Loading Skeleton
export function StoryboardLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <StatsRowSkeleton />

            {/* Actions Bar Skeleton */}
            <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-48 bg-white/10" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 bg-white/10 rounded" />
                        <Skeleton className="h-8 w-8 bg-white/10 rounded" />
                        <Skeleton className="h-8 w-32 bg-white/10" />
                    </div>
                </div>
            </Card>

            <SceneGridSkeleton />
        </div>
    );
}
