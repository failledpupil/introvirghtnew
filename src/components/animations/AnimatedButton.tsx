import { motion } from 'framer-motion';
import { buttonHover } from '../../utils/animations/motionVariants';
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
}

export function AnimatedButton({ 
  children, 
  className, 
  onClick,
  disabled = false,
  pulse = false
}: AnimatedButtonProps) {
  return (
    <motion.button
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      variants={buttonHover}
      animate={pulse && !disabled ? {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
}