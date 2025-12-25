'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon?: LucideIcon;
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: string;
}

export function StatCard({ icon: Icon, title, value, change, color = 'from-blue-500 to-cyan-500' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-medium ${change.positive !== false ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive !== false ? '+' : ''}{change.value}%
          </span>
          <span className="text-gray-500">{change.label}</span>
        </div>
      )}
    </div>
  );
}
