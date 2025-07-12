'use client';

import { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockNewsItems, mockAdmins } from '@/data/mockData';
import { NewsItem } from '@/types';
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
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

const NewsListPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hindi' | 'english'>('english');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  const filteredNews = useMemo(() => {
    return mockNewsItems.filter(item => {
      const matchesLanguage = item.language === activeTab;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPublished = !showPublishedOnly || item.isPublished;
      return matchesLanguage && matchesSearch && matchesPublished;
    });
  }, [activeTab, searchTerm, showPublishedOnly]);

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

  const handleBulkPublish = () => {
    // Mock bulk publish functionality
    console.log('Publishing items:', selectedItems);
    setSelectedItems([]);
  };

  const handleBulkUnpublish = () => {
    // Mock bulk unpublish functionality
    console.log('Unpublishing items:', selectedItems);
    setSelectedItems([]);
  };

  const getLockedByAdmin = (adminId: string) => {
    return mockAdmins.find(admin => admin.id === adminId);
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
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/news/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add News
              </Link>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('english')}
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
                onClick={() => setActiveTab('hindi')}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'hindi'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Hindi News
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPublishedOnly}
                    onChange={(e) => setShowPublishedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Published only</span>
                </label>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} selected
                  </span>
                  <button
                    onClick={handleBulkPublish}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={handleBulkUnpublish}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                  >
                    Unpublish
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* News List */}
          <div className="p-6">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No news found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
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
                                <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                  <Lock className="w-3 h-3" />
                                  <span>
                                    {isLockedByCurrentUser ? 'You' : lockedByAdmin?.username}
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
                                    <span>Draft</span>
                                  </>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1">
                                <Link
                                  href={`/admin/news/${item.id}`}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/admin/news/${item.id}/edit`}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsListPage; 