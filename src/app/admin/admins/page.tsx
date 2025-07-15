'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createAdmin, deactivateAdmin, changeAdminRole, getAllAdmins } from '@/data/adminApi';
import { AdminUser } from '@/types';
import {
  Plus,
  Trash2,
  Shield,
  User,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

const AdminManagementPage = () => {
  const { user, token } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'superadmin',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      if (!token) return;
      try {
        const res = await getAllAdmins(token);
        if (res.success && Array.isArray(res.admins)) {
          // Normalize admin objects to always have username and email
          const normalizedAdmins = res.admins.map((a: any) => {
            // Try to get a valid id: id, _id, or fallback to email (if unique)
            let id = a.id || a._id || a.email || '';
            if (!id) {
              // As a last resort, use username
              id = a.username || a.name || Math.random().toString(36).substr(2, 9);
            }
            return {
              ...a,
              id,
              username: a.username || a.name || '',
              email: a.email || '',
            };
          });
          setAdmins(normalizedAdmins);
        } else {
          setAdmins([]);
        }
      } catch (err) {
        setAdmins([]);
      }
    };
    fetchAdmins();
  }, [token]);

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

  // Debug: log admins array
  console.log('Admins:', admins);

  const filteredAdmins = admins.filter(admin => {
    const username = admin.username || '';
    const email = admin.email || '';
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await createAdmin(token, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.admin) {
        const newAdmin: AdminUser = {
          id: response.admin.id,
          username: response.admin.name,
          email: response.admin.email,
          role: response.admin.role,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        setAdmins([...admins, newAdmin]);
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          role: 'admin',
          password: '',
          confirmPassword: '',
        });
      } else {
        setError(response.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      setError('Failed to create admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!adminId) {
      alert('Invalid admin ID');
      return;
    }
    if (adminId === user?.id) {
      alert('You cannot delete your own account');
      return;
    }
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      // Assuming backend supports DELETE /api/superadmin/admin/:id
      const res = await fetch(`http://localhost:5001/api/superadmin/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(admins.filter(admin => admin.id !== adminId));
        alert('Admin deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete admin.');
      }
    } catch (err) {
      alert('Failed to delete admin.');
    }
  };

  const handleChangeRole = async (adminId: string, newRole: 'admin' | 'superadmin') => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to change this admin's role to ${newRole}?`)) return;
    try {
      const res = await changeAdminRole(token, adminId, newRole);
      if (res.success) {
        setAdmins(admins.map(a => a.id === adminId ? { ...a, role: newRole } : a));
        alert('Admin role updated successfully.');
      } else {
        alert(res.message || 'Failed to update admin role.');
      }
    } catch (err) {
      alert('Failed to update admin role.');
    }
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

                  <div className="flex flex-wrap gap-2 items-center pt-2">
                    {/* Only show the toggle role button for superadmins */}
                    {user?.role === 'superadmin' && admin.id !== user.id && (
                      <button
                        onClick={() => handleChangeRole(admin.id, admin.role === 'admin' ? 'superadmin' : 'admin')}
                        className="min-w-[110px] flex-1 flex items-center justify-center px-3 py-2 text-sm text-purple-600 border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                      >
                        {admin.role === 'admin' ? 'Make Superadmin' : 'Make Admin'}
                      </button>
                    )}
                    {admin.id && admin.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="min-w-[110px] flex-1 px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'superadmin' })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Add Admin'
                    )}
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
      </div>
    </AdminLayout>
  );
};

export default AdminManagementPage; 