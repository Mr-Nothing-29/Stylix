import { Link } from 'react-router-dom';
import GarmentPreview from './GarmentPreview';
import { formatINR } from '../../utils/pricing';
import { COLORS } from '../../data/customizationOptions';

export default function PreviewPanel({ garmentType, garmentLabel, colorId, fabric, addons, total, onSave, saving, saveMessage, saved }) {
  const color = COLORS.find((c) => c.id === colorId) || COLORS[0];

  return (
    <div
      style={{
        background: 'var(--ink)',
        color: 'var(--ivory)',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p className="stx-label" style={{ color: 'var(--brass-light)', marginBottom: '18px' }}>
          Live preview
        </p>
        <GarmentPreview garmentType={garmentType} colorHex={color.hex} fabric={fabric} addons={addons} />
        <h3
          className="stx-heading"
          style={{ fontSize: '24px', margin: '18px 0 4px', fontWeight: 500 }}
        >
          {garmentLabel}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'rgba(246, 243, 236, 0.6)',
            margin: 0,
          }}
        >
          {color.label}
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderTop: '1px solid rgba(246, 243, 236, 0.18)',
            paddingTop: '18px',
            marginTop: '24px',
          }}
        >
          <span className="stx-label" style={{ color: 'rgba(246, 243, 236, 0.6)' }}>
            Estimated total
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              color: 'var(--ivory)',
            }}
          >
            {formatINR(total)}
          </span>
        </div>

        <button
          type="button"
          className="stx-btn-primary"
          style={{ marginTop: '18px' }}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving design…' : 'Save this design'}
        </button>

        {saveMessage && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brass-light)',
              marginTop: '10px',
              textAlign: 'center',
            }}
          >
            {saveMessage}
          </p>
        )}

        {saved && (
          <Link
            to="/designs"
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ivory)',
              borderBottom: '1px solid var(--brass)',
              paddingBottom: '2px',
              marginTop: '10px',
              textDecoration: 'none',
              width: 'fit-content',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            View it in My Designs →
          </Link>
        )}
      </div>
    </div>
  );
}
