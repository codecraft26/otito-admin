'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSystemConfig } from '@/data/mockData';
import { SystemConfig } from '@/types';
import {
  Save,
  Settings,
  Globe,
  Clock,
  MessageSquare,
  Shield,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Hash,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const ConfigPage = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(mockSystemConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Saving configuration:', config);
    setSaved(true);
    setIsLoading(false);
    
    // Clear saved status after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !config.categories.includes(newCategory)) {
      setConfig({
        ...config,
        categories: [...config.categories, newCategory]
      });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setConfig({
      ...config,
      categories: config.categories.filter(cat => cat !== categoryToRemove)
    });
  };

  const handleToggleAutoPublish = () => {
    setConfig({
      ...config,
      autoPublish: !config.autoPublish
    });
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
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                    className={clsx(
                      'flex items-center px-4 py-2 rounded-lg border transition-colors',
                      config.autoPublish
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    )}
                  >
                    {config.autoPublish ? (
                      <ToggleRight className="w-5 h-5 mr-2" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 mr-2" />
                    )}
                    {config.autoPublish ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, processed news will be automatically published without admin approval
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">News Categories</h2>
            </div>
            <button
              onClick={handleAddCategory}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {config.categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <button
                  onClick={() => handleRemoveCategory(category)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            These categories will be used to classify news articles automatically
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">NewsData.io API</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Connected and operational</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">ChatGPT API</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Connected and operational</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Cron Job</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Next run: {new Date(Date.now() + config.newsFrequency * 60000).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Configuration Summary</h3>
              <div className="text-xs text-blue-700 mt-1 space-y-1">
                <p>• News will be fetched every {config.newsFrequency} minutes</p>
                <p>• Maximum {config.maxNewsPerBatch} articles per batch</p>
                <p>• Auto-publish is {config.autoPublish ? 'enabled' : 'disabled'}</p>
                <p>• {config.categories.length} categories configured</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfigPage; 