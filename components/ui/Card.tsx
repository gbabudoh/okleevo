import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
}) => {
  const baseStyles = 'rounded-xl border transition-all';
  const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';
  const glassStyles = glass ? 'glass' : 'bg-white border-gray-200';
  
  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-6 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

