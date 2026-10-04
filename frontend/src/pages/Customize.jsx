import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GARMENT_TYPES, FABRICS, COLORS, ADDONS, GENDERS } from '../data/customizationOptions';
import { computeTotal } from '../utils/pricing';
import StepSection from '../components/customize/StepSection';
import OptionCard from '../components/customize/OptionCard';
import ColorSwatch from '../components/customize/ColorSwatch';
import PreviewPanel from '../components/customize/PreviewPanel';
import PreviewModal from '../components/customize/PreviewModal';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

export default function Customize() {
  const { session } = useAuth();
  const location = useLocation();
  const prefill = location.state?.prefill;

  const prefillGarment = prefill && GARMENT_TYPES.find((g) => g.id === prefill.garmentType);
  const [gender, setGender] = useState(prefillGarment ? prefillGarment.gender : 'men');
  const genderGarments = GARMENT_TYPES.filter((g) => g.gender === gender);

  const [garmentType, setGarmentType] = useState(
    prefillGarment ? prefillGarment.id : genderGarments[0].id
  );
  const [fabric, setFabric] = useState(prefill?.fabric || FABRICS[0].id);
  const [colorId, setColorId] = useState(prefill?.colorId || COLORS[0].id);
  const [addonIds, setAddonIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const garment = GARMENT_TYPES.find((g) => g.id === garmentType);
  const fabricObj = FABRICS.find((f) => f.id === fabric);
  const colorObj = COLORS.find((c) => c.id === colorId);

  function handleGenderChange(newGender) {
    setGender(newGender);
    const firstMatch = GARMENT_TYPES.find((g) => g.gender === newGender);
    setGarmentType(firstMatch.id);
  }

  const total = useMemo(
    () => computeTotal({ garmentType, fabric, addonIds }),
    [garmentType, fabric, addonIds]
  );

  function toggleAddon(id) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaveMessage('');

    if (!session) {
      setSaveMessage('Sign in to save your design.');
      return;
    }

    setSaving(true);
    try {
      await api.saveDesign(
        { garment_type: garmentType, fabric, color: colorId, addons: addonIds, estimated_price: total },
        session.access_token
      );
      setSaveMessage('Design saved to your account.');
      setSaved(true);
    } catch (err) {
      setSaveMessage(err.message || "Couldn't save your design.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div
        style={{
          padding: '20px 40px',
          borderBottom: '1px solid var(--stone-line)',
        }}
      >
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Design studio
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          Build your garment
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          alignItems: 'start',
        }}
        className="stx-studio-shell"
      >
        <div style={{ padding: '8px 40px 60px' }}>
          <StepSection number={1} title="Choose a garment" subtitle="What are we making?">
            <div style={{ display: 'flex', gap: '0', marginBottom: '18px', borderBottom: '1px solid var(--stone-line)' }}>
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGenderChange(g.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 0 10px',
                    marginRight: '28px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: gender === g.id ? 'var(--ink)' : 'var(--ink-soft)',
                    borderBottom: gender === g.id ? '2px solid var(--brass)' : '2px solid transparent',
                    opacity: gender === g.id ? 1 : 0.6,
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {genderGarments.map((g) => (
                <OptionCard
                  key={g.id}
                  label={g.label}
                  description={g.description}
                  meta={`from ₹${g.basePrice}`}
                  selected={garmentType === g.id}
                  onClick={() => setGarmentType(g.id)}
                />
              ))}
            </div>
          </StepSection>

          <StepSection number={2} title="Pick a fabric" subtitle={`${garment.fabricMeters}m needed for this garment`}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {FABRICS.map((f) => (
                <OptionCard
                  key={f.id}
                  label={f.label}
                  description={f.texture}
                  meta={`₹${f.pricePerMeter}/m`}
                  selected={fabric === f.id}
                  onClick={() => setFabric(f.id)}
                />
              ))}
            </div>
          </StepSection>

          <StepSection number={3} title="Choose a colour">
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <ColorSwatch
                  key={c.id}
                  hex={c.hex}
                  label={c.label}
                  selected={colorId === c.id}
                  onClick={() => setColorId(c.id)}
                />
              ))}
            </div>
          </StepSection>

          <StepSection number={4} title="Finishing details" subtitle="Optional add-ons">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ADDONS.map((a) => (
                <label
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: `1px solid ${addonIds.includes(a.id) ? 'var(--brass)' : 'var(--stone-line)'}`,
                    background: addonIds.includes(a.id) ? 'rgba(169, 128, 62, 0.06)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={addonIds.includes(a.id)}
                      onChange={() => toggleAddon(a.id)}
                      style={{ accentColor: '#4E1B22' }}
                    />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink)' }}>
                      {a.label}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brass)' }}>
                    +₹{a.price}
                  </span>
                </label>
              ))}
            </div>
          </StepSection>
        </div>

        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <PreviewPanel
            garmentType={garmentType}
            garmentLabel={garment.label}
            colorId={colorId}
            fabric={fabric}
            addons={addonIds}
            total={total}
            onSave={handleSave}
            saving={saving}
            saveMessage={saveMessage}
            saved={saved}
          />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              background: 'var(--ink)',
              borderTop: '1px solid rgba(246, 243, 236, 0.18)',
              color: 'var(--brass-light)',
              fontFamily: 'var(--font-body)',
              fontSize: '11.5px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '14px',
              cursor: 'pointer',
            }}
          >
            View full preview →
          </button>
        </div>
      </div>

      {previewOpen && (
        <PreviewModal
          garmentType={garmentType}
          garmentLabel={garment.label}
          fabric={fabric}
          fabricLabel={fabricObj.label}
          colorHex={colorObj.hex}
          colorLabel={colorObj.label}
          addons={addonIds}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .stx-studio-shell {
            grid-template-columns: 1fr !important;
          }
          .stx-studio-shell > div:last-child {
            position: static !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
