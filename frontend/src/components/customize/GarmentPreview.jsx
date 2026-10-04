// 'd' path data per garment — redrawn as smooth curved silhouettes rather
// than straight-edged polygons, so each garment reads as an actual piece
// of clothing (sleeve curves, collar shaping, waist nip, flare, etc.)
// rather than an abstract shape.
const PATHS = {
  shirt:
    'M88,30 Q100,44 112,30 L135,32 Q158,36 162,45 Q166,58 168,78 Q158,84 150,82 Q140,76 132,68 Q136,90 138,100 Q140,140 142,175 L58,175 Q60,140 62,100 Q64,90 68,68 Q60,76 50,82 Q42,84 32,78 Q34,58 38,45 Q42,36 65,32 Z',
  kurta:
    'M88,30 Q100,44 112,30 L135,32 Q158,36 162,45 Q166,58 168,78 Q158,84 150,82 Q140,76 132,68 Q138,95 140,120 Q144,160 148,195 L128,193 L120,180 L80,180 L72,193 L52,195 Q56,160 60,120 Q62,95 68,68 Q60,76 50,82 Q42,84 32,78 Q34,58 38,45 Q42,36 65,32 Z',
  kurti:
    'M88,30 Q100,44 112,30 L135,32 Q158,36 162,45 Q166,58 168,78 Q158,84 150,82 Q140,76 132,68 Q136,90 138,105 Q140,125 142,148 L58,148 Q60,125 62,105 Q64,90 68,68 Q60,76 50,82 Q42,84 32,78 Q34,58 38,45 Q42,36 65,32 Z',
  dress:
    'M88,28 Q100,42 112,28 L128,30 Q145,34 148,42 Q150,50 146,56 Q140,60 134,56 Q130,62 128,72 Q126,90 122,100 Q140,140 158,195 Q100,205 42,195 Q60,140 78,100 Q74,90 72,72 Q70,62 66,56 Q60,60 54,56 Q50,50 52,42 Q55,34 72,30 Z',
  blazer:
    'M85,28 Q100,40 115,28 L142,30 Q164,34 170,46 Q175,58 176,74 Q166,82 158,80 Q148,74 140,66 Q144,100 145,130 Q147,160 148,185 L52,185 Q53,160 55,130 Q56,100 60,66 Q52,74 42,80 Q34,82 24,74 Q25,58 30,46 Q36,34 58,30 Z',
  overcoat:
    'M85,28 Q100,40 115,28 L142,30 Q164,34 170,46 Q175,58 176,74 Q166,82 158,80 Q148,74 140,66 Q144,110 146,150 Q148,180 150,208 L50,208 Q52,180 54,150 Q56,110 60,66 Q52,74 42,80 Q34,82 24,74 Q25,58 30,46 Q36,34 58,30 Z',
  waistcoat:
    'M82,26 Q100,42 118,26 L130,32 Q136,36 132,44 L114,54 L119,130 L81,130 L86,54 L68,44 Q64,36 70,32 Z',
  trousers:
    'M70,18 L130,18 Q135,18 135,23 L133,30 L67,30 L65,23 Q65,18 70,18 Z M67,30 Q64,60 62,100 Q60,150 58,205 L92,205 Q93,150 95,100 Q97,65 98,40 Q83,36 67,30 Z M133,30 Q136,60 138,100 Q140,150 142,205 L108,205 Q107,150 105,100 Q103,65 102,40 Q117,36 133,30 Z',
  coord:
    'M88,28 Q100,42 112,28 L128,30 Q145,34 148,42 Q150,50 146,56 Q140,60 134,56 Q131,64 129,74 Q127,84 126,92 Q145,140 162,205 Q100,218 38,205 Q55,140 74,92 Q73,84 71,74 Q69,64 66,56 Q60,60 54,56 Q50,50 52,42 Q55,34 72,30 Z',
};

// Garments with no visible centre-back seam in this flat style (sleeveless
// or single-piece pants read oddly with one).
const NO_BACK_SEAM = new Set(['waistcoat', 'trousers']);

// Per-garment [startY, endY] for the centre-back seam line, matched to
// each garment's actual torso/hem length.
const BACK_SEAM_RANGE = {
  shirt: [44, 175],
  kurta: [44, 190],
  kurti: [44, 148],
  dress: [42, 195],
  blazer: [40, 185],
  overcoat: [40, 205],
  waistcoat: [42, 128],
  coord: [42, 205],
};

