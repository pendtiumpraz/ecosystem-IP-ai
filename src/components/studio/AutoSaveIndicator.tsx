'use client';

import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedTime?: string;
  onRetry?: () => void;
}

export function AutoSaveIndicator({ status, lastSavedTime, onRetry }: AutoSaveIndicatorProps) {
  return (
    <div className="auto-save-indicator">
      {status === 'saving' && (
        <div className="save-status saving">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      )}
      {status === 'saved' && (
        <div className="save-status saved">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Saved</span>
          {lastSavedTime && (
            <span className="save-time">{lastSavedTime}</span>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="save-status error">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Save failed</span>
          {onRetry && (
            <button 
              className="retry-button"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
