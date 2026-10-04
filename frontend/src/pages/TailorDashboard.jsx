import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NavBar from '../components/NavBar';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/orders/StatusBadge';
import { ORDER_STATUSES, statusIndex } from '../data/orderStatus';
import { formatINR } from '../utils/pricing';
import '../styles/theme.css';

const SPECIALTY_OPTIONS = [
  'Bridal wear',
  'Formal suits',
  'Kurta & ethnic wear',
  'Western wear',
  'Alterations',
  'Kids wear',
];

function SetupForm({ onCreated, token }) {
  const [form, setForm] = useState({
    business_name: '',
    bio: '',
    city: '',
    specialties: [],
    years_experience: '',
    starting_price: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleSpecialty(s) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.business_name.trim() || !form.bio.trim() || !form.city.trim()) {
      setError('Fill in your business name, bio, and city.');
      return;
    }

    setSubmitting(true);
    try {
      const tailor = await api.createMyTailorProfile(
        {
          business_name: form.business_name,
          bio: form.bio,
          city: form.city,
          specialties: form.specialties,
          years_experience: Number(form.years_experience) || 0,
          starting_price: form.starting_price ? Number(form.starting_price) : null,
        },
        token
      );
      onCreated(tailor);
    } catch (err) {
      setError(err.message || "Couldn't create your tailor profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 24px 60px' }}>
      <p className="stx-label" style={{ marginBottom: '6px' }}>
        Set up your listing
      </p>
      <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '28px', margin: '0 0 8px' }}>
        Create your tailor profile
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 28px' }}>
        This is what customers see when they find you in the directory.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="stx-label" htmlFor="business_name">
            Business name
          </label>
          <input
            id="business_name"
            className="stx-field"
            value={form.business_name}
            onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="stx-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="stx-field"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="stx-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              className="stx-field"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="stx-label" htmlFor="years">
              Years of experience
            </label>
            <input
              id="years"
              type="number"
              min="0"
              className="stx-field"
              value={form.years_experience}
              onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="stx-label" htmlFor="starting_price">
            Starting price (₹, optional)
          </label>
          <input
            id="starting_price"
            type="number"
            min="0"
            className="stx-field"
            value={form.starting_price}
            onChange={(e) => setForm((f) => ({ ...f, starting_price: e.target.value }))}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <p className="stx-label" style={{ marginBottom: '10px' }}>
            Specialties
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSpecialty(s)}
                style={{
                  padding: '6px 12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11.5px',
                  border: `1px solid ${form.specialties.includes(s) ? 'var(--brass)' : 'var(--stone-line)'}`,
                  background: form.specialties.includes(s) ? 'rgba(169, 128, 62, 0.08)' : 'transparent',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="stx-error">{error}</p>}

        <button type="submit" className="stx-btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create profile'}
        </button>
      </form>
    </div>
  );
}

function IncomingOrderRow({ order, token, onUpdated }) {
  const [advancing, setAdvancing] = useState(false);
  const currentIndex = statusIndex(order.status);
  const next = ORDER_STATUSES[currentIndex + 1];

  async function handleAdvance() {
    if (!next) return;
    setAdvancing(true);
    try {
      const updated = await api.updateOrderStatus(order.id, { status: next.id }, token);
      onUpdated(updated);
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div
      style={{
        padding: '16px 20px',
        border: '1px solid var(--stone-line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>
        <p
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '16px', margin: '0 0 3px', fontWeight: 500, textTransform: 'capitalize' }}
        >
          {order.garment_type} · {order.fabric}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
          {formatINR(order.estimated_price)} · <Link to={`/orders/${order.id}`} className="stx-link">View order</Link>
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <StatusBadge status={order.status} />
        {next && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            style={{
              background: 'var(--wine)',
              color: 'var(--ivory)',
              border: 'none',
              padding: '8px 14px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {advancing ? 'Updating…' : `Mark ${next.label}`}
          </button>
        )}
      </div>
    </div>
  );
}

function ConnectionRow({ connection }) {
  const date = connection.created_at
    ? new Date(connection.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--stone-line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
          {connection.customer_name}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-soft)' }}>{date}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
        {connection.message}
      </p>
    </div>
  );
}

export default function TailorDashboard() {
  const { session, profile, loading: authLoading } = useAuth();
  const [tailor, setTailor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getMyTailorProfile(session.access_token)
      .then((t) => {
        setTailor(t);
        return Promise.all([
          api.getMyIncomingOrders(session.access_token),
          api.getMyIncomingConnections(session.access_token),
        ]);
      })
      .then((res) => {
        if (res) {
          setOrders(res[0]);
          setConnections(res[1]);
        }
      })
      .catch(() => setTailor(null))
      .finally(() => {
        setCheckedProfile(true);
        setLoading(false);
      });
  }, [session]);

  function handleOrderUpdated(updated) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to access your tailor dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading || authLoading) return null;

  if (profile && profile.role !== 'tailor') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            This dashboard is only for tailor accounts.
          </p>
        </div>
      </div>
    );
  }

  if (checkedProfile && !tailor) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <SetupForm token={session.access_token} onCreated={setTailor} />
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.estimated_price, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Tailor dashboard
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          {tailor?.business_name}
        </h1>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          <StatCard label="Incoming orders" value={orders.length} />
          <StatCard label="Revenue collected" value={formatINR(totalRevenue)} />
          <StatCard label="Rating" value={tailor?.review_count > 0 ? `${tailor.rating} ★` : 'No reviews yet'} />
          <StatCard label="Connection requests" value={connections.length} />
        </div>

        <p className="stx-label" style={{ marginBottom: '14px' }}>
          Incoming orders
        </p>
        {orders.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '40px' }}>
            No orders yet — once a customer orders from you, it'll show up here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
            {orders.map((o) => (
              <IncomingOrderRow key={o.id} order={o} token={session.access_token} onUpdated={handleOrderUpdated} />
            ))}
          </div>
        )}

        <p className="stx-label" style={{ marginBottom: '14px' }}>
          Connection requests
        </p>
        {connections.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            No connection requests yet.
          </p>
        ) : (
          <div>
            {connections.map((c) => (
              <ConnectionRow key={c.id} connection={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
