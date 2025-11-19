
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInCpf: (cpf: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = '@FiberApp:user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Erro ao restaurar sessão", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signInCpf = async (cpf: string) => {
    setIsLoading(true);
    try {
      const data: AuthResponse = await authService.loginCpf(cpf);
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      navigate('/'); // Redireciona para Dashboard
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authService.logout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInCpf, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
