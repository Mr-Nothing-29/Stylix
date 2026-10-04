import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/customize', label: 'Studio' },
  { to: '/recommendations', label: 'For you' },
  { to: '/tailors', label: 'Tailors' },
  { to: '/designs', label: 'My designs' },
  { to: '/measurements', label: 'Measurements' },
  { to: '/orders', label: 'My orders' },
  { to: '/profile', label: 'Profile' },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [...LINKS];
  if (profile?.role === 'tailor') {
    links.push({ to: '/tailor-dashboard', label: 'Dashboard' });
  }
  if (profile?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <header
      style={{
        padding: '18px 40px',
        borderBottom: '1px solid var(--stone-line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        background: 'var(--ivory)',
      }}
    >
      <Link
        to="/profile"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '19px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--ink)',
          textDecoration: 'none',
        }}
      >
        STYLIX
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12.5px',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                textDecoration: 'none',
                borderBottom: active ? '1.5px solid var(--brass)' : '1.5px solid transparent',
                paddingBottom: '3px',
              }}
            >
              {link.label}
            </Link>
          );
        })}

        {session && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '12.5px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
              padding: 0,
            }}
          >
            Sign out
          </button>
        )}
      </nav>
    </header>
  );
}
