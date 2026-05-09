import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services';
import './Auth.css';

const STEPS = [
  { num: '01', label: 'Create Account',   desc: 'Fill in your details' },
  { num: '02', label: 'Verify Email',     desc: 'Check your .edu inbox' },
  { num: '03', label: 'Start Connecting', desc: 'Post or explore projects' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectRole   = (role) => setForm({ ...form, role });

  const validate = () => {
    if (!form.name.trim())               return 'Full name is required.';
    if (!form.email.includes('.edu'))    return 'Only institutional email addresses are allowed (e.g. .edu, .edu.tr).';
    if (form.password.length < 8)        return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm)  return 'Passwords do not match.';
    if (!form.role)                      return 'Please select a role.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Email verification screen ── */
  if (step === 2) {
    return (
      <div className="auth-always-dark">
      <div className="auth-page">
        <div className="auth-panel-left">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-floating-pills">
            <span className="auth-pill auth-pill-1">🔒 NDA Protected</span>
            <span className="auth-pill auth-pill-2">✅ .edu Verified</span>
            <span className="auth-pill auth-pill-3">🚀 GDPR Compliant</span>
          </div>
          <div className="auth-left-content">
            <div className="auth-left-brand">
              <div className="auth-left-logo">⚕</div>
              <span className="auth-left-brand-name">Health<span>AI</span></span>
            </div>
            <h1 className="auth-left-title">
              Almost<br /><span>There!</span>
            </h1>
            <p className="auth-left-subtitle">
              One last step — verify your institutional email to activate your account and start connecting.
            </p>
            <ul className="auth-left-features">
              {STEPS.map(s => (
                <li key={s.num} style={{ marginBottom: 18, opacity: s.num === '02' ? 1 : 0.55 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: s.num === '02' ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.10)',
                    border: s.num === '02' ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: s.num === '02' ? '#38BDF8' : 'rgba(255,255,255,0.5)',
                  }}>{s.num}</span>
                  <div>
                    <strong style={{ display: 'block', color: s.num === '02' ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 14 }}>{s.label}</strong>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="auth-panel-right">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 20, animation: 'fadeIn 0.5s ease' }}>📧</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Check your inbox
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              We sent a verification link to<br />
              <strong style={{ color: 'var(--gray-800)' }}>{form.email}</strong>
            </p>
            <button className="btn btn-primary btn-lg auth-submit" onClick={() => navigate('/login')}>
              Go to Sign In →
            </button>
            <p className="auth-footer" style={{ marginTop: 16 }}>
              Wrong email? <button style={{ background:'none', border:'none', color:'var(--primary)', fontWeight:600, cursor:'pointer', fontSize:13 }} onClick={() => setStep(1)}>Go back</button>
            </p>
          </div>
        </div>
      </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div className="auth-always-dark">
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-floating-pills">
          <span className="auth-pill auth-pill-1">🔒 NDA Protected</span>
          <span className="auth-pill auth-pill-2">✅ .edu Only</span>
          <span className="auth-pill auth-pill-3">🚀 Free to Join</span>
        </div>

        <div className="auth-left-content">
          <div className="auth-left-brand">
            <div className="auth-left-logo">⚕</div>
            <span className="auth-left-brand-name">Health<span>AI</span></span>
          </div>

          <h1 className="auth-left-title">
            Join the<br /><span>Movement</span>
          </h1>
          <p className="auth-left-subtitle">
            Healthcare professionals and engineers building the future of medicine — together.
          </p>

          {/* Steps tracker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: i === 0 ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                borderRadius: 12, padding: '12px 14px',
                animation: `cardSlideIn 0.5s ease ${i * 0.12}s both`,
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)',
                  border: i === 0 ? '1px solid rgba(56,189,248,0.6)' : '1px solid rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  color: i === 0 ? '#38BDF8' : 'rgba(255,255,255,0.35)',
                }}>{s.num}</span>
                <div>
                  <strong style={{ display:'block', fontSize:14, fontWeight:700, color: i===0 ? '#fff' : 'rgba(255,255,255,0.45)' }}>{s.label}</strong>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="auth-left-stats">
            <div className="auth-stat">
              <span className="auth-stat-num">120+</span>
              <span className="auth-stat-label">Projects</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">340+</span>
              <span className="auth-stat-label">Members</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">48</span>
              <span className="auth-stat-label">Meetings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the health-tech co-creation platform.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Institutional Email (.edu / .edu.tr)</label>
              <input className="form-control" type="email" name="email" placeholder="you@student.university.edu.tr" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Select Your Role</label>
              <div className="role-grid">
                <div className={`role-card ${form.role === 'engineer' ? 'selected' : ''}`} onClick={() => selectRole('engineer')}>
                  <span className="role-card-icon">⚙️</span>
                  <span className="role-card-label">Engineer</span>
                  <span className="role-card-desc">Build solutions</span>
                </div>
                <div className={`role-card ${form.role === 'healthcare' ? 'selected' : ''}`} onClick={() => selectRole('healthcare')}>
                  <span className="role-card-icon">🏥</span>
                  <span className="role-card-label">Healthcare Pro</span>
                  <span className="role-card-desc">Post clinical needs</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-control" type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
            </div>

            <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
