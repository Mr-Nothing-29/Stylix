import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

const FIELDS = [
  { id: 'height_cm', label: 'Height' },
  { id: 'chest_cm', label: 'Chest / bust' },
  { id: 'waist_cm', label: 'Waist' },
  { id: 'hip_cm', label: 'Hip' },
  { id: 'shoulder_cm', label: 'Shoulder width' },
  { id: 'sleeve_length_cm', label: 'Sleeve length' },
  { id: 'inseam_cm', label: 'Inseam' },
  { id: 'neck_cm', label: 'Neck' },
];

export default function Measurements() {
  const { session, loading: authLoading } = useAuth();
  const [form, setForm] = useState(() => {
    const initial = { notes: '' };
    FIELDS.forEach((f) => (initial[f.id] = ''));
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getMyMeasurements(session.access_token)
      .then((m) => {
        const next = { notes: m.notes || '' };
        FIELDS.forEach((f) => (next[f.id] = m[f.id] != null ? String(m[f.id]) : ''));
        setForm(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, authLoading]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const payload = { notes: form.notes || null };
    FIELDS.forEach((f) => {
      const val = form[f.id];
      payload[f.id] = val === '' ? null : Number(val);
    });

    try {
      await api.saveMyMeasurements(payload, session.access_token);
      setMessage('Measurements saved — these will be used for your next order.');
    } catch (err) {
      setError(err.message || "Couldn't save your measurements.");
    } finally {
      setSaving(false);
    }
  }

  if (!session && !authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to save your measurements.
          </p>
        </div>
      </div>
    );
  }

  if (loading || authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Your sizing, on file
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          My measurements
        </h1>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '36px 24px 60px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 28px' }}>
          Save these once and every order you place will include a copy, so your tailor always
          has exactly what they need — no re-entering sizes each time. All measurements in
          centimetres.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px', marginBottom: '20px' }}>
            {FIELDS.map((f) => (
              <div key={f.id}>
                <label className="stx-label" htmlFor={f.id}>
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type="number"
                  step="0.1"
                  min="0"
                  className="stx-field"
                  placeholder="cm"
                  value={form[f.id]}
                  onChange={update(f.id)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="stx-label" htmlFor="notes">
              Notes for your tailor (optional)
            </label>
            <textarea
              id="notes"
              className="stx-field"
              rows={3}
              placeholder="Fit preferences, old injuries, anything else worth knowing…"
              value={form.notes}
              onChange={update('notes')}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          {message && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--brass)', marginTop: '-10px', marginBottom: '16px' }}>
              {message}
            </p>
          )}
          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" style={{ width: 'auto', padding: '14px 32px' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save measurements'}
          </button>
        </form>
      </div>
    </div>
  );
}
