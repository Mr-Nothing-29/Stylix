import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NavBar from '../components/NavBar';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/orders/StatusBadge';
import { formatINR } from '../utils/pricing';
import '../styles/theme.css';

export default function AdminDashboard() {
  const { session, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session || authLoading) return;
    if (profile && profile.role !== 'admin') {
      setLoading(false);
      return;
    }
    Promise.all([api.getAdminStats(session.access_token), api.getAdminRecentOrders(session.access_token)])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o);
      })
      .catch((err) => setError(err.message || "Couldn't load admin data."))
      .finally(() => setLoading(false));
  }, [session, profile, authLoading]);

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading || authLoading) return null;

  if (profile && profile.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            This dashboard is for admin accounts only. Admin access isn't self-serve —
            it's set directly on your account in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Platform overview
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          Admin dashboard
        </h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px 60px' }}>
        {error && <p className="stx-error">{error}</p>}

        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <StatCard label="Customers" value={stats.total_customers} />
            <StatCard label="Tailors" value={stats.total_tailors} />
            <StatCard label="Suppliers" value={stats.total_suppliers} />
            <StatCard label="Total orders" value={stats.total_orders} />
            <StatCard label="Revenue collected" value={formatINR(stats.total_revenue)} />
            <StatCard label="Reviews" value={stats.total_reviews} />
            <StatCard
              label="Avg. tailor rating"
              value={stats.average_rating > 0 ? `${stats.average_rating} ★` : '—'}
            />
          </div>
        )}

        <p className="stx-label" style={{ marginBottom: '14px' }}>
          Recent orders across the platform
        </p>
        {orders.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            No orders placed yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.map((o) => {
              const date = o.created_at
                ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '';
              return (
                <div
                  key={o.id}
                  style={{
                    padding: '14px 18px',
                    border: '1px solid var(--stone-line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        margin: '0 0 3px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {o.garment_type} · {o.fabric}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--ink-soft)', margin: 0 }}>
                      {o.tailor_business_name || 'Unknown tailor'} · {date} · {formatINR(o.estimated_price)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
