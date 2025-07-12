'use client';

import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSystemStats } from '@/data/mockData';
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
} from 'lucide-react';

const StatsPage = () => {
  const { user } = useAuth();
  const stats = mockSystemStats;

  // Mock data for charts
  const weeklyNewsData = [
    { day: 'Mon', published: 12, unpublished: 8 },
    { day: 'Tue', published: 15, unpublished: 5 },
    { day: 'Wed', published: 18, unpublished: 7 },
    { day: 'Thu', published: 22, unpublished: 6 },
    { day: 'Fri', published: 20, unpublished: 4 },
    { day: 'Sat', published: 16, unpublished: 9 },
    { day: 'Sun', published: 14, unpublished: 11 },
  ];

  const monthlyTrendData = [
    { month: 'Jan', news: 120, headlines: 8 },
    { month: 'Feb', news: 135, headlines: 12 },
    { month: 'Mar', news: 148, headlines: 15 },
    { month: 'Apr', news: 162, headlines: 18 },
    { month: 'May', news: 156, headlines: 12 },
    { month: 'Jun', news: 178, headlines: 22 },
  ];

  const categoryData = [
    { name: 'Politics', value: 35, color: '#3B82F6' },
    { name: 'Economy', value: 28, color: '#10B981' },
    { name: 'Technology', value: 22, color: '#F59E0B' },
    { name: 'Sports', value: 18, color: '#EF4444' },
    { name: 'Health', value: 15, color: '#8B5CF6' },
    { name: 'Others', value: 12, color: '#6B7280' },
  ];

  const languageData = [
    { name: 'English', value: 65, color: '#3B82F6' },
    { name: 'Hindi', value: 35, color: '#F59E0B' },
  ];

  const statsCards = [
    {
      title: 'Total News',
      value: stats.totalNews,
      icon: Newspaper,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Published',
      value: stats.publishedNews,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Unpublished',
      value: stats.unpublishedNews,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: '-3%',
      changeType: 'decrease',
    },
    {
      title: 'Headlines',
      value: stats.totalHeadlines,
      icon: Star,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase',
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      icon: Users,
      color: 'bg-indigo-500',
      change: '0%',
      changeType: 'neutral',
    },
    {
      title: 'Today\'s News',
      value: stats.newsPublishedToday,
      icon: Calendar,
      color: 'bg-orange-500',
      change: '+25%',
      changeType: 'increase',
    },
  ];

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
                      <span className={`text-sm font-medium ${
                        card.changeType === 'increase' ? 'text-green-600' :
                        card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {card.change}
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly News Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly News Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyNewsData}>
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
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="news" stroke="#3B82F6" name="Total News" strokeWidth={2} />
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-gray-600">Publication Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">2.3h</p>
              <p className="text-sm text-gray-600">Avg. Processing Time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">8.2K</p>
              <p className="text-sm text-gray-600">Total Readers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">4.7</p>
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
                  <p className="text-2xl font-bold text-blue-900">{stats.newsPublishedThisWeek}</p>
                  <p className="text-xs text-blue-600">News Published</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">This Month</p>
                  <p className="text-2xl font-bold text-green-900">{stats.newsPublishedThisMonth}</p>
                  <p className="text-xs text-green-600">News Published</p>
                </div>
                <Newspaper className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Active Headlines</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalHeadlines}</p>
                  <p className="text-xs text-purple-600">Featured Stories</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">System Admins</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.totalAdmins}</p>
                  <p className="text-xs text-orange-600">Active Users</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">API Status</p>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Uptime</p>
                <p className="text-sm text-blue-600">99.9% this month</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-800">Performance</p>
                <p className="text-sm text-purple-600">Excellent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatsPage; 