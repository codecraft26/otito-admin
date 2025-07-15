'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSystemConfig } from '@/data/mockData';
import { getArticleById, updateArticleContent, unlockArticle, lockArticle, checkLockStatus } from '@/data/adminApi';
import { NewsItem } from '@/types';
import {
  ArrowLeft,
  Save,
  X,
  Star,
  Globe,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

const NewsEditPage = () => {
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    twoLineSummary: '',
    fourLineSummary: '',
    swipeSummary: '',
    fullDescription: '',
    category: '',
    tags: [] as string[],
    isHeadline: false,
    isPublished: false,
    language: 'english' as 'hindi' | 'english',
    imageUrl: '',
    sourceUrl: '',
  });
  
  console.log('Current formData:', formData);
  const [newTag, setNewTag] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isLocking, setIsLocking] = useState(true);
  const [heartbeatInterval, setHeartbeatInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load article immediately when component mounts
    if (token && params.id) {
      loadArticle();
    }
  }, [token, params.id]);

  useEffect(() => {
    // Handle locking separately after component mounts
    let isComponentMounted = true;
    
    const doLock = async () => {
      if (!token || !params.id) {
        setIsLocking(false);
        return;
      }
      
      setIsLocking(true);
      
      try {
        console.log('Attempting to lock article:', params.id);
        const res = await lockArticle(token, params.id as string);
        console.log('Lock response:', res);
        
        if (isComponentMounted) {
          if (res.success) {
            setIsLocked(true);
            setIsLocking(false);
            startHeartbeat(); // Start heartbeat to maintain lock
            startAutoSave(); // Start auto-save when lock is acquired
          } else {
            setIsLocking(false);
            console.warn('Lock failed:', res.message);
            setError(`Warning: ${res.message}. You can view the article but editing may be restricted.`);
          }
        }
      } catch (err: any) {
        console.error('Lock error:', err);
        if (isComponentMounted) {
          setIsLocking(false);
          console.warn('Lock error:', err.message);
          setError(`Warning: Failed to lock article. You can view the article but editing may be restricted.`);
        }
      }
    };
    
    // Only try to lock if article is loaded
    if (newsItem) {
      doLock();
    }
    
    // Unlock on unmount
    return () => {
      isComponentMounted = false;
      stopHeartbeat();
      stopAutoSave();
      if (token && params.id && isLocked) {
        // Use fetch directly for cleanup to avoid promise rejection warnings
        fetch(`http://localhost:5001/api/admin/article/${params.id}/unlock`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Silently handle errors during cleanup
        });
      }
    };
  }, [newsItem, token, params.id]);

  // Start heartbeat to maintain lock
  const startHeartbeat = () => {
    if (heartbeatInterval) return; // Already running
    
    const interval = setInterval(async () => {
      if (token && params.id && isLocked) {
        try {
          // Check lock status instead of trying to lock again
          const statusResponse = await checkLockStatus(token, params.id as string);
          
          if (!statusResponse.success || !statusResponse.data?.isLocked || statusResponse.data?.lockedBy !== user?.id) {
            // Lock has been lost
            setIsLocked(false);
            stopHeartbeat();
            alert('Your editing session has expired. The article lock has been released.');
            router.push('/admin/news');
          }
        } catch (error) {
          console.warn('Heartbeat failed:', error);
          // If heartbeat fails multiple times, we should check the lock status
          // For now, we'll let the user continue and they'll find out on save
        }
      }
    }, 30000); // 30 seconds
    
    setHeartbeatInterval(interval);
  };

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
  };

  // Start auto-save
  const startAutoSave = () => {
    if (autoSaveInterval) return; // Already running
    
    const interval = setInterval(() => {
      if (hasUnsavedChanges && isLocked && token && newsItem?.id) {
        performAutoSave();
      }
    }, 60000); // Auto-save every 60 seconds
    
    setAutoSaveInterval(interval);
  };

  // Stop auto-save
  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }
  };

  // Perform auto-save
  // Track form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Perform auto-save
  const performAutoSave = async () => {
    if (!newsItem || !token || !newsItem.id || !isLocked) return;
    
    try {
      const updateData = {
        title: formData.title,
        twoLineDescription: formData.twoLineSummary,
        fourLineDescription: formData.fourLineSummary,
        swipeDescription: formData.swipeSummary,
        content: formData.fullDescription,
        category: formData.category.split(',').map(cat => cat.trim()).filter(Boolean),
        tags: formData.tags,
        isHeadline: formData.isHeadline,
        isPublished: formData.isPublished,
        language: formData.language === 'hindi' ? 'HI' : 'EN',
        source: formData.sourceUrl,
      };

      const response = await updateArticleContent(token, newsItem.id, updateData);
      
      if (response.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log('Auto-saved successfully');
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return lastSaved.toLocaleString();
  };

  // Add beforeunload event listener to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLocked && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLocked, hasUnsavedChanges]);

  const loadArticle = async () => {
    if (!token) {
      console.log('Cannot load article - missing token');
      setError('Authentication token missing');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const id = params.id as string;
      console.log('Loading article with ID:', id);
      
      // Get the specific article by ID
      const response = await getArticleById(token, id);
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        const article = response.data;
        
        // Normalize the article data
        const normalizedArticle: NewsItem = {
          ...article,
          id: article._id || article.id || article.articleId || '',
          category: Array.isArray(article.category) ? article.category : [article.category].filter(Boolean),
          tags: article.tags || [],
          createdAt: article.createdAt || article.created_at || new Date().toISOString(),
          updatedAt: article.updatedAt || article.updated_at || new Date().toISOString(),
          publishedAt: article.publishedAt || article.published_at,
        };
        
        setNewsItem(normalizedArticle);
        const formDataToSet = {
          title: normalizedArticle.title || '',
          twoLineSummary: normalizedArticle.twoLineDescription || normalizedArticle.twoLineSummary || '',
          fourLineSummary: normalizedArticle.fourLineDescription || normalizedArticle.fourLineSummary || '',
          swipeSummary: normalizedArticle.swipeDescription || normalizedArticle.swipeSummary || '',
          fullDescription: normalizedArticle.content || normalizedArticle.fullDescription || '',
          category: Array.isArray(normalizedArticle.category) ? normalizedArticle.category.join(', ') : (normalizedArticle.category || ''),
          tags: [...(normalizedArticle.tags || [])],
          isHeadline: normalizedArticle.isHeadline || false,
          isPublished: normalizedArticle.isPublished || false,
          language: (normalizedArticle.language === 'HI' ? 'hindi' : normalizedArticle.language === 'EN' ? 'english' : normalizedArticle.language) || 'english',
          imageUrl: normalizedArticle.imageUrl || '',
          sourceUrl: normalizedArticle.source || normalizedArticle.sourceUrl || '',
        };
        
        console.log('Setting form data:', formDataToSet);
        setFormData(formDataToSet);
        setLastSaved(new Date()); // Set initial save time
        setHasUnsavedChanges(false);
        
        // Start auto-save when we have a locked article
        if (isLocked) {
          startAutoSave();
        }
        
        console.log('Form data set successfully');
      } else {
        console.log('Article not found in response:', response);
        setError('Article not found or failed to load');
      }
    } catch (error: any) {
      console.error('Load article error:', error);
      setError(error.message || 'Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  // Load article without lock requirement (for debugging)
  const loadArticleWithoutLock = async () => {
    if (!token) {
      console.log('Cannot load article - missing token');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const id = params.id as string;
      console.log('Loading article without lock, ID:', id);
      
      // Get the specific article by ID
      const response = await getArticleById(token, id);
      console.log('API Response (no lock):', response);
      
      if (response.success && response.data) {
        const article = response.data;
        
        // Normalize the article data
        const normalizedArticle: NewsItem = {
          ...article,
          id: article._id || article.id || article.articleId || '',
          category: Array.isArray(article.category) ? article.category : [article.category].filter(Boolean),
          tags: article.tags || [],
          createdAt: article.createdAt || article.created_at || new Date().toISOString(),
          updatedAt: article.updatedAt || article.updated_at || new Date().toISOString(),
          publishedAt: article.publishedAt || article.published_at,
        };
        
        setNewsItem(normalizedArticle);
        const formDataToSet = {
          title: normalizedArticle.title || '',
          twoLineSummary: normalizedArticle.twoLineDescription || normalizedArticle.twoLineSummary || '',
          fourLineSummary: normalizedArticle.fourLineDescription || normalizedArticle.fourLineSummary || '',
          swipeSummary: normalizedArticle.swipeDescription || normalizedArticle.swipeSummary || '',
          fullDescription: normalizedArticle.content || normalizedArticle.fullDescription || '',
          category: Array.isArray(normalizedArticle.category) ? normalizedArticle.category.join(', ') : (normalizedArticle.category || ''),
          tags: [...(normalizedArticle.tags || [])],
          isHeadline: normalizedArticle.isHeadline || false,
          isPublished: normalizedArticle.isPublished || false,
          language: (normalizedArticle.language === 'HI' ? 'hindi' : normalizedArticle.language === 'EN' ? 'english' : normalizedArticle.language) || 'english',
          imageUrl: normalizedArticle.imageUrl || '',
          sourceUrl: normalizedArticle.source || normalizedArticle.sourceUrl || '',
        };
        
        console.log('Setting form data (no lock):', formDataToSet);
        setFormData(formDataToSet);
        setLastSaved(new Date()); // Set initial save time
        setHasUnsavedChanges(false);
        console.log('Form data set successfully (no lock)');
      } else {
        console.log('Article not found in response (no lock):', response);
        setError('Article not found or failed to load');
      }
    } catch (error: any) {
      console.error('Load article error (no lock):', error);
      setError(error.message || 'Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsItem || !token || !newsItem.id) return;

    setIsSaving(true);
    setError('');
    
    try {
      const updateData = {
        title: formData.title,
        twoLineDescription: formData.twoLineSummary,
        fourLineDescription: formData.fourLineSummary,
        swipeDescription: formData.swipeSummary,
        content: formData.fullDescription,
        category: formData.category.split(',').map(cat => cat.trim()).filter(Boolean),
        tags: formData.tags,
        isHeadline: formData.isHeadline,
        isPublished: formData.isPublished,
        language: formData.language === 'hindi' ? 'HI' : 'EN',
        source: formData.sourceUrl,
      };

      const response = await updateArticleContent(token, newsItem.id, updateData);
      
      if (response.success) {
        // Stop heartbeat and unlock the article after save
        stopHeartbeat();
        stopAutoSave();
        setHasUnsavedChanges(false);
        if (isLocked) {
          await unlockArticle(token, newsItem.id);
          setIsLocked(false);
        }
        // Redirect back to news list
        router.push('/admin/news');
      } else if (response.message === 'You do not own the lock') {
        alert('You do not own the lock for this article.');
        router.push('/admin/news');
      } else {
        setError(response.message || 'Failed to update article');
      }
    } catch (error: any) {
      if (error?.message?.includes('You do not own the lock')) {
        alert('You do not own the lock for this article.');
        router.push('/admin/news');
        return;
      }
      setError(error.message || 'Failed to update article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleFormChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleFormChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCancel = async () => {
    if (token && params.id && isLocked) {
      try {
        stopHeartbeat();
        stopAutoSave();
        await unlockArticle(token, params.id as string);
        setIsLocked(false);
      } catch (error: any) {
        if (error?.message?.includes('You do not own the lock')) {
          alert('You do not own the lock for this article.');
        }
        // Continue with navigation even if unlock fails
      }
    }
    router.push('/admin/news');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading news item...</p>
          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  if (!newsItem) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">News Not Found</h3>
          <p className="text-gray-600">The news item you're looking for doesn't exist.</p>
          <Link
            href="/admin/news"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
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

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/news"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News List
              </Link>
              {/* Lock Status Indicator */}
              <div className="flex items-center space-x-3">
                {isLocking ? (
                  <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    <span className="text-sm font-medium">Acquiring Lock...</span>
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Article Locked for Editing</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    <span className="text-sm font-medium">Editing Without Lock</span>
                  </div>
                )}
                {lastSaved && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-sm">
                      {hasUnsavedChanges ? 'Unsaved changes' : `Saved ${formatLastSaved()}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg transition-colors',
                  isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
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

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter news title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleFormChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select Category</option>
                  {mockSystemConfig.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isHeadline}
                    onChange={(e) => handleFormChange('isHeadline', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mark as Headline</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleFormChange('isPublished', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summaries */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summaries</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Two Line Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.twoLineSummary}
                  onChange={(e) => handleFormChange('twoLineSummary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Enter two line summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Four Line Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.fourLineSummary}
                  onChange={(e) => handleFormChange('fourLineSummary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Enter four line summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Swipe Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.swipeSummary}
                  onChange={(e) => handleFormChange('swipeSummary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Enter swipe summary"
                />
              </div>
            </div>
          </div>

          {/* Full Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Full Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.fullDescription}
                  onChange={(e) => handleFormChange('fullDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Enter full description"
                />
              </div>


            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Media and Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media and Links</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => handleFormChange('sourceUrl', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="https://example.com/source-article"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={clsx(
                  'flex items-center px-6 py-2 rounded-lg transition-colors',
                  isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
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
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewsEditPage; 