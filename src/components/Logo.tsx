import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const sparklesSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6'
  };

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          gradient: 'from-white to-gray-200',
          text: 'text-white',
          sparkles: 'text-white/80'
        };
      case 'dark':
        return {
          gradient: 'from-gray-800 to-gray-900',
          text: 'text-gray-800',
          sparkles: 'text-gray-600'
        };
      default:
        return {
          gradient: 'from-cyan-500 via-blue-500 to-purple-600',
          text: 'text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text',
          sparkles: 'text-yellow-400'
        };
    }
  };

  const colors = getColors();

  return (
    <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20`}>
          <Bot className={`${iconSizeClasses[size]} text-white`} />
        </div>
        
        {/* Sparkles animation */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className={`${sparklesSizeClasses[size]} ${colors.sparkles} animate-pulse`} />
        </div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br ${colors.gradient} rounded-2xl blur-xl opacity-30 animate-pulse`}></div>
      </div>
      
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold ${colors.text}`}>
            OmnIA
          </h1>
          {size !== 'sm' && (
            <p className={`text-xs ${variant === 'white' ? 'text-white/80' : variant === 'dark' ? 'text-gray-600' : 'text-cyan-300'} font-medium`}>
              Commercial Mobilier IA
            </p>
          )}
        </div>
      )}
    </a>
  );
};