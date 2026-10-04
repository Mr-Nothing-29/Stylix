export default function PaymentMethodTile({ id, label, description, selected, onClick }) {
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
        marginBottom: '10px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--ink)',
          display: 'block',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--ink-soft)',
        }}
      >
        {description}
      </span>
    </button>
  );
}
