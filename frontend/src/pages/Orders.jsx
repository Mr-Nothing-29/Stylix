import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import OrderCard from '../components/orders/OrderCard';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function Orders() {
  const { session, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getMyOrders(session.access_token)
      .then(setOrders)
      .catch((err) => setError(err.message || "Couldn't load your orders."))
      .finally(() => setLoading(false));
  }, [session, authLoading]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Order history
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          My orders
        </h1>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 24px 60px' }}>
        {!session && !authLoading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to see your orders.
          </p>
        )}

        {loading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Loading…
          </p>
        )}

        {!loading && error && <p className="stx-error">{error}</p>}

        {!loading && !error && session && orders.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            No orders yet. <Link to="/designs" className="stx-link">Start from a saved design →</Link>
          </p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
