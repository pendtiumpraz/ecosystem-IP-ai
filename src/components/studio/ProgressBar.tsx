'use client';

import { CheckCircle, Circle } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'yellow' | 'cyan' | 'pink' | 'orange' | 'purple' | 'green' | 'blue';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const colorClasses = {
  yellow: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
};

const bgColorClasses = {
  yellow: 'bg-amber-100',
  cyan: 'bg-cyan-100',
  pink: 'bg-pink-100',
  orange: 'bg-orange-100',
  purple: 'bg-purple-100',
  green: 'bg-emerald-100',
  blue: 'bg-blue-100',
};

const textColorClasses = {
  yellow: 'text-amber-600',
  cyan: 'text-cyan-600',
  pink: 'text-pink-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  green: 'text-emerald-600',
  blue: 'text-blue-600',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  progress,
  color = 'orange',
  showLabel = true,
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const colorClass = colorClasses[color];
  const bgColorClass = bgColorClasses[color];
  const textColorClass = textColorClasses[color];
  const sizeClass = sizeClasses[size];
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        {/* Progress Bar */}
        <div className={`flex-1 ${sizeClass} ${bgColorClass} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${colorClass} ${animated ? 'transition-all duration-500' : ''}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Label */}
        {showLabel && (
          <div className={`flex items-center gap-2 text-xs font-medium ${textColorClass}`}>
            {clampedProgress === 100 ? (
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 text-gray-300" />
            )}
            <span className="w-12 text-right">{clampedProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
