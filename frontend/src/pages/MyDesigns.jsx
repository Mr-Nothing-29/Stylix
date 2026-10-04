import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GarmentPreview from '../components/customize/GarmentPreview';
import { COLORS } from '../data/customizationOptions';
import { formatINR } from '../utils/pricing';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function MyDesigns() {
  const { session, loading: authLoading } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getMyDesigns(session.access_token)
      .then(setDesigns)
      .catch((err) => setError(err.message || "Couldn't load your designs."))
      .finally(() => setLoading(false));
  }, [session, authLoading]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Saved work
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          My designs
        </h1>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 60px' }}>
        {!session && !authLoading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to see your saved designs.
          </p>
        )}

        {loading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Loading…
          </p>
        )}

        {!loading && error && <p className="stx-error">{error}</p>}

        {!loading && !error && session && designs.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            No saved designs yet. <Link to="/customize" className="stx-link">Start one in the design studio →</Link>
          </p>
        )}

        {!loading && !error && designs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {designs.map((d) => {
              const color = COLORS.find((c) => c.id === d.color) || COLORS[0];
              return (
                <div key={d.id} style={{ border: '1px solid var(--stone-line)', padding: '20px', textAlign: 'center' }}>
                  <GarmentPreview garmentType={d.garment_type} colorHex={color.hex} />
                  <h3
                    className="stx-heading stx-heading--dark"
                    style={{ fontSize: '17px', margin: '12px 0 2px', fontWeight: 500, textTransform: 'capitalize' }}
                  >
                    {d.garment_type}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                    {d.fabric} · {color.label} · {formatINR(d.estimated_price)}
                  </p>
                  <Link
                    to={`/orders/new/${d.id}`}
                    className="stx-link"
                    style={{ fontSize: '12.5px' }}
                  >
                    Order this design →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
