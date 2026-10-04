export default function StepSection({ number, title, subtitle, children }) {
  return (
    <section style={{ padding: '32px 0', borderBottom: '1px solid var(--stone-line)' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <span
          className="stx-label"
          style={{
            color: 'var(--brass)',
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            letterSpacing: 'normal',
            textTransform: 'none',
            lineHeight: 1,
          }}
        >
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <h3
            className="stx-heading stx-heading--dark"
            style={{ fontSize: '22px', margin: 0, fontWeight: 500 }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--ink-soft)',
                margin: '4px 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
