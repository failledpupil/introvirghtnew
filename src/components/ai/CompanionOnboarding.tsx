// Onboarding flow for AI emotional companion

import React, { useState } from 'react';
import { cn } from '../../utils/cn';

import type {
  CompanionPreferences,
  CommunicationStyle,
  ResponseLength,
  EmpathyStyle
} from '../../types/emotional-companion';

export interface CompanionOnboardingProps {
  onComplete: (preferences: CompanionPreferences) => void;
  onSkip: () => void;
  className?: string;
}

export const CompanionOnboarding: React.FC<CompanionOnboardingProps> = ({
  onComplete,
  onSkip,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<CompanionPreferences>>({
    communicationStyle: 'warm',
    responseLength: 'moderate',
    empathyStyle: 'validating',
    humorLevel: 5,
    directnessLevel: 5,
    topicSensitivities: [],
    supportPreferences: [],
    boundarySettings: {
      topicsToAvoid: [],
      maxSessionLength: 30,
      crisisInterventionEnabled: true,
      dataRetentionPeriod: 365,
      shareInsightsWithUser: true
    }
  });

  const steps = [
    {
      title: "Meet Alex, Your AI Companion",
      component: IntroductionStep
    },
    {
      title: "Communication Style",
      component: CommunicationStyleStep
    },
    {
      title: "Support Preferences",
      component: SupportPreferencesStep
    },
    {
      title: "Privacy & Safety",
      component: PrivacyStep
    },
    {
      title: "Ready to Begin!",
      component: CompletionStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const completePreferences: CompanionPreferences = {
      communicationStyle: preferences.communicationStyle || 'warm',
      responseLength: preferences.responseLength || 'moderate',
      empathyStyle: preferences.empathyStyle || 'validating',
      humorLevel: preferences.humorLevel || 5,
      directnessLevel: preferences.directnessLevel || 5,
      topicSensitivities: preferences.topicSensitivities || [],
      supportPreferences: preferences.supportPreferences || [],
      boundarySettings: preferences.boundarySettings || {
        topicsToAvoid: [],
        maxSessionLength: 30,
        crisisInterventionEnabled: true,
        dataRetentionPeriod: 365,
        shareInsightsWithUser: true
      }
    };
    
    onComplete(completePreferences);
  };

  const updatePreferences = (updates: Partial<CompanionPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg overflow-hidden max-w-2xl mx-auto', className)}>
      {/* Progress Bar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-fountain-pen-blue dark:text-gray-100">
            {steps[currentStep].title}
          </h2>
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip Setup
          </button>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <CurrentStepComponent
          preferences={preferences}
          updatePreferences={updatePreferences}
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );
};

// Step Components

interface StepProps {
  preferences: Partial<CompanionPreferences>;
  updatePreferences: (updates: Partial<CompanionPreferences>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const IntroductionStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🤗</div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-script text-fountain-pen-blue dark:text-gray-100">
          Hello! I'm Alex
        </h3>
        
        <p className="text-pencil-graphite dark:text-gray-300 leading-relaxed">
          I'm your AI emotional companion, designed to understand your feelings, provide support, 
          and help you process your emotions through meaningful conversations.
        </p>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-left">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            What I can do for you:
          </h4>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Analyze your diary entries to understand your emotional patterns</li>
            <li>• Provide empathetic support during difficult times</li>
            <li>• Celebrate your achievements and positive moments</li>
            <li>• Offer gentle guidance and coping strategies</li>
            <li>• Help you reflect on your thoughts and feelings</li>
            <li>• Provide crisis support resources when needed</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Your privacy matters:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• All emotional analysis happens locally on your device</li>
            <li>• Your conversations are encrypted and stored securely</li>
            <li>• You have complete control over your data</li>
            <li>• I adapt to your communication preferences</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
};

const CommunicationStyleStep: React.FC<StepProps> = ({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack, 
  isFirstStep 
}) => {
  const communicationStyles: Array<{
    value: CommunicationStyle;
    label: string;
    description: string;
    example: string;
  }> = [
    {
      value: 'warm',
      label: 'Warm & Caring',
      description: 'Friendly, nurturing, and emotionally supportive',
      example: '"I can hear how much this means to you. Your feelings are completely valid. 💙"'
    },
    {
      value: 'casual',
      label: 'Casual & Relaxed',
      description: 'Laid-back, conversational, and approachable',
      example: '"Hey, that sounds really tough. Want to talk through what\'s going on?"'
    },
    {
      value: 'gentle',
      label: 'Gentle & Soft',
      description: 'Tender, careful, and extra sensitive to emotions',
      example: '"I sense you might be feeling overwhelmed. Take your time, I\'m here to listen."'
    },
    {
      value: 'direct',
      label: 'Direct & Clear',
      description: 'Straightforward, honest, and to the point',
      example: '"It sounds like you\'re dealing with anxiety. What specific thoughts are troubling you?"'
    },
    {
      value: 'formal',
      label: 'Professional & Respectful',
      description: 'Polite, structured, and professionally supportive',
      example: '"I understand you are experiencing difficulties. How may I best support you today?"'
    }
  ];

  const responseLengths: Array<{
    value: ResponseLength;
    label: string;
    description: string;
  }> = [
    {
      value: 'brief',
      label: 'Brief & Concise',
      description: 'Short, focused responses that get to the point'
    },
    {
      value: 'moderate',
      label: 'Balanced',
      description: 'Thoughtful responses with good detail'
    },
    {
      value: 'detailed',
      label: 'Detailed & Thorough',
      description: 'Comprehensive responses with extra context'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
          How would you like me to communicate with you?
        </h3>
        
        <div className="space-y-3">
          {communicationStyles.map((style) => (
            <label
              key={style.value}
              className={cn(
                'block p-4 border rounded-lg cursor-pointer transition-all',
                preferences.communicationStyle === style.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              )}
            >
              <input
                type="radio"
                name="communicationStyle"
                value={style.value}
                checked={preferences.communicationStyle === style.value}
                onChange={(e) => updatePreferences({ communicationStyle: e.target.value as CommunicationStyle })}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0',
                  preferences.communicationStyle === style.value
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                )}>
                  {preferences.communicationStyle === style.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{style.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{style.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">{style.example}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
          Response Length Preference
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {responseLengths.map((length) => (
            <label
              key={length.value}
              className={cn(
                'block p-3 border rounded-lg cursor-pointer transition-all text-center',
                preferences.responseLength === length.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              )}
            >
              <input
                type="radio"
                name="responseLength"
                value={length.value}
                checked={preferences.responseLength === length.value}
                onChange={(e) => updatePreferences({ responseLength: e.target.value as ResponseLength })}
                className="sr-only"
              />
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{length.label}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{length.description}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const SupportPreferencesStep: React.FC<StepProps> = ({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack 
}) => {
  const empathyStyles: Array<{
    value: EmpathyStyle;
    label: string;
    description: string;
  }> = [
    {
      value: 'validating',
      label: 'Validating & Understanding',
      description: 'Focus on acknowledging and validating your emotions'
    },
    {
      value: 'solution_focused',
      label: 'Solution-Focused',
      description: 'Help you find practical solutions and next steps'
    },
    {
      value: 'exploratory',
      label: 'Exploratory & Reflective',
      description: 'Ask questions to help you explore your thoughts deeper'
    },
    {
      value: 'strength_based',
      label: 'Strength-Based',
      description: 'Highlight your strengths and positive qualities'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
          What type of emotional support works best for you?
        </h3>
        
        <div className="space-y-3">
          {empathyStyles.map((style) => (
            <label
              key={style.value}
              className={cn(
                'block p-4 border rounded-lg cursor-pointer transition-all',
                preferences.empathyStyle === style.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              )}
            >
              <input
                type="radio"
                name="empathyStyle"
                value={style.value}
                checked={preferences.empathyStyle === style.value}
                onChange={(e) => updatePreferences({ empathyStyle: e.target.value as EmpathyStyle })}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0',
                  preferences.empathyStyle === style.value
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                )}>
                  {preferences.empathyStyle === style.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{style.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{style.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
          Personality Traits
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Humor Level: {preferences.humorLevel}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={preferences.humorLevel || 5}
              onChange={(e) => updatePreferences({ humorLevel: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Serious</span>
              <span>Playful</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Directness Level: {preferences.directnessLevel}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={preferences.directnessLevel || 5}
              onChange={(e) => updatePreferences({ directnessLevel: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Gentle</span>
              <span>Direct</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const PrivacyStep: React.FC<StepProps> = ({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack 
}) => {
  const updateBoundarySettings = (updates: any) => {
    updatePreferences({
      boundarySettings: {
        ...preferences.boundarySettings,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
          Privacy & Safety Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200">Crisis Support</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Allow Alex to detect crisis situations and provide safety resources
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.boundarySettings?.crisisInterventionEnabled ?? true}
              onChange={(e) => updateBoundarySettings({ crisisInterventionEnabled: e.target.checked })}
              className="w-4 h-4"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Emotional Insights</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Allow Alex to share insights about your emotional patterns
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.boundarySettings?.shareInsightsWithUser ?? true}
              onChange={(e) => updateBoundarySettings({ shareInsightsWithUser: e.target.checked })}
              className="w-4 h-4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Retention Period
            </label>
            <select
              value={preferences.boundarySettings?.dataRetentionPeriod ?? 365}
              onChange={(e) => updateBoundarySettings({ dataRetentionPeriod: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={-1}>Forever</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Important Privacy Information
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• All emotional analysis happens locally on your device</li>
          <li>• Your conversations are encrypted and stored securely</li>
          <li>• You can export or delete your data at any time</li>
          <li>• Alex learns from your interactions to provide better support</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-script text-fountain-pen-blue dark:text-gray-100">
          You're All Set!
        </h3>
        
        <p className="text-pencil-graphite dark:text-gray-300 leading-relaxed">
          Alex is now configured to provide personalized emotional support based on your preferences. 
          Remember, you can always adjust these settings later in the privacy controls.
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3">
            Ready to start your journey with Alex:
          </h4>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2 text-left">
            <li>✨ Write in your diary and Alex will understand your emotions</li>
            <li>💬 Have meaningful conversations about your thoughts and feelings</li>
            <li>📊 Receive insights about your emotional patterns and growth</li>
            <li>🛡️ Get support during difficult times with crisis resources</li>
            <li>🎯 Celebrate your achievements and positive moments together</li>
          </ul>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
      >
        Start Chatting with Alex
      </button>
    </div>
  );
};

export default CompanionOnboarding;