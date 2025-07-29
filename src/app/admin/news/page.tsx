'use client';

import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getArticles, publishArticle, lockArticle, unlockArticle, validateToken, updateArticleContent } from '@/data/adminApi';
import { NewsItem, ArticlesResponse } from '@/types';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Eye,
  Edit,
  Trash2,
  Globe,
  Send,
  Star,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const NewsListPage = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL-based state management to preserve tab and filter states across page refreshes
  // This ensures users stay on the same tab and with the same filters when they refresh the page
  
  const [activeTab, setActiveTab] = useState<'english' | 'hindi' | 'locked'>('english');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [showHeadlineOnly, setShowHeadlineOnly] = useState(false);
  const [articles, setArticles] = useState<NewsItem[]>([]);

  // Get initial tab from URL or default to 'english'
  const getInitialTab = (): 'english' | 'hindi' | 'locked' => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'hindi' || tabParam === 'locked') {
      return tabParam;
    }
    return 'english';
  };

  // Get initial filter states from URL
  const getInitialFilters = () => {
    return {
      searchTerm: searchParams.get('search') || '',
      showPublishedOnly: searchParams.get('published') === 'true',
      showHeadlineOnly: searchParams.get('headline') === 'true',
    };
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    perPage: 10,
  });
  const [lockModal, setLockModal] = useState<{ open: boolean; lockedBy: string | null }>({ open: false, lockedBy: null });
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [totalLockedCount, setTotalLockedCount] = useState(0);
  const [totalHeadlineCount, setTotalHeadlineCount] = useState(0);

  // Calculate headline count from articles
  const calculateHeadlineCount = (articles: NewsItem[]) => {
    return articles.filter(article => article.isHeadline).length;
  };

  // Load headline count across all languages
  const loadHeadlineCount = async () => {
    if (!token) return;
    
    try {
      // Fetch articles from both languages to count headlines
      const [englishResponse, hindiResponse] = await Promise.all([
        getArticles(token, { page: 1, limit: 100, language: 'EN' }),
        getArticles(token, { page: 1, limit: 100, language: 'HI' })
      ]);

      const allArticles = [
        ...(englishResponse.articles || []),
        ...(hindiResponse.articles || [])
      ];

      const headlineCount = calculateHeadlineCount(allArticles);
      setTotalHeadlineCount(headlineCount);
    } catch (error) {
      console.error('Failed to load headline count:', error);
    }
  };

  // Update URL when tab changes
  const updateTabInURL = (tab: 'english' | 'hindi' | 'locked') => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'english') {
      params.delete('tab'); // Remove tab param for default tab
    } else {
      params.set('tab', tab);
    }
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // Handle tab change
  const handleTabChange = (tab: 'english' | 'hindi' | 'locked') => {
    setActiveTab(tab);
    updateTabInURL(tab);
  };

  // Update URL with all current state
  // URL structure: /admin/news?tab=hindi&search=test&published=true&headline=true
  const updateURL = () => {
    const params = new URLSearchParams();
    
    // Add tab (only if not default 'english' tab)
    if (activeTab !== 'english') {
      params.set('tab', activeTab);
    }
    
    // Add filters (only if they are active)
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    if (showPublishedOnly) {
      params.set('published', 'true');
    }
    if (showHeadlineOnly) {
      params.set('headline', 'true');
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePublishedFilterChange = (value: boolean) => {
    setShowPublishedOnly(value);
  };

  const handleHeadlineFilterChange = (value: boolean) => {
    setShowHeadlineOnly(value);
  };

  // Load locked count across all languages
  const loadLockedCount = async () => {
    if (!token || !user?.id) return;
    
    try {
      // Fetch a sample from both languages to count locked articles
      const [englishResponse, hindiResponse] = await Promise.all([
        getArticles(token, { page: 1, limit: 100, language: 'EN' }),
        getArticles(token, { page: 1, limit: 100, language: 'HI' })
      ]);

      const allArticles = [
        ...(englishResponse.articles || []),
        ...(hindiResponse.articles || [])
      ];

      const lockedByUser = allArticles.filter(article => article.lockedBy === user.id);
      setTotalLockedCount(lockedByUser.length);
    } catch (error) {
      console.error('Failed to load locked count:', error);
    }
  };

  // Initialize state from URL on component mount
  useEffect(() => {
    const currentTab = getInitialTab();
    const currentFilters = getInitialFilters();
    
    setActiveTab(currentTab);
    setSearchTerm(currentFilters.searchTerm);
    setShowPublishedOnly(currentFilters.showPublishedOnly);
    setShowHeadlineOnly(currentFilters.showHeadlineOnly);
  }, []);

  // Handle URL changes and sync with state
  useEffect(() => {
    const currentTab = getInitialTab();
    const currentFilters = getInitialFilters();
    
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
    if (currentFilters.searchTerm !== searchTerm) {
      setSearchTerm(currentFilters.searchTerm);
    }
    if (currentFilters.showPublishedOnly !== showPublishedOnly) {
      setShowPublishedOnly(currentFilters.showPublishedOnly);
    }
    if (currentFilters.showHeadlineOnly !== showHeadlineOnly) {
      setShowHeadlineOnly(currentFilters.showHeadlineOnly);
    }
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [activeTab, searchTerm, showPublishedOnly, showHeadlineOnly]);

  // Load articles when tab or filters change
  useEffect(() => {
    if (token) {
      loadArticles();
    }
  }, [token, activeTab, showPublishedOnly, showHeadlineOnly, searchTerm]);

  // Load locked count when component mounts or user changes
  useEffect(() => {
    if (token && user?.id) {
      loadLockedCount();
    }
  }, [token, user?.id]);

  // Load headline count when component mounts or articles change
  useEffect(() => {
    if (token) {
      loadHeadlineCount();
    }
  }, [token]);

  // Reload articles when user returns to this page (e.g., from edit page)
  useEffect(() => {
    const handleFocus = () => {
      if (token) {
        loadArticles(pagination.currentPage);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token, pagination.currentPage]);

  const loadArticles = async (page = 1) => {
    console.log('loadArticles called - token present:', !!token);
    console.log('Current user:', user ? user.email : 'no user');
    console.log('Token from localStorage:', localStorage.getItem('admin-token') ? 'present' : 'missing');
    console.log('User from localStorage:', localStorage.getItem('admin-user') ? 'present' : 'missing');
    
    if (!token) {
      setError('Please login to view articles.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Handle locked tab - fetch articles from both languages
      if (activeTab === 'locked') {
        // For locked tab, we need to fetch articles from both languages
        // and then filter on the client side to show only locked articles
        const englishParams: any = {
          page: 1,
          limit: 50, // Fetch more to ensure we get locked articles
          language: 'EN',
        };
        
        const hindiParams: any = {
          page: 1,
          limit: 50, // Fetch more to ensure we get locked articles
          language: 'HI',
        };

        if (showPublishedOnly) {
          englishParams.isPublished = true;
          hindiParams.isPublished = true;
        }
        
        if (showHeadlineOnly) {
          englishParams.isHeadline = true;
          hindiParams.isHeadline = true;
        }
        
        if (searchTerm.trim()) {
          englishParams.title = searchTerm.trim();
          hindiParams.title = searchTerm.trim();
        }

        // Fetch both English and Hindi articles
        const [englishResponse, hindiResponse] = await Promise.all([
          getArticles(token, englishParams),
          getArticles(token, hindiParams)
        ]);

        // Combine articles from both languages
        const allArticles = [
          ...(englishResponse.articles || []),
          ...(hindiResponse.articles || [])
        ];

        // Filter to show only articles locked by current user
        const lockedArticles = allArticles.filter(article => article.lockedBy === user?.id);

        setArticles(lockedArticles);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalArticles: lockedArticles.length,
          perPage: lockedArticles.length,
        });
        // Update headline count after loading locked articles
        loadHeadlineCount();
      } else {
        // For language tabs, use the normal pagination
        const params: any = {
          page,
          limit: 10,
          language: activeTab === 'english' ? 'EN' : 'HI',
        };
        
        if (showPublishedOnly) {
          params.isPublished = true;
        }
        
        if (showHeadlineOnly) {
          params.isHeadline = true;
        }
        
        if (searchTerm.trim()) {
          params.title = searchTerm.trim();
        }
        
        const response: ArticlesResponse = await getArticles(token, params);
        
        if (response.articles) {
          setArticles(response.articles);
          setPagination({
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalArticles: response.totalArticles,
            perPage: response.perPage,
          });
          // Update headline count after loading articles
          loadHeadlineCount();
        }
      }
    } catch (error) {
      console.error('Load articles error:', error);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = useMemo(() => {
    let filtered = articles.map(item => ({
      ...item,
      id: item._id || item.id || item.articleId || '',
      // Normalize language field for UI
      language: (item.language === 'EN' ? 'english' : 'hindi') as 'english' | 'hindi',
      // Normalize summary fields
      twoLineSummary: item.twoLineDescription || item.twoLineSummary || '',
      fourLineSummary: item.fourLineDescription || item.fourLineSummary || '',
      swipeSummary: item.swipeDescription || item.swipeSummary || '',
      fullDescription: item.content || item.fullDescription || '',
      // Normalize category to string
      category: Array.isArray(item.category) ? item.category.join(', ') : item.category,
      // Normalize image URL
      imageUrl: item.image_url || item.imageUrl,
      sourceUrl: item.source || item.sourceUrl,
    }));

    // For locked tab, articles are already filtered in loadArticles function
    // For other tabs, no additional filtering needed since API handles language filtering

    return filtered;
  }, [articles]);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredNews.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredNews.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkPublish = async () => {
    if (!token || selectedItems.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(
        selectedItems.map(itemId => publishArticle(token, itemId, true))
      );
      setSelectedItems([]);
      loadArticles(pagination.currentPage);
    } catch (error) {
      console.error('Bulk publish error:', error);
      setError('Failed to publish articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (!token || selectedItems.length === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(
        selectedItems.map(itemId => publishArticle(token, itemId, false))
      );
      setSelectedItems([]);
      loadArticles(pagination.currentPage);
    } catch (error) {
      console.error('Bulk unpublish error:', error);
      setError('Failed to unpublish articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkToggleHeadline = async () => {
    if (!token || selectedItems.length === 0) return;
    
    setLoading(true);
    try {
      // Get current headline status of selected items
      const selectedArticles = articles.filter(item => selectedItems.includes(item.id || ''));
      const updatePromises = selectedArticles.map(article => {
        const updateData = {
          isHeadline: !article.isHeadline
        };
        return updateArticleContent(token, article.id || '', updateData);
      });
      
      await Promise.all(updatePromises);
      setSelectedItems([]);
      loadArticles(pagination.currentPage);
      // Update headline count after bulk operation
      loadHeadlineCount();
    } catch (error) {
      console.error('Bulk headline toggle error:', error);
      setError('Failed to update headline status for some articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      await publishArticle(token, id, !currentStatus);
      loadArticles(pagination.currentPage);
    } catch (error) {
      console.error('Toggle publish error:', error);
      setError('Failed to update article status. Please try again.');
    }
  };

  const handleToggleHeadline = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      const updateData = {
        isHeadline: !currentStatus
      };
      
      await updateArticleContent(token, id, updateData);
      loadArticles(pagination.currentPage);
      // Update headline count after toggling
      loadHeadlineCount();
    } catch (error) {
      console.error('Toggle headline error:', error);
      setError('Failed to update headline status. Please try again.');
    }
  };

  const handleEditClick = async (item: any) => {
    if (!token) return;
    setLockingId(item.id);
    try {
      const res = await lockArticle(token, item.id);
      if (res.success) {
        // Refresh locked count before navigating
        loadLockedCount();
        router.push(`/admin/news/${item.id}/edit`);
      } else {
        alert(res.message || 'Failed to lock article.');
      }
    } catch (err) {
      alert('Failed to lock article.');
    } finally {
      setLockingId(null);
    }
  };

  const handleUnlockClick = async (itemId: string) => {
    if (!token) return;
    setLockingId(itemId);
    try {
      const res = await unlockArticle(token, itemId);
      if (res.success) {
        // Reload articles to reflect the unlocked status
        loadArticles(pagination.currentPage);
        // Refresh locked count
        loadLockedCount();
      } else {
        alert(res.message || 'Failed to unlock article.');
      }
    } catch (err) {
      alert('Failed to unlock article.');
    } finally {
      setLockingId(null);
    }
  };

  // Helper to display locked by info (username/email/raw)
  const getLockedByAdmin = (adminId: string) => {
    // If you have a list of admins, you could look up by ID here
    // For now, just return a fallback object
    return { username: `Admin ${adminId}`, email: undefined };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
              <p className="text-gray-600 mt-1">
                Manage and publish news articles across different languages
              </p>
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

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('english')}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'english'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                English News
              </button>
              <button
                onClick={() => handleTabChange('hindi')}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'hindi'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Hindi News
              </button>
              <button
                onClick={() => handleTabChange('locked')}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1',
                  activeTab === 'locked'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Lock className="w-4 h-4" />
                <span>Locked by Me</span>
                {totalLockedCount > 0 && (
                  <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {totalLockedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPublishedOnly}
                    onChange={(e) => handlePublishedFilterChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Published only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showHeadlineOnly}
                    onChange={(e) => handleHeadlineFilterChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Headline only</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                {/* Refresh Button */}
                <button
                  onClick={() => {
                    loadArticles(pagination.currentPage);
                    loadHeadlineCount();
                  }}
                  disabled={loading}
                  className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={clsx("w-4 h-4 mr-1", loading && "animate-spin")} />
                  Refresh
                </button>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selected
                    </span>
                    <button
                      onClick={handleBulkPublish}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Publishing...' : 'Publish'}
                    </button>
                    <button
                      onClick={handleBulkUnpublish}
                      disabled={loading}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Unpublishing...' : 'Unpublish'}
                    </button>
                    <button
                      onClick={handleBulkToggleHeadline}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Toggle Headlines'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* News List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading articles...</h3>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                {activeTab === 'locked' ? (
                  <>
                    <Lock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No locked articles</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any articles locked for editing
                    </p>
                  </>
                ) : (
                  <>
                    <Globe className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No news found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedItems.length === filteredNews.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>Select All</span>
                  </button>
                </div>

                {/* News Items */}
                {filteredNews.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const lockedByAdmin = item.lockedBy ? getLockedByAdmin(item.lockedBy) : null;
                  const isLockedByCurrentUser = item.lockedBy === user?.id;
                  const isLocked = !!item.lockedBy;

                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        'border rounded-lg p-4 transition-all',
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleSelectItem(item.id)}
                          className="mt-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {item.twoLineSummary}
                              </p>
                              
                              {/* Metadata */}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDate(item.createdAt)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {item.category}
                                </span>
                                {/* Show language indicator in locked tab */}
                                {activeTab === 'locked' && (
                                  <span className={clsx(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    item.language === 'english' 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-green-100 text-green-800"
                                  )}>
                                    {item.language === 'english' ? 'EN' : 'HI'}
                                  </span>
                                )}
                                {item.isHeadline && (
                                  <span className="flex items-center text-yellow-600">
                                    <Star className="w-3 h-3 mr-1" />
                                    Headline
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status and Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {/* Lock Status */}
                              {isLocked && (
                                <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded" title={isLockedByCurrentUser ? 'You are editing this article' : `Locked by ${lockedByAdmin?.username || lockedByAdmin?.email || item.lockedBy}`}>
                                  <Lock className="w-3 h-3" />
                                  <span>
                                    {isLockedByCurrentUser
                                      ? 'Locked by You'
                                      : `Locked by ${lockedByAdmin?.username || lockedByAdmin?.email || item.lockedBy}`}
                                  </span>
                                </div>
                              )}

                              {/* Publish Status */}
                              <div className={clsx(
                                'flex items-center space-x-1 text-xs px-2 py-1 rounded',
                                item.isPublished
                                  ? 'text-green-600 bg-green-50'
                                  : 'text-gray-600 bg-gray-50'
                              )}>
                                {item.isPublished ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Published</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Unpublished</span>
                                  </>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1">
                                <Link
                                  href={`/admin/news/${item.id}`}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  disabled={isLocked && !isLockedByCurrentUser || lockingId === item.id}
                                  className={clsx(
                                    'p-1 transition-colors',
                                    isLocked && !isLockedByCurrentUser
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-400 hover:text-green-600',
                                    lockingId === item.id && 'opacity-50 cursor-wait'
                                  )}
                                  title={isLocked && !isLockedByCurrentUser ? `Locked by ${lockedByAdmin?.username}` : 'Edit'}
                                >
                                  {lockingId === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Edit className="w-4 h-4" />
                                  )}
                                </button>
                                {/* Show unlock button only in locked tab and only for articles locked by current user */}
                                {activeTab === 'locked' && isLockedByCurrentUser && (
                                  <button
                                    onClick={() => handleUnlockClick(item.id)}
                                    disabled={lockingId === item.id}
                                    className={clsx(
                                      'p-1 transition-colors text-gray-400 hover:text-orange-600',
                                      lockingId === item.id && 'opacity-50 cursor-wait'
                                    )}
                                    title="Unlock Article"
                                  >
                                    {lockingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Lock className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    if (item.lockedBy && item.lockedBy !== user?.id) {
                                      setLockModal({ open: true, lockedBy: item.lockedBy });
                                    } else {
                                      handleTogglePublish(item.id, item.isPublished);
                                    }
                                  }}
                                  disabled={loading}
                                  className={clsx(
                                    "p-1 transition-colors disabled:opacity-50",
                                    item.isPublished 
                                      ? "text-gray-400 hover:text-yellow-600" 
                                      : "text-gray-400 hover:text-green-600",
                                    (item.lockedBy && item.lockedBy !== user?.id) && 'cursor-not-allowed opacity-60'
                                  )}
                                  title={item.isPublished ? "Unpublish" : "Publish"}
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleHeadline(item.id, item.isHeadline)}
                                  disabled={loading}
                                  className={clsx(
                                    "p-1 transition-colors disabled:opacity-50",
                                    item.isHeadline 
                                      ? "text-yellow-500 hover:text-yellow-600" 
                                      : "text-gray-400 hover:text-yellow-500"
                                  )}
                                  title={item.isHeadline ? "Remove Headline" : "Make Headline"}
                                >
                                  <Star className={clsx("w-4 h-4", item.isHeadline && "fill-current")} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages} 
                  ({pagination.totalArticles} total articles)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadArticles(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1 || loading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadArticles(pageNum)}
                          disabled={loading}
                          className={clsx(
                            "px-3 py-2 text-sm font-medium rounded-lg disabled:cursor-not-allowed",
                            pageNum === pagination.currentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => loadArticles(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages || loading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      {lockModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Locked</h3>
            <p className="text-gray-700 mb-4">
              This article is currently locked by <span className="font-bold">{(() => {
                const lockedByAdmin = lockModal.lockedBy ? getLockedByAdmin(lockModal.lockedBy) : null;
                return lockedByAdmin?.username || lockedByAdmin?.email || lockModal.lockedBy;
              })()}</span>.<br/>
              You cannot publish or unpublish it until it is unlocked.
            </p>
            <button
              onClick={() => setLockModal({ open: false, lockedBy: null })}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default NewsListPage; 