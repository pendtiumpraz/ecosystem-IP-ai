'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export function LoadingOverlay({ message = 'Loading...', progress, onCancel }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-animation">
          <div className="spinner" />
          <div className="pulse-ring" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating content...</h3>
        <p className="loading-message text-gray-600 mb-4">{message}</p>
        {progress !== undefined && (
          <div className="loading-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {onCancel && (
          <button 
            className="cancel-button mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
