import { ORDER_STATUSES, statusIndex } from '../../data/orderStatus';

export default function StatusTimeline({ status }) {
  const currentIndex = statusIndex(status);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {ORDER_STATUSES.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const upcoming = i > currentIndex;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i === ORDER_STATUSES.length - 1 ? '0 0 auto' : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: done || active ? 'var(--ink)' : 'transparent',
                  border: `1.5px solid ${active ? 'var(--brass)' : done ? 'var(--ink)' : 'var(--stone)'}`,
                  boxShadow: active ? '0 0 0 3px rgba(169, 128, 62, 0.2)' : 'none',
                  display: 'block',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10.5px',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: upcoming ? 'var(--stone)' : 'var(--ink)',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </div>
            {i < ORDER_STATUSES.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: i < currentIndex ? 'var(--ink)' : 'var(--stone-line)',
                  marginTop: '-18px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
