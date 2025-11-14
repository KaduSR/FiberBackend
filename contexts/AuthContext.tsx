import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';
import type { IXCAuthResponse } from '@/types/ixc';

interface AuthContextType {
  user: IXCAuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@fibernet:auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IXCAuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const userData: IXCAuthResponse = JSON.parse(stored);
        setUser(userData);
        // Restore token in API client
        if (userData.token) {
          const { ixcApi } = await import('@/services/ixcApi');
          ixcApi.setToken(userData.token);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use mock login for development
      // Replace with authService.login() in production
      const response = await authService.mockLogin(email, password);
      
      setUser(response);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      authService.logout();
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUser = async () => {
    // Implement user data refresh if needed
    // This could fetch updated contract status, etc.
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
