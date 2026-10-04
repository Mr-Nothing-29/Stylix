export default function OptionCard({ label, description, meta, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '16px 18px',
        background: selected ? 'rgba(169, 128, 62, 0.08)' : 'transparent',
        border: `1px solid ${selected ? 'var(--brass)' : 'var(--stone-line)'}`,
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          {label}
        </span>
        {meta && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brass)',
            }}
          >
            {meta}
          </span>
        )}
      </div>
      {description && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: '12.5px',
            color: 'var(--ink-soft)',
            margin: '6px 0 0',
          }}
        >
          {description}
        </p>
      )}
    </button>
  );
}
