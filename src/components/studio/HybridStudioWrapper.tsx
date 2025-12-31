'use client';

import React, { useState, useCallback } from 'react';
import { StudioModeToggle, StudioModeSwitch, StudioMode } from './StudioModeToggle';
import { CanvasStudio } from './CanvasStudio';
import { StoryboardStudio } from './StoryboardStudio';
import { Sparkles, Info, X } from 'lucide-react';

interface HybridStudioWrapperProps {
    projectId: string;
    userId: string;
    tabId: string;
    tabName: string;
    canvasType?: 'character' | 'universe' | 'story' | 'project' | 'moodboard';
    availableModes?: StudioMode[];
    defaultMode?: StudioMode;
    children: React.ReactNode; // Form mode content
    onCanvasSave?: (data: any) => void;
}

// Tip messages for each canvas type
const canvasTips: Record<string, string> = {
    character: '💡 Tip: Di Canvas Mode, kamu bisa menambahkan referensi visual, catatan, dan color palette untuk karaktermu. Coba drag-and-drop untuk mengatur layout!',
    universe: '💡 Tip: Gunakan Canvas Mode untuk membuat peta dunia, hubungan antar lokasi, dan visual worldbuilding yang immersive!',
    story: '💡 Tip: Canvas Mode cocok untuk plotting non-linear. Buat sticky notes untuk setiap plot point dan hubungkan dengan garis!',
    project: '💡 Tip: Kumpulkan semua inspirasi, tasks, dan notes project di Canvas Mode untuk overview yang lebih visual!',
    moodboard: '💡 Tip: Perfect untuk mengumpulkan visual references! Upload gambar, tambahkan color palettes, dan annotate sesuai kebutuhan.',
};

export function HybridStudioWrapper({
    projectId,
    userId,
    tabId,
    tabName,
    canvasType = 'moodboard',
    availableModes = ['form', 'canvas'],
    defaultMode = 'form',
    children,
    onCanvasSave,
}: HybridStudioWrapperProps) {
    const [mode, setMode] = useState<StudioMode>(defaultMode);
    const [showTip, setShowTip] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleModeChange = useCallback((newMode: StudioMode) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setMode(newMode);
            setIsTransitioning(false);
        }, 150);
    }, []);

    const renderContent = () => {
        if (isTransitioning) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
                </div>
            );
        }

        switch (mode) {
            case 'canvas':
                return (
                    <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <CanvasStudio
                            projectId={projectId}
                            userId={userId}
                            canvasType={canvasType}
                            canvasName={tabName}
                            onSave={onCanvasSave}
                        />
                    </div>
                );

            case 'storyboard':
                return (
                    <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <StoryboardStudio
                            projectId={projectId}
                            userId={userId}
                            projectName={tabName}
                            onSave={onCanvasSave}
                        />
                    </div>
                );

            case 'form':
            default:
                return <>{children}</>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{tabName}</h3>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">{mode} Mode</span>
                </div>

                <StudioModeToggle
                    currentMode={mode}
                    onModeChange={handleModeChange}
                    availableModes={availableModes}
                />
            </div>

            {/* Mode-specific Tip */}
            {mode === 'canvas' && showTip && (
                <div className="relative flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 animate-fadeIn">
                    <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-orange-800">{canvasTips[canvasType]}</p>
                    </div>
                    <button
                        onClick={() => setShowTip(false)}
                        className="flex-shrink-0 p-1 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-orange-400" />
                    </button>
                </div>
            )}

            {mode === 'storyboard' && showTip && (
                <div className="relative flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 animate-fadeIn">
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                        <Info className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-purple-800">
                            💡 Storyboard Mode memungkinkan kamu membuat scene timeline, mengatur voiceover, dan generate animasi langsung dari prompt!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowTip(false)}
                        className="flex-shrink-0 p-1 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-purple-400" />
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                {renderContent()}
            </div>
        </div>
    );
}

export default HybridStudioWrapper;
