'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockAdmins } from '@/data/mockData';
import { AdminUser } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Key,
  Mail,
  UserPlus,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

const AdminManagementPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'admin' as 'admin' | 'superadmin',
    password: '',
    confirmPassword: '',
  });

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

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const newAdmin: AdminUser = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      role: formData.role,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setAdmins([...admins, newAdmin]);
    setShowAddModal(false);
    setFormData({
      username: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    });
  };

  const handleEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    const updatedAdmins = admins.map(admin =>
      admin.id === selectedAdmin.id
        ? {
            ...admin,
            username: formData.username,
            email: formData.email,
            role: formData.role,
          }
        : admin
    );

    setAdmins(updatedAdmins);
    setShowEditModal(false);
    setSelectedAdmin(null);
    setFormData({
      username: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Mock password change
    console.log('Changing password for admin:', selectedAdmin?.id);
    setShowPasswordModal(false);
    setSelectedAdmin(null);
    setFormData({
      username: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (adminId === user?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter(admin => admin.id !== adminId));
    }
  };

  const handleToggleStatus = (adminId: string) => {
    if (adminId === user?.id) {
      alert('You cannot deactivate your own account');
      return;
    }

    const updatedAdmins = admins.map(admin =>
      admin.id === adminId
        ? { ...admin, isActive: !admin.isActive }
        : admin
    );
    setAdmins(updatedAdmins);
  };

  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      username: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    });
    setShowPasswordModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
              <p className="text-gray-600 mt-1">
                Manage admin users and their permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className={clsx(
                    'border rounded-lg p-6 transition-all',
                    admin.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        admin.role === 'superadmin' ? 'bg-purple-100' : 'bg-blue-100'
                      )}>
                        {admin.role === 'superadmin' ? (
                          <Shield className="w-5 h-5 text-purple-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{admin.username}</h3>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        admin.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="capitalize">{admin.role}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Joined {formatDate(admin.createdAt)}</span>
                    </div>
                    {admin.lastLogin && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Last login {formatDate(admin.lastLogin)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => openPasswordModal(admin)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Password
                    </button>
                    {admin.id !== user?.id && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(admin.id)}
                          className={clsx(
                            'px-3 py-2 text-sm rounded transition-colors',
                            admin.isActive
                              ? 'text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                              : 'text-green-600 border border-green-300 hover:bg-green-50'
                          )}
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredAdmins.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'superadmin' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Admin</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'superadmin' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Password for {selectedAdmin.username}
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminManagementPage; 