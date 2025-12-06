import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className={`
            w-5 h-5 rounded border-gray-300 transition-all cursor-pointer
            focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${error ? 'border-error' : ''}
            ${className}
          `}
          style={{ accentColor: '#fc6813' }}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3">
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-error">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
