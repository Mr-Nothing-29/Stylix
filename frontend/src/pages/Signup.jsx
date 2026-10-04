import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandPanel from '../components/BrandPanel';
import '../styles/theme.css';

const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'tailor', label: 'Tailor' },
  { value: 'supplier', label: 'Fabric supplier' },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    if (!form.fullName.trim()) return 'Enter your full name.';
    if (!form.email.trim()) return 'Enter your email.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/login', { state: { justSignedUp: true } });
    } catch (err) {
      setError(err.message || "Couldn't create your account. Try again.");
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
        title="Design it. Tailor it. Wear it."
        body="Create an account as a customer, a tailor, or a fabric supplier — Stylix fits your role to the platform."
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
            Get started
          </p>
          <h2
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '30px', margin: '0 0 28px' }}
          >
            Create your account
          </h2>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              className="stx-field"
              placeholder="Ananya Raman"
              value={form.fullName}
              onChange={update('fullName')}
              autoComplete="name"
            />
          </div>

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

          <div style={{ marginBottom: '22px' }}>
            <label className="stx-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="stx-field"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p className="stx-label" style={{ marginBottom: '10px' }}>
              I am joining as
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {ROLES.map((role) => (
                <button
                  type="button"
                  key={role.value}
                  className={`stx-role-option ${
                    form.role === role.value ? 'stx-role-option--active' : ''
                  }`}
                  onClick={() => setForm((f) => ({ ...f, role: role.value }))}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
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
            Already have an account? <Link to="/login" className="stx-link">Sign in</Link>
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
