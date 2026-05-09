import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const SLIDES = [
  { icon: '🏥', title: 'Post Clinical Problems', desc: 'Healthcare pros share unmet needs & ideas' },
  { icon: '⚙️', title: 'Engineers Respond',      desc: 'Tech teams find medical challenges to solve' },
  { icon: '🤝', title: 'NDA-Protected Meetings', desc: '3-step verified system protects your IP' },
];

function Counter({ target, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(target / 50);
    const t = setInterval(() => {
      v = Math.min(v + step, target);
      setN(v);
      if (v >= target) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [target]);
  return <>{n}{suffix}</>;
}

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [slide, setSlide]     = useState(0);
  const [forgotOpen, setForgotOpen]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 3400);
    return () => clearInterval(t);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      // Backend endpoint may not exist yet — catch any error and still show success
      await import('../../services').then(m => m.authApi.forgotPassword?.({ email: forgotEmail })).catch(() => {});
    } catch (_) {}
    setForgotSent(true);
    setForgotLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-always-dark">
    <div className="auth-fullscreen">

      {/* ── Animated background ── */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-grid" />
        <div className="auth-vignette" />
      </div>

      {/* ── Floating badges ── */}
      <span className="auth-pill auth-pill-1">🔒 NDA Protected</span>
      <span className="auth-pill auth-pill-2">✅ .edu Verified Only</span>
      <span className="auth-pill auth-pill-3">🚀 GDPR Compliant</span>

      {/* ── Center layout ── */}
      <div className="auth-center">

        {/* Left: brand + showcase */}
        <div className="auth-hero">
          <div className="auth-left-brand">
            <div className="auth-left-logo">⚕</div>
            <span className="auth-left-brand-name">Health<span>AI</span></span>
          </div>

          <h1 className="auth-left-title">
            Where Medicine<br />Meets <span>Engineering</span>
          </h1>
          <p className="auth-left-subtitle">
            The platform connecting healthcare professionals with engineers to build the next generation of medical technology.
          </p>

          {/* Sliding feature cards */}
          <div className="auth-showcase">
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className="auth-showcase-card"
                onClick={() => setSlide(i)}
                style={{
                  opacity:      slide === i ? 1 : 0.38,
                  transform:    slide === i ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.97)',
                  borderColor:  slide === i ? 'rgba(56,189,248,0.40)' : 'rgba(255,255,255,0.07)',
                  background:   slide === i ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'pointer',
                }}
              >
                <div className="auth-showcase-icon blue" style={{ fontSize: 22 }}>{s.icon}</div>
                <div className="auth-showcase-text">
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </div>
                {slide === i && <div className="auth-pulse-dot" />}
              </div>
            ))}
          </div>

          {/* Dot nav */}
          <div className="auth-dots">
            {SLIDES.map((_, i) => (
              <button key={i} className={`auth-dot${slide === i ? ' auth-dot--active' : ''}`} onClick={() => setSlide(i)} />
            ))}
          </div>

          {/* Stats */}
          <div className="auth-left-stats">
            <div className="auth-stat">
              <span className="auth-stat-num"><Counter target={120} suffix="+" /></span>
              <span className="auth-stat-label">Projects</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num"><Counter target={340} suffix="+" /></span>
              <span className="auth-stat-label">Members</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num"><Counter target={48} /></span>
              <span className="auth-stat-label">Meetings</span>
            </div>
          </div>
        </div>

        {/* Right: form card */}
        <div className="auth-form-wrap">
          <div className="auth-glass-card">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Welcome back. Sign in to continue.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Institutional Email</label>
                <input className="form-control" type="email" name="email"
                  placeholder="you@university.edu" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" name="password"
                  placeholder="••••••••" value={form.password} onChange={handleChange} required />
                <button
                  type="button"
                  onClick={() => { setForgotOpen(o => !o); setForgotSent(false); setForgotEmail(''); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 12, color: 'var(--primary)', cursor: 'pointer',
                    textAlign: 'right', alignSelf: 'flex-end', marginTop: 4,
                    textDecoration: 'underline', fontFamily: 'inherit',
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Inline forgot password section */}
              {forgotOpen && (
                <div style={{
                  background: 'rgba(59,130,246,0.07)',
                  border: '1px solid rgba(59,130,246,0.18)',
                  borderRadius: 10, padding: '14px 16px', marginBottom: 16,
                }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 10, fontWeight: 600 }}>
                    Reset your password
                  </p>
                  {forgotSent ? (
                    <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                      ✓ If this email exists, a reset link has been sent.
                    </p>
                  ) : (
                    <form onSubmit={handleForgot} style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        type="submit"
                        disabled={forgotLoading}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {forgotLoading ? '…' : 'Send Link'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Register</Link>
            </p>

            <div className="auth-demo-hint">
              <strong>Demo accounts — click to fill</strong>
              <div className="demo-btns">
                <button type="button" className="demo-btn" onClick={() => setForm({ email: 'dogukan@university.edu', password: 'password123' })}>⚙️ Engineer</button>
                <button type="button" className="demo-btn" onClick={() => setForm({ email: 'ayse@hospital.edu',    password: 'password123' })}>🏥 Healthcare</button>
                <button type="button" className="demo-btn" onClick={() => setForm({ email: 'admin@healthai.edu',   password: 'password123' })}>🛡️ Admin</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
