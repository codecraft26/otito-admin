'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/data/adminApi';
import { DashboardStatsData } from '@/types';
import { 
  Newspaper, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Settings,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardStats = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await getDashboardStats(token);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadDashboardStats();
    } else {
      // For regular admins, we don't need full dashboard stats
      setLoading(false);
    }
  }, [token, user?.role]);

  // For non-superadmin users, show a simpler dashboard
  if (user?.role !== 'superadmin') {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's your admin portal. Use the navigation to manage news articles.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/news"
                className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Newspaper className="w-5 h-5 mr-3" />
                  <span className="font-medium">Manage News Articles</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Dashboard statistics are not available.</p>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    {
      title: 'Total News',
      value: stats.overview.totalNews.count,
      icon: Newspaper,
      color: 'bg-blue-500',
      description: 'All news items'
    },
    {
      title: 'Published',
      value: stats.overview.published.count,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Published articles'
    },
    {
      title: 'Unpublished',
      value: stats.overview.unpublished.count,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      description: 'Pending articles'
    },
    {
      title: 'Headlines',
      value: stats.overview.headlines.count,
      icon: Star,
      color: 'bg-purple-500',
      description: 'Featured headlines'
    },
    {
      title: 'Total Admins',
      value: stats.overview.totalAdmins.count,
      icon: Users,
      color: 'bg-indigo-500',
      description: 'System administrators'
    },
    {
      title: 'Today\'s News',
      value: stats.overview.todayNews.count,
      icon: Calendar,
      color: 'bg-orange-500',
      description: 'Published today'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your news portal today.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadDashboardStats}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-Publish Mode Status */}
        {stats.autoPublishMode !== undefined && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Auto-Publish Mode</h3>
                <p className="text-gray-600 mt-1">
                  {stats.autoPublishMode 
                    ? 'New articles are automatically published'
                    : 'New articles require manual approval'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats.autoPublishMode 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stats.autoPublishMode ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/news"
              className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <Newspaper className="w-5 h-5 mr-3" />
                <span className="font-medium">Manage News</span>
              </div>
            </a>
            <a
              href="/admin/admins"
              className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span className="font-medium">Manage Admins</span>
              </div>
            </a>
            <a
              href="/admin/config"
              className="block w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium">System Config</span>
              </div>
            </a>
            <a
              href="/admin/stats"
              className="block w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-3" />
                <span className="font-medium">View Statistics</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 