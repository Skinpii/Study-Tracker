import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, useGoogleAuth } from './contexts/GoogleAuthContext';
import { PageProvider } from './contexts/PageContext';
import Dashboard from './Dashboard';
import GoogleLoginForm from './components/GoogleLoginForm';
import Loader from './components/Loader';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Backend health check component
const BackendHealthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState('');

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://study-tracker-htgk.onrender.com';
  };

  const isLocalDevelopment = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  };

  const checkBackendHealth = async () => {
    // Only run backend health check when deployed online (not localhost)
    if (isLocalDevelopment()) {
      console.log('Local development detected, skipping backend health check');
      setIsChecking(false);
      setIsBackendReady(true);
      setError(null);
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      console.log('Checking backend health at:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      console.log('Backend response status:', response.status);
      const text = await response.text();
      
      // If we get "Cannot GET /" response or any response, it means the server is running
      if (text.includes('Cannot GET /') || response.status === 404 || (response.status >= 200 && response.status < 600)) {
        console.log('Backend is ready!');
        setIsChecking(false);
        setIsBackendReady(true);
        setError(null);
      } else {
        setIsChecking(false);
        setIsBackendReady(true);
        setError(null);
      }
    } catch (err) {
      console.error('Backend health check failed:', err);
      
      // Check if it's a CORS error (which actually means the server is responding)
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        console.log('CORS error detected - backend is likely running!');
        setIsChecking(false);
        setIsBackendReady(true);
        setError(null);
        return;
      }
      
      setError('Backend is starting up, please wait...');
      
      // Retry after 3 seconds if backend is not ready
      setTimeout(() => {
        setError(null);
        checkBackendHealth();
      }, 3000);
    }
  };

  // Animate dots for loading effect
  useEffect(() => {
    if (isChecking || error) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isChecking, error]);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  if (!isBackendReady) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000000ff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <Loader />
        
        <h2 style={{
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: '500',
          marginTop: '2rem',
          marginBottom: '0.5rem'
        }}>
          Starting Backend
        </h2>
        
        <p style={{
          color: '#cccccc',
          fontSize: '1rem',
          marginTop: '0.5rem'
        }}>
          Please wait while we connect to the server{dots}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useGoogleAuth();
  
  // Require authentication for all users
  if (!user) return <GoogleLoginForm />;
  
  return (
    <>
      <Dashboard />
    </>
  );
};

function LoginHandler() {
  const { setUser, setToken } = useGoogleAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
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
        } catch {}
        window.location.hash = '';
        navigate('/');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [setUser, setToken, navigate]);
  return <div>Logging in...</div>;
}

const App: React.FC = () => (
  <BackendHealthCheck>
    <GoogleAuthProvider>
      <PageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginHandler />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </PageProvider>
    </GoogleAuthProvider>
  </BackendHealthCheck>
);

export default App;
