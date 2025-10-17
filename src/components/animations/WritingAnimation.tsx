import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface WritingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * WritingAnimation - Typewriter effect for text
 * Perfect for AI-generated content or prompts
 */
export const WritingAnimation: React.FC<WritingAnimationProps> = ({
  text,
  speed = 50,
  onComplete,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, prefersReducedMotion]);

  return (
    <span className={cn('font-handwritten', className)}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="writing-cursor inline-block w-0.5 h-5 bg-fountain-pen-blue ml-0.5" />
      )}
    </span>
  );
};

export default WritingAnimation;
