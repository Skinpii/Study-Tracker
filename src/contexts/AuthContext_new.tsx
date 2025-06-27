import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { authService } from '../lib/authService';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication methods using authService
  async function register(email: string, password: string, displayName: string) {
    await authService.signUpWithEmail(email, password, displayName);
  }

  async function login(email: string, password: string) {
    await authService.signInWithEmail(email, password);
  }

  async function loginWithGoogle() {
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await authService.resetPassword(email);
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    await authService.updateUserPassword(currentPassword, newPassword);
  }

  async function updateProfile(displayName?: string, photoURL?: string) {
    await authService.updateUserProfile(displayName, photoURL);
  }

  async function sendVerificationEmail() {
    await authService.sendVerificationEmail();
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    sendVerificationEmail,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
