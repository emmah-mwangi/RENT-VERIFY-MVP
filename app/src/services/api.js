// API Service - All backend communication
const API_BASE = import.meta.env.VITE_API_URL || 'https://rent-verify-mvp.onrender.com/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  signup(fullName, email, phone, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, phone, password }),
    });
  },

  login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  // Receipts endpoints
  uploadReceipt(formData) {
    return fetch(`${API_BASE}/receipts/add-receipt`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }
      return data;
    });
  },

  getReceipts() {
    return this.request('/receipts');
  },

  parseReceipt(smsMessage) {
    return this.request('/receipts/parse-sms', {
      method: 'POST',
      body: JSON.stringify({ messageText: smsMessage }),
    });
  },
};
