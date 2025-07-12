'use client';

import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockSystemStats } from '@/data/mockData';
import { 
  Newspaper, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const stats = mockSystemStats;

  const statsCards = [
    {
      title: 'Total News',
      value: stats.totalNews,
      icon: Newspaper,
      color: 'bg-blue-500',
      description: 'All news items'
    },
    {
      title: 'Published',
      value: stats.publishedNews,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Published articles'
    },
    {
      title: 'Unpublished',
      value: stats.unpublishedNews,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      description: 'Pending articles'
    },
    {
      title: 'Headlines',
      value: stats.totalHeadlines,
      icon: Star,
      color: 'bg-purple-500',
      description: 'Featured headlines'
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      icon: Users,
      color: 'bg-indigo-500',
      description: 'System administrators'
    },
    {
      title: 'Today\'s News',
      value: stats.newsPublishedToday,
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
            {user?.role === 'superadmin' && (
              <>
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
              </>
            )}
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