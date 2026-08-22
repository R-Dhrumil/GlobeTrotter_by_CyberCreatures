import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('globetrotter_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or extract response payload
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected route, clean storage if token expired
      if (window.location.pathname.startsWith('/app') || window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const tripAPI = {
  create: (data) => api.post('/trips', data),
  getMyTrips: () => api.get('/trips/my'),
  getById: (id) => api.get(`/trips/${id}`),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  copy: (id) => api.post(`/trips/${id}/copy`),
  getPublic: (slug) => api.get(`/trips/share/${slug}`),

  // Stops
  addStop: (tripId, data) => api.post(`/trips/${tripId}/stops`, data),
  updateStop: (id, data) => api.put(`/trips/stops/${id}`, data),
  deleteStop: (id) => api.delete(`/trips/stops/${id}`),
  reorderStops: (tripId, stopIds) => api.put(`/trips/${tripId}/stops/reorder`, { stopIds }),

  // Activities
  addActivity: (stopId, data) => api.post(`/trips/stops/${stopId}/activities`, data),
  updateActivity: (id, data) => api.put(`/trips/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/trips/activities/${id}`),

  // Budget
  getBudget: (tripId) => api.get(`/trips/${tripId}/budget`),
  upsertBudget: (tripId, data) => api.post(`/trips/${tripId}/budget`, data),
  deleteBudget: (id) => api.delete(`/trips/budget/${id}`),
};

export const catalogAPI = {
  getCities: (params) => api.get('/catalog/cities', { params }),
  getHierarchy: () => api.get('/catalog/hierarchy'),
  getCityById: (id) => api.get(`/catalog/cities/${id}`),
  getActivities: (params) => api.get('/catalog/activities', { params }),
  getFeatured: () => api.get('/catalog/featured'),
  getGallery: (params) => api.get('/catalog/gallery', { params }),
  getPublicTrips: (params) => api.get('/catalog/public-trips', { params }),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getMessages: () => api.get('/contact/messages'),
  markRead: (id) => api.patch(`/contact/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/contact/messages/${id}`),
};

export const seoAPI = {
  getSeo: () => api.get('/seo'),
  updateSeo: (data) => api.post('/seo', { seo: data }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Catalog CRUD
  createCity: (data) => api.post('/admin/cities', data),
  updateCity: (id, data) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),
  createActivity: (data) => api.post('/admin/activities', data),
  updateActivity: (id, data) => api.put(`/admin/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/admin/activities/${id}`),

  // Payments & Transactions
  getTransactions: () => api.get('/admin/transactions'),
  testPayment: (data) => api.post('/admin/transactions/test-pay', data),

  // Settings
  getSettings: (group) => api.get('/admin/settings', { params: { group } }),
  updateSettings: (settings, group) => api.post('/admin/settings', { settings, group }),
  testSmtp: (data) => api.post('/admin/smtp/test', data),
};

export const groupAPI = {
  enableGroup: (tripId) => api.post(`/trips/${tripId}/group/enable`),
  getInviteLink: (tripId) => api.get(`/trips/${tripId}/group/invite-link`),
  joinGroup: (token) => api.post(`/trips/group/join/${token}`),
  validateInvite: (token) => api.get(`/trips/group/validate/${token}`),
  getMembers: (tripId) => api.get(`/trips/${tripId}/group/members`),
  removeMember: (tripId, userId) => api.delete(`/trips/${tripId}/group/members/${userId}`),
  addExpense: (tripId, data) => api.post(`/trips/${tripId}/group/expenses`, data),
  getExpenses: (tripId) => api.get(`/trips/${tripId}/group/expenses`),
  deleteExpense: (tripId, expenseId) => api.delete(`/trips/${tripId}/group/expenses/${expenseId}`),
  getSettlement: (tripId) => api.get(`/trips/${tripId}/group/settlement`),
};

export default api;
