import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition, pageTransitionFade } from '../../utils/animations/motionVariants';

interface EnhancedPageTransitionProps {
  children: ReactNode;
  variant?: 'slide' | 'fade' | 'scale';
}

export function EnhancedPageTransition({ children, variant = 'slide' }: EnhancedPageTransitionProps) {
  const variants = variant === 'fade' ? pageTransitionFade : pageTransition;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}