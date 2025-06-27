import React from 'react';
import { GoogleAuthProvider, useGoogleAuth } from './contexts/GoogleAuthContext';
import Dashboard from './Dashboard';
import GoogleLoginForm from './components/GoogleLoginForm';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

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
  <GoogleAuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginHandler />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  </GoogleAuthProvider>
);

export default App;
