// Core diary entry interface
export interface DiaryEntry {
  id: string;
  date: Date;
  content: string; // Rich text JSON from Tiptap
  emotions: Emotion[];
  tags: string[];
  wordCount: number;
  writingTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  encrypted: boolean;
}

// Emotion tracking interface
export interface Emotion {
  id: string;
  name: string;
  intensity: number; // 1-10 scale
  color: string;
  category: 'positive' | 'negative' | 'neutral';
  custom: boolean;
}

// Writing theme configuration
export interface WritingTheme {
  id: string;
  name: string;
  paperTexture: 'ruled' | 'dotted' | 'blank' | 'grid';
  paperColor: string;
  inkColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginSize: number;
}

// Notification settings
export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  streakReminders: boolean;
  insightNotifications: boolean;
  soundEnabled: boolean;
}

// Privacy settings
export interface PrivacySettings {
  encryptionEnabled: boolean;
  autoLock: boolean;
  lockTimeout: number; // in minutes
  biometricAuth: boolean;
  cloudSync: boolean;
  anonymousAnalytics: boolean;
}

// Engagement preferences
export interface EngagementPreferences {
  streakTracking: boolean;
  milestoneNotifications: boolean;
  writingPrompts: boolean;
  memoryInsights: boolean;
  progressVisualization: boolean;
  communityStats: boolean;
}

// User preferences interface
export interface UserPreferences {
  theme: WritingTheme;
  autoSave: boolean;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  engagement: EngagementPreferences;
}

// Milestone tracking
export interface Milestone {
  id: string;
  type: 'streak' | 'wordCount' | 'consistency' | 'emotion' | 'custom';
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
  achievedAt?: Date;
  icon: string;
  color: string;
}

// Writing prompt interface
export interface WritingPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'goals' | 'memories' | 'emotions' | 'creative';
  difficulty: 'easy' | 'medium' | 'deep';
  tags: string[];
  personalizedFor?: string; // user ID if personalized
}

// Filter options for entry browsing
export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  emotions?: string[];
  tags?: string[];
  searchQuery?: string;
  sortBy: 'date' | 'wordCount' | 'writingTime' | 'emotions';
  sortOrder: 'asc' | 'desc';
}

// Streak information
export interface StreakInfo {
  current: number;
  longest: number;
  lastEntryDate: Date | null;
  streakStartDate: Date | null;
  milestones: Milestone[];
}

// Emotion analysis data
export interface EmotionAnalysis {
  dominantEmotion: Emotion;
  emotionDistribution: Record<string, number>;
  intensityAverage: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  insights: string[];
}

// App state interfaces for Zustand stores
export interface DiaryStore {
  entries: DiaryEntry[];
  currentEntry: DiaryEntry | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createEntry: (date?: Date) => Promise<DiaryEntry>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => DiaryEntry | null;
  getEntriesByDateRange: (start: Date, end: Date) => DiaryEntry[];
  searchEntries: (query: string) => DiaryEntry[];
  setCurrentEntry: (entry: DiaryEntry | null) => void;
}

export interface EmotionStore {
  emotions: Emotion[];
  customEmotions: Emotion[];
  recentEmotions: Emotion[];
  
  // Actions
  addEmotion: (emotion: Omit<Emotion, 'id'>) => Emotion;
  updateEmotion: (id: string, updates: Partial<Emotion>) => void;
  deleteEmotion: (id: string) => void;
  getEmotionAnalysis: (entries: DiaryEntry[]) => EmotionAnalysis;
}

export interface UserStore {
  preferences: UserPreferences;
  streakInfo: StreakInfo;
  milestones: Milestone[];
  
  // Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateStreak: (entryDate: Date) => void;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  achieveMilestone: (id: string) => void;
}

// Database schema interfaces
export interface DatabaseSchema {
  entries: DiaryEntry;
  emotions: Emotion;
  preferences: UserPreferences;
  milestones: Milestone;
  prompts: WritingPrompt;
}

// Export utility types
export type EntryViewMode = 'calendar' | 'list' | 'mood-chart';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'offline';

// Re-export emotional companion types
export * from './emotional-companion';