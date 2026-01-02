/**
 * Authentication Context
 * Manages user authentication state (Guest, User, Admin)
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'guest' | 'user' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
  playerId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isGuest: () => boolean;
  isUser: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setState({
          user: {
            username: userData.username,
            role: userData.role as UserRole,
            playerId: userData.player_id,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Invalid token
        localStorage.removeItem('auth_token');
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Save token
      localStorage.setItem('auth_token', data.access_token);

      // Update state
      setState({
        user: {
          username: data.username,
          role: data.role as UserRole,
          playerId: data.player_id,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const isGuest = () => !state.isAuthenticated;
  const isUser = () => state.user?.role === 'user';
  const isAdmin = () => state.user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isGuest,
        isUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
