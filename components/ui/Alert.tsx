import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variants = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${config.bg} ${config.border} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${config.text}`}>{title}</h4>
          )}
          <div className={`text-sm ${config.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${config.iconColor}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
