import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StarRatingInput from '../components/reviews/StarRatingInput';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function LeaveReview() {
  const { id } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api
      .getOrder(id, session.access_token)
      .then((o) => {
        if (o.status !== 'delivered') {
          setError('This order needs to be delivered before you can review it.');
          return;
        }
        setOrder(o);
      })
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  }, [id, session]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Pick a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createReview(id, { rating, comment: comment || null }, session.access_token);
      navigate(`/orders/${id}`, { state: { justReviewed: true } });
    } catch (err) {
      setError(err.message || "Couldn't submit your review.");
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
            <Link to="/login" className="stx-link">Sign in</Link> to leave a review.
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
          <Link to={`/orders/${id}`} className="stx-link">← Back to order</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <header style={{ padding: '16px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <Link to={`/orders/${id}`} className="stx-link" style={{ fontSize: '13px' }}>
          ← Back to order
        </Link>
      </header>

      <div style={{ maxWidth: '460px', margin: '0 auto', padding: '48px 24px 60px' }}>
        <p className="stx-label" style={{ marginBottom: '6px' }}>
          Leave a review
        </p>
        <h1
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '26px', margin: '0 0 4px', textTransform: 'capitalize' }}
        >
          How was your {order.garment_type}?
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 32px' }}>
          Your review helps other customers pick the right tailor.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '22px' }}>
            <p className="stx-label" style={{ marginBottom: '10px' }}>
              Your rating
            </p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="stx-label" htmlFor="comment">
              Your review (optional)
            </label>
            <textarea
              id="comment"
              className="stx-field"
              rows={5}
              placeholder="What was it like working with this tailor?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          {error && <p className="stx-error">{error}</p>}

          <button type="submit" className="stx-btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </div>
    </div>
  );
}
