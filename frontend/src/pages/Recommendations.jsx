import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GarmentPreview from '../components/customize/GarmentPreview';
import NavBar from '../components/NavBar';
import { GARMENT_TYPES, FABRICS, COLORS } from '../data/customizationOptions';
import '../styles/theme.css';

function label(list, id) {
  return list.find((item) => item.id === id)?.label || id;
}

export default function Recommendations() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getRecommendations(session.access_token)
      .then((res) => {
        setItems(res.items);
        setSource(res.source);
      })
      .catch((err) => setError(err.message || "Couldn't load recommendations."))
      .finally(() => setLoading(false));
  }, [session]);

  function tryCombo(item) {
    navigate('/customize', {
      state: {
        prefill: {
          garmentType: item.garment_type,
          fabric: item.fabric,
          colorId: item.color,
        },
      },
    });
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to see recommendations for you.
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
          {source === 'ai' ? 'AI stylist picks' : 'Suggested for you'}
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          Recommended for you
        </h1>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 60px' }}>
        {loading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Thinking of a few things you might like…
          </p>
        )}

        {!loading && error && <p className="stx-error">{error}</p>}

        {!loading && !error && (
          <>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink-soft)', margin: '0 0 28px' }}>
              {source === 'ai'
                ? 'Generated based on what you\u2019ve designed and ordered so far.'
                : 'Based on what you\u2019ve tried so far — connect a Gemini API key on the backend for AI-generated picks instead.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {items.map((item, i) => {
                const color = COLORS.find((c) => c.id === item.color) || COLORS[0];
                return (
                  <div key={i} style={{ border: '1px solid var(--stone-line)', padding: '24px', textAlign: 'center' }}>
                    <GarmentPreview garmentType={item.garment_type} colorHex={color.hex} fabric={item.fabric} />
                    <h3
                      className="stx-heading stx-heading--dark"
                      style={{ fontSize: '18px', margin: '14px 0 2px', fontWeight: 500, textTransform: 'capitalize' }}
                    >
                      {label(GARMENT_TYPES, item.garment_type)}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                      {label(FABRICS, item.fabric)} · {color.label}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 300,
                        fontSize: '12.5px',
                        color: 'var(--ink)',
                        lineHeight: 1.6,
                        margin: '0 0 16px',
                        minHeight: '40px',
                      }}
                    >
                      {item.reason}
                    </p>
                    <button
                      type="button"
                      onClick={() => tryCombo(item)}
                      className="stx-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12.5px' }}
                    >
                      Try this combo →
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
