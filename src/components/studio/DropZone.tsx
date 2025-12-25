'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  onBrowse?: () => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export function DropZone({ onDrop, onBrowse, accept, multiple = false, maxSize }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    // Filter by file type if accept is specified
    let filteredFiles = files;
    if (accept) {
      const acceptTypes = accept.split(',').map(t => t.trim());
      filteredFiles = files.filter(file => {
        return acceptTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });
      });
    }
    
    // Filter by file size if maxSize is specified
    if (maxSize) {
      filteredFiles = filteredFiles.filter(file => file.size <= maxSize);
    }
    
    // Filter by multiple flag
    if (!multiple) {
      filteredFiles = filteredFiles.slice(0, 1);
    }
    
    if (filteredFiles.length > 0) {
      onDrop(filteredFiles);
    }
  };

  return (
    <div 
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging ? (
        <div className="drag-over-content space-y-4">
          <Upload className="h-12 w-12 text-blue-500 mx-auto" />
          <p className="drag-message text-lg font-medium text-blue-500">Drop files here to upload</p>
        </div>
      ) : (
        <div className="drop-content space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="drop-text text-gray-600">
            Drag & drop files here or{' '}
            <button 
              className="browse-button text-blue-500 hover:underline font-medium"
              onClick={onBrowse}
            >
              browse
            </button>
          </p>
          {maxSize && (
            <p className="text-xs text-gray-400">
              Maximum file size: {(maxSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}
    </div>
  );
}
