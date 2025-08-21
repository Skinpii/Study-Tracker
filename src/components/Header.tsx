import { Bell, Search, User, LogOut } from 'lucide-react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

export function Header() {
  const { user, logout } = useGoogleAuth();
  return (
    <header className="header">
      <div className="header-left">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="search-input"
          />
        </div>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile">
          <div className="user-avatar">
            {user?.picture ? (
              <img src={user.picture} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.name || 'Student'}
            </span>
            <span className="user-email">
              {user?.email}
            </span>
          </div>
        </div>
        <button className="logout-btn" title="Sign out" onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
