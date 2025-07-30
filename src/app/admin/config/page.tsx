'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getConfiguration, updateConfiguration, toggleAutoPublishMode } from '@/data/adminApi';
import { ConfigurationData, UpdateConfigurationRequest } from '@/types';
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
  Key,
  Globe,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

const ConfigPage = () => {
  const { user, token } = useAuth();
  const [config, setConfig] = useState<ConfigurationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load configuration on component mount
  useEffect(() => {
    if (token && user?.role === 'superadmin') {
      loadConfiguration();
    }
  }, [token, user?.role]);

  const loadConfiguration = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }
    
    setIsFetching(true);
    setError('');
    
    try {
      const response = await getConfiguration(token);
      
      if (response.success) {
        setConfig(response.data);
      } else {
        setError(response.message || 'Failed to load configuration');
      }
    } catch (error: any) {
      console.error('Error loading configuration:', error);
      
      // More detailed error handling
      if (error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
      } else if (error.message.includes('403')) {
        setError('Access denied. This feature requires superadmin privileges.');
      } else if (error.message.includes('404')) {
        setError('Configuration not found. Please contact system administrator.');
      } else {
        setError(error.message || 'Failed to load configuration');
      }
    } finally {
      setIsFetching(false);
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
    if (!token || !config) {
      setError('Configuration data not available');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const updateData: UpdateConfigurationRequest = {
        ai: {
          api_key: config.ai.api_key,
          end_point: config.ai.end_point,
        },
        news: {
          key: config.news.key,
          end_point: config.news.end_point,
          params: config.news.params,
        },
        country: config.country,
        englishPrompt: config.englishPrompt,
        hindiPrompt: config.hindiPrompt,
        language: config.language,
        publish_state: config.publish_state,
        cron_interval: config.cron_interval,
        // Temporarily commenting out auto_publish_mode until we resolve the API issue
        // auto_publish_mode: config.auto_publish_mode,
      };

      const response = await updateConfiguration(token, updateData);

      if (response.success) {
        setSaved(true);
        // Update local config with response data if available
        if (response.data) {
          setConfig(response.data);
        }
        // Clear saved status after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      console.error('Save config error:', error);
      setError(error.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfigField = (field: string, value: any) => {
    if (!config) return;
    
    // Handle auto_publish_mode separately using the dedicated API
    if (field === 'auto_publish_mode') {
      handleToggleAutoPublish(value);
      return;
    }
    
    setConfig(prev => {
      if (!prev) return prev;
      
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof ConfigurationData] as any,
            [child]: value,
          },
        };
      }
      
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleToggleAutoPublish = async (newValue?: boolean) => {
    if (!token || !config) return;
    
    const targetValue = newValue !== undefined ? newValue : !config.auto_publish_mode;
    
    try {
      const response = await toggleAutoPublishMode(token, targetValue);
      if (response.success) {
        setConfig(prev => prev ? { ...prev, auto_publish_mode: response.autoPublishMode } : prev);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to toggle auto-publish mode');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to toggle auto-publish mode');
      console.error('Auto-publish toggle error:', error);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!config) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Not Found</h3>
          <p className="text-gray-600 mb-4">No configuration data available.</p>
          <button
            onClick={loadConfiguration}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
              <p className="text-gray-600 mt-1">
                Manage system settings, API keys, and AI prompts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadConfiguration}
                disabled={isFetching}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={clsx("w-4 h-4 mr-1", isFetching && "animate-spin")} />
                Refresh
              </button>
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Bot className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">AI Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={config.ai.api_key}
                    onChange={(e) => updateConfigField('ai.api_key', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter OpenAI API key..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  OpenAI API key for content generation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI API Endpoint
                </label>
                <input
                  type="url"
                  value={config.ai.end_point}
                  onChange={(e) => updateConfigField('ai.end_point', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="https://api.openai.com/v1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  OpenAI API endpoint URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI Organization ID
                </label>
                <input
                  type="text"
                  value={config.ai.org_id || ''}
                  onChange={(e) => updateConfigField('ai.org_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="org-your-organization-id"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: OpenAI Organization ID for billing and usage tracking
                </p>
              </div>
            </div>
          </div>

          {/* News API Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">News API Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={config.news.key}
                    onChange={(e) => updateConfigField('news.key', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter news API key..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  News API key for fetching articles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News API Endpoint
                </label>
                <input
                  type="url"
                  value={config.news.end_point}
                  onChange={(e) => updateConfigField('news.end_point', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="https://newsapi.org/v2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  News API endpoint URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  News API Parameters
                </label>
                <input
                  type="text"
                  value={config.news.params}
                  onChange={(e) => updateConfigField('news.params', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="country=IN&category=general"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional parameters for news API requests
                </p>
              </div>
            </div>
          </div>

          {/* AI Prompts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">AI Prompts</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Prompt
                </label>
                <textarea
                  value={config.englishPrompt || ''}
                  onChange={(e) => updateConfigField('englishPrompt', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                  placeholder="Enter the prompt for English news processing..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prompt will be used by AI to process English news articles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hindi Prompt
                </label>
                <textarea
                  value={config.hindiPrompt || ''}
                  onChange={(e) => updateConfigField('hindiPrompt', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                  placeholder="Enter the prompt for Hindi news processing..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prompt will be used by AI to process Hindi news articles
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Code
                </label>
                <input
                  type="text"
                  value={config.country}
                  onChange={(e) => updateConfigField('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="IN"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ISO country code (2 letters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => updateConfigField('language', e.target.value as 'en' | 'hi')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Default language for news processing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cron Interval
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={config.cron_interval}
                    onChange={(e) => updateConfigField('cron_interval', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="*/1 * * * *"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cron schedule for automated news fetching (e.g., */5 * * * * for every 5 minutes)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-Publish Mode
                  </label>
                  <p className="text-xs text-gray-500">
                    Automatically publish processed news without admin approval
                  </p>
                </div>
                <button
                  onClick={() => handleToggleAutoPublish()}
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-lg border transition-colors',
                    config.auto_publish_mode
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  )}
                >
                  {config.auto_publish_mode ? (
                    <ToggleRight className="w-5 h-5 mr-2" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 mr-2" />
                  )}
                  {config.auto_publish_mode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center text-sm text-gray-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>
              {config ? (
                <>
                  Last updated: {new Date(config.updatedAt).toLocaleString()} | 
                  Created: {new Date(config.createdAt).toLocaleString()}
                </>
              ) : (
                'No configuration data available'
              )}
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfigPage; 