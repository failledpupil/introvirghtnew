import { VAPIButton, type VAPIButtonProps } from './VAPIButton';

// Simplified Button component that wraps VAPIButton
export type ButtonProps = VAPIButtonProps;

export function Button(props: ButtonProps) {
  return <VAPIButton {...props} />;
}
