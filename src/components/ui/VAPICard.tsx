import React from 'react';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { getVAPICardClasses, getVAPIDataAttributes } from '../../utils/vapiThemeUtils';

export interface VAPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

/**
 * VAPI-aware card component that adapts to theme
 */
export const VAPICard: React.FC<VAPICardProps> = ({
  children,
  hoverable = false,
  className,
  ...props
}) => {
  const { isActive, config } = useVAPITheme();

  const cardClasses = getVAPICardClasses(isActive, hoverable, className);
  const dataAttributes = getVAPIDataAttributes(config);

  return (
    <div 
      className={cardClasses} 
      {...dataAttributes}
      {...props}
    >
      {children}
    </div>
  );
};

export default VAPICard;