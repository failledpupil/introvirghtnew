import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TodaysEntry } from '../TodaysEntry';
import { MoodVisualization } from '../MoodVisualization';
import { StreakTracker } from '../StreakTracker';
import { MilestoneCelebration } from '../MilestoneCelebration';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../animations/ScrollReveal';
import { AnimatedCard } from '../animations/AnimatedCard';
import { FloatingParticles } from '../animations/FloatingParticles';
import { Confetti } from '../animations/Confetti';
import { staggerContainer, listItem, fadeInUp } from '../../utils/animations/motionVariants';

import { AnimatedLogo } from '../branding/AnimatedLogo';
import { VAPICard, VAPIText, VAPIButton } from '../ui';
import { useVAPITheme } from '../../hooks/useVAPITheme';
import { useDiaryStore } from '../../stores/diaryStore';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';


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

export function DashboardView() {
  const navigate = useNavigate();
  const { entries } = useDiaryStore();
  const [showMoodInsights, setShowMoodInsights] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<Milestone | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const vapi = useVAPITheme();

  const recentEntries = entries
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const handleTodaysEntryClick = () => {
    navigate('/write');
  };

  const handleViewAllEntries = () => {
    navigate('/entries');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleMilestoneAchieved = (milestone: Milestone) => {
    setCelebratingMilestone(milestone);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleCloseCelebration = () => {
    setCelebratingMilestone(null);
  };

  const handleShareMilestone = () => {
    if (celebratingMilestone) {
      const shareText = `🎉 I just achieved "${celebratingMilestone.title}" in my writing journey! ${celebratingMilestone.description} #WritingGoals #PersonalGrowth`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Writing Milestone Achieved!',
          text: shareText,
        }).catch(console.error);
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Milestone shared to clipboard!');
        }).catch(console.error);
      }
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto"
      initial="initial"
      animate="animate"
      variants={fadeInUp}
    >
      {/* Floating Particles Background */}
      {!vapi.isActive && <FloatingParticles count={15} />}
      
      {/* Confetti for achievements */}
      <Confetti show={showConfetti} particleCount={100} />
      
      {/* Welcome Header */}
      <motion.div 
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div>
          <VAPIText 
            as="h1" 
            type="accent" 
            className="text-4xl font-script mb-2"
          >
            Welcome Back
          </VAPIText>
          <VAPIText type="secondary">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Ready to capture today's thoughts?
          </VAPIText>
        </div>
        <div className="hidden lg:block">
          <AnimatedLogo 
            variant="icon" 
            size="lg" 
            animation="glow"
            loop
            className={cn(
              "transition-opacity duration-500",
              vapi.isActive 
                ? "opacity-30 hover:opacity-80" 
                : "opacity-20 hover:opacity-60"
            )}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Today's Entry */}
        <div className="lg:col-span-2">
          <TodaysEntry 
            onEntryClick={handleTodaysEntryClick}
            className="mb-8"
          />

          {/* Recent Entries */}
          {recentEntries.length > 0 && (
            <VAPICard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <VAPIText as="h2" type="accent" className="text-xl font-script">
                  Recent Entries
                </VAPIText>
                <VAPIButton
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllEntries}
                >
                  View All →
                </VAPIButton>
              </div>

              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => navigate('/write')} // Could be enhanced to navigate to specific entry
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200",
                      vapi.isActive
                        ? "border-vapi-border-secondary hover:border-vapi-accent-primary hover:bg-vapi-accent-primary/5"
                        : "border-notebook-lines hover:border-fountain-pen-blue/50 hover:bg-fountain-pen-blue/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <VAPIText type="primary" className="font-medium">
                        {format(entry.date, 'EEEE, MMM d')}
                      </VAPIText>
                      <div className="flex items-center gap-3 text-xs">
                        <VAPIText type="muted" className="text-xs">
                          {entry.wordCount} words
                        </VAPIText>
                        {entry.emotions.length > 0 && (
                          <div className="flex items-center gap-1">
                            <VAPIText type="muted" className="text-xs">
                              {entry.emotions.length}
                            </VAPIText>
                            <span>😊</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {entry.content && (
                      <VAPIText type="secondary" className="text-sm leading-relaxed line-clamp-2">
                        {entry.content.length > 120 
                          ? entry.content.substring(0, 120) + '...'
                          : entry.content
                        }
                      </VAPIText>
                    )}

                    {entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.emotions.slice(0, 3).map((emotion) => (
                          <span
                            key={emotion.id}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded text-xs",
                              vapi.isActive
                                ? "bg-vapi-accent-primary/10 text-vapi-accent-primary"
                                : "bg-fountain-pen-blue/10 text-fountain-pen-blue"
                            )}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: emotion.color }}
                            />
                            {emotion.name}
                          </span>
                        ))}
                        {entry.emotions.length > 3 && (
                          <VAPIText type="muted" className="text-xs">
                            +{entry.emotions.length - 3}
                          </VAPIText>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </VAPICard>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Streak Tracker */}
          <StreakTracker 
            onMilestoneAchieved={handleMilestoneAchieved}
            showCelebration={false} // We'll handle celebration in the modal
          />

          {/* Quick Actions */}
          <VAPICard className="p-6">
            <VAPIText as="h3" type="accent" className="text-lg font-script mb-4">
              Quick Actions
            </VAPIText>
            
            <div className="space-y-3">
              <VAPIButton
                variant="ghost"
                onClick={() => navigate('/write')}
                className="w-full flex items-center gap-3 p-3 text-left justify-start"
              >
                <span className="text-lg">✍️</span>
                <div>
                  <VAPIText type="primary" className="font-medium">Start Writing</VAPIText>
                  <VAPIText type="muted" className="text-xs">Begin today's entry</VAPIText>
                </div>
              </VAPIButton>
              
              <VAPIButton
                variant="ghost"
                onClick={handleViewAllEntries}
                className="w-full flex items-center gap-3 p-3 text-left justify-start"
              >
                <span className="text-lg">📚</span>
                <div>
                  <VAPIText type="primary" className="font-medium">Browse Entries</VAPIText>
                  <VAPIText type="muted" className="text-xs">View past writings</VAPIText>
                </div>
              </VAPIButton>
              
              <VAPIButton
                variant="ghost"
                onClick={() => navigate('/search')}
                className="w-full flex items-center gap-3 p-3 text-left justify-start"
              >
                <span className="text-lg">🔍</span>
                <div>
                  <VAPIText type="primary" className="font-medium">Search</VAPIText>
                  <VAPIText type="muted" className="text-xs">Find specific entries</VAPIText>
                </div>
              </VAPIButton>
              
              <VAPIButton
                variant="ghost"
                onClick={handleViewAnalytics}
                className="w-full flex items-center gap-3 p-3 text-left justify-start"
              >
                <span className="text-lg">📊</span>
                <div>
                  <VAPIText type="primary" className="font-medium">Insights</VAPIText>
                  <VAPIText type="muted" className="text-xs">View your patterns</VAPIText>
                </div>
              </VAPIButton>
              
              <VAPIButton
                variant="ghost"
                onClick={() => navigate('/assistant')}
                className="w-full flex items-center gap-3 p-3 text-left justify-start"
              >
                <span className="text-lg">🤖</span>
                <div>
                  <VAPIText type="primary" className="font-medium">AI Assistant</VAPIText>
                  <VAPIText type="muted" className="text-xs">Chat about your entries</VAPIText>
                </div>
              </VAPIButton>
            </div>
          </VAPICard>

          {/* Mood Insights Toggle */}
          {entries.length > 0 && (
            <VAPICard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <VAPIText as="h3" type="accent" className="text-lg font-script">
                  Mood Insights
                </VAPIText>
                <VAPIButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodInsights(!showMoodInsights)}
                >
                  {showMoodInsights ? 'Hide' : 'Show'}
                </VAPIButton>
              </div>
              
              {showMoodInsights ? (
                <div className="max-h-96 overflow-y-auto">
                  <MoodVisualization entries={entries} />
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">💭</div>
                  <VAPIText type="muted" className="text-sm">
                    Discover patterns in your emotional journey
                  </VAPIText>
                </div>
              )}
            </VAPICard>
          )}
        </div>
      </div>

      {/* Milestone Celebration Modal */}
      <MilestoneCelebration
        milestone={celebratingMilestone}
        onClose={handleCloseCelebration}
        onShare={handleShareMilestone}
      />
      </div>
    </PageTransition>
  );
}