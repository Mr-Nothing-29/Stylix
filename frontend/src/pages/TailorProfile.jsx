import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import RatingStars from '../components/tailors/RatingStars';
import SpecialtyTag from '../components/tailors/SpecialtyTag';
import ReviewCard from '../components/reviews/ReviewCard';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function TailorProfile() {
  const { id } = useParams();
  const { session } = useAuth();
  const [tailor, setTailor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  useEffect(() => {
    api
      .getTailor(id)
      .then(setTailor)
      .catch((err) => setError(err.message || "Couldn't load this tailor."))
      .finally(() => setLoading(false));
    api.getTailorReviews(id).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  async function handleConnect(e) {
    e.preventDefault();
    setSendResult('');

    if (!session) {
      setSendResult('Sign in to send a connection request.');
      return;
    }
    if (!message.trim()) {
      setSendResult('Write a short note about what you need.');
      return;
    }

    setSending(true);
    try {
      await api.connectWithTailor(id, { message }, session.access_token);
      setSendResult('Request sent — the tailor will get back to you.');
      setMessage('');
    } catch (err) {
      setSendResult(err.message || "Couldn't send your request.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return null;

  if (error || !tailor) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <NavBar />
        <div style={{ padding: '48px' }}>
          <p className="stx-error">{error || 'Tailor not found.'}</p>
          <Link to="/tailors" className="stx-link">← Back to tailors</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <header style={{ padding: '16px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <Link to="/tailors" className="stx-link" style={{ fontSize: '13px' }}>
          ← All tailors
        </Link>
      </header>

      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '40px 24px 60px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '48px',
        }}
        className="stx-tailor-shell"
      >
        <div>
          <p className="stx-label" style={{ marginBottom: '6px' }}>
            {tailor.city} · {tailor.years_experience} years experience
          </p>
          <h1
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '34px', margin: '0 0 12px' }}
          >
            {tailor.business_name}
          </h1>

          <RatingStars rating={tailor.rating} reviewCount={tailor.review_count} />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '18px 0' }}>
            {tailor.specialties.map((s) => (
              <SpecialtyTag key={s} label={s} />
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'var(--ink)',
              maxWidth: '440px',
            }}
          >
            {tailor.bio}
          </p>

          {tailor.starting_price && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--brass)',
                marginTop: '16px',
              }}
            >
              Custom work starting from ₹{tailor.starting_price.toLocaleString('en-IN')}
            </p>
          )}

          <div style={{ marginTop: '36px', maxWidth: '440px' }}>
            <p className="stx-label" style={{ marginBottom: '8px' }}>
              Reviews
            </p>
            {reviews.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
                No reviews yet — be the first to work with them and leave one.
              </p>
            ) : (
              <div>
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--stone-line)', paddingLeft: '40px' }}>
          <p className="stx-label" style={{ marginBottom: '6px' }}>
            Get in touch
          </p>
          <h2
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '20px', margin: '0 0 16px', fontWeight: 500 }}
          >
            Send a request
          </h2>

          <form onSubmit={handleConnect}>
            <textarea
              className="stx-field"
              rows={5}
              placeholder="Tell them what you're looking to get made…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
            {sendResult && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12.5px',
                  color: sendResult.startsWith('Request sent') ? 'var(--brass)' : 'var(--error)',
                  margin: '8px 0 0',
                }}
              >
                {sendResult}
              </p>
            )}
            <button
              type="submit"
              className="stx-btn-primary"
              style={{ marginTop: '16px' }}
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Send request'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .stx-tailor-shell {
            grid-template-columns: 1fr !important;
          }
          .stx-tailor-shell > div:last-child {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--stone-line);
            padding-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
