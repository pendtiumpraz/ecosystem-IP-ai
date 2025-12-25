'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: Action[];
  progress?: number;
  badge?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  icon: Icon, 
  color = 'from-blue-500 to-cyan-500',
  actions = [],
  progress,
  badge
}: SectionHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 max-w-2xl">{description}</p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="gap-2"
                >
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
