import { motion } from 'framer-motion';
import { cardHoverGlow } from '../../utils/animations/motionVariants';
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'glow' | 'lift' | 'none';
}

export function AnimatedCard({ 
  children, 
  className, 
  onClick,
  hoverEffect = 'glow'
}: AnimatedCardProps) {
  const variants = hoverEffect === 'glow' ? cardHoverGlow : 
                  hoverEffect === 'lift' ? { hover: { y: -5 } } : {};

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={variants}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-shadow duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}