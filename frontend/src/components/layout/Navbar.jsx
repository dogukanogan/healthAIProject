import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { meetingsApi } from '../../services';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingCount, setPendingCount] = useState(0);
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('healthai_notif_read') || '[]'); } catch { return []; }
  });
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const bellRef = useRef(null);
  const userRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const roleLabel = {
    engineer: '⚙️ Engineer',
    healthcare: '🏥 Healthcare',
    admin: '🛡️ Admin',
  };
  const roleBadgeClass = {
    engineer: 'role-badge-engineer',
    healthcare: 'role-badge-healthcare',
    admin: 'role-badge-admin',
  };

  // Load avatar from localStorage
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`healthai_avatar_${user.id}`);
    setAvatar(stored || null);
  }, [user]);

  // Persist readIds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('healthai_notif_read', JSON.stringify(readIds));
    // Recalculate unread badge
    const unread = pendingMeetings.filter(m => !readIds.includes(m.id)).length;
    setPendingCount(unread);
  }, [readIds, pendingMeetings]);

  const markRead    = (id) => setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
  const markUnread  = (id) => setReadIds(prev => prev.filter(x => x !== id));
  const markAllRead = ()   => setReadIds(pendingMeetings.map(m => m.id));

  // Fetch pending meeting count
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      meetingsApi.getAll().then(data => {
        const pending = data.filter(m => m.ownerId === user.id && m.status === 'pending');
        setPendingMeetings(pending);
      }).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleThemeToggle = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 400);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      localStorage.setItem(`healthai_avatar_${user.id}`, b64);
      setAvatar(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!user) return;
    localStorage.removeItem(`healthai_avatar_${user.id}`);
    setAvatar(null);
  };

  const AvatarCircle = ({ size = 32, fontSize = 13 }) => (
    avatar
      ? <img
          src={avatar}
          alt={user?.name}
          style={{
            width: size, height: size, borderRadius: '50%',
            objectFit: 'cover', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37,99,235,0.45)',
            border: '2px solid rgba(56,189,248,0.40)',
          }}
        />
      : <div
          style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #38BDF8)',
            color: 'white', fontSize, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.45)',
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.5 8.5H20L14.5 12.5L16.5 19L12 15L7.5 19L9.5 12.5L4 8.5H10.5L12 2Z" fill="white" opacity="0.9"/>
              <circle cx="12" cy="12" r="3" fill="#38BDF8"/>
            </svg>
          </div>
          <span className="brand-name">Health<span>AI</span></span>
        </Link>

        {/* Nav links */}
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

        {/* Right side */}
        {user && (
          <div className="navbar-user">

            {/* Theme toggle: simple circular icon button */}
            <button
              className={`navbar-theme-btn${spinning ? ' spinning' : ''}`}
              onClick={handleThemeToggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {/* Notification bell */}
            <div className="navbar-bell-wrap" ref={bellRef}>
              <button
                className="navbar-icon-btn"
                onClick={() => { setBellOpen(o => !o); setUserOpen(false); }}
                aria-label="Notifications"
              >
                🔔
                {pendingCount > 0 && (
                  <span className="nav-badge">{pendingCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="navbar-dropdown bell-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      {pendingCount > 0 && <span className="notif-count-badge">{pendingCount}</span>}
                      {pendingMeetings.length > 0 && (
                        <button className="notif-mark-all-btn" onClick={e => { e.stopPropagation(); markAllRead(); setPendingCount(0); }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  {pendingMeetings.length === 0 ? (
                    <div className="dropdown-empty">No pending requests</div>
                  ) : (
                    pendingMeetings.map(m => {
                      const isRead = readIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className={`bell-notif-item${isRead ? ' bell-notif-read' : ''}`}
                          onClick={() => {
                            if (!isRead) { markRead(m.id); setPendingCount(c => Math.max(0, c - 1)); }
                            setBellOpen(false);
                            navigate(`/meetings/${m.id}`);
                          }}
                        >
                          <div className={`bell-notif-dot${isRead ? ' bell-notif-dot-read' : ''}`} />
                          <div className="bell-notif-text">
                            <strong>{m.requesterName}</strong>
                            <span> sent a meeting request</span>
                            <div className="bell-notif-post">{m.postTitle}</div>
                          </div>
                          <button
                            className="notif-toggle-btn"
                            title={isRead ? 'Mark as unread' : 'Mark as read'}
                            onClick={e => {
                              e.stopPropagation();
                              if (isRead) { markUnread(m.id); setPendingCount(c => c + 1); }
                              else        { markRead(m.id);   setPendingCount(c => Math.max(0, c - 1)); }
                            }}
                          >
                            {isRead ? '○' : '●'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* User button (avatar + name combined) */}
            <div className="navbar-user-wrap" ref={userRef}>
              <button
                className="navbar-user-btn"
                onClick={() => { setUserOpen(o => !o); setBellOpen(false); }}
              >
                <AvatarCircle size={30} fontSize={12} />
                <span className="navbar-username">{user.name}</span>
                <span className="navbar-user-caret">{userOpen ? '▲' : '▼'}</span>
              </button>

              {userOpen && (
                <div className="navbar-dropdown user-dropdown">
                  {/* Profile picture section */}
                  <div className="user-dropdown-profile">
                    <div className="user-dropdown-avatar-wrap">
                      <AvatarCircle size={52} fontSize={20} />
                      <button
                        className="avatar-edit-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change profile picture"
                      >
                        📷
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                      <span className={`navbar-role-badge ${roleBadgeClass[user.role]}`}>
                        {roleLabel[user.role]}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserOpen(false)}
                  >
                    <span>👤</span> My Profile
                  </Link>

                  <button
                    className="dropdown-item dropdown-item-toggle"
                    onClick={handleThemeToggle}
                  >
                    <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                    <span style={{ flex: 1 }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    <span className="theme-mode-label">{theme === 'dark' ? 'ON' : 'OFF'}</span>
                  </button>

                  {avatar && (
                    <button
                      className="dropdown-item"
                      onClick={() => { handleRemoveAvatar(); }}
                    >
                      <span>🗑️</span> Remove Photo
                    </button>
                  )}

                  <div className="dropdown-divider" />

                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}
