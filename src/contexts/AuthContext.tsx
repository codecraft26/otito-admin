'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AuthContextType, LoginResponse } from '@/types';
import { adminLogin, superadminLogin } from '@/data/adminApi';

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

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('admin-user');
    const savedToken = localStorage.getItem('admin-token');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('admin-user');
        localStorage.removeItem('admin-token');
      }
    }
    setIsLoading(false);
  }, []);

  // Accepts either username or email for login
  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Determine if superadmin or admin login (simple heuristic: if contains '@', treat as email)
      let response: LoginResponse;
      if (usernameOrEmail.includes('@')) {
        // Try superadmin login first
        response = await superadminLogin(usernameOrEmail, password);
        if (!response.success) {
          // If not superadmin, try admin login
          response = await adminLogin(usernameOrEmail, password);
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin-user');
    localStorage.removeItem('admin-token');
  };

  const value: AuthContextType & { token: string | null } = {
    user,
    login,
    logout,
    isLoading,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 