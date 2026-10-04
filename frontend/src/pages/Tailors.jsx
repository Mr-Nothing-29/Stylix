import { useEffect, useState } from 'react';
import { api } from '../services/api';
import TailorCard from '../components/tailors/TailorCard';
import SpecialtyTag from '../components/tailors/SpecialtyTag';
import NavBar from '../components/NavBar';
import '../styles/theme.css';

const SPECIALTY_OPTIONS = [
  'Bridal wear',
  'Formal suits',
  'Kurta & ethnic wear',
  'Western wear',
  'Alterations',
  'Kids wear',
];

export default function Tailors() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError('');
      api
        .getTailors({ search, specialty, city })
        .then(setTailors)
        .catch((err) => setError(err.message || "Couldn't load tailors."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, specialty, city]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <NavBar />
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--stone-line)' }}>
        <p className="stx-label" style={{ marginBottom: '4px' }}>
          Tailor discovery
        </p>
        <h1 className="stx-heading stx-heading--dark" style={{ fontSize: '26px', margin: 0 }}>
          Find a tailor
        </h1>
      </div>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '36px 24px 60px' }}>
        <input
          type="text"
          placeholder="Search by name, city, or specialty…"
          className="stx-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: '17px', marginBottom: '20px' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <SpecialtyTag
            label="All specialties"
            active={specialty === ''}
            onClick={() => setSpecialty('')}
          />
          {SPECIALTY_OPTIONS.map((s) => (
            <SpecialtyTag
              key={s}
              label={s}
              active={specialty === s}
              onClick={() => setSpecialty(specialty === s ? '' : s)}
            />
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by city (optional)"
          className="stx-field"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ maxWidth: '260px', fontSize: '13px', marginBottom: '32px' }}
        />

        {loading && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Searching…
          </p>
        )}

        {!loading && error && <p className="stx-error">{error}</p>}

        {!loading && !error && tailors.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            No tailors match those filters. Try widening your search.
          </p>
        )}

        {!loading && !error && tailors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {tailors.map((t) => (
              <TailorCard key={t.id} tailor={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
