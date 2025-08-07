import React, { useState, useEffect } from 'react';

interface BackendLoadingProps {
  onBackendReady: () => void;
}

const BackendLoading: React.FC<BackendLoadingProps> = ({ onBackendReady }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState('');

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://study-tracker-htgk.onrender.com';
  };

  const checkBackendHealth = async () => {
    try {
      const backendUrl = getBackendUrl();
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      const text = await response.text();
      
      // If we get "Cannot GET /" response, it means the server is running
      if (text.includes('Cannot GET /') || response.status === 404) {
        setIsChecking(false);
        onBackendReady();
      } else {
        // If we got any response, server is likely up
        setIsChecking(false);
        onBackendReady();
      }
    } catch (err) {
      console.error('Backend health check failed:', err);
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
};

export default BackendLoading;
