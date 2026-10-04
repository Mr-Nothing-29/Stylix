import { Link } from 'react-router-dom';
import '../styles/theme.css';

function MeasuringTape() {
  const ticks = Array.from({ length: 60 });
  return (
    <div className="stx-tape" aria-hidden="true">
      {ticks.map((_, i) => (
        <div
          key={i}
          className={`stx-tape__tick ${i % 5 === 0 ? 'stx-tape__tick--major' : ''}`}
          style={{ height: i % 5 === 0 ? '16px' : '8px' }}
        />
      ))}
    </div>
  );
}

const FEATURES = [
  { title: 'Design it', body: 'Pick a garment, fabric, colour, and finishing details in the studio — see it and its price update live.' },
  { title: 'Find your tailor', body: 'Search and filter real tailors by specialty and city, read reviews, and connect directly.' },
  { title: 'Track every stage', body: 'From submitted to delivered, follow your order on a clear visual timeline.' },
];

export default function Welcome() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <header
        style={{
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
          }}
        >
          STYLIX
        </span>
        <Link to="/login" className="stx-link" style={{ fontSize: '13px' }}>
          Sign in
        </Link>
      </header>

      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '64px 24px 40px',
          textAlign: 'center',
        }}
      >
        <p className="stx-label" style={{ marginBottom: '18px' }}>
          Made to measure, made online
        </p>
        <h1
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '44px', lineHeight: 1.15, margin: '0 0 20px' }}
        >
          Design your garment. Find your tailor. Wear it.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--ink-soft)',
            margin: '0 auto 36px',
            maxWidth: '460px',
          }}
        >
          Stylix connects you with real tailors to bring a custom design to
          life — from first sketch to finished garment, all in one place.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/signup"
            className="stx-btn-primary"
            style={{ width: 'auto', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}
          >
            Get started
          </Link>
          <Link
            to="/login"
            style={{
              padding: '14px 32px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              border: '1px solid var(--stone-line)',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '20px 24px 0' }}>
        <MeasuringTape />
      </div>

      <div
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '40px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
        }}
        className="stx-welcome-features"
      >
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h3
              className="stx-heading stx-heading--dark"
              style={{ fontSize: '18px', margin: '0 0 8px', fontWeight: 500 }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--ink-soft)',
                margin: 0,
              }}
            >
              {f.body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .stx-welcome-features {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
