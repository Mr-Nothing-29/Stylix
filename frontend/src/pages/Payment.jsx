import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PaymentMethodTile from '../components/payments/PaymentMethodTile';
import { formatINR } from '../utils/pricing';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

const METHODS = [
  { id: 'upi', label: 'UPI', description: 'Scan a real QR code with any UPI app.' },
  { id: 'card', label: 'Card', description: 'Credit or debit card (demo).' },
  { id: 'cod', label: 'Cash on delivery', description: 'Pay the tailor when your order arrives.' },
];

const UPI_ID = import.meta.env.VITE_UPI_ID || '';
const UPI_PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || 'Stylix';

export default function Payment() {
  const { id } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [method, setMethod] = useState('upi');
  const [upiRef, setUpiRef] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getOrder(id, session.access_token)
      .then((o) => {
        if (o.payment_status === 'paid') {
          navigate(`/orders/${id}`);
          return;
        }
        setOrder(o);
      })
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  }, [id, session, navigate]);

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function buildUpiUri() {
    const note = `Stylix order ${order.id.slice(0, 8)}`;
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_PAYEE_NAME,
      am: String(order.estimated_price),
      cu: 'INR',
      tn: note,
    });
    return `upi://pay?${params.toString()}`;
  }

  async function handlePay(e) {
    e.preventDefault();
    setError('');

    if (method === 'upi' && !UPI_ID) {
      setError('No UPI ID is configured for this app yet — add VITE_UPI_ID to frontend/.env.');
      return;
    }
    if (method === 'card' && (cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3)) {
      setError('Fill in a complete card number, expiry, and CVV.');
      return;
    }

    setProcessing(true);
    try {
      const payload = { method };
      if (method === 'upi') {
        payload.upi_ref = upiRef.trim() || null;
      } else if (method === 'card') {
        // Simulated processing delay for a realistic checkout feel — the
        // card flow is still a mock, unlike UPI which is a real transfer.
        await new Promise((resolve) => setTimeout(resolve, 1200));
        payload.card_last4 = cardNumber.replace(/\s/g, '').slice(-4);
      }

      await api.payForOrder(order.id, payload, session.access_token);
      navigate(`/orders/${order.id}`, { state: { justPaid: true } });
    } catch (err) {
      setError(err.message || 'Payment failed. Try again.');
    } finally {
      setProcessing(false);
    }
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <Link to="/login" className="stx-link">Sign in</Link> to pay for this order.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return null;

  if (error && !order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p className="stx-error">{error}</p>
          <Link to="/orders" className="stx-link">← Back to orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <header style={{ padding: '16px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <Link to={`/orders/${order.id}`} className="stx-link" style={{ fontSize: '13px' }}>
          ← Back to order
        </Link>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 24px 60px' }}>
        <p className="stx-label" style={{ marginBottom: '6px' }}>
          Checkout
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '28px', margin: '0 0 4px' }}>
          {formatINR(order.estimated_price)}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 32px', textTransform: 'capitalize' }}>
          {order.garment_type} · {order.fabric}
        </p>

        <form onSubmit={handlePay}>
          <p className="stx-label" style={{ marginBottom: '10px' }}>
            Payment method
          </p>
          {METHODS.map((m) => (
            <PaymentMethodTile
              key={m.id}
              label={m.label}
              description={m.description}
              selected={method === m.id}
              onClick={() => setMethod(m.id)}
            />
          ))}

          {method === 'upi' && (
            <div style={{ margin: '20px 0' }}>
              {!UPI_ID ? (
                <p className="stx-error" style={{ marginTop: 0 }}>
                  No UPI ID configured yet. Add VITE_UPI_ID (and optionally VITE_UPI_PAYEE_NAME)
                  to frontend/.env, then restart the dev server.
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: '#fff', border: '1px solid var(--stone-line)' }}>
                    <QRCodeSVG value={buildUpiUri()} size={180} fgColor="#16140F" bgColor="#ffffff" />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12.5px',
                      color: 'var(--ink)',
                      textAlign: 'center',
                      margin: '14px 0 0',
                    }}
                  >
                    Scan with GPay, PhonePe, Paytm, or any UPI app to pay {formatINR(order.estimated_price)}.
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--ink-soft)',
                      textAlign: 'center',
                      margin: '4px 0 20px',
                    }}
                  >
                    This is a real UPI transfer to {UPI_ID} — not processed by Stylix.
                  </p>

                  <label className="stx-label" htmlFor="upiRef">
                    Transaction reference / UTR (optional)
                  </label>
                  <input
                    id="upiRef"
                    className="stx-field"
                    placeholder="e.g. 234567891234"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                  />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px' }}>
                    Find this in your UPI app's payment confirmation screen — helps match this
                    order to your transfer.
                  </p>
                </>
              )}
            </div>
          )}

          {method === 'card' && (
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="stx-label" htmlFor="cardNumber">
                  Card number
                </label>
                <input
                  id="cardNumber"
                  className="stx-field"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label className="stx-label" htmlFor="expiry">
                    Expiry
                  </label>
                  <input
                    id="expiry"
                    className="stx-field"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="stx-label" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    className="stx-field"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'cod' && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink-soft)', margin: '16px 0' }}>
              You'll pay the tailor directly when your order is delivered. No payment is collected now.
            </p>
          )}

          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" style={{ marginTop: '10px' }} disabled={processing}>
            {processing
              ? 'Processing…'
              : method === 'cod'
              ? 'Confirm order'
              : method === 'upi'
              ? "I've completed the payment"
              : `Pay ${formatINR(order.estimated_price)}`}
          </button>

          {method === 'card' && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: '12px', textAlign: 'center' }}>
              Demo checkout — no real card payment is processed.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
