// Privacy control interface for AI emotional companion

import React, { useState, useEffect } from 'react';
import { useEmotionalAnalysis } from '../../hooks/useEmotionalAnalysis';
import { emotionalCompanionEngine } from '../../services/emotionalCompanionEngine';
import { emotionalStorageService } from '../../services/emotionalStorage';
import { cn } from '../../utils/cn';

import type {
  CompanionPreferences,
  BoundarySettings,
  TopicSensitivity
} from '../../types/emotional-companion';

export interface CompanionPrivacySettingsProps {
  className?: string;
  onClose?: () => void;
}

export const CompanionPrivacySettings: React.FC<CompanionPrivacySettingsProps> = ({
  className,
  onClose
}) => {
  const { preferences, updatePreferences } = useEmotionalAnalysis();
  
  // State
  const [localPreferences, setLocalPreferences] = useState<CompanionPreferences | null>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSensitiveTopic, setNewSensitiveTopic] = useState('');

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({ ...preferences });
    }
    loadStorageStats();
  }, [preferences]);

  const loadStorageStats = async () => {
    try {
      const stats = await emotionalStorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!localPreferences) return;

    try {
      await updatePreferences(localPreferences);
      onClose?.();
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await emotionalCompanionEngine.exportUserData();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emotional-companion-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await emotionalCompanionEngine.deleteUserData();
      setShowDeleteConfirm(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateBoundarySettings = (updates: Partial<BoundarySettings>) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      boundarySettings: {
        ...localPreferences.boundarySettings,
        ...updates
      }
    });
  };

  const addSensitiveTopic = () => {
    if (!newSensitiveTopic.trim() || !localPreferences) return;

    const newSensitivity: TopicSensitivity = {
      topic: newSensitiveTopic.trim(),
      sensitivity: 'high',
      setAt: new Date()
    };

    setLocalPreferences({
      ...localPreferences,
      topicSensitivities: [...localPreferences.topicSensitivities, newSensitivity]
    });
    
    setNewSensitiveTopic('');
  };

  const removeSensitiveTopic = (index: number) => {
    if (!localPreferences) return;
    
    const updated = [...localPreferences.topicSensitivities];
    updated.splice(index, 1);
    
    setLocalPreferences({
      ...localPreferences,
      topicSensitivities: updated
    });
  };

  const updateTopicSensitivity = (index: number, sensitivity: TopicSensitivity['sensitivity']) => {
    if (!localPreferences) return;
    
    const updated = [...localPreferences.topicSensitivities];
    updated[index] = { ...updated[index], sensitivity };
    
    setLocalPreferences({
      ...localPreferences,
      topicSensitivities: updated
    });
  };

  if (!localPreferences) {
    return (
      <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg p-6', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-cream-paper dark:bg-gray-800 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-fountain-pen-blue dark:text-gray-100">
              Privacy & Data Settings
            </h2>
            <p className="text-sm text-pencil-graphite dark:text-gray-400 mt-1">
              Control how Alex handles your personal data and emotional information
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8 max-h-96 overflow-y-auto">
        {/* Data Retention Settings */}
        <section>
          <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
            Data Retention
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pencil-graphite dark:text-gray-300 mb-2">
                Keep conversation data for:
              </label>
              <select
                value={localPreferences.boundarySettings.dataRetentionPeriod}
                onChange={(e) => updateBoundarySettings({ dataRetentionPeriod: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
                <option value={-1}>Forever</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="shareInsights"
                checked={localPreferences.boundarySettings.shareInsightsWithUser}
                onChange={(e) => updateBoundarySettings({ shareInsightsWithUser: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="shareInsights" className="text-sm text-pencil-graphite dark:text-gray-300">
                Allow Alex to share emotional insights and patterns with you
              </label>
            </div>
          </div>
        </section>

        {/* Crisis Intervention Settings */}
        <section>
          <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
            Safety & Crisis Support
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="crisisIntervention"
                checked={localPreferences.boundarySettings.crisisInterventionEnabled}
                onChange={(e) => updateBoundarySettings({ crisisInterventionEnabled: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="crisisIntervention" className="text-sm text-pencil-graphite dark:text-gray-300">
                Enable crisis detection and safety resource recommendations
              </label>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
              When enabled, Alex will monitor for signs of crisis and provide appropriate support resources.
              This feature helps ensure your safety during difficult times.
            </p>
          </div>
        </section>

        {/* Session Settings */}
        <section>
          <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
            Session Limits
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-pencil-graphite dark:text-gray-300 mb-2">
              Maximum conversation length (minutes):
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={localPreferences.boundarySettings.maxSessionLength}
              onChange={(e) => updateBoundarySettings({ maxSessionLength: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Alex will gently suggest taking breaks after this duration
            </p>
          </div>
        </section>

        {/* Topic Sensitivities */}
        <section>
          <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
            Topic Boundaries
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pencil-graphite dark:text-gray-300 mb-2">
                Topics to handle with extra sensitivity:
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSensitiveTopic}
                  onChange={(e) => setNewSensitiveTopic(e.target.value)}
                  placeholder="Add a topic (e.g., work, family, health)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-pencil-graphite dark:text-gray-200"
                  onKeyDown={(e) => e.key === 'Enter' && addSensitiveTopic()}
                />
                <button
                  onClick={addSensitiveTopic}
                  className="px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-2">
                {localPreferences.topicSensitivities.map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="flex-1 text-sm text-pencil-graphite dark:text-gray-300">
                      {topic.topic}
                    </span>
                    <select
                      value={topic.sensitivity}
                      onChange={(e) => updateTopicSensitivity(index, e.target.value as any)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-pencil-graphite dark:text-gray-200"
                    >
                      <option value="low">Low sensitivity</option>
                      <option value="moderate">Moderate sensitivity</option>
                      <option value="high">High sensitivity</option>
                      <option value="avoid">Avoid completely</option>
                    </select>
                    <button
                      onClick={() => removeSensitiveTopic(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-lg font-medium text-fountain-pen-blue dark:text-gray-100 mb-4">
            Data Management
          </h3>
          
          {storageStats && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-pencil-graphite dark:text-gray-300 mb-2">
                Current Data Usage
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Conversations:</span>
                  <span className="ml-2 font-medium">{storageStats.conversationCount}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Analyses:</span>
                  <span className="ml-2 font-medium">{storageStats.analysisCount}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Storage Size:</span>
                  <span className="ml-2 font-medium">{(storageStats.totalSize / 1024).toFixed(1)} KB</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {storageStats.lastUpdated ? new Date(storageStats.lastUpdated).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export All My Data'}
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete All My Data
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex gap-3">
          <button
            onClick={handleSaveSettings}
            className="flex-1 px-4 py-2 bg-fountain-pen-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Save Settings
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Delete All Data?
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              This will permanently delete all your conversations, emotional analyses, and preferences. 
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanionPrivacySettings;