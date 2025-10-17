import React from 'react';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { getVAPITextClasses } from '../../utils/vapiThemeUtils';

export interface VAPITextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  type?: 'primary' | 'secondary' | 'muted' | 'accent';
  children: React.ReactNode;
  className?: string;
}

/**
 * VAPI-aware text component that adapts to theme
 */
export const VAPIText: React.FC<VAPITextProps> = ({
  as: Component = 'p',
  type = 'primary',
  children,
  className,
  ...props
}) => {
  const { isActive } = useVAPITheme();

  const textClasses = getVAPITextClasses(type, isActive, className);

  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

export default VAPIText;