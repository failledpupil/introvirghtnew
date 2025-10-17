import { VAPICard, type VAPICardProps } from './VAPICard';

// Simplified Card component that wraps VAPICard
export type CardProps = VAPICardProps;

export function Card(props: CardProps) {
  return <VAPICard {...props} />;
}
