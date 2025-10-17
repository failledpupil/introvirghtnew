import React from 'react';
import { Logo, type LogoProps } from './Logo';
import { cn } from '../../utils/cn';

export interface LogoLoaderProps extends Omit<LogoProps, 'animated'> {
  message?: string;
  showMessage?: boolean;
  pulseAnimation?: boolean;
}

/**
 * LogoLoader - Loading state component with animated logo
 * Perfect for splash screens and loading states
 */
export const LogoLoader: React.FC<LogoLoaderProps> = ({
  message = 'Loading...',
  showMessage = true,
  pulseAnimation = true,
  size = 'xl',
  variant = 'full',
  className,
  ...logoProps
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* Animated Logo */}
      <div
        className={cn(
          'relative',
          pulseAnimation && 'animate-logo-glow'
        )}
      >
        <Logo
          variant={variant}
          size={size}
          animated
          className="animate-breathe"
          {...logoProps}
        />
        
        {/* Enhanced glow effect */}
        {pulseAnimation && (
          <>
            <div className="absolute inset-0 -z-10 blur-xl opacity-30 bg-fountain-pen-blue dark:bg-blue-400 animate-breathe" />
            <div className="absolute inset-0 -z-20 blur-2xl opacity-20 bg-fountain-pen-blue dark:bg-blue-400 animate-pulse-gentle" />
          </>
        )}
      </div>

      {/* Loading Message */}
      {showMessage && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-pencil-graphite dark:text-gray-300 font-script text-lg animate-fade-in">
            {message}
          </p>
          
          {/* Loading dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-fountain-pen-blue dark:bg-blue-400 animate-loading-dots" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-fountain-pen-blue dark:bg-blue-400 animate-loading-dots" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-fountain-pen-blue dark:bg-blue-400 animate-loading-dots" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoLoader;
