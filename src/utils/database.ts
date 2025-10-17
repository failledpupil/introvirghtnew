import type { DiaryEntry, Emotion, UserPreferences, Milestone, DatabaseSchema } from '../types';

const DB_NAME = 'DiaryApp';
const DB_VERSION = 1;

// Store names
const STORES = {
  ENTRIES: 'entries',
  EMOTIONS: 'emotions',
  PREFERENCES: 'preferences',
  MILESTONES: 'milestones',
  PROMPTS: 'prompts'
} as const;

class DatabaseManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });

    return this.initPromise;
  }

  private createStores(db: IDBDatabase): void {
    // Entries store
    if (!db.objectStoreNames.contains(STORES.ENTRIES)) {
      const entriesStore = db.createObjectStore(STORES.ENTRIES, { keyPath: 'id' });
      entriesStore.createIndex('date', 'date', { unique: false });
      entriesStore.createIndex('createdAt', 'createdAt', { unique: false });
      entriesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
    }

    // Emotions store
    if (!db.objectStoreNames.contains(STORES.EMOTIONS)) {
      const emotionsStore = db.createObjectStore(STORES.EMOTIONS, { keyPath: 'id' });
      emotionsStore.createIndex('category', 'category', { unique: false });
      emotionsStore.createIndex('custom', 'custom', { unique: false });
    }

    // Preferences store
    if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
      db.createObjectStore(STORES.PREFERENCES, { keyPath: 'id' });
    }

    // Milestones store
    if (!db.objectStoreNames.contains(STORES.MILESTONES)) {
      const milestonesStore = db.createObjectStore(STORES.MILESTONES, { keyPath: 'id' });
      milestonesStore.createIndex('type', 'type', { unique: false });
      milestonesStore.createIndex('achieved', 'achieved', { unique: false });
    }

    // Prompts store
    if (!db.objectStoreNames.contains(STORES.PROMPTS)) {
      const promptsStore = db.createObjectStore(STORES.PROMPTS, { keyPath: 'id' });
      promptsStore.createIndex('category', 'category', { unique: false });
    }
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Generic CRUD operations
  async add<T extends keyof DatabaseSchema>(
    storeName: T,
    data: DatabaseSchema[T]
  ): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to add to ${storeName}`));
    });
  }

  async update<T extends keyof DatabaseSchema>(
    storeName: T,
    data: DatabaseSchema[T]
  ): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to update ${storeName}`));
    });
  }

  async get<T extends keyof DatabaseSchema>(
    storeName: T,
    id: string
  ): Promise<DatabaseSchema[T] | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error(`Failed to get from ${storeName}`));
    });
  }

  async getAll<T extends keyof DatabaseSchema>(
    storeName: T
  ): Promise<DatabaseSchema[T][]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get all from ${storeName}`));
    });
  }

  async delete<T extends keyof DatabaseSchema>(
    storeName: T,
    id: string
  ): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete from ${storeName}`));
    });
  }

  // Specialized query methods
  async getEntriesByDateRange(start: Date, end: Date): Promise<DiaryEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.ENTRIES], 'readonly');
      const store = transaction.objectStore(STORES.ENTRIES);
      const index = store.index('date');
      const range = IDBKeyRange.bound(start, end);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get entries by date range'));
    });
  }

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    const entries = await this.getAll(STORES.ENTRIES);
    const lowercaseQuery = query.toLowerCase();

    return entries.filter(entry => {
      const contentMatch = entry.content.toLowerCase().includes(lowercaseQuery);
      const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      return contentMatch || tagMatch;
    });
  }

  async getEmotionsByCategory(category: string): Promise<Emotion[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.EMOTIONS], 'readonly');
      const store = transaction.objectStore(STORES.EMOTIONS);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get emotions by category'));
    });
  }

  async getCustomEmotions(): Promise<Emotion[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.EMOTIONS], 'readonly');
      const store = transaction.objectStore(STORES.EMOTIONS);
      const index = store.index('custom');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get custom emotions'));
    });
  }

  async getAchievedMilestones(): Promise<Milestone[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.MILESTONES], 'readonly');
      const store = transaction.objectStore(STORES.MILESTONES);
      const index = store.index('achieved');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get achieved milestones'));
    });
  }

  // Data migration and maintenance
  async migrateData(fromVersion: number, toVersion: number): Promise<void> {
    // Implement data migration logic here
    console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);

    // Example migration logic
    if (fromVersion < 2) {
      // Add new fields or transform existing data
    }
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames = Object.values(STORES);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');
      let completed = 0;

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length) {
            resolve();
          }
        };

        request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
      });
    });
  }

  async exportData(): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};

    for (const storeName of Object.values(STORES)) {
      data[storeName] = await this.getAll(storeName as keyof DatabaseSchema);
    }

    return data;
  }

  async importData(data: Record<string, any[]>): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(Object.values(STORES), 'readwrite');
      let completed = 0;
      const totalStores = Object.keys(data).length;

      Object.entries(data).forEach(([storeName, items]) => {
        if (Object.values(STORES).includes(storeName as any)) {
          const store = transaction.objectStore(storeName);

          items.forEach(item => {
            store.put(item);
          });

          completed++;
          if (completed === totalStores) {
            resolve();
          }
        }
      });

      transaction.onerror = () => reject(new Error('Failed to import data'));
    });
  }

  // Connection management
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Create singleton instance
export const db = new DatabaseManager();

