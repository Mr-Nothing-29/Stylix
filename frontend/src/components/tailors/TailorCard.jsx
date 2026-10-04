import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import SpecialtyTag from './SpecialtyTag';

export default function TailorCard({ tailor }) {
  return (
    <Link
      to={`/tailors/${tailor.id}`}
      style={{
        display: 'block',
        border: '1px solid var(--stone-line)',
        padding: '22px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brass)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--stone-line)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '19px', margin: '0 0 4px', fontWeight: 500 }}
          >
            {tailor.business_name}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            {tailor.city} · {tailor.years_experience} yrs experience
          </p>
        </div>
      </div>

      <div style={{ margin: '12px 0' }}>
        <RatingStars rating={tailor.rating} reviewCount={tailor.review_count} />
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {tailor.specialties.slice(0, 3).map((s) => (
          <SpecialtyTag key={s} label={s} />
        ))}
      </div>
    </Link>
  );
}
