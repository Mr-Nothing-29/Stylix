import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function Profile() {
  const { session, profile, setProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !session) navigate('/login');
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.updateProfile(form, session.access_token);
      setProfile(updated);
      setMessage('Profile updated — taking you to the studio…');
      setTimeout(() => navigate('/customize'), 900);
    } catch (err) {
      setMessage(err.message || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 24px' }}>
        <p className="stx-label" style={{ marginBottom: '8px' }}>
          {profile.role === 'tailor'
            ? 'Tailor account'
            : profile.role === 'supplier'
            ? 'Supplier account'
            : 'Customer account'}
        </p>

        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '32px', margin: '0 0 12px' }}>
          {profile.full_name}
        </h1>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="full_name">
              Full name
            </label>
            <input id="full_name" className="stx-field" value={form.full_name} onChange={update('full_name')} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className="stx-field"
              placeholder="Add a phone number"
              value={form.phone}
              onChange={update('phone')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="stx-label" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              className="stx-field"
              placeholder="Add your address"
              value={form.address}
              onChange={update('address')}
            />
          </div>

          {message && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--brass)',
                marginTop: '-10px',
                marginBottom: '18px',
              }}
            >
              {message}
            </p>
          )}

          <button type="submit" className="stx-btn-primary" style={{ width: 'auto', padding: '14px 32px' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
