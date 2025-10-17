import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({ 
  text, 
  speed = 50, 
  className,
  showCursor = true,
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      {showCursor && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  );
}