import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const roleMap: Record<number, User['role']> = {
  3: 'Admin',
  2: 'Staff',
  1: 'Customer',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Use the numeric role directly for mapping
        const numericRole = Number(parsedUser.role);
        const convertedUser: User = {
          ...parsedUser,
          role: roleMap[numericRole] ?? 'Customer',
        };
        setToken(storedToken);
        setUser(convertedUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      // Backend sends role as number, map it to string union
      const numericRole = Number(response.user.role);
      const convertedUser: User = {
        ...response.user,
        role: roleMap[numericRole] ?? 'Customer',
      };
      setToken(response.token);
      setUser(convertedUser);
      // Store the numeric role, not the mapped string
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({ ...response.user, role: numericRole }));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    hasRole,
    hasPermission,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
  