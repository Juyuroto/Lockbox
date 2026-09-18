const API_URL = import.meta.env.VITE_API_URL;

// ── Helpers ──────────────────────────────────────────────

const getToken = () => localStorage.getItem('lockbox_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }
  return data;
};

// ── Auth ─────────────────────────────────────────────────

export const authService = {

  register: async (email, password) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

};

// ── Vault ─────────────────────────────────────────────────

export const vaultService = {

  getVault: async () => {
    const response = await fetch(`${API_URL}/vault`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

};