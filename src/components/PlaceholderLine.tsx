import React from 'react';

interface PlaceholderLineProps {
  className?: string;
  width?: string;
  height?: string;
  tone?: 'dark' | 'medium' | 'light' | 'white' | 'sage';
  rounded?: 'full' | 'lg' | 'md' | 'sm';
}

export const PlaceholderLine: React.FC<PlaceholderLineProps> = ({
  className = '',
  width = 'w-24',
  height = 'h-3',
  tone = 'medium',
  rounded = 'full',
}) => {
  const toneClasses = {
    dark: 'bg-[#263A20]',
    medium: 'bg-[#263A20]/45',
    light: 'bg-[#263A20]/25',
    white: 'bg-white/90',
    sage: 'bg-[#A3B89D]',
  }[tone];

  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    sm: 'rounded-sm',
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={`${width} ${height} ${toneClasses} ${roundedClasses} transition-all duration-200 ${className}`}
    />
  );
};
