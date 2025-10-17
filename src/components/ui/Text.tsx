import { VAPIText, type VAPITextProps } from './VAPIText';

// Simplified Text component that wraps VAPIText
export type TextProps = VAPITextProps;

export function Text(props: TextProps) {
  return <VAPIText {...props} />;
}
