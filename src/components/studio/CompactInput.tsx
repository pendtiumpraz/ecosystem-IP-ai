'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompactInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'email';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  color?: 'yellow' | 'cyan' | 'pink' | 'orange' | 'purple' | 'green' | 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  maxLength?: number;
  className?: string;
}

const colorClasses = {
  yellow: {
    label: 'text-amber-600',
    input: 'bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20',
    helper: 'text-amber-500',
    iconColor: 'text-amber-500',
  },
  cyan: {
    label: 'text-cyan-600',
    input: 'bg-white border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400/20',
    helper: 'text-cyan-500',
    iconColor: 'text-cyan-500',
  },
  pink: {
    label: 'text-pink-600',
    input: 'bg-white border-pink-200 focus:border-pink-400 focus:ring-pink-400/20',
    helper: 'text-pink-500',
    iconColor: 'text-pink-500',
  },
  orange: {
    label: 'text-orange-600',
    input: 'bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400/20',
    helper: 'text-orange-500',
    iconColor: 'text-orange-500',
  },
  purple: {
    label: 'text-purple-600',
    input: 'bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20',
    helper: 'text-purple-500',
    iconColor: 'text-purple-500',
  },
  green: {
    label: 'text-emerald-600',
    input: 'bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20',
    helper: 'text-emerald-500',
    iconColor: 'text-emerald-500',
  },
  blue: {
    label: 'text-blue-600',
    input: 'bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20',
    helper: 'text-blue-500',
    iconColor: 'text-blue-500',
  },
  gray: {
    label: 'text-gray-600',
    input: 'bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400/20',
    helper: 'text-gray-500',
    iconColor: 'text-gray-500',
  },
};

const sizeClasses = {
  sm: 'h-7 text-xs',
  md: 'h-8 text-sm',
  lg: 'h-10 text-base',
};

export function CompactInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  error,
  helperText,
  icon,
  color = 'gray',
  size = 'md',
  maxLength,
  className,
}: CompactInputProps) {
  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-2">
          {icon && <span className={`text-[10px] ${colorClass.iconColor}`}>{icon}</span>}
          <Label className={`text-[10px] uppercase tracking-wider font-bold ${colorClass.label}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      )}

      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`${sizeClass} ${colorClass.input} text-gray-900 ${error ? 'border-red-400 focus:border-red-500' : ''} ${className || ''}`}
        />
        {icon && !label && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${colorClass.iconColor}`}>
            {icon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500">{error}</p>
      )}

      {helperText && !error && (
        <p className={`text-[10px] ${colorClass.helper}`}>{helperText}</p>
      )}
    </div>
  );
}
