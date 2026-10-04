export const GARMENT_TYPES = [
  {
    id: 'shirt',
    label: 'Shirt',
    gender: 'men',
    basePrice: 449,
    fabricMeters: 1.8,
    description: 'Tailored shirt, formal or casual cut.',
  },
  {
    id: 'kurta',
    label: 'Kurta',
    gender: 'men',
    basePrice: 549,
    fabricMeters: 2.5,
    description: 'Traditional kurta with a modern silhouette.',
  },
  {
    id: 'blazer',
    label: 'Blazer',
    gender: 'men',
    basePrice: 1299,
    fabricMeters: 3.5,
    description: 'Structured blazer with a tailored shoulder line.',
  },
  {
    id: 'trousers',
    label: 'Trousers',
    gender: 'men',
    basePrice: 399,
    fabricMeters: 1.5,
    description: 'Tailored trousers, straight or slim fit.',
  },
  {
    id: 'waistcoat',
    label: 'Waistcoat',
    gender: 'men',
    basePrice: 499,
    fabricMeters: 1.2,
    description: 'Fitted waistcoat, worn over a shirt.',
  },
  {
    id: 'overcoat',
    label: 'Overcoat',
    gender: 'men',
    basePrice: 1799,
    fabricMeters: 4.0,
    description: 'Long structured coat for layering in colder months.',
  },
  {
    id: 'dress',
    label: 'Dress',
    gender: 'women',
    basePrice: 799,
    fabricMeters: 3.0,
    description: 'Fitted or flowing, made to your measurements.',
  },
  {
    id: 'kurti',
    label: 'Kurti',
    gender: 'women',
    basePrice: 499,
    fabricMeters: 2.0,
    description: 'Relaxed, knee-length kurti for everyday wear.',
  },
  {
    id: 'coord',
    label: 'Co-ord set',
    gender: 'women',
    basePrice: 899,
    fabricMeters: 3.2,
    description: 'Cropped top with a flared palazzo, cut as one set.',
  },
];

export const GENDERS = [
  { id: 'men', label: "Men's" },
  { id: 'women', label: "Women's" },
];

export const FABRICS = [
  { id: 'cotton', label: 'Cotton', pricePerMeter: 150, texture: 'Crisp, breathable, everyday wear.' },
  { id: 'linen', label: 'Linen', pricePerMeter: 220, texture: 'Light and airy, relaxed drape.' },
  { id: 'silk', label: 'Silk', pricePerMeter: 400, texture: 'Smooth sheen, occasion wear.' },
  { id: 'wool', label: 'Wool blend', pricePerMeter: 350, texture: 'Structured, holds shape well.' },
];

export const COLORS = [
  { id: 'ivory', label: 'Ivory', hex: '#F1EDE3' },
  { id: 'charcoal', label: 'Charcoal', hex: '#2E2C28' },
  { id: 'wine', label: 'Wine', hex: '#5B1A22' },
  { id: 'sage', label: 'Sage', hex: '#7C8265' },
  { id: 'navy', label: 'Navy', hex: '#1F2937' },
  { id: 'brass', label: 'Brass', hex: '#A9803E' },
];

export const ADDONS = [
  { id: 'embroidery', label: 'Hand embroidery detail', price: 180 },
  { id: 'lining', label: 'Contrast inner lining', price: 90 },
  { id: 'monogram', label: 'Monogram', price: 120 },
  { id: 'buttons', label: 'Horn buttons upgrade', price: 80 },
];
