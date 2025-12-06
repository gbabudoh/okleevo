import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div
      className={`rounded-lg flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#fc6813',
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.5 }}>
        O
      </span>
    </div>
  );
};

export const LogoFull: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={40} />
      <span className="text-xl font-bold text-gray-900">Okleevo</span>
    </div>
  );
};
