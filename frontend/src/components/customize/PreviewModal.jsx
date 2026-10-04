import { useState } from 'react';
import GarmentPreview from './GarmentPreview';

export default function PreviewModal({ garmentType, garmentLabel, fabric, fabricLabel, colorHex, colorLabel, addons, onClose }) {
  const [view, setView] = useState('front');

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 20, 15, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--ivory)',
          maxWidth: '440px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: 'var(--ink-soft)',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Virtual preview
        </p>
        <h2
          className="stx-heading stx-heading--dark"
          style={{ fontSize: '24px', margin: '0 0 20px', textTransform: 'capitalize' }}
        >
          {garmentLabel}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <GarmentPreview
            garmentType={garmentType}
            colorHex={colorHex}
            fabric={fabric}
            addons={addons}
            view={view}
            showMannequin
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '22px' }}>
          {['front', 'back'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 16px 8px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: view === v ? 'var(--ink)' : 'var(--ink-soft)',
                borderBottom: view === v ? '2px solid var(--brass)' : '2px solid transparent',
              }}
            >
              {v === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--stone-line)', paddingTop: '16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--ink-soft)', margin: '0 0 6px' }}>
            {fabricLabel} · {colorLabel}
          </p>
          {addons.length > 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--brass)', margin: 0, textTransform: 'capitalize' }}>
              {addons.join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
