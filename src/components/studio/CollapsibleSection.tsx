'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, description, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button 
        className="collapsible-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="trigger-description text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <ChevronDown 
          className={`chevron h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}
