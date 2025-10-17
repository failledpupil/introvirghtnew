import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface AnimatedGradientProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function AnimatedGradient({ 
  children, 
  className,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6']
}: AnimatedGradientProps) {
  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      style={{
        background: `linear-gradient(45deg, ${colors.join(', ')})`
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.div>
  );
}