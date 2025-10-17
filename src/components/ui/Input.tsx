import { VAPIInput, type VAPIInputProps } from './VAPIInput';

// Simplified Input component that wraps VAPIInput
export type InputProps = VAPIInputProps;

export function Input(props: InputProps) {
  return <VAPIInput {...props} />;
}
