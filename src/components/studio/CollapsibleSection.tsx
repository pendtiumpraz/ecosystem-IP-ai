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
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    icon: 'bg-amber-500 text-white',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    icon: 'bg-cyan-500 text-white',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
    icon: 'bg-pink-500 text-white',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    icon: 'bg-orange-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    icon: 'bg-purple-500 text-white',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    icon: 'bg-emerald-500 text-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: 'bg-blue-500 text-white',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    icon: 'bg-gray-400 text-white',
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
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <AlertCircle className="h-3 w-3" />
          0%
        </span>
      );
    }
    if (progressPercent === 100) {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <Check className="h-3 w-3" />
          Complete
        </span>
      );
    }
    return <span className="text-[10px] text-gray-500">{progressPercent}%</span>;
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full justify-between p-3 rounded-lg ${colorClass.bg} border ${colorClass.border} hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className={`h-5 w-5 rounded ${colorClass.icon} flex items-center justify-center`}>{icon}</div>}
          <div>
            <div className={`text-sm font-bold ${colorClass.text}`}>{title}</div>
            {(progress !== undefined || (filledFields !== undefined && totalFields !== undefined)) && (
              <div className="flex items-center gap-2 mt-0.5">
                {getProgressBadge()}
                {filledFields !== undefined && totalFields !== undefined && (
                  <span className="text-[10px] text-gray-400">
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
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
