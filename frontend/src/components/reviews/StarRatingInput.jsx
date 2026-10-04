import { useState } from 'react';

export default function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: '28px',
            lineHeight: 1,
            color: (hover || value) >= n ? 'var(--brass)' : 'var(--stone)',
            transition: 'color 0.1s ease',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
