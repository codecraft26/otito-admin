'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSystemConfig } from '@/data/mockData';
import { updateConfig, getAutoPublishStatus, toggleAutoPublishMode } from '@/data/adminApi';
import { SystemConfig } from '@/types';
import {
  Save,
  Settings,
  Clock,
  MessageSquare,
  Shield,
  AlertCircle,
  CheckCircle,
  Hash,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

const ConfigPage = () => {
  const { user, token } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(mockSystemConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [autoPublishLoading, setAutoPublishLoading] = useState(false);
  const [autoPublishMode, setAutoPublishMode] = useState<boolean | null>(null);

  // Load auto-publish status on component mount
  useEffect(() => {
    if (token && user?.role === 'superadmin') {
      loadAutoPublishStatus();
    }
  }, [token, user?.role]);

  const loadAutoPublishStatus = async () => {
    if (!token) return;
    
    try {
      const response = await getAutoPublishStatus(token);
      if (response.success) {
        setAutoPublishMode(response.autoPublishMode);
      }
    } catch (error) {
      console.error('Error loading auto-publish status:', error);
    }
  };

  const handleToggleAutoPublish = async () => {
    if (!token || autoPublishMode === null) return;
    
    setAutoPublishLoading(true);
    try {
      const response = await toggleAutoPublishMode(token, !autoPublishMode);
      if (response.success) {
        setAutoPublishMode(response.autoPublishMode);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to toggle auto-publish mode');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to toggle auto-publish mode');
      console.error('Auto-publish toggle error:', error);
    } finally {
      setAutoPublishLoading(false);
    }
  };

  // Redirect if not superadmin
  if (user?.role !== 'superadmin') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only superadmins can access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await updateConfig(token, {
        cron_interval: `*/${config.newsFrequency} * * * *`, // Convert minutes to cron format
        hindi_prompt: config.hindiPrompt,
        english_prompt: config.englishPrompt,
        auto_publish: config.autoPublish,
        max_news_per_batch: config.maxNewsPerBatch,
      });

      if (response.success) {
        setSaved(true);
        // Clear saved status after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save config error:', error);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
              <p className="text-gray-600 mt-1">
                Manage system settings and AI prompts
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={clsx(
                'flex items-center px-4 py-2 rounded-lg transition-colors',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Prompts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">AI Prompts</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hindi Prompt
                </label>
                <textarea
                  value={config.hindiPrompt}
                  onChange={(e) => setConfig({ ...config, hindiPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter the prompt for Hindi news processing..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prompt will be used by ChatGPT to process Hindi news articles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Prompt
                </label>
                <textarea
                  value={config.englishPrompt}
                  onChange={(e) => setConfig({ ...config, englishPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter the prompt for English news processing..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prompt will be used by ChatGPT to process English news articles
                </p>
              </div>
            </div>
          </div>

          {/* News Processing Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">News Processing</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News Fetch Frequency (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={config.newsFrequency}
                    onChange={(e) => setConfig({ ...config, newsFrequency: parseInt(e.target.value) })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How often to fetch news from NewsData.io (5-1440 minutes)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max News Per Batch
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.maxNewsPerBatch}
                    onChange={(e) => setConfig({ ...config, maxNewsPerBatch: parseInt(e.target.value) })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of news articles to process in each batch
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Publish Mode
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleToggleAutoPublish}
                    disabled={autoPublishLoading}
                    className={clsx(
                      'flex items-center px-4 py-2 rounded-lg border transition-colors',
                      autoPublishMode
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    )}
                  >
                    {autoPublishLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : autoPublishMode ? (
                      <ToggleRight className="w-5 h-5 mr-2" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 mr-2" />
                    )}
                    {autoPublishMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, processed news will be automatically published without admin approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfigPage; 