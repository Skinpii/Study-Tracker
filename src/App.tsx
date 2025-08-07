import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, useGoogleAuth } from './contexts/GoogleAuthContext';
import Dashboard from './Dashboard';
import GoogleLoginForm from './components/GoogleLoginForm';
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
    // Skip backend health check for local development
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
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '0 1rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          
          <h2 style={{
            color: '#333',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            {error ? 'Starting Backend' : 'Connecting to Backend'}
          </h2>
          
          <p style={{
            color: '#666',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            {error || `Checking backend connection${dots}`}
          </p>
          
          <div style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            Backend URL: {getBackendUrl()}
          </div>
          
          <button
            onClick={() => {
              console.log('User manually skipped backend check');
              setIsChecking(false);
              setIsBackendReady(true);
              setError(null);
            }}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Continue Anyway
          </button>
        </div>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, logout } = useGoogleAuth();
  if (!user) return <GoogleLoginForm />;
  return (
    <>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        {user.picture && <img src={user.picture} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
        <span style={{ fontWeight: 500, color: '#333', marginRight: 8 }}>{user.email}</span>
        <button className="logout-btn" onClick={logout} style={{ fontWeight: 500, padding: '0.5em 1.2em', borderRadius: 8, background: '#eee', color: '#444', border: '1px solid #ccc', cursor: 'pointer' }}>Logout</button>
      </div>
      <button
        onClick={logout}
        title="Logout"
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          margin: 0,
          padding: '0.5em 0.7em',
          borderRadius: '8px 0 0 0',
          background: '#eee',
          color: '#444',
          border: '1px solid #ccc',
          borderRight: 'none',
          borderBottom: 'none',
          fontSize: 18,
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          cursor: 'pointer',
        }}
      >
        ⎋
      </button>
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
      <Router>
        <Routes>
          <Route path="/login" element={<LoginHandler />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </GoogleAuthProvider>
  </BackendHealthCheck>
);

export default App;
