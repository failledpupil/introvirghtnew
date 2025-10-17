import { VAPICard, VAPIText } from '../ui';
import { useVAPITheme } from '../../hooks/useSimpleVAPITheme';
import { cn } from '../../utils/cn';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  const vapi = useVAPITheme();

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <VAPICard className="p-8 text-center">
        <div className={cn(
          "animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4",
          vapi.isActive ? "border-vapi-accent-primary" : "border-fountain-pen-blue"
        )}></div>
        <VAPIText type="secondary" className="animate-pulse">
          {message}
        </VAPIText>
      </VAPICard>
    </div>
  );
}