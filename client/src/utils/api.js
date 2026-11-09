const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('flexora_admin_token') || localStorage.getItem('zguard_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `İşlem başarısız (${res.status})`);
  }

  return data;
}

export const api = {
  // Public Store & Verification
  getStoreInfo: (slug = '') => request(`/store/info${slug ? `/${slug}` : ''}`),
  sendFeedback: (feedback) => request('/store/feedback', { method: 'POST', body: JSON.stringify(feedback) }),
  checkKey: (keyCode) => request('/verify/check-key', { method: 'POST', body: JSON.stringify({ keyCode }) }),
  fetchLiveCode: (keyCode, targetAccountId = null) => 
    request('/verify/fetch-code', { method: 'POST', body: JSON.stringify({ keyCode, targetAccountId }) }),
  viewCredentials: (keyCode) => request('/verify/view-credentials', { method: 'POST', body: JSON.stringify({ keyCode }) }),
  selectGames: (keyCode, gameIds) => request('/verify/select-games', { method: 'POST', body: JSON.stringify({ keyCode, gameIds }) }),

  // Admin Auth
  login: (username, password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/admin/me'),
  changePassword: (currentPassword, newPassword) => 
    request('/admin/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Admin Stats & Overview
  getStats: () => request('/admin/stats'),

  // Admin Accounts
  getAccounts: () => request('/admin/accounts'),
  addAccount: (data) => request('/admin/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/admin/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/admin/accounts/${id}`, { method: 'DELETE' }),
  bulkImportAccounts: (data) => request('/admin/accounts/bulk-import', { method: 'POST', body: JSON.stringify(data) }),
  testImap: (imapConfig) => request('/admin/accounts/test-imap', { method: 'POST', body: JSON.stringify(imapConfig) }),
  testTotp: (secret) => request('/admin/accounts/test-totp', { method: 'POST', body: JSON.stringify({ secret }) }),
  testExnor: (data) => request('/admin/accounts/test-exnor', { method: 'POST', body: JSON.stringify(data) }),

  // Admin Keys
  getKeys: () => request('/admin/keys'),
  createKey: (data) => request('/admin/keys', { method: 'POST', body: JSON.stringify(data) }),
  createBulkKeys: (data) => request('/admin/keys/bulk', { method: 'POST', body: JSON.stringify(data) }),
  deleteKey: (id) => request(`/admin/keys/${id}`, { method: 'DELETE' }),
  purgeKeys: () => request('/admin/keys/purge', { method: 'POST' }),

  // Admin Packages & Games
  getPackages: () => request('/admin/packages'),
  savePackage: (data) => request('/admin/packages', { method: 'POST', body: JSON.stringify(data) }),
  deletePackage: (id) => request(`/admin/packages/${id}`, { method: 'DELETE' }),
  getGames: () => request('/admin/games'),
  saveGame: (data) => request('/admin/games', { method: 'POST', body: JSON.stringify(data) }),
  deleteGame: (id) => request(`/admin/games/${id}`, { method: 'DELETE' }),

  // Admin Settings
  getSettings: () => request('/admin/settings'),
  updateSettings: (data) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Feedback
  getFeedback: () => request('/admin/feedback'),
  updateFeedbackStatus: (id, status) => request(`/admin/feedback/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteFeedback: (id) => request(`/admin/feedback/${id}`, { method: 'DELETE' }),

  // Admin License
  getLicense: () => request('/admin/license'),
  activateLicense: (code) => request('/admin/license/activate', { method: 'POST', body: JSON.stringify({ code }) }),
  generateTestKey: () => request('/admin/license/generate-test-key', { method: 'POST' })
};
