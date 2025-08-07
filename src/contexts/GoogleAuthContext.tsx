import React, { createContext, useContext, useEffect, useState } from 'react';

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<GoogleUser | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useGoogleAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useGoogleAuth must be used within AuthProvider');
  return ctx;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/login';

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restore from localStorage
    const savedToken = localStorage.getItem('google_token');
    const savedUser = localStorage.getItem('google_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // Handle OAuth redirect
    const hash = window.location.hash;
    if (hash && hash.includes('id_token')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const idToken = params.get('id_token');
      if (idToken) {
        setToken(idToken);
        try {
          const user = JSON.parse(atob(idToken.split('.')[1]));
          setUser(user);
          localStorage.setItem('google_token', idToken);
          localStorage.setItem('google_user', JSON.stringify(user));
          window.location.hash = '';
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('google_token', token);
      localStorage.setItem('google_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('google_token');
      localStorage.removeItem('google_user');
    }
  }, [token, user]);

  const login = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Client ID is not set. Please check your .env file.');
      return;
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).substring(2),
      prompt: 'select_account',
      response_mode: 'fragment',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}; 