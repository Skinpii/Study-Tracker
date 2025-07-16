import React from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

export default function GoogleLoginForm() {
  const { login } = useGoogleAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>Sign in with Google</h2>
      <button
        onClick={login}
        style={{
          fontSize: '1.2rem',
          padding: '1em 2em',
          borderRadius: 8,
          background: '#4285f4',
          color: '#fff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          style={{ width: 24, marginRight: 12, verticalAlign: 'middle', background: '#fff', borderRadius: '50%' }}
        />
        Sign in with Google
      </button>
    </div>
  );
} 