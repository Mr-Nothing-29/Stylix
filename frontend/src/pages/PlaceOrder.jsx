import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GarmentPreview from '../components/customize/GarmentPreview';
import { COLORS } from '../data/customizationOptions';
import { formatINR } from '../utils/pricing';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function PlaceOrder() {
  const { designId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [design, setDesign] = useState(null);
  const [tailors, setTailors] = useState([]);
  const [tailorId, setTailorId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.getMyDesigns(session.access_token),
      api.getTailors({}),
      api.getProfile(session.access_token),
      api.getMyMeasurements(session.access_token).catch(() => null),
    ])
      .then(([designs, tailorList, profile, myMeasurements]) => {
        const match = designs.find((d) => d.id === designId);
        if (!match) {
          setError('Design not found.');
        } else {
          setDesign(match);
        }
        setTailors(tailorList);
        if (tailorList.length > 0) setTailorId(tailorList[0].id);
        if (profile.address) setAddress(profile.address);
        setMeasurements(myMeasurements);
      })
      .catch((err) => setError(err.message || "Couldn't load this page."))
      .finally(() => setLoading(false));
  }, [session, designId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!tailorId) {
      setError('Choose a tailor to send this order to.');
      return;
    }
    if (!address.trim()) {
      setError('Add a delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder(
        {
          tailor_id: tailorId,
          design_id: design.id,
          garment_type: design.garment_type,
          fabric: design.fabric,
          color: design.color,
          addons: design.addons,
          estimated_price: design.estimated_price,
          delivery_address: address,
          notes: notes || null,
          measurements: measurements
            ? {
                height_cm: measurements.height_cm,
                chest_cm: measurements.chest_cm,
                waist_cm: measurements.waist_cm,
                hip_cm: measurements.hip_cm,
                shoulder_cm: measurements.shoulder_cm,
                sleeve_length_cm: measurements.sleeve_length_cm,
                inseam_cm: measurements.inseam_cm,
                neck_cm: measurements.neck_cm,
                notes: measurements.notes,
              }
            : null,
        },
        session.access_token
      );
      navigate(`/orders/${order.id}/pay`);
    } catch (err) {
      setError(err.message || "Couldn't place your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to place an order.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return null;

  if (error && !design) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p className="stx-error">{error}</p>
          <Link to="/designs" className="stx-link">← Back to my designs</Link>
        </div>
      </div>
    );
  }

  const color = COLORS.find((c) => c.id === design.color) || COLORS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <header style={{ padding: '16px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <Link to="/designs" className="stx-link" style={{ fontSize: '13px' }}>
          ← My designs
        </Link>
      </header>

      <div
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: '40px 24px 60px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '40px',
        }}
        className="stx-order-shell"
      >
        <div style={{ textAlign: 'center' }}>
          <GarmentPreview garmentType={design.garment_type} colorHex={color.hex} />
          <h3
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '18px', margin: '10px 0 2px', fontWeight: 500, textTransform: 'capitalize' }}
          >
            {design.garment_type}
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
            {design.fabric} · {color.label}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--brass)', margin: '10px 0 0' }}>
            {formatINR(design.estimated_price)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="stx-label" style={{ marginBottom: '6px' }}>
            Place order
          </p>
          <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: '0 0 24px' }}>
            Where should this go?
          </h1>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="tailor">
              Choose a tailor
            </label>
            <select
              id="tailor"
              className="stx-field"
              value={tailorId}
              onChange={(e) => setTailorId(e.target.value)}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {tailors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.business_name} — {t.city}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="address">
              Delivery address
            </label>
            <textarea
              id="address"
              className="stx-field"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="notes">
              Notes for the tailor (optional)
            </label>
            <textarea
              id="notes"
              className="stx-field"
              rows={3}
              placeholder="Fit preferences, timing…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div
            style={{
              marginBottom: '24px',
              padding: '14px 16px',
              border: `1px solid ${measurements ? 'var(--stone-line)' : 'var(--brass)'}`,
              background: measurements ? 'transparent' : 'rgba(169, 128, 62, 0.06)',
            }}
          >
            <p className="stx-label" style={{ marginBottom: '6px' }}>
              Measurements
            </p>
            {measurements ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink)', margin: 0 }}>
                Your saved measurements will be sent with this order.{' '}
                <Link to="/measurements" className="stx-link">Review or update →</Link>
              </p>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink)', margin: 0 }}>
                No measurements saved yet — your tailor will need these to get the fit right.{' '}
                <Link to="/measurements" className="stx-link">Add them now →</Link>
              </p>
            )}
          </div>

          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stx-order-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
