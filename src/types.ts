// Core data types for the diary application

export interface DiaryEntry {
  id: string;
  content: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  mood?: string;
  emotions: Emotion[];
  wordCount: number;
  writingTime?: number;
  readingTime?: number;
  weather?: string;
  location?: string;
  attachments?: string[];
  isPrivate?: boolean;
  isFavorite?: boolean;
  encrypted?: boolean;
}

export interface Emotion {
  id: string;
  name: string;
  intensity: number; // 1-10 scale
  color: string;
  category: 'positive' | 'negative' | 'neutral';
  custom: boolean;
}

export interface Theme {
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

export interface WritingTheme extends Theme {}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string;
  streakReminders: boolean;
  insightNotifications: boolean;
  soundEnabled: boolean;
}

export interface PrivacySettings {
  encryptionEnabled: boolean;
  autoLock: boolean;
  lockTimeout: number; // minutes
  biometricAuth: boolean;
  cloudSync: boolean;
  anonymousAnalytics: boolean;
}

export interface EngagementSettings {
  streakTracking: boolean;
  milestoneNotifications: boolean;
  writingPrompts: boolean;
  memoryInsights: boolean;
  progressVisualization: boolean;
  communityStats: boolean;
}

export interface UserPreferences {
  theme: Theme;
  autoSave: boolean;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  engagement: EngagementSettings;
}

export interface Milestone {
  id: string;
  type: 'streak' | 'wordCount' | 'entries' | 'custom';
  title: string;
  description: string;
  target: number;
  current: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
  icon: string;
}

export interface WritingPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'creative' | 'gratitude' | 'goals' | 'memories' | 'emotions';
  difficulty: 'easy' | 'medium' | 'hard' | 'deep';
  tags: string[];
  usageCount?: number;
  lastUsed?: Date;
}

export type EntryViewMode = 'list' | 'grid' | 'timeline' | 'calendar' | 'mood-chart';

export interface StreakData {
  current: number;
  longest: number;
  lastEntryDate?: Date;
  milestones: number[];
}

export interface MoodData {
  date: Date;
  emotions: string[];
  intensity: number;
  notes?: string;
}

export interface AnalyticsData {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  writingStreak: StreakData;
  mostUsedTags: Array<{ tag: string; count: number }>;
  emotionalTrends: Array<{ emotion: string; frequency: number; averageIntensity: number }>;
  writingPatterns: {
    timeOfDay: Array<{ hour: number; count: number }>;
    dayOfWeek: Array<{ day: string; count: number }>;
    monthlyTrends: Array<{ month: string; count: number; words: number }>;
  };
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  emotions?: string[];
  mood?: string;
  isFavorite?: boolean;
  isPrivate?: boolean;
  minWordCount?: number;
  maxWordCount?: number;
}

export interface ExportOptions {
  format: 'json' | 'txt' | 'markdown' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMetadata: boolean;
  includePrivateEntries: boolean;
  groupBy?: 'date' | 'tag' | 'emotion';
}

// Database schema type mapping
export interface DatabaseSchema {
  entries: DiaryEntry;
  emotions: Emotion;
  preferences: UserPreferences & { id: string };
  milestones: Milestone;
  prompts: WritingPrompt;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Store types
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

export interface ThemeStore {
  currentTheme: Theme;
  availableThemes: Theme[];
  isDarkMode: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  loadThemes: () => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;