// Roughly where the collar/chest sits per garment, for positioning addon
// indicators. Approximate by design — this is a stylised preview, not a
// pattern-accurate one.
const CHEST_POINT = {
  shirt: { x: 100, y: 95 },
  kurta: { x: 100, y: 100 },
  kurti: { x: 100, y: 95 },
  dress: { x: 100, y: 75 },
  blazer: { x: 100, y: 105 },
  overcoat: { x: 100, y: 115 },
  waistcoat: { x: 100, y: 80 },
  trousers: { x: 80, y: 55 },
  coord: { x: 100, y: 80 },
};

// Front-only construction details — collar flaps, lapels, and a button
// placket line. These represent how the garment is actually built, so
// unlike addons they always show on front view and never on back view.
function FrontDetails({ garmentType }) {
  const collarFlaps = (leftTip, rightTip, midY) => (
    <>
      <path d={`M${leftTip[0]},${leftTip[1]} L${leftTip[0] - 10},${midY} L${leftTip[0] + 8},${midY + 4} Z`} fill="var(--ink)" opacity="0.12" />
      <path d={`M${rightTip[0]},${rightTip[1]} L${rightTip[0] + 10},${midY} L${rightTip[0] - 8},${midY + 4} Z`} fill="var(--ink)" opacity="0.12" />
    </>
  );

  switch (garmentType) {
    case 'shirt':
      return (
        <>
          <path d="M88,30 L78,44 L96,48 Z" fill="var(--ink)" opacity="0.12" />
          <path d="M112,30 L122,44 L104,48 Z" fill="var(--ink)" opacity="0.12" />
          <line x1="100" y1="44" x2="100" y2="175" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
        </>
      );
    case 'kurta':
      return (
        <>
          <path d="M88,30 L78,44 L96,48 Z" fill="var(--ink)" opacity="0.12" />
          <path d="M112,30 L122,44 L104,48 Z" fill="var(--ink)" opacity="0.12" />
          <line x1="100" y1="44" x2="100" y2="150" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
        </>
      );
    case 'kurti':
      return (
        <>
          <path d="M88,30 L78,44 L96,48 Z" fill="var(--ink)" opacity="0.12" />
          <path d="M112,30 L122,44 L104,48 Z" fill="var(--ink)" opacity="0.12" />
          <line x1="100" y1="44" x2="100" y2="148" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
        </>
      );
    case 'dress':
      return (
        <>
          <path d="M88,28 L79,40 L96,44 Z" fill="var(--ink)" opacity="0.12" />
          <path d="M112,28 L121,40 L104,44 Z" fill="var(--ink)" opacity="0.12" />
          <line x1="100" y1="42" x2="100" y2="100" stroke="var(--ink)" strokeWidth="0.8" opacity="0.25" />
        </>
      );
    case 'coord':
      return (
        <>
          <path d="M88,28 L79,40 L96,44 Z" fill="var(--ink)" opacity="0.12" />
          <path d="M112,28 L121,40 L104,44 Z" fill="var(--ink)" opacity="0.12" />
          <line x1="70" y1="92" x2="130" y2="92" stroke="var(--ink)" strokeWidth="1" opacity="0.35" />
        </>
      );
    case 'blazer':
      return (
        <>
          <path d="M85,28 L62,54 L98,68 Z" fill="var(--ink)" opacity="0.16" />
          <path d="M115,28 L138,54 L102,68 Z" fill="var(--ink)" opacity="0.16" />
          <line x1="100" y1="40" x2="100" y2="185" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
        </>
      );
    case 'overcoat':
      return (
        <>
          <path d="M85,28 L62,54 L98,68 Z" fill="var(--ink)" opacity="0.16" />
          <path d="M115,28 L138,54 L102,68 Z" fill="var(--ink)" opacity="0.16" />
          <line x1="100" y1="40" x2="100" y2="208" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
        </>
      );
    case 'waistcoat':
      return <line x1="100" y1="42" x2="100" y2="128" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />;
    default:
      return null;
  }
}

