'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/data/adminApi';
import { DashboardStatsData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Newspaper,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  BarChart3,
  Loader2,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { clsx } from 'clsx';

const StatsPage = () => {
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
    loadDashboardStats();
  }, [token]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard statistics...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Statistics</h3>
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
      change: stats.overview.totalNews.percentageChange,
      changeType: stats.overview.totalNews.percentageChange > 0 ? 'increase' : stats.overview.totalNews.percentageChange < 0 ? 'decrease' : 'neutral',
    },
    {
      title: 'Published',
      value: stats.overview.published.count,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: stats.overview.published.percentageChange,
      changeType: stats.overview.published.percentageChange > 0 ? 'increase' : stats.overview.published.percentageChange < 0 ? 'decrease' : 'neutral',
    },
    {
      title: 'Unpublished',
      value: stats.overview.unpublished.count,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: stats.overview.unpublished.percentageChange,
      changeType: stats.overview.unpublished.percentageChange > 0 ? 'increase' : stats.overview.unpublished.percentageChange < 0 ? 'decrease' : 'neutral',
    },
    {
      title: 'Headlines',
      value: stats.overview.headlines.count,
      icon: Star,
      color: 'bg-purple-500',
      change: stats.overview.headlines.percentageChange,
      changeType: stats.overview.headlines.percentageChange > 0 ? 'increase' : stats.overview.headlines.percentageChange < 0 ? 'decrease' : 'neutral',
    },
    {
      title: 'Total Admins',
      value: stats.overview.totalAdmins.count,
      icon: Users,
      color: 'bg-indigo-500',
      change: stats.overview.totalAdmins.percentageChange,
      changeType: stats.overview.totalAdmins.percentageChange > 0 ? 'increase' : stats.overview.totalAdmins.percentageChange < 0 ? 'decrease' : 'neutral',
    },
    {
      title: 'Today\'s News',
      value: stats.overview.todayNews.count,
      icon: Calendar,
      color: 'bg-orange-500',
      change: stats.overview.todayNews.percentageChange,
      changeType: stats.overview.todayNews.percentageChange > 0 ? 'increase' : stats.overview.todayNews.percentageChange < 0 ? 'decrease' : 'neutral',
    },
  ];

  const formatPercentageChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  };

  const getTrendIcon = (changeType: string) => {
    if (changeType === 'increase') return <TrendingUp className="w-3 h-3" />;
    if (changeType === 'decrease') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive analytics and insights for your news portal
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
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={clsx(
                        'text-sm font-medium flex items-center gap-1',
                        card.changeType === 'increase' ? 'text-green-600' :
                        card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {getTrendIcon(card.changeType)}
                        {formatPercentageChange(card.change)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
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
              <div className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium',
                stats.autoPublishMode 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              )}>
                {stats.autoPublishMode ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly News Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly News Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="published" fill="#10B981" name="Published" />
                <Bar dataKey="unpublished" fill="#F59E0B" name="Unpublished" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalNews" stroke="#3B82F6" name="Total News" strokeWidth={2} />
                <Line type="monotone" dataKey="headlines" stroke="#EF4444" name="Headlines" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">News by Category</h3>
            {stats.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ category, percentage }) => percentage > 5 ? `${category} ${percentage}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.categoryDistribution.map((entry, index) => {
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Articles']} />
                  <Legend 
                    formatter={(value) => value}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
            {stats.languageDistribution && stats.languageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.languageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ language, percentage }) => `${language} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.languageDistribution.map((entry, index) => {
                      const colors = ['#3B82F6', '#F59E0B'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Articles']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No language data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.performanceMetrics.publicationRate}%</p>
              <p className="text-sm text-gray-600">Publication Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.performanceMetrics.avgProcessingTime}h</p>
              <p className="text-sm text-gray-600">Avg. Processing Time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{(stats.performanceMetrics.totalReaders / 1000).toFixed(1)}K</p>
              <p className="text-sm text-gray-600">Total Readers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.performanceMetrics.avgRating}</p>
              <p className="text-sm text-gray-600">Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">This Week</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.activitySummary.thisWeekPublished}</p>
                  <p className="text-xs text-blue-600">News Published</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">This Month</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activitySummary.thisMonthPublished}</p>
                  <p className="text-xs text-green-600">News Published</p>
                </div>
                <Newspaper className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Active Headlines</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.activitySummary.activeHeadlines}</p>
                  <p className="text-xs text-purple-600">Featured Stories</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">System Admins</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.activitySummary.systemAdmins}</p>
                  <p className="text-xs text-orange-600">Active Users</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatsPage; 