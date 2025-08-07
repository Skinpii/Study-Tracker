import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackendHealthContextType {
  isBackendReady: boolean;
  isChecking: boolean;
  error: string | null;
  checkBackendHealth: () => Promise<void>;
}

const BackendHealthContext = createContext<BackendHealthContextType | undefined>(undefined);

export const useBackendHealth = () => {
  const context = useContext(BackendHealthContext);
  if (!context) {
    throw new Error('useBackendHealth must be used within a BackendHealthProvider');
  }
  return context;
};

interface BackendHealthProviderProps {
  children: React.ReactNode;
}

export const BackendHealthProvider: React.FC<BackendHealthProviderProps> = ({ children }) => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://study-tracker-htgk.onrender.com';
  };

  const checkBackendHealth = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const backendUrl = getBackendUrl();
      
      // Try to fetch the root endpoint - if it returns "Cannot GET /" it means backend is running
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      const text = await response.text();
      
      // If we get "Cannot GET /" response, it means the server is running
      if (text.includes('Cannot GET /')) {
        setIsBackendReady(true);
        setError(null);
      } else {
        // Try a different approach - check if server responds at all
        setIsBackendReady(true); // If we got any response, server is likely up
        setError(null);
      }
    } catch (err) {
      console.error('Backend health check failed:', err);
      setError('Backend is not responding. Please wait while it starts up...');
      setIsBackendReady(false);
      
      // Retry after 3 seconds if backend is not ready
      setTimeout(() => {
        checkBackendHealth();
      }, 3000);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const value = {
    isBackendReady,
    isChecking,
    error,
    checkBackendHealth,
  };

  return (
    <BackendHealthContext.Provider value={value}>
      {children}
    </BackendHealthContext.Provider>
  );
};