function TextureDefs() {
  return (
    <defs>
      <pattern id="stx-tex-cotton" width="4" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="4" y2="0" stroke="#000" strokeOpacity="0.09" strokeWidth="0.6" />
      </pattern>
      <pattern
        id="stx-tex-linen"
        width="5" height="5" patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="5" stroke="#000" strokeOpacity="0.08" strokeWidth="0.6" />
      </pattern>
      <linearGradient id="stx-tex-silk" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="42%" stopColor="#fff" stopOpacity="0" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <pattern id="stx-tex-wool" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="1.2" cy="1.2" r="0.5" fill="#000" fillOpacity="0.09" />
        <circle cx="3.4" cy="3.1" r="0.4" fill="#000" fillOpacity="0.07" />
      </pattern>
      <linearGradient id="stx-shade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
        <stop offset="15%" stopColor="#000" stopOpacity="0" />
        <stop offset="85%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
      </linearGradient>
    </defs>
  );
}

function AddonIndicators({ addonIds, chest, view }) {
  const visible =
    view === 'back' ? addonIds.filter((a) => a === 'embroidery' || a === 'lining') : addonIds;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {visible.includes('embroidery') && (
        <g stroke="var(--brass)" strokeWidth="1" fill="none" opacity="0.85">
          <circle cx={chest.x - 14} cy={chest.y} r="2.2" />
          <circle cx={chest.x - 8} cy={chest.y - 4} r="2.2" />
          <circle cx={chest.x - 8} cy={chest.y + 4} r="2.2" />
          <path d={`M${chest.x - 18} ${chest.y} L${chest.x - 4} ${chest.y}`} strokeWidth="0.7" />
        </g>
      )}
      {visible.includes('monogram') && (
        <text
          x={chest.x + 10}
          y={chest.y + 4}
          fontFamily="var(--font-display)"
          fontSize="9"
          fill="var(--brass)"
          opacity="0.9"
        >
          AB
        </text>
      )}
      {visible.includes('buttons') && (
        <g fill="var(--brass)" opacity="0.85">
          <circle cx={chest.x} cy={chest.y + 10} r="1.4" />
          <circle cx={chest.x} cy={chest.y + 22} r="1.4" />
          <circle cx={chest.x} cy={chest.y + 34} r="1.4" />
        </g>
      )}
      {visible.includes('lining') && (
        <path
          d={`M${chest.x - 22} ${chest.y - 18} Q${chest.x} ${chest.y - 24} ${chest.x + 22} ${chest.y - 18}`}
          stroke="var(--wine)"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      )}
    </g>
  );
}

export default function GarmentPreview({
  garmentType,
  colorHex,
  fabric = null,
  addons = [],
  view = 'front',
  showMannequin = false,
}) {
  const d = PATHS[garmentType] || PATHS.shirt;
  const clipId = `stx-clip-${garmentType}-${view}`;
  const chest = CHEST_POINT[garmentType] || CHEST_POINT.shirt;
  const seamRange = BACK_SEAM_RANGE[garmentType];
  const hasBackSeam = view === 'back' && !NO_BACK_SEAM.has(garmentType) && seamRange;

  return (
    <svg
      viewBox="0 0 200 220"
      style={{ width: '100%', maxWidth: '260px', height: 'auto' }}
      aria-label={`${view === 'back' ? 'Back' : 'Front'} preview of the ${garmentType}${
        fabric ? ` in ${fabric}` : ''
      }`}
    >
      <TextureDefs />
      <clipPath id={clipId}>
        <path d={d} />
      </clipPath>

      {showMannequin && (
        <g stroke="var(--stone)" strokeWidth="1" fill="none" opacity="0.7">
          <circle cx="100" cy="10" r="9" />
          <path d="M100 19 L100 30" />
        </g>
      )}

      <g style={{ transition: 'opacity 0.2s ease' }}>
        <path d={d} fill={colorHex} stroke="none" />
        {fabric && (
          <g clipPath={`url(#${clipId})`}>
            <path d={d} fill={`url(#stx-tex-${fabric})`} stroke="none" />
          </g>
        )}
        <g clipPath={`url(#${clipId})`}>
          <path d={d} fill="url(#stx-shade)" stroke="none" />
        </g>
        <path d={d} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />

        <g clipPath={`url(#${clipId})`}>
          {view === 'front' ? (
            <FrontDetails garmentType={garmentType} />
          ) : (
            hasBackSeam && (
              <line
                x1="100"
                y1={seamRange[0]}
                x2="100"
                y2={seamRange[1]}
                stroke="var(--ink)"
                strokeWidth="0.6"
                opacity="0.35"
              />
            )
          )}
        </g>

        {addons.length > 0 && <AddonIndicators addonIds={addons} chest={chest} view={view} />}
      </g>
    </svg>
  );
}
