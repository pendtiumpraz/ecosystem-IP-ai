'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

interface SuccessStateProps {
  title: string;
  message: string;
  action?: Action;
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        
        {action && (
          <div className="flex items-center justify-center">
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
