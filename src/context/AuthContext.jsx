import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * ==============================================================================
 * Central Authentication Context & Provider
 * ==============================================================================
 * Manages user session state, JWT persistence in localStorage, and initial hydration.
 */

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user profile on initial app load if a token is present
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (isMounted) {
          const userData = response.data?.data?.user || response.data?.user;
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        // Token expired or invalid
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCurrentUser();

    // Listen for 401 Unauthorized events from Axios interceptors
    const handleAuthExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier,
      password,
    });

    const payload = response.data?.data || response.data;
    const receivedToken = payload.token;
    const receivedUser = payload.user;

    localStorage.setItem(TOKEN_KEY, receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  }, []);

  const signup = useCallback(async (signupData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, signupData);

    const payload = response.data?.data || response.data;
    const receivedToken = payload.token;
    const receivedUser = payload.user;

    localStorage.setItem(TOKEN_KEY, receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
