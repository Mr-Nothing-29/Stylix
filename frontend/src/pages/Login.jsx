import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandPanel from '../components/BrandPanel';
import '../styles/theme.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await login(form);
      navigate('/profile');
    } catch (err) {
      setError(err.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        background: 'var(--ivory)',
      }}
      className="stx-auth-shell"
    >
      <BrandPanel
        eyebrow="Stylix — made to measure"
        title="Every garment starts with a fit only you have."
        body="Sign in to pick up your custom order, message your tailor, or start a new design from scratch."
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
          <p className="stx-label" style={{ marginBottom: '6px' }}>
            Welcome back
          </p>
          <h2
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '30px', margin: '0 0 32px' }}
          >
            Sign in to Stylix
          </h2>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="stx-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label className="stx-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="stx-field"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--ink-soft)',
              marginTop: '24px',
              textAlign: 'center',
            }}
          >
            New to Stylix? <Link to="/signup" className="stx-link">Create an account</Link>
          </p>
        </form>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .stx-auth-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
