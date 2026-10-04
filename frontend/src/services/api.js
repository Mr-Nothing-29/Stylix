const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || 'Something went wrong. Try again.');
  }

  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getProfile: (token) => request('/users/me', { token }),
  updateProfile: (payload, token) =>
    request('/users/me', { method: 'PUT', body: payload, token }),
  saveDesign: (payload, token) => request('/designs', { method: 'POST', body: payload, token }),
  getMyDesigns: (token) => request('/designs', { token }),
  getTailors: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/tailors${query ? `?${query}` : ''}`);
  },
  getTailor: (id) => request(`/tailors/${id}`),
  connectWithTailor: (id, payload, token) =>
    request(`/tailors/${id}/connect`, { method: 'POST', body: payload, token }),
  getMyConnections: (token) => request('/connections/mine', { token }),
  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  getMyOrders: (token) => request('/orders', { token }),
  getOrder: (id, token) => request(`/orders/${id}`, { token }),
  updateOrderStatus: (id, payload, token) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: payload, token }),
  payForOrder: (id, payload, token) =>
    request(`/orders/${id}/pay`, { method: 'POST', body: payload, token }),
  getPaymentForOrder: (id, token) => request(`/orders/${id}/payment`, { token }),
  createReview: (orderId, payload, token) =>
    request(`/orders/${orderId}/review`, { method: 'POST', body: payload, token }),
  getOwnReview: (orderId, token) => request(`/orders/${orderId}/review`, { token }),
  getTailorReviews: (tailorId) => request(`/tailors/${tailorId}/reviews`),
  getMyTailorProfile: (token) => request('/tailors/me', { token }),
  createMyTailorProfile: (payload, token) =>
    request('/tailors/me', { method: 'POST', body: payload, token }),
  updateMyTailorProfile: (payload, token) =>
    request('/tailors/me', { method: 'PUT', body: payload, token }),
  getMyIncomingOrders: (token) => request('/tailors/me/orders', { token }),
  getMyIncomingConnections: (token) => request('/tailors/me/connections', { token }),
  getAdminStats: (token) => request('/admin/stats', { token }),
  getAdminRecentOrders: (token) => request('/admin/orders', { token }),
  getRecommendations: (token) => request('/recommendations', { token }),
  getMyMeasurements: (token) => request('/users/me/measurements', { token }),
  saveMyMeasurements: (payload, token) =>
    request('/users/me/measurements', { method: 'PUT', body: payload, token }),
};
