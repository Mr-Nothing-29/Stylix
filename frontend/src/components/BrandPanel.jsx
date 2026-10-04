function MeasuringTape() {
  const ticks = Array.from({ length: 40 });
  return (
    <div className="stx-tape" aria-hidden="true">
      {ticks.map((_, i) => (
        <div
          key={i}
          className={`stx-tape__tick ${i % 5 === 0 ? 'stx-tape__tick--major' : ''}`}
          style={{ height: i % 5 === 0 ? '18px' : '9px' }}
        />
      ))}
    </div>
  );
}

export default function BrandPanel({ eyebrow, title, body }) {
  return (
    <div
      style={{
        background: 'var(--ink)',
        color: 'var(--ivory)',
        padding: '56px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '520px',
      }}
    >
      <div>
        <p className="stx-label" style={{ color: 'var(--brass-light)', marginBottom: '18px' }}>
          {eyebrow}
        </p>
        <h1
          className="stx-heading"
          style={{ fontSize: '42px', lineHeight: 1.15, margin: 0, maxWidth: '360px' }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: '14px',
            lineHeight: 1.7,
            color: 'rgba(246, 243, 236, 0.7)',
            marginTop: '20px',
            maxWidth: '320px',
          }}
        >
          {body}
        </p>
      </div>

      <div>
        <MeasuringTape />
        <p
          className="stx-label"
          style={{ marginTop: '10px', color: 'rgba(246, 243, 236, 0.45)' }}
        >
          Cut to fit &mdash; measured, not guessed
        </p>
      </div>
    </div>
  );
}
