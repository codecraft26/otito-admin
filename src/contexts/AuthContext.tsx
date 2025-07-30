'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser, AuthContextType, LoginResponse } from '@/types';
import { adminLogin, superadminLogin, setTokenExpirationHandler } from '@/data/adminApi';
import { useToast } from './ToastContext';

const AuthContext = createContext<(AuthContextType & { token: string | null }) | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  // Handle token expiration
  const handleTokenExpiration = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin-user');
    localStorage.removeItem('admin-token');
    showToast('warning', 'Your session has expired. Please login again.', 5000);
    router.push('/');
  };

  // Check token validity on app start and when token changes
  useEffect(() => {
    // Set up token expiration handler for API calls
    setTokenExpirationHandler(handleTokenExpiration);

    const checkTokenValidity = async () => {
      const savedUser = localStorage.getItem('admin-user');
      const savedToken = localStorage.getItem('admin-token');
      
      if (savedUser && savedToken) {
        try {
          const user = JSON.parse(savedUser);
          setUser(user);
          setToken(savedToken);
          
          // Validate token with backend
          const response = await fetch('http://localhost:5001/admin', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });
          
          if (!response.ok) {
            handleTokenExpiration();
            return;
          }
        } catch (error) {
          console.error('Error parsing saved user or validating token:', error);
          handleTokenExpiration();
          return;
        }
      }
      setIsLoading(false);
    };

    checkTokenValidity();
  }, [router]);

  // Accepts either username or email for login
  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // Determine if superadmin or admin login (simple heuristic: if contains '@', treat as email)
      let response: LoginResponse & { message?: string };
      if (usernameOrEmail.includes('@')) {
        // Try superadmin login first
        response = await superadminLogin(usernameOrEmail, password);
        if (!response.success) {
          // If not superadmin, try admin login
          const adminResponse = await adminLogin(usernameOrEmail, password);
          if (!adminResponse.success) {
            return { 
              success: false, 
              message: adminResponse.message || response.message || 'Invalid email or password' 
            };
          }
          response = adminResponse;
        }
      } else {
        // Try admin login with username as email (for demo, fallback to admin login)
        response = await adminLogin(usernameOrEmail, password);
      }
      
      if (response.success && response.token && response.admin) {
        
        // Normalize the user data to match our interface
        const normalizedUser: AdminUser = {
          id: response.admin.id,
          username: response.admin.name, // API returns 'name', we use as 'username'
          email: response.admin.email,
          role: response.admin.role,
          createdAt: new Date().toISOString(), // API doesn't return this, use current time
          isActive: true, // Assume active if they can login
        };
        
        setUser(normalizedUser);
        setToken(response.token);
        localStorage.setItem('admin-user', JSON.stringify(normalizedUser));
        localStorage.setItem('admin-token', response.token);
        
        showToast('success', 'Login successful!', 3000);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid email or password' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin-user');
    localStorage.removeItem('admin-token');
    showToast('info', 'You have been logged out successfully.', 3000);
    router.push('/');
  };

  const value: AuthContextType & { token: string | null } = {
    user,
    login,
    logout,
    isLoading,
    token,
    handleTokenExpiration, // Export this for use in other components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 