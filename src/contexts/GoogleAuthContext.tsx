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
      return;
    }

    // Handle OAuth redirect first (for real Google login)
    const hash = window.location.hash;
    if (hash && hash.includes('id_token')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const idToken = params.get('id_token');
      if (idToken) {
        setToken(idToken);
        try {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          // Use real Google user info with their actual user ID
          const user = {
            sub: payload.sub, // Use real Google user ID so each user has their own data
            email: payload.email,
            name: payload.name,
            picture: payload.picture
          };
          setUser(user);
          localStorage.setItem('google_token', idToken);
          localStorage.setItem('google_user', JSON.stringify(user));
          window.location.hash = '';
        } catch {}
      }
      return;
    }

    // FALLBACK: Use dev token only if no Google login and in allowed environments
    if (process.env.NODE_ENV === 'development' || 
        window.location.hostname === 'localhost' ||
        window.location.hostname.includes('onrender.com')) {
      const mockUser = {
        sub: 'dev-user-123',
        email: 'devuser@example.com',
        name: 'Dev User',
        picture: 'https://ui-avatars.com/api/?name=Dev+User&background=2C2C2C&color=fff',
      };
      const mockToken = 'dev-token-123';
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('google_token', mockToken);
      localStorage.setItem('google_user', JSON.stringify(mockUser));
      return;
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

  // Auto-logout when user leaves the website
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear authentication when user closes/leaves the website
      localStorage.removeItem('google_token');
      localStorage.removeItem('google_user');
    };

    const handleVisibilityChange = () => {
      // Auto-logout when user switches to another tab for extended period
      if (document.visibilityState === 'hidden') {
        // Set a timeout to logout after 5 minutes of being away
        const timeoutId = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            logout();
          }
        }, 5 * 60 * 1000); // 5 minutes

        // Store timeout ID to clear it if user comes back
        (window as any).logoutTimeoutId = timeoutId;
      } else if (document.visibilityState === 'visible') {
        // Clear the logout timeout if user comes back
        if ((window as any).logoutTimeoutId) {
          clearTimeout((window as any).logoutTimeoutId);
          delete (window as any).logoutTimeoutId;
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear any pending logout timeout
      if ((window as any).logoutTimeoutId) {
        clearTimeout((window as any).logoutTimeoutId);
        delete (window as any).logoutTimeoutId;
      }
    };
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
