'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockNewsItems, mockAdmins } from '@/data/mockData';
import { NewsItem } from '@/types';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Star,
  Lock,
  Unlock,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Facebook,
  Twitter,
  Copy,
  ExternalLink,
  Tag,
  Calendar,
  Globe,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

const NewsDetailPage = () => {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const item = mockNewsItems.find(news => news.id === id);
    if (item) {
      setNewsItem(item);
      setIsLocked(!!item.lockedBy);
      
      // Simulate locking the item for current user
      if (!item.lockedBy) {
        // Mock API call to lock the item
        console.log('Locking item for user:', user?.id);
        setIsLocked(true);
      }
    }
  }, [params.id, user?.id]);

  const handlePublish = () => {
    if (!newsItem) return;
    // Mock publish functionality
    console.log('Publishing news item:', newsItem.id);
    setNewsItem({
      ...newsItem,
      isPublished: true,
      publishedAt: new Date().toISOString()
    });
  };

  const handleUnpublish = () => {
    if (!newsItem) return;
    // Mock unpublish functionality
    console.log('Unpublishing news item:', newsItem.id);
    setNewsItem({
      ...newsItem,
      isPublished: false,
      publishedAt: undefined
    });
  };

  const handleToggleHeadline = () => {
    if (!newsItem) return;
    // Mock toggle headline functionality
    console.log('Toggling headline status:', newsItem.id);
    setNewsItem({
      ...newsItem,
      isHeadline: !newsItem.isHeadline
    });
  };

  const handleShareTwitter = () => {
    if (!newsItem) return;
    const text = encodeURIComponent(`${newsItem.title} - ${newsItem.twoLineSummary}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareFacebook = () => {
    if (!newsItem) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLockedByAdmin = (adminId: string) => {
    return mockAdmins.find(admin => admin.id === adminId);
  };

  if (!newsItem) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news item...</p>
        </div>
      </AdminLayout>
    );
  }

  const lockedByAdmin = newsItem.lockedBy ? getLockedByAdmin(newsItem.lockedBy) : null;
  const isLockedByCurrentUser = newsItem.lockedBy === user?.id;
  const canEdit = !newsItem.lockedBy || isLockedByCurrentUser;

  return (
    <AdminLayout>
      <div className="space-y-6">
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
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              {canEdit && (
                <Link
                  href={`/admin/news/${newsItem.id}/edit`}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              )}
              <button className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Lock Status */}
        {newsItem.lockedBy && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {isLockedByCurrentUser 
                    ? 'You have locked this article for editing'
                    : `This article is being edited by ${lockedByAdmin?.username}`
                  }
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Locked since {formatDate(newsItem.lockedAt!)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    newsItem.language === 'hindi' 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  )}>
                    {newsItem.language === 'hindi' ? 'हिंदी' : 'English'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {newsItem.category}
                  </span>
                </div>
                <button
                  onClick={handleToggleHeadline}
                  className={clsx(
                    'flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    newsItem.isHeadline
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Star className={clsx('w-4 h-4 mr-1', newsItem.isHeadline && 'fill-current')} />
                  {newsItem.isHeadline ? 'Remove Headline' : 'Make Headline'}
                </button>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {newsItem.title}
              </h1>

              {newsItem.imageUrl && (
                <div className="mb-6">
                  <img
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Two Line Summary</h3>
                  <p className="text-gray-700">{newsItem.twoLineSummary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Four Line Summary</h3>
                  <p className="text-gray-700">{newsItem.fourLineSummary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Swipe Summary</h3>
                  <p className="text-gray-700">{newsItem.swipeSummary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Description</h3>
                  <p className="text-gray-700 leading-relaxed">{newsItem.fullDescription}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{newsItem.originalDescription}</p>
                </div>

                {newsItem.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {newsItem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Status</h3>
              
              <div className={clsx(
                'flex items-center space-x-3 p-3 rounded-lg mb-4',
                newsItem.isPublished ? 'bg-green-50' : 'bg-gray-50'
              )}>
                {newsItem.isPublished ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Published</p>
                      <p className="text-sm text-green-600">
                        {formatDate(newsItem.publishedAt!)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">Draft</p>
                      <p className="text-sm text-gray-600">Not published yet</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {newsItem.isPublished ? (
                  <button
                    onClick={handleUnpublish}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish Now
                  </button>
                )}
              </div>
            </div>

            {/* Article Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created: {formatDate(newsItem.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Updated: {formatDate(newsItem.updatedAt)}</span>
                </div>
                {newsItem.sourceUrl && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <a
                      href={newsItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      Source Article
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Article</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleShareTwitter}
                  className="w-full flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 mr-3" />
                  Share on Twitter
                </button>
                
                <button
                  onClick={handleShareFacebook}
                  className="w-full flex items-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Facebook className="w-5 h-5 mr-3" />
                  Share on Facebook
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NewsDetailPage; 