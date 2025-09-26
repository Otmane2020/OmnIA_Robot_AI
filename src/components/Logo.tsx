import React from 'react';
import { Bot } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-2 flex items-center justify-center">
        <Bot className={`${iconSizes[size]} text-white`} />
      </div>
      <div>
        <h1 className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}>
          OmnIA
        </h1>
        <p className="text-xs text-gray-400">Commercial Mobilier IA</p>
      </div>
    </div>
  );
};