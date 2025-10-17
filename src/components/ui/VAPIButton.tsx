import React from 'react';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { getVAPIButtonClasses } from '../../utils/vapiThemeUtils';

export interface VAPIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * VAPI-aware button component that adapts to theme
 */
export const VAPIButton: React.FC<VAPIButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const { isActive } = useVAPITheme();

  const buttonClasses = getVAPIButtonClasses(variant, size, isActive, className);

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default VAPIButton;