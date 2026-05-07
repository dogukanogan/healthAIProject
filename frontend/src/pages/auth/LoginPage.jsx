import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
      <div className="auth-panel-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">⚕</div>
          <h1 className="auth-left-title">HealthAI</h1>
          <p className="auth-left-subtitle">
            Connect healthcare professionals with engineers to build the future of medical technology.
          </p>
          <ul className="auth-left-features">
            <li>Structured collaboration announcements</li>
            <li>3-step NDA-protected meeting requests</li>
            <li>Institutional .edu access only</li>
            <li>GDPR-compliant data management</li>
          </ul>
        </div>
      </div>

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
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>

          <div className="auth-demo-hint">
            <strong>Demo accounts — click to fill</strong>
            <div className="demo-btns">
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'dogukan@university.edu', password: 'password123' })}>⚙️ Engineer</button>
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'ayse@hospital.edu', password: 'password123' })}>🏥 Healthcare</button>
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'admin@healthai.edu', password: 'password123' })}>🛡️ Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
