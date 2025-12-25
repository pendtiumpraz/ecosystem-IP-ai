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
}

const colorClasses = {
  yellow: {
    label: 'text-yellow-400',
    input: 'bg-black/20 border-yellow-400/30 focus:border-yellow-400/50 focus:ring-yellow-400/20',
    helper: 'text-yellow-400/60',
  },
  cyan: {
    label: 'text-cyan-400',
    input: 'bg-black/20 border-cyan-400/30 focus:border-cyan-400/50 focus:ring-cyan-400/20',
    helper: 'text-cyan-400/60',
  },
  pink: {
    label: 'text-pink-500',
    input: 'bg-black/20 border-pink-500/30 focus:border-pink-500/50 focus:ring-pink-500/20',
    helper: 'text-pink-500/60',
  },
  orange: {
    label: 'text-orange-500',
    input: 'bg-black/20 border-orange-500/30 focus:border-orange-500/50 focus:ring-orange-500/20',
    helper: 'text-orange-500/60',
  },
  purple: {
    label: 'text-purple-500',
    input: 'bg-black/20 border-purple-500/30 focus:border-purple-500/50 focus:ring-purple-500/20',
    helper: 'text-purple-500/60',
  },
  green: {
    label: 'text-emerald-400',
    input: 'bg-black/20 border-emerald-400/30 focus:border-emerald-400/50 focus:ring-emerald-400/20',
    helper: 'text-emerald-400/60',
  },
  blue: {
    label: 'text-blue-500',
    input: 'bg-black/20 border-blue-500/30 focus:border-blue-500/50 focus:ring-blue-500/20',
    helper: 'text-blue-500/60',
  },
  gray: {
    label: 'text-white/60',
    input: 'bg-black/20 border-white/10 focus:border-white/20 focus:ring-white/10',
    helper: 'text-white/40',
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
}: CompactInputProps) {
  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-2">
          {icon && <span className="text-[10px]">{icon}</span>}
          <Label className={`text-[10px] uppercase tracking-wider font-bold ${colorClass.label}`}>
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
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
          className={`${sizeClass} ${colorClass.input} ${error ? 'border-red-400/50 focus:border-red-400' : ''}`}
        />
        {icon && !label && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className={`text-[10px] ${colorClass.helper}`}>{helperText}</p>
      )}
    </div>
  );
}
