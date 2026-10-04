export default function SpecialtyTag({ label, active, onClick }) {
  const clickable = typeof onClick === 'function';

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        letterSpacing: '0.04em',
        color: active ? 'var(--ink)' : 'var(--ink-soft)',
        border: `1px solid ${active ? 'var(--brass)' : 'var(--stone-line)'}`,
        background: active ? 'rgba(169, 128, 62, 0.08)' : 'transparent',
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  );
}
