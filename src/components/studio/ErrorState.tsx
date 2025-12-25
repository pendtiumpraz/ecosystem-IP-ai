'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
}

interface ErrorStateProps {
  title: string;
  message: string;
  actions?: Action[];
  code?: string;
}

export function ErrorState({ title, message, actions = [], code }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500">{message}</p>
          {code && (
            <code className="block mt-2 px-3 py-2 text-xs font-mono bg-gray-100 text-gray-700 rounded-lg">
              {code}
            </code>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
