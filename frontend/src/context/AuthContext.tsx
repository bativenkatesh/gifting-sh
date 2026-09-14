import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('maison_lotus_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('maison_lotus_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('maison_lotus_user', JSON.stringify(user));
      localStorage.setItem('maison_lotus_token', token);
    } else {
      localStorage.removeItem('maison_lotus_user');
      localStorage.removeItem('maison_lotus_token');
    }
  }, [user, token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Invalid credentials. Please verify your email and password.',
        };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: 'Unable to reach the authentication server. Please ensure the backend is running.',
      };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Backend route is /signup
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error?.message || 'Registration failed. Please check your information.',
        };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: 'Unable to reach the authentication server. Please ensure the backend is running.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
