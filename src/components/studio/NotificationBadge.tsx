'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBadge({ count = 0, onClick, className = '' }: NotificationBadgeProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}
