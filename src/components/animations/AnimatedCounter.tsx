import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { counterAnimation } from '../../utils/animations/motionVariants';
import { cn } from '../../utils/cn';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  className 
}: AnimatedCounterProps) {
  const count = useAnimatedCounter({ end: value, duration });

  return (
    <motion.span
      initial="initial"
      animate="animate"
      variants={counterAnimation}
      className={cn('inline-block', className)}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}