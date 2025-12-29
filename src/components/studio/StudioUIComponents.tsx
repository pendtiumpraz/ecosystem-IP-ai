import { ChevronDown, ChevronRight } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  color: string;
  children: React.ReactNode;
}

interface CompactInputProps {
  label: string;
  labelColor: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  helperText?: string;
  helperColor?: string;
  disabled?: boolean;
  rows?: number;
  children?: React.ReactNode;
}

interface CardProps {
  header?: string;
  children: React.ReactNode;
}

interface ButtonProps {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Progress</span>
      <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-orange-600 font-bold min-w-[35px] text-right">{progress}%</span>
    </div>
  );
};

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  color,
  children
}) => {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className={`w-full justify-between p-3 rounded-lg ${color} hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-white" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 rounded-lg bg-white border border-orange-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const CompactInput: React.FC<CompactInputProps> = ({
  label,
  labelColor,
  type,
  value,
  onChange,
  placeholder,
  helperText,
  helperColor = 'text-gray-500',
  disabled = false,
  rows = 3,
  children
}) => {
  const baseInputClasses = `w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputClasses}
          disabled={disabled}
          rows={rows}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={onChange}
          className={`${baseInputClasses} h-9`}
          disabled={disabled}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseInputClasses} h-9`}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="space-y-1">
      <label className={`text-[10px] uppercase tracking-wider font-medium ${labelColor}`}>
        {label}
      </label>
      {renderInput()}
      {helperText && (
        <p className={`text-[10px] ${helperColor}`}>{helperText}</p>
      )}
    </div>
  );
};

export const Card: React.FC<CardProps> = ({ header, children }) => {
  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {header && (
          <h3 className="text-base font-semibold text-gray-900 mb-3">{header}</h3>
        )}
        {children}
      </div>
    </div>
  );
};

export const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  variant = 'primary',
  onClick,
  disabled = false
}) => {
  const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};