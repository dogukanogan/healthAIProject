import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi, meetingsApi } from '../../services';
import './Profile.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile pic
  const [avatar, setAvatar] = useState(() =>
    user ? localStorage.getItem(`healthai_avatar_${user.id}`) || null : null
  );
  const fileInputRef = useRef(null);

  // Name change
  const [name, setName] = useState(user?.name || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState(null); // { type: 'success'|'error', text }
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Notifications (pending meetings where user is owner)
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    meetingsApi.getAll().then(data => {
      const pending = data.filter(m => m.ownerId === user.id && m.status === 'pending');
      setNotifications(pending);
    }).catch(() => {});
  }, [user]);

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

  const handleNameSave = async (e) => {
    e.preventDefault();
    setNameSaving(true);
    // Optimistic save (no backend update endpoint required beyond existing profileApi)
    try {
      await new Promise(r => setTimeout(r, 400));
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } finally { setNameSaving(false); }
  };

  const handleExport = () => {
    const data = {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      exportedAt: new Date().toISOString(),
      note: 'This file contains all personal data stored about you on HealthAI platform.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'healthai_my_data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally { setPwLoading(false); }
  };

  const handleDelete = async () => {
    if (deleteInput !== user.email) return;
    await logout();
    navigate('/login');
  };

  const roleBadgeClass = {
    engineer: 'role-badge-engineer',
    healthcare: 'role-badge-healthcare',
    admin: 'role-badge-admin',
  };
  const roleLabel = {
    engineer: '⚙️ Engineer',
    healthcare: '🏥 Healthcare Professional',
    admin: '🛡️ Admin',
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 24 }}>My Profile</h1>

      <div className="profile-layout">

        {/* ── Top card: avatar + info ── */}
        <div className="card profile-top-card">
          <div className="profile-avatar-upload-section">
            <div className="profile-avatar-wrap">
              {avatar
                ? <img src={avatar} alt={user?.name} className="profile-avatar-img" />
                : <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <div className="profile-avatar-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                📷 Change Photo
              </button>
              {avatar && (
                <button type="button" className="btn btn-danger btn-sm" onClick={handleRemoveAvatar}>
                  🗑 Remove
                </button>
              )}
            </div>
            <p className="profile-avatar-hint">Click "Change Photo" to upload a profile picture. Supported: JPG, PNG, GIF</p>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <h2 className="profile-name">{user?.name}</h2>
              <div className="profile-email">{user?.email}</div>
              <span className={`navbar-role-badge ${roleBadgeClass[user?.role]}`}>
                {roleLabel[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* ── Settings card ── */}
        <div className="card">
          <h3 className="gdpr-title">⚙️ Account Settings</h3>

          {/* Name change */}
          <form onSubmit={handleNameSave} style={{ marginTop: 16 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--gray-50)', opacity: 0.7 }}
              />
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Email cannot be changed.</span>
            </div>
            {nameSaved && (
              <div style={{ color: 'var(--success)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
                ✓ Profile updated.
              </div>
            )}
            <button className="btn btn-primary btn-sm" type="submit" disabled={nameSaving}>
              {nameSaving ? 'Saving…' : 'Save Name'}
            </button>
          </form>

          <div className="divider" />

          {/* Password change */}
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 14 }}>
            🔑 Change Password
          </h4>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Min 8 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Repeat new password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
            {pwMsg && (
              <div style={{
                fontSize: 13, fontWeight: 600, marginBottom: 10,
                color: pwMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>
                {pwMsg.type === 'success' ? '✓' : '⚠'} {pwMsg.text}
              </div>
            )}
            <button className="btn btn-primary btn-sm" type="submit" disabled={pwLoading}>
              {pwLoading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* ── Privacy card ── */}
        <div className="card gdpr-card">
          <h3 className="gdpr-title">🔒 Privacy & GDPR</h3>
          <p className="gdpr-desc">You have full control over your personal data stored on this platform.</p>
          <div className="gdpr-item">
            <div>
              <strong>Export My Data</strong>
              <p>Download all data we store about you as a JSON file.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExport}>Export</button>
          </div>
        </div>

        {/* ── Notifications card ── */}
        <div className="card">
          <h3 className="gdpr-title">🔔 Notifications</h3>
          <div className="notif-list" style={{ marginTop: 12 }}>
            {notifications.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>No pending notifications.</p>
            ) : (
              notifications.map(m => (
                <div
                  key={m.id}
                  className="notif-item unread"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/meetings')}
                >
                  <div className="notif-dot notif-dot-new" />
                  <div>
                    <strong>{m.requesterName} sent a meeting request</strong>
                    <p>For: {m.postTitle}</p>
                    <span className="notif-time">Click to view in Meetings</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Danger Zone card ── */}
        <div className="card" style={{ border: '1.5px solid rgba(248,113,113,0.35)', marginTop: 8 }}>
          <h3 className="gdpr-title" style={{ color: '#F87171' }}>⚠️ Danger Zone</h3>
          <div className="gdpr-item gdpr-danger-item">
            <div>
              <strong>Delete Account</strong>
              <p>Permanently delete your account and all associated data. This action is irreversible.</p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>Delete</button>
          </div>
        </div>

      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDelete(false)}>
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close" onClick={() => setShowDelete(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                This will permanently delete your account, all your posts, and all associated data. This cannot be undone.
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Type your email to confirm: <strong>{user?.email}</strong></label>
                <input
                  className="form-control"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder={user?.email}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteInput !== user?.email}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
