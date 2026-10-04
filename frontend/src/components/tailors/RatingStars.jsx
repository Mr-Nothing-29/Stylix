export default function RatingStars({ rating, reviewCount }) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ display: 'flex', gap: '1px' }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <span
              key={i}
              style={{
                fontSize: '13px',
                color: filled || half ? 'var(--brass)' : 'var(--stone)',
              }}
            >
              ★
            </span>
          );
        })}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)' }}>
        {rating.toFixed(1)}
        {typeof reviewCount === 'number' && ` (${reviewCount})`}
      </span>
    </div>
  );
}
