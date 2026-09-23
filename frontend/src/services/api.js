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
    const error = new Error(data.error || 'Une erreur est survenue');
    error.status = response.status;
    throw error;
  }
  return data;
};

// ── Auth ─────────────────────────────────────────────────

export const authService = {

  register: async (email) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  completeRegistration: async (token, password) => {
    const response = await fetch(`${API_URL}/signup/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
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
    const data = await handleResponse(response);
    // gorm.Model renvoie "ID" en majuscules, on normalise en "id"
    return {
      ...data,
      folders: (data.folders ?? []).map(f => ({ ...f, id: f.ID })),
      passwords: (data.passwords ?? []).map(p => ({ ...p, id: p.ID })),
    };
  },

};

// ── Items ─────────────────────────────────────────────────

export const itemService = {

  // type: 'password' | 'contact'
  // data: { login, password, note } ou { first_name, last_name, email, phone }
  createItem: async ({ type, title, folder_id, data }) => {
    const response = await fetch(`${API_URL}/item`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type, title, folder_id, data }),
    });
    return handleResponse(response);
  },

};