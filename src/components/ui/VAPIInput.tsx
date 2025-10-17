import React from 'react';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { getVAPIInputClasses } from '../../utils/vapiThemeUtils';

export interface VAPIInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  className?: string;
}

/**
 * VAPI-aware input component that adapts to theme
 */
export const VAPIInput: React.FC<VAPIInputProps> = ({
  hasError = false,
  className,
  ...props
}) => {
  const { isActive } = useVAPITheme();

  const inputClasses = getVAPIInputClasses(isActive, hasError, className);

  return (
    <input 
      className={inputClasses}
      {...props}
    />
  );
};

export default VAPIInput;