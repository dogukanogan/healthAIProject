import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const SLIDES = [
  {
    icon: '🏥',
    iconClass: 'blue',
    title: 'Post Clinical Problems',
    desc: 'Healthcare professionals share unmet needs & project ideas',
  },
  {
    icon: '⚙️',
    iconClass: 'cyan',
    title: 'Engineers Respond',
    desc: 'Tech teams find relevant medical challenges to solve',
  },
  {
    icon: '🤝',
    iconClass: 'violet',
    title: 'NDA-Protected Meetings',
    desc: '3-step verified meeting system protects your IP',
  },
];

function AnimatedCounter({ target, duration = 1800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [active, setActive]   = useState(0);

  // auto-cycle slides
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % SLIDES.length), 3200);
    return () => clearInterval(t);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── LEFT PANEL ── */}
      <div className="auth-panel-left">
        {/* Animated orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Floating pills */}
        <div className="auth-floating-pills">
          <span className="auth-pill auth-pill-1">🔒 NDA Protected</span>
          <span className="auth-pill auth-pill-2">✅ .edu Verified</span>
          <span className="auth-pill auth-pill-3">🚀 GDPR Compliant</span>
        </div>

        <div className="auth-left-content">
          {/* Brand */}
          <div className="auth-left-brand">
            <div className="auth-left-logo">⚕</div>
            <span className="auth-left-brand-name">Health<span>AI</span></span>
          </div>

          {/* Headline */}
          <h1 className="auth-left-title">
            Where Medicine<br />Meets <span>Engineering</span>
          </h1>
          <p className="auth-left-subtitle">
            The platform that connects healthcare professionals with engineers to build the next generation of medical technology.
          </p>

          {/* Animated showcase cards */}
          <div className="auth-showcase">
            {SLIDES.map((s, i) => (
              <div
                key={i}
                className={`auth-showcase-card${active === i ? ' auth-showcase-card--active' : ''}`}
                style={{
                  opacity: active === i ? 1 : 0.45,
                  transform: active === i ? 'translateX(0) scale(1)' : 'translateX(-6px) scale(0.98)',
                  borderColor: active === i ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.10)',
                  background: active === i ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
                onClick={() => setActive(i)}
              >
                <div className={`auth-showcase-icon ${s.iconClass}`}>{s.icon}</div>
                <div className="auth-showcase-text">
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </div>
                {active === i && (
                  <div style={{
                    marginLeft:'auto', width:8, height:8,
                    borderRadius:'50%', background:'#38BDF8',
                    flexShrink: 0,
                    boxShadow: '0 0 8px #38BDF8',
                    animation: 'pulse 1.4s ease-in-out infinite'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Slide dots */}
          <div style={{ display:'flex', gap:8, marginBottom:32 }}>
            {SLIDES.map((_,i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: active===i ? 24 : 8,
                  height: 8,
                  borderRadius: 99,
                  border: 'none',
                  background: active===i ? '#38BDF8' : 'rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.35s ease',
                }}
              />
            ))}
          </div>

          {/* Stats row */}
          <div className="auth-left-stats">
            <div className="auth-stat">
              <span className="auth-stat-num"><AnimatedCounter target={120} />+</span>
              <span className="auth-stat-label">Projects</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num"><AnimatedCounter target={340} />+</span>
              <span className="auth-stat-label">Members</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num"><AnimatedCounter target={48} /></span>
              <span className="auth-stat-label">Meetings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-panel-right">
        <div className="auth-card">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back. Sign in to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Institutional Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
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
  );
}
