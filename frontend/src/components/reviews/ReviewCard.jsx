export default function ReviewCard({ review }) {
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--stone-line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
          {review.customer_name || 'Stylix customer'}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-soft)' }}>
          {date}
        </span>
      </div>
      <div style={{ marginBottom: review.comment ? '6px' : 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{ fontSize: '13px', color: i < review.rating ? 'var(--brass)' : 'var(--stone)' }}
          >
            ★
          </span>
        ))}
      </div>
      {review.comment && (
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.6 }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}
