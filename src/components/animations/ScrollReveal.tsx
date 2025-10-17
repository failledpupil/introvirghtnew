import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { scrollReveal } from '../../utils/animations/motionVariants';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export function ScrollReveal({ 
  children, 
  className, 
  delay = 0,
  threshold = 0.1 
}: ScrollRevealProps) {
  const { ref, controls } = useScrollAnimation({ delay, threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={scrollReveal}
      className={className}
    >
      {children}
    </motion.div>
  );
}