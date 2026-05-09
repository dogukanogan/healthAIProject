import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { meetingsApi } from '../../services';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const roleLabel = { engineer: '⚙️ Engineer', healthcare: '🏥 Healthcare', admin: '🛡️ Admin' };
  const roleBadgeClass = { engineer: 'role-badge-engineer', healthcare: 'role-badge-healthcare', admin: 'role-badge-admin' };

  // Fetch pending meeting count
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      meetingsApi.getAll().then(data => {
        const pending = data.filter(m => m.ownerId === user.id && m.status === 'pending');
        setPendingCount(pending.length);
      }).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-logo">⚕</div>
          <span className="brand-name">Health<span>AI</span></span>
        </Link>

        {user && (
          <div className="navbar-links">
            <Link to="/dashboard" className={isActive('/dashboard')}>
              <span className="nav-link-icon">🏠</span>Dashboard
            </Link>
            <Link to="/posts" className={isActive('/posts')}>
              <span className="nav-link-icon">📋</span>Posts
            </Link>
            <Link to="/meetings" className={isActive('/meetings')} style={{ position: 'relative' }}>
              <span className="nav-link-icon">🤝</span>Meetings
              {pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" className={isActive('/admin')}>
                <span className="nav-link-icon">🛡️</span>Admin
              </Link>
            )}
          </div>
        )}

        {user && (
          <div className="navbar-user">
            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
              </span>
            </button>

            <span className={`navbar-role-badge ${roleBadgeClass[user.role]}`}>
              {roleLabel[user.role]}
            </span>
            <span className="navbar-username">{user.name}</span>
            <Link to="/profile" className="navbar-avatar" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </Link>
            <button className="btn btn-secondary btn-sm navbar-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
