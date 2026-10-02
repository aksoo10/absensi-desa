const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('presensi_token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if FormData is used
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authApi = {
  login: (identifier, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiRequest('/auth/me'),
};

export const attendanceApi = {
  getToday: () => apiRequest('/attendance/today'),
  checkIn: (keterangan) =>
    apiRequest('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ keterangan }),
    }),
  checkOut: () =>
    apiRequest('/attendance/check-out', {
      method: 'POST',
    }),
  getHistory: () => apiRequest('/attendance/history'),
  getStats: () => apiRequest('/attendance/stats'),
};

export const leaveApi = {
  submitRequest: (formData) =>
    apiRequest('/leave/request', {
      method: 'POST',
      body: formData,
    }),
  getMyRequests: () => apiRequest('/leave/my-requests'),
  getAllRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/leave/all?${query}`);
  },
  processRequest: (id, status, catatan_admin) =>
    apiRequest(`/leave/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status, catatan_admin }),
    }),
};

export const pegawaiApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/pegawai?${query}`);
  },
  getById: (id) => apiRequest(`/pegawai/${id}`),
  create: (data) =>
    apiRequest('/pegawai', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/pegawai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/pegawai/${id}`, {
      method: 'DELETE',
    }),
};

export const schedulesApi = {
  getAll: () => apiRequest('/schedules'),
  getActive: () => apiRequest('/schedules/active'),
  create: (data) =>
    apiRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/schedules/${id}`, {
      method: 'DELETE',
    }),
};

export const reportsApi = {
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reports?${query}`);
  },
};

export const dashboardApi = {
  getAdminDashboard: () => apiRequest('/dashboard/admin'),
};
