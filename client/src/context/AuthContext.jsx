import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stugig_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('stugig_token'));

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('stugig_token', data.token);
    localStorage.setItem('stugig_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    const { data } = await client.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('stugig_token', data.token);
    localStorage.setItem('stugig_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('stugig_token');
    localStorage.removeItem('stugig_user');
    setToken(null);
    setUser(null);
  }, []);

  // Update the stored user object in-place (e.g. after profile edit)
  // Does NOT make a network request — just syncs state + localStorage.
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...JSON.parse(localStorage.getItem('stugig_user') || '{}'), ...updatedUser };
    localStorage.setItem('stugig_user', JSON.stringify(merged));
    setUser(merged);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser, isAuthenticated, isFreelancer, isClient, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
