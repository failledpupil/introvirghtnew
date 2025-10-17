import { useState, useEffect } from 'react';
import { format, startOfDay, subDays, differenceInDays } from 'date-fns';
import { cn } from '../utils/cn';
import { useDiaryStore } from '../stores/diaryStore';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './animations/AnimatedCounter';
import { ScrollReveal } from './animations/ScrollReveal';
import { staggerContainer, listItem } from '../utils/animations/motionVariants';


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

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  totalWords: number;
  writingDays: number;
  averageWordsPerEntry: number;
  consistencyScore: number;
  lastWritingDate: Date | null;
}

interface StreakTrackerProps {
  onMilestoneAchieved?: (milestone: Milestone) => void;
  showCelebration?: boolean;
  className?: string;
}

export function StreakTracker({ onMilestoneAchieved, showCelebration = true, className }: StreakTrackerProps) {
  const { entries } = useDiaryStore();
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Milestone[]>([]);
  const [showMilestones, setShowMilestones] = useState(false);

  // Calculate comprehensive streak statistics
  useEffect(() => {
    if (entries.length === 0) {
      setStats({
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        totalWords: 0,
        writingDays: 0,
        averageWordsPerEntry: 0,
        consistencyScore: 0,
        lastWritingDate: null
      });
      return;
    }

    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const uniqueDates = [...new Set(entries.map(e => format(e.date, 'yyyy-MM-dd')))];
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = startOfDay(new Date());
    
    for (let i = 0; i < 365; i++) {
      const hasEntry = sortedEntries.some(entry => 
        startOfDay(entry.date).getTime() === checkDate.getTime()
      );
      
      if (hasEntry) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // Allow one day gap for current streak (maybe they haven't written today yet)
        if (i === 0 && currentStreak === 0) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = uniqueDates.sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      tempStreak++;
      const currentDate = new Date(sortedDates[i]);
      const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;
      
      if (!nextDate || differenceInDays(nextDate, currentDate) > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    // Calculate consistency score (percentage of days with entries in last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentEntries = entries.filter(entry => entry.date >= thirtyDaysAgo);
    const recentUniqueDays = new Set(recentEntries.map(e => format(e.date, 'yyyy-MM-dd'))).size;
    const consistencyScore = Math.round((recentUniqueDays / 30) * 100);

    const newStats: StreakStats = {
      currentStreak,
      longestStreak,
      totalEntries: entries.length,
      totalWords,
      writingDays: uniqueDates.length,
      averageWordsPerEntry: Math.round(totalWords / entries.length),
      consistencyScore,
      lastWritingDate: sortedEntries[0]?.date || null
    };

    setStats(newStats);
  }, [entries]);

  // Define milestones
  useEffect(() => {
    if (!stats) return;

    const allMilestones: Milestone[] = [
      // Streak milestones
      { id: 'streak-3', title: 'Getting Started', description: 'Write for 3 days in a row', icon: '🌱', threshold: 3, achieved: stats.currentStreak >= 3, category: 'streak' },
      { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day writing streak', icon: '🔥', threshold: 7, achieved: stats.currentStreak >= 7, category: 'streak' },
      { id: 'streak-14', title: 'Two Week Champion', description: 'Write consistently for 2 weeks', icon: '💪', threshold: 14, achieved: stats.currentStreak >= 14, category: 'streak' },
      { id: 'streak-30', title: 'Monthly Master', description: 'Complete a 30-day writing streak', icon: '🏆', threshold: 30, achieved: stats.currentStreak >= 30, category: 'streak' },
      { id: 'streak-100', title: 'Century Club', description: 'Achieve a 100-day writing streak', icon: '💎', threshold: 100, achieved: stats.currentStreak >= 100, category: 'streak' },

      // Entry count milestones
      { id: 'entries-10', title: 'First Steps', description: 'Write your first 10 entries', icon: '📝', threshold: 10, achieved: stats.totalEntries >= 10, category: 'entries' },
      { id: 'entries-50', title: 'Prolific Writer', description: 'Reach 50 diary entries', icon: '📚', threshold: 50, achieved: stats.totalEntries >= 50, category: 'entries' },
      { id: 'entries-100', title: 'Century of Stories', description: 'Write 100 diary entries', icon: '📖', threshold: 100, achieved: stats.totalEntries >= 100, category: 'entries' },
      { id: 'entries-365', title: 'Year of Reflection', description: 'Complete 365 diary entries', icon: '🗓️', threshold: 365, achieved: stats.totalEntries >= 365, category: 'entries' },

      // Word count milestones
      { id: 'words-1000', title: 'Thousand Words', description: 'Write your first 1,000 words', icon: '✍️', threshold: 1000, achieved: stats.totalWords >= 1000, category: 'words' },
      { id: 'words-10000', title: 'Ten Thousand Tales', description: 'Reach 10,000 words written', icon: '📄', threshold: 10000, achieved: stats.totalWords >= 10000, category: 'words' },
      { id: 'words-50000', title: 'Novelist Level', description: 'Write 50,000 words total', icon: '📑', threshold: 50000, achieved: stats.totalWords >= 50000, category: 'words' },
      { id: 'words-100000', title: 'Word Master', description: 'Achieve 100,000 words written', icon: '📜', threshold: 100000, achieved: stats.totalWords >= 100000, category: 'words' },

      // Consistency milestones
      { id: 'consistency-50', title: 'Half Consistent', description: 'Write on 50% of days this month', icon: '⚡', threshold: 50, achieved: stats.consistencyScore >= 50, category: 'consistency' },
      { id: 'consistency-75', title: 'Highly Consistent', description: 'Write on 75% of days this month', icon: '🎯', threshold: 75, achieved: stats.consistencyScore >= 75, category: 'consistency' },
      { id: 'consistency-90', title: 'Almost Perfect', description: 'Write on 90% of days this month', icon: '⭐', threshold: 90, achieved: stats.consistencyScore >= 90, category: 'consistency' },
    ];

    // Check for newly achieved milestones (only if we have previous milestones)
    if (milestones.length > 0) {
      const newlyAchieved = allMilestones.filter(milestone => {
        const wasAchieved = milestones.find(prev => prev.id === milestone.id)?.achieved || false;
        return milestone.achieved && !wasAchieved;
      });

      if (newlyAchieved.length > 0) {
        setRecentAchievements(newlyAchieved);
        newlyAchieved.forEach(milestone => {
          milestone.achievedDate = new Date();
          onMilestoneAchieved?.(milestone);
        });
      }
    }

    setMilestones(allMilestones);
  }, [stats, onMilestoneAchieved]);

  if (!stats) {
    return (
      <div className={cn('streak-tracker', className)}>
        <div className="animate-pulse bg-aged-paper border border-notebook-lines rounded-lg p-6">
          <div className="h-6 bg-notebook-lines rounded mb-4"></div>
          <div className="h-4 bg-notebook-lines rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const getStreakMessage = () => {
    if (stats.currentStreak === 0) {
      return "Start your writing journey today!";
    } else if (stats.currentStreak === 1) {
      return "Great start! Keep the momentum going.";
    } else if (stats.currentStreak < 7) {
      return `${stats.currentStreak} days strong! You're building a habit.`;
    } else if (stats.currentStreak < 30) {
      return `Amazing ${stats.currentStreak}-day streak! You're on fire! 🔥`;
    } else {
      return `Incredible ${stats.currentStreak}-day streak! You're a writing master! 💎`;
    }
  };

  const getNextMilestone = () => {
    return milestones
      .filter(m => !m.achieved)
      .sort((a, b) => a.threshold - b.threshold)[0];
  };

  const nextMilestone = getNextMilestone();
  const achievedMilestones = milestones.filter(m => m.achieved);

  return (
    <div className={cn('streak-tracker', className)}>
      {/* Recent Achievements Celebration */}
      {showCelebration && recentAchievements.length > 0 && (
        <div className="mb-6 animate-bounce-in">
          {recentAchievements.map((milestone) => (
            <div
              key={milestone.id}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 mb-3 animate-celebration"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">{milestone.icon}</div>
                <div>
                  <h3 className="font-script text-lg text-fountain-pen-blue">
                    🎉 Milestone Achieved!
                  </h3>
                  <p className="font-medium text-pencil-graphite">{milestone.title}</p>
                  <p className="text-sm text-pencil-graphite/70">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Streak Display */}
      <motion.div 
        className="bg-aged-paper border border-notebook-lines rounded-lg p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <motion.div 
            className="text-6xl font-bold text-fountain-pen-blue mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <AnimatedCounter value={stats.currentStreak} duration={1500} />
          </motion.div>
          <motion.div 
            className="text-lg font-script text-pencil-graphite mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Day Writing Streak
          </motion.div>
          <motion.p 
            className="text-sm text-pencil-graphite/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {getStreakMessage()}
          </motion.p>
        </div>

        {/* Streak Visualization */}
        <motion.div 
          className="flex justify-center mb-6"
          variants={staggerContainer}
          initial="hidden"
          animate="animate"
        >
          <div className="flex gap-1">
            {Array.from({ length: Math.min(stats.currentStreak, 30) }, (_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full',
                  i < 7 ? 'bg-green-400' :
                  i < 14 ? 'bg-blue-400' :
                  i < 30 ? 'bg-purple-400' :
                  'bg-yellow-400'
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: i * 0.03,
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
                whileHover={{ scale: 1.5 }}
              />
            ))}
            {stats.currentStreak > 30 && (
              <motion.div 
                className="flex items-center ml-2 text-sm text-pencil-graphite/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                +{stats.currentStreak - 30} more
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-fountain-pen-blue">
              {stats.longestStreak}
            </div>
            <div className="text-xs text-pencil-graphite/70">Longest Streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-fountain-pen-blue">
              {stats.totalEntries}
            </div>
            <div className="text-xs text-pencil-graphite/70">Total Entries</div>
          </div>
          <div>
            <div className="text-xl font-bold text-fountain-pen-blue">
              {stats.consistencyScore}%
            </div>
            <div className="text-xs text-pencil-graphite/70">Consistency</div>
          </div>
          <div>
            <div className="text-xl font-bold text-fountain-pen-blue">
              {stats.averageWordsPerEntry}
            </div>
            <div className="text-xs text-pencil-graphite/70">Avg Words</div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-aged-paper border border-notebook-lines rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{nextMilestone.icon}</div>
            <div className="flex-1">
              <h3 className="font-medium text-pencil-graphite">Next Milestone</h3>
              <p className="text-sm text-pencil-graphite/70">{nextMilestone.title}</p>
              <p className="text-xs text-pencil-graphite/50">{nextMilestone.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-fountain-pen-blue">
                {nextMilestone.category === 'streak' ? stats.currentStreak :
                 nextMilestone.category === 'entries' ? stats.totalEntries :
                 nextMilestone.category === 'words' ? stats.totalWords :
                 stats.consistencyScore} / {nextMilestone.threshold}
              </div>
              <div className="w-20 bg-notebook-lines rounded-full h-2 mt-1">
                <div
                  className="bg-fountain-pen-blue rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((nextMilestone.category === 'streak' ? stats.currentStreak :
                        nextMilestone.category === 'entries' ? stats.totalEntries :
                        nextMilestone.category === 'words' ? stats.totalWords :
                        stats.consistencyScore) / nextMilestone.threshold) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowMilestones(!showMilestones)}
          className="text-sm text-fountain-pen-blue hover:text-fountain-pen-blue/80 transition-colors"
        >
          {showMilestones ? 'Hide' : 'Show'} All Milestones ({achievedMilestones.length}/{milestones.length})
        </button>
      </div>

      {/* All Milestones */}
      {showMilestones && (
        <div className="mt-4 space-y-3">
          {['streak', 'entries', 'words', 'consistency'].map(category => {
            const categoryMilestones = milestones.filter(m => m.category === category);
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            
            return (
              <div key={category}>
                <h4 className="font-medium text-pencil-graphite mb-2">{categoryName} Milestones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                        milestone.achieved
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-aged-paper border-notebook-lines text-pencil-graphite/70'
                      )}
                    >
                      <div className={cn(
                        'text-xl',
                        milestone.achieved ? 'animate-bounce' : 'opacity-50'
                      )}>
                        {milestone.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-medium text-sm',
                          milestone.achieved && 'text-green-800'
                        )}>
                          {milestone.title}
                        </div>
                        <div className="text-xs opacity-70">
                          {milestone.description}
                        </div>
                        {milestone.achieved && milestone.achievedDate && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Achieved {format(milestone.achievedDate, 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}