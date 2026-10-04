import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import GarmentPreview from '../components/customize/GarmentPreview';
import StatusTimeline from '../components/orders/StatusTimeline';
import { COLORS } from '../data/customizationOptions';
import { ORDER_STATUSES, statusIndex } from '../data/orderStatus';
import { formatINR } from '../utils/pricing';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function OrderDetail() {
  const { id } = useParams();
  const { session } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewChecked, setReviewChecked] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getOrder(id, session.access_token)
      .then(setOrder)
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  }, [id, session]);

  useEffect(() => {
    if (!session || !order || order.status !== 'delivered') return;
    api
      .getOwnReview(id, session.access_token)
      .then(setReview)
      .catch(() => setReview(null))
      .finally(() => setReviewChecked(true));
  }, [id, session, order]);

  async function handleAdvance() {
    const currentIndex = statusIndex(order.status);
    const next = ORDER_STATUSES[currentIndex + 1];
    if (!next) return;

    setAdvancing(true);
    try {
      const updated = await api.updateOrderStatus(order.id, { status: next.id }, session.access_token);
      setOrder(updated);
    } catch (err) {
      setError(err.message || "Couldn't update the status.");
    } finally {
      setAdvancing(false);
    }
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to view this order.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return null;

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p className="stx-error">{error || 'Order not found.'}</p>
          <Link to="/orders" className="stx-link">← Back to orders</Link>
        </div>
      </div>
    );
  }

  const color = COLORS.find((c) => c.id === order.color) || COLORS[0];
  const isFinal = order.status === 'delivered';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <header style={{ padding: '16px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <Link to="/orders" className="stx-link" style={{ fontSize: '13px' }}>
          ← All orders
        </Link>
      </header>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 60px' }}>
        <p className="stx-label" style={{ marginBottom: '6px' }}>
          Order status
        </p>
        <h1
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '30px', margin: '0 0 40px', textTransform: 'capitalize' }}
        >
          {order.garment_type} · {order.fabric}
        </h1>

        <StatusTimeline status={order.status} />

        <div
          style={{
            marginTop: '32px',
            padding: '16px 20px',
            border: `1px solid ${order.payment_status === 'unpaid' ? 'var(--brass)' : 'var(--stone-line)'}`,
            background: order.payment_status === 'unpaid' ? 'rgba(169, 128, 62, 0.06)' : 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <p className="stx-label" style={{ marginBottom: '4px' }}>
              Payment
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
              {order.payment_status === 'paid' && 'Paid in full'}
              {order.payment_status === 'cod_pending' && 'Pay on delivery'}
              {order.payment_status === 'unpaid' && 'Not yet paid'}
            </p>
          </div>
          {order.payment_status === 'unpaid' && (
            <Link
              to={`/orders/${order.id}/pay`}
              className="stx-btn-primary"
              style={{ width: 'auto', padding: '10px 22px', textDecoration: 'none', display: 'inline-block' }}
            >
              Pay now
            </Link>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid var(--stone-line)',
          }}
        >
          <GarmentPreview garmentType={order.garment_type} colorHex={color.hex} />
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 4px' }}>
              {color.label}
              {order.addons?.length > 0 && ` · ${order.addons.join(', ')}`}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--brass)', margin: '0 0 16px' }}>
              {formatINR(order.estimated_price)}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 4px' }}>
              Delivering to
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
              {order.delivery_address}
            </p>
            {order.notes && (
              <>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '12px 0 4px' }}>
                  Notes
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
                  {order.notes}
                </p>
              </>
            )}

            {order.measurements && (
              <>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '12px 0 6px' }}>
                  Measurements
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '2px 16px' }}>
                  {[
                    ['Height', order.measurements.height_cm],
                    ['Chest/bust', order.measurements.chest_cm],
                    ['Waist', order.measurements.waist_cm],
                    ['Hip', order.measurements.hip_cm],
                    ['Shoulder', order.measurements.shoulder_cm],
                    ['Sleeve', order.measurements.sleeve_length_cm],
                    ['Inseam', order.measurements.inseam_cm],
                    ['Neck', order.measurements.neck_cm],
                  ]
                    .filter(([, v]) => v != null)
                    .map(([label, v]) => (
                      <p key={label} style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink)', margin: 0 }}>
                        {label}: {v} cm
                      </p>
                    ))}
                </div>
                {order.measurements.notes && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: '6px 0 0', fontStyle: 'italic' }}>
                    "{order.measurements.notes}"
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {!isFinal && (
          <div style={{ marginTop: '32px' }}>
            <button
              type="button"
              className="stx-btn-primary"
              style={{ width: 'auto', padding: '12px 26px' }}
              onClick={handleAdvance}
              disabled={advancing}
            >
              {advancing ? 'Updating…' : 'Mark next stage (demo)'}
            </button>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-soft)', marginTop: '8px' }}>
              In a live version, the tailor updates this from their dashboard — this button is here so you
              can demo the full flow yourself.
            </p>
          </div>
        )}

        {isFinal && reviewChecked && (
          <div
            style={{
              marginTop: '32px',
              padding: '16px 20px',
              border: `1px solid ${review ? 'var(--stone-line)' : 'var(--brass)'}`,
              background: review ? 'transparent' : 'rgba(169, 128, 62, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {review ? (
              <div>
                <p className="stx-label" style={{ marginBottom: '4px' }}>
                  Your review
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brass)', margin: 0 }}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="stx-label" style={{ marginBottom: '4px' }}>
                    How was it?
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
                    Leave a review for your tailor
                  </p>
                </div>
                <Link
                  to={`/orders/${order.id}/review`}
                  className="stx-btn-primary"
                  style={{ width: 'auto', padding: '10px 22px', textDecoration: 'none', display: 'inline-block' }}
                >
                  Write a review
                </Link>
              </>
            )}
          </div>
        )}

        {error && <p className="stx-error" style={{ marginTop: '16px' }}>{error}</p>}
      </div>
    </div>
  );
}
