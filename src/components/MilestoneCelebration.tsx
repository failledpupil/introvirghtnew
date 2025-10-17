import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  achieved: boolean;
  achievedDate?: Date;
  category: 'streak' | 'entries' | 'words' | 'consistency';
}

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onClose: () => void;
  onShare?: () => void;
}

export function MilestoneCelebration({ milestone, onClose, onShare }: MilestoneCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (milestone) {
      setIsVisible(true);
      setShowConfetti(true);
      
      // Auto-hide confetti after animation
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(confettiTimer);
    } else {
      setIsVisible(false);
      setShowConfetti(false);
    }
  }, [milestone]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!milestone) return null;

  const getCelebrationMessage = () => {
    switch (milestone.category) {
      case 'streak':
        return `You've maintained a ${milestone.threshold}-day writing streak! Your consistency is inspiring.`;
      case 'entries':
        return `You've written ${milestone.threshold} diary entries! Your journey of self-reflection continues to grow.`;
      case 'words':
        return `You've written ${milestone.threshold.toLocaleString()} words! Your thoughts and stories are adding up.`;
      case 'consistency':
        return `You've achieved ${milestone.threshold}% consistency this month! Your dedication is remarkable.`;
      default:
        return 'Congratulations on this amazing achievement!';
    }
  };

  const getEncouragementMessage = () => {
    const messages = [
      "Keep up the amazing work! Every word you write is a step in your personal growth journey.",
      "Your dedication to self-reflection is truly admirable. You're building something beautiful.",
      "Writing consistently takes real commitment. You should be proud of this achievement!",
      "Each entry you write is a gift to your future self. Thank you for staying committed.",
      "Your writing journey is unique and valuable. Celebrate this milestone - you've earned it!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        <div className="bg-cream-paper rounded-lg shadow-2xl max-w-md w-full border-2 border-fountain-pen-blue/20 animate-modal-enter">
          {/* Header */}
          <div className="bg-gradient-to-r from-fountain-pen-blue/10 to-purple-600/10 p-6 rounded-t-lg text-center border-b border-notebook-lines">
            <div className="text-6xl mb-3 animate-bounce">
              {milestone.icon}
            </div>
            <h2 className="text-2xl font-script text-fountain-pen-blue mb-2">
              Milestone Achieved!
            </h2>
            <h3 className="text-xl font-medium text-pencil-graphite">
              {milestone.title}
            </h3>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-pencil-graphite/80 leading-relaxed mb-4">
                {getCelebrationMessage()}
              </p>
              
              <div className="bg-aged-paper rounded-lg p-4 border border-notebook-lines">
                <p className="text-sm text-pencil-graphite/70 italic">
                  "{getEncouragementMessage()}"
                </p>
              </div>
            </div>

            {/* Achievement Details */}
            <div className="bg-fountain-pen-blue/5 rounded-lg p-4 mb-6 border border-fountain-pen-blue/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-pencil-graphite/70 mb-1">Achievement</div>
                  <div className="font-medium text-pencil-graphite">{milestone.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-fountain-pen-blue">
                    {milestone.threshold}
                  </div>
                  <div className="text-xs text-pencil-graphite/70 capitalize">
                    {milestone.category === 'consistency' ? 'Percent' : milestone.category}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex-1 bg-fountain-pen-blue/10 text-fountain-pen-blue py-3 px-4 rounded-lg hover:bg-fountain-pen-blue/20 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  <span>Share</span>
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="flex-1 bg-fountain-pen-blue text-white py-3 px-4 rounded-lg hover:bg-fountain-pen-blue/90 transition-colors font-medium"
              >
                Continue Writing
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-pencil-graphite/50 hover:text-pencil-graphite transition-colors rounded-lg hover:bg-notebook-lines/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}