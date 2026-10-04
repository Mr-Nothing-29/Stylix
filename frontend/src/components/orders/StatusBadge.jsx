import { statusLabel } from '../../data/orderStatus';

export default function StatusBadge({ status }) {
  const delivered = status === 'delivered';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 11px',
        fontFamily: 'var(--font-body)',
        fontSize: '10.5px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: delivered ? 'var(--ivory)' : 'var(--ink)',
        background: delivered ? 'var(--ink)' : 'rgba(169, 128, 62, 0.1)',
        border: delivered ? 'none' : '1px solid var(--brass)',
      }}
    >
      {statusLabel(status)}
    </span>
  );
}
