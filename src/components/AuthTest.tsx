// import React from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';

export function AuthTest() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', minHeight: '100vh', backgroundColor: '#282828' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <h1>Authentication Test Page</h1>
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h2>User Information</h2>
          <p><strong>Display Name:</strong> {currentUser.displayName || 'Not set'}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Photo URL:</strong> {currentUser.photoURL || 'Not set'}</p>
          <p><strong>UID:</strong> {currentUser.uid}</p>
          <p><strong>Creation Time:</strong> {currentUser.metadata.creationTime}</p>
          <p><strong>Last Sign In:</strong> {currentUser.metadata.lastSignInTime}</p>
          
          <h3>Provider Data</h3>
          {currentUser.providerData.map((provider, index) => (
            <div key={index} style={{ marginLeft: '20px' }}>
              <p><strong>Provider ID:</strong> {provider.providerId}</p>
              <p><strong>Provider UID:</strong> {provider.uid}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(244, 67, 54, 0.1)',
              color: '#f44336',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Sign Out
          </button>
          
          <a
            href="/dashboard"
            style={{
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s ease',
            }}
          >
            Go to Dashboard
          </a>
        </div>
      </motion.div>
    </div>
  );
}