// Initialize default emotions and preferences
export async function initializeDefaultData(): Promise<void> {
  await db.init();

  // Check if emotions already exist
  const existingEmotions = await db.getAll(STORES.EMOTIONS);

  if (existingEmotions.length === 0) {
    // Add default emotions
    const defaultEmotions: Emotion[] = [
      { id: 'happy', name: 'Happy', intensity: 5, color: '#fbbf24', category: 'positive', custom: false },
      { id: 'sad', name: 'Sad', intensity: 5, color: '#3b82f6', category: 'negative', custom: false },
      { id: 'angry', name: 'Angry', intensity: 5, color: '#ef4444', category: 'negative', custom: false },
      { id: 'excited', name: 'Excited', intensity: 7, color: '#f59e0b', category: 'positive', custom: false },
      { id: 'calm', name: 'Calm', intensity: 4, color: '#10b981', category: 'positive', custom: false },
      { id: 'anxious', name: 'Anxious', intensity: 6, color: '#8b5cf6', category: 'negative', custom: false },
      { id: 'grateful', name: 'Grateful', intensity: 6, color: '#ec4899', category: 'positive', custom: false },
      { id: 'confused', name: 'Confused', intensity: 4, color: '#6b7280', category: 'neutral', custom: false },
    ];

    for (const emotion of defaultEmotions) {
      await db.add(STORES.EMOTIONS, emotion);
    }
  }

  // Initialize default preferences if they don't exist
  const existingPrefs = await db.get(STORES.PREFERENCES, 'user-preferences');

  if (!existingPrefs) {
    const defaultPreferences: UserPreferences & { id: string } = {
      id: 'user-preferences',
      theme: {
        id: 'classic',
        name: 'Classic Notebook',
        paperTexture: 'ruled',
        paperColor: '#faf7f0',
        inkColor: '#1e3a8a',
        fontFamily: 'Caveat',
        fontSize: 16,
        lineHeight: 1.6,
        marginSize: 80
      },
      autoSave: true,
      notifications: {
        dailyReminder: false,
        reminderTime: '20:00',
        streakReminders: true,
        insightNotifications: true,
        soundEnabled: false
      },
      privacy: {
        encryptionEnabled: false,
        autoLock: false,
        lockTimeout: 15,
        biometricAuth: false,
        cloudSync: false,
        anonymousAnalytics: true
      },
      engagement: {
        streakTracking: true,
        milestoneNotifications: true,
        writingPrompts: true,
        memoryInsights: true,
        progressVisualization: true,
        communityStats: false
      }
    };

    await db.add(STORES.PREFERENCES, defaultPreferences);
  }
}