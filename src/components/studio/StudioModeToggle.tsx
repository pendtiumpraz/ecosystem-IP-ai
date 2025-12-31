'use client';

import React from 'react';
import { LayoutGrid, PenTool, Film, ToggleLeft, ToggleRight } from 'lucide-react';

export type StudioMode = 'form' | 'canvas' | 'storyboard';

interface StudioModeToggleProps {
    currentMode: StudioMode;
    onModeChange: (mode: StudioMode) => void;
    availableModes?: StudioMode[];
    className?: string;
}

const modeConfig = {
    form: {
        icon: LayoutGrid,
        label: 'Form',
        description: 'Structured input fields',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
    },
    canvas: {
        icon: PenTool,
        label: 'Canvas',
        description: 'Creative workspace',
        color: 'from-coral-500 to-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-200',
    },
    storyboard: {
        icon: Film,
        label: 'Storyboard',
        description: 'Timeline & animation',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200',
    },
};

export function StudioModeToggle({
    currentMode,
    onModeChange,
    availableModes = ['form', 'canvas'],
    className = '',
}: StudioModeToggleProps) {
    return (
        <div className={`flex items-center gap-1 p-1 bg-gray-100 rounded-xl ${className}`}>
            {availableModes.map((mode) => {
                const config = modeConfig[mode];
                const Icon = config.icon;
                const isActive = currentMode === mode;

                return (
                    <button
                        key={mode}
                        onClick={() => onModeChange(mode)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? config.textColor : ''}`} />
                        <span>{config.label}</span>
                        {isActive && (
                            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${config.color} opacity-10`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// Compact toggle version for header
export function StudioModeSwitch({
    currentMode,
    onModeChange,
    className = '',
}: Pick<StudioModeToggleProps, 'currentMode' | 'onModeChange' | 'className'>) {
    const isCanvas = currentMode === 'canvas';

    return (
        <button
            onClick={() => onModeChange(isCanvas ? 'form' : 'canvas')}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200
        ${isCanvas
                    ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                } ${className}`}
        >
            {isCanvas ? (
                <>
                    <PenTool className="w-4 h-4" />
                    <span className="text-sm font-medium">Canvas Mode</span>
                    <ToggleRight className="w-5 h-5 text-orange-500" />
                </>
            ) : (
                <>
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm font-medium">Form Mode</span>
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                </>
            )}
        </button>
    );
}

export default StudioModeToggle;
