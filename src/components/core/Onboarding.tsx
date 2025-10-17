import { useState } from 'react';
import { cn } from '../../utils/cn';
import { VAPICard, VAPIText, VAPIButton, VAPIInput } from '../ui';

interface OnboardingProps {
  onComplete: (name: string) => void;
  className?: string;
}

export function Onboarding({ onComplete, className }: OnboardingProps) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    onComplete(name || 'Writer');
  };

  if (step === 0) {
    return (
      <VAPICard className={cn('p-8 max-w-md mx-auto', className)}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📖</div>
          <VAPIText as="h1" type="accent" className="text-3xl font-script mb-4">
            Welcome to Introvirght
          </VAPIText>
          <VAPIText type="secondary">
            A beautiful space for introverts to explore their inner world.
          </VAPIText>
        </div>

        <VAPIButton
          onClick={() => setStep(1)}
          className="w-full py-3 px-6 font-medium"
        >
          Get Started
        </VAPIButton>
      </VAPICard>
    );
  }

  return (
    <VAPICard className={cn('p-8 max-w-md mx-auto', className)}>
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">✨</div>
        <VAPIText as="h2" type="accent" className="text-2xl font-script mb-4">
          What should we call you?
        </VAPIText>
        <VAPIText type="secondary" className="mb-6">
          This is optional - you can always change it later.
        </VAPIText>
      </div>

      <div className="mb-6">
        <VAPIInput
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 text-center"
          onKeyPress={(e) => e.key === 'Enter' && handleComplete()}
          autoFocus
        />
      </div>

      <div className="flex gap-3">
        <VAPIButton
          variant="secondary"
          onClick={() => setName('')}
          className="flex-1 py-3 px-6"
        >
          Skip
        </VAPIButton>
        <VAPIButton
          onClick={handleComplete}
          className="flex-1 py-3 px-6 font-medium"
        >
          Continue
        </VAPIButton>
      </div>
    </VAPICard>
  );
}
