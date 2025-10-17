import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface WordCountCelebrationProps {
  count: number;
  milestone?: number;
  onMilestoneReached?: (milestone: number) => void;
  className?: string;
}

/**
 * WordCountCelebration - Celebrates word count milestones
 * Shows animated feedback when reaching writing goals
 */
export const WordCountCelebration: React.FC<WordCountCelebrationProps> = ({
  count,
  milestone = 100,
  onMilestoneReached,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  useEffect(() => {
    const currentMilestone = Math.floor(count / milestone) * milestone;
    
    if (currentMilestone > lastMilestone && currentMilestone > 0) {
      setShowCelebration(true);
      setLastMilestone(currentMilestone);
      onMilestoneReached?.(currentMilestone);

      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [count, milestone, lastMilestone, onMilestoneReached]);

  if (!showCelebration) {
    return (
      <span className={cn('text-pencil-graphite dark:text-gray-300', className)}>
        {count} words
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-fountain-pen-blue dark:text-blue-400 font-medium',
        prefersReducedMotion ? '' : 'animate-bounce-in',
        className
      )}
    >
      🎉 {count} words!
    </span>
  );
};

export default WordCountCelebration;
