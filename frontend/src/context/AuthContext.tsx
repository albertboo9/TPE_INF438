import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, UserProfile, LoginResponse } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setAccessToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Failed to parse saved user credentials', err);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Event listener for token expiration triggered by the api client
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const data = await apiClient.login(username, password);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAccessToken(data.accessToken);
      setUser(data.user);
      
      return data;
    } catch (err) {
      logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setAccessToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
