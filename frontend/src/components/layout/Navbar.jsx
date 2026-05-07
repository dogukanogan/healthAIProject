import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const roleLabel = { engineer: '⚙️ Engineer', healthcare: '🏥 Healthcare', admin: '🛡️ Admin' };
  const roleBadgeClass = { engineer: 'role-badge-engineer', healthcare: 'role-badge-healthcare', admin: 'role-badge-admin' };

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
            <Link to="/meetings" className={isActive('/meetings')}>
              <span className="nav-link-icon">🤝</span>Meetings
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
            <span className={`navbar-role-badge ${roleBadgeClass[user.role]}`}>
              {roleLabel[user.role]}
            </span>
            <span className="navbar-username">{user.name}</span>
            <Link to="/profile" className="navbar-avatar" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
