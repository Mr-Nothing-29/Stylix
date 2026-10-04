import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatINR } from '../../utils/pricing';

export default function OrderCard({ order }) {
  const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '';

  return (
    <Link
      to={`/orders/${order.id}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 20px',
        border: '1px solid var(--stone-line)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div>
        <h3
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '18px', margin: '0 0 4px', fontWeight: 500, textTransform: 'capitalize' }}
        >
          {order.garment_type} · {order.fabric}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
          {date} · {formatINR(order.estimated_price)}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </Link>
  );
}
