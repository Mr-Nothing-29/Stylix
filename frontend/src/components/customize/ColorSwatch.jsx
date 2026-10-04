export default function ColorSwatch({ hex, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: hex,
          display: 'block',
          border: selected ? '2px solid var(--brass)' : '1px solid var(--stone-line)',
          outline: selected ? '2px solid var(--ivory)' : 'none',
          outlineOffset: selected ? '-4px' : 0,
          boxShadow: selected ? '0 0 0 1px var(--brass)' : 'none',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: selected ? 'var(--ink)' : 'var(--ink-soft)',
        }}
      >
        {label}
      </span>
    </button>
  );
}
