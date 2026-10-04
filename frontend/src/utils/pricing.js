import { GARMENT_TYPES, FABRICS, ADDONS } from '../data/customizationOptions';

export function computeTotal({ garmentType, fabric, addonIds = [] }) {
  const garment = GARMENT_TYPES.find((g) => g.id === garmentType);
  const fabricOption = FABRICS.find((f) => f.id === fabric);

  if (!garment || !fabricOption) return 0;

  const fabricCost = fabricOption.pricePerMeter * garment.fabricMeters;
  const addonsCost = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0
  );

  return Math.round(garment.basePrice + fabricCost + addonsCost);
}

export function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}
