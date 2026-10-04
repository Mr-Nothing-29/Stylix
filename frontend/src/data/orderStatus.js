export const ORDER_STATUSES = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'stitching', label: 'Stitching' },
  { id: 'ready', label: 'Ready' },
  { id: 'delivered', label: 'Delivered' },
];

export function statusIndex(statusId) {
  return ORDER_STATUSES.findIndex((s) => s.id === statusId);
}

export function statusLabel(statusId) {
  return ORDER_STATUSES.find((s) => s.id === statusId)?.label || statusId;
}
