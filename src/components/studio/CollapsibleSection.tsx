'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  progress?: number; // 0-100
  totalFields?: number;
  filledFields?: number;
  color?: 'yellow' | 'cyan' | 'pink' | 'orange' | 'purple' | 'green' | 'blue' | 'gray';
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
}

const colorClasses = {
  yellow: {
    bg: 'bg-yellow-400/90',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400',
    icon: 'bg-yellow-400',
  },
  cyan: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    icon: 'bg-cyan-500',
  },
  pink: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-500',
    icon: 'bg-pink-500',
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
    icon: 'bg-orange-500',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    icon: 'bg-purple-500',
  },
  green: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    icon: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    icon: 'bg-blue-500',
  },
  gray: {
    bg: 'bg-white/10',
    border: 'border-white/20',
    text: 'text-white/60',
    icon: 'bg-white/20',
  },
};

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  progress,
  totalFields,
  filledFields,
  color = 'gray',
  onToggle,
  disabled = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const colorClass = colorClasses[color];
  const progressPercent = progress ?? (filledFields && totalFields ? Math.round((filledFields / totalFields) * 100) : 0);

  const getProgressBadge = () => {
    if (progressPercent === 0) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-white/40">
          <AlertCircle className="h-3 w-3" />
          0%
        </span>
      );
    }
    if (progressPercent === 100) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <Check className="h-3 w-3" />
          Complete
        </span>
      );
    }
    return <span className="text-[10px] text-white/60">{progressPercent}%</span>;
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full justify-between p-3 rounded-lg ${colorClass.bg} ${colorClass.border} hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className={`h-5 w-5 rounded ${colorClass.icon} flex items-center justify-center`}>{icon}</div>}
          <div>
            <div className={`text-sm font-bold ${colorClass.text}`}>{title}</div>
            {(progress !== undefined || (filledFields !== undefined && totalFields !== undefined)) && (
              <div className="flex items-center gap-2 mt-0.5">
                {getProgressBadge()}
                {filledFields !== undefined && totalFields !== undefined && (
                  <span className="text-[10px] text-white/40">
                    ({filledFields}/{totalFields})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className={`h-4 w-4 ${colorClass.text}`} />
        ) : (
          <ChevronRight className={`h-4 w-4 ${colorClass.text}`} />
        )}
      </Button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 rounded-lg bg-black/20 border border-white/10 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
