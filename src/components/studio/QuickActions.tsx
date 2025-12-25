'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export function QuickActions({ actions, title = 'Quick Actions' }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-gray-100"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <ActionIcon className="h-4 w-4 text-gray-500" />
              <span className="flex-1 text-left">{action.label}</span>
              {action.shortcut && (
                <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                  {action.shortcut}
                </kbd>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
