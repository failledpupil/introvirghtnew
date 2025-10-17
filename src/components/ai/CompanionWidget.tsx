// Compact companion widget for integration throughout the app

import React, { useState } from 'react';
import { EmotionalCompanion } from './EmotionalCompanion';
import { cn } from '../../utils/cn';

export interface CompanionWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnlyWhenEntries?: boolean;
}

export const CompanionWidget: React.FC<CompanionWidgetProps> = ({
  className,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenWidget, setHasSeenWidget] = useState(() => {
    return localStorage.getItem('companion-widget-seen') === 'true';
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!hasSeenWidget) {
      setHasSeenWidget(true);
      localStorage.setItem('companion-widget-seen', 'true');
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className={cn('fixed z-40', positionClasses[position], className)}>
        <button
          onClick={handleToggle}
          className={cn(
            'w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-xl',
            'hover:scale-110 active:scale-95',
            !hasSeenWidget && 'animate-pulse'
          )}
          title="Chat with Alex, your emotional companion"
        >
          {isOpen ? '✕' : '💙'}
        </button>
        
        {/* New feature indicator */}
        {!hasSeenWidget && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
            !
          </div>
        )}
      </div>

      {/* Companion Chat Panel */}
      {isOpen && (
        <div className={cn(
          'fixed z-30 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600',
          position.includes('right') ? 'right-6' : 'left-6',
          position.includes('bottom') ? 'bottom-24' : 'top-24',
          'w-96 h-[500px] animate-in slide-in-from-bottom-4 duration-300'
        )}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                    💙
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Alex</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your emotional companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Companion Interface */}
            <div className="flex-1 overflow-hidden">
              <EmotionalCompanion className="h-full border-0 rounded-none" />
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default CompanionWidget;