import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeSelector } from '../ui/ThemeSelector';

interface UserPreferences {
  writingGoal: 'reflection' | 'creativity' | 'productivity' | 'healing';
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  writingStyle: 'structured' | 'freeform' | 'prompted' | 'mixed';
  privacyLevel: 'private' | 'anonymous' | 'community';
  name?: string;
}

interface AppSettings {
  notifications: {
    dailyReminders: boolean;
    streakWarnings: boolean;
    milestoneAlerts: boolean;
    reminderTime: string;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  writing: {
    autosave: boolean;
    wordCountGoal: number;
    showWritingTime: boolean;
    enableFocusMode: boolean;
  };
  appearance: {
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    lineHeight: 'compact' | 'normal' | 'relaxed';
  };
}

export function SettingsView() {
  const { currentTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'appearance' | 'data'>('profile');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    notifications: {
      dailyReminders: true,
      streakWarnings: true,
      milestoneAlerts: true,
      reminderTime: '19:00'
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      crashReports: true
    },
    writing: {
      autosave: true,
      wordCountGoal: 200,
      showWritingTime: true,
      enableFocusMode: true
    },
    appearance: {
      darkMode: false,
      fontSize: 'medium',
      lineHeight: 'normal'
    }
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setAppSettings(JSON.parse(savedSettings));
    }
  }, []);

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: '👤' },
    { id: 'preferences' as const, name: 'Writing', icon: '✍️' },
    { id: 'notifications' as const, name: 'Notifications', icon: '🔔' },
    { id: 'privacy' as const, name: 'Privacy', icon: '🔒' },
    { id: 'appearance' as const, name: 'Appearance', icon: '🎨' },
    { id: 'data' as const, name: 'Data', icon: '💾' }
  ];

  const saveSettings = () => {
    if (userPreferences) {
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    }
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('appSettings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const settingsData = {
      userPreferences,
      appSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diary-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.userPreferences) setUserPreferences(data.userPreferences);
        if (data.appSettings) setAppSettings(data.appSettings);
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-script text-fountain-pen-blue mb-2">Settings</h1>
          <p className="text-pencil-graphite/70">
            Customize your writing experience and manage your preferences.
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex gap-3">
            <button
              onClick={() => setHasUnsavedChanges(false)}
              className="px-4 py-2 border border-notebook-lines rounded-lg text-pencil-graphite hover:bg-fountain-pen-blue/5 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-fountain-pen-blue/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-4 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-fountain-pen-blue text-white'
                      : 'text-pencil-graphite hover:bg-fountain-pen-blue/10'
                  )}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-aged-paper border border-notebook-lines rounded-lg p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-2">Display Name</label>
                    <input
                      type="text"
                      value={userPreferences?.name || ''}
                      onChange={(e) => {
                        setUserPreferences(prev => prev ? { ...prev, name: e.target.value } : null);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="How should we address you?"
                      className="w-full px-4 py-3 border border-notebook-lines rounded-lg bg-cream-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-2">Writing Goal</label>
                    <select
                      value={userPreferences?.writingGoal || 'reflection'}
                      onChange={(e) => {
                        setUserPreferences(prev => prev ? { ...prev, writingGoal: e.target.value as any } : null);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 border border-notebook-lines rounded-lg bg-cream-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    >
                      <option value="reflection">Self-Reflection</option>
                      <option value="creativity">Creative Expression</option>
                      <option value="productivity">Productive Thinking</option>
                      <option value="healing">Emotional Healing</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-fountain-pen-blue/5 rounded-lg">
                  <h3 className="font-medium text-pencil-graphite mb-2">Account Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-fountain-pen-blue">
                        {Math.floor(Math.random() * 100 + 50)}
                      </div>
                      <div className="text-xs text-pencil-graphite/70">Days Active</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-fountain-pen-blue">
                        {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                      </div>
                      <div className="text-xs text-pencil-graphite/70">Words Written</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-fountain-pen-blue">
                        {Math.floor(Math.random() * 20 + 5)}
                      </div>
                      <div className="text-xs text-pencil-graphite/70">Current Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Writing Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Writing Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-3">Daily Word Count Goal</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={appSettings.writing.wordCountGoal}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            writing: { ...prev.writing, wordCountGoal: parseInt(e.target.value) }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 slider"
                      />
                      <span className="text-fountain-pen-blue font-medium w-20">
                        {appSettings.writing.wordCountGoal} words
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.writing.autosave}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            writing: { ...prev.writing, autosave: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Auto-save entries</div>
                        <div className="text-sm text-pencil-graphite/70">Automatically save your writing as you type</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.writing.showWritingTime}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            writing: { ...prev.writing, showWritingTime: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Show writing time</div>
                        <div className="text-sm text-pencil-graphite/70">Display time spent writing each entry</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.writing.enableFocusMode}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            writing: { ...prev.writing, enableFocusMode: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Enable focus mode</div>
                        <div className="text-sm text-pencil-graphite/70">Allow distraction-free writing sessions</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Notifications</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-3">Daily Reminder Time</label>
                    <input
                      type="time"
                      value={appSettings.notifications.reminderTime}
                      onChange={(e) => {
                        setAppSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, reminderTime: e.target.value }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="px-4 py-3 border border-notebook-lines rounded-lg bg-cream-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.dailyReminders}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, dailyReminders: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Daily writing reminders</div>
                        <div className="text-sm text-pencil-graphite/70">Get gentle reminders to write each day</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.streakWarnings}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, streakWarnings: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Streak warnings</div>
                        <div className="text-sm text-pencil-graphite/70">Alert when your writing streak is at risk</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.milestoneAlerts}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, milestoneAlerts: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Milestone celebrations</div>
                        <div className="text-sm text-pencil-graphite/70">Celebrate achievements and milestones</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Privacy & Data</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Your data stays private</span>
                    </div>
                    <p className="text-sm text-green-700">
                      All your diary entries are stored locally on your device. We never upload your personal writing to external servers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.privacy.dataCollection}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, dataCollection: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Anonymous usage data</div>
                        <div className="text-sm text-pencil-graphite/70">Help improve the app with anonymous usage statistics</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.privacy.analytics}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, analytics: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Analytics</div>
                        <div className="text-sm text-pencil-graphite/70">Allow anonymous analytics to improve features</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appSettings.privacy.crashReports}
                        onChange={(e) => {
                          setAppSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, crashReports: e.target.checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="text-fountain-pen-blue focus:ring-fountain-pen-blue"
                      />
                      <div>
                        <div className="font-medium text-pencil-graphite">Crash reports</div>
                        <div className="text-sm text-pencil-graphite/70">Send anonymous crash reports to help fix bugs</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-3">Theme</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-4 border border-notebook-lines rounded-lg bg-cream-paper">
                        <div className="text-sm text-pencil-graphite mb-2">Current Theme</div>
                        <div className="font-medium text-fountain-pen-blue">{currentTheme.name}</div>
                      </div>
                      <button
                        onClick={() => setShowThemeSelector(true)}
                        className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-fountain-pen-blue/90 transition-colors"
                      >
                        Change Theme
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-3">Font Size</label>
                    <select
                      value={appSettings.appearance.fontSize}
                      onChange={(e) => {
                        setAppSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, fontSize: e.target.value as any }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 border border-notebook-lines rounded-lg bg-cream-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pencil-graphite mb-3">Line Height</label>
                    <select
                      value={appSettings.appearance.lineHeight}
                      onChange={(e) => {
                        setAppSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, lineHeight: e.target.value as any }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 border border-notebook-lines rounded-lg bg-cream-paper focus:outline-none focus:ring-2 focus:ring-fountain-pen-blue"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Relaxed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-script text-fountain-pen-blue mb-6">Data Management</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Backup Your Settings</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Export your preferences and settings to restore them later or transfer to another device.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={exportSettings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Export Settings
                      </button>
                      <label className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm cursor-pointer">
                        Import Settings
                        <input
                          type="file"
                          accept=".json"
                          onChange={importSettings}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">Reset All Settings</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      This will reset all your preferences to default values. Your diary entries will not be affected.
                    </p>
                    <button
                      onClick={resetSettings}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Reset Settings
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">Clear All Data</h3>
                    <p className="text-sm text-red-700 mb-4">
                      ⚠️ This will permanently delete all your diary entries and settings. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure? This will delete ALL your diary entries permanently.')) {
                          if (confirm('This is your final warning. All your writing will be lost forever. Continue?')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-cream-paper rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-fountain-pen-blue">Choose Your Theme</h2>
                <button
                  onClick={() => setShowThemeSelector(false)}
                  className="p-2 text-pencil-graphite/70 hover:text-red-pen transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ThemeSelector onThemeSelect={() => setShowThemeSelector(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}