export default function StatCard({ label, value }) {
  return (
    <div style={{ padding: '18px 20px', border: '1px solid var(--stone-line)' }}>
      <p className="stx-label" style={{ marginBottom: '8px' }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
