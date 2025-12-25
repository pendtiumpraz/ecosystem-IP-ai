'use client';

import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      <a
        href="/dashboard/projects"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Projects</span>
      </a>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span
              className={`${
                index === items.length - 1
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 cursor-pointer transition-colors'
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
