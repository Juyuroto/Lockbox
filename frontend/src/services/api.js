import { getToken, getRefreshToken, saveTokens, endSession } from './session';

const API_URL = import.meta.env.VITE_API_URL;

// ── Helpers ──────────────────────────────────────────────

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const errorMessage = data.error?.message || data.error || 'Une erreur est survenue';
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  return data.data !== undefined ? data.data : data;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('Aucun refresh token');
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ token: refreshToken }),
      });
      try {
        const data = await handleResponse(response);
        saveTokens(data.token, data.refresh_token);
      } catch (err) {
        if (getRefreshToken() && getRefreshToken() !== refreshToken) return;
        throw err;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const refreshSession = refreshAccessToken;

const authFetch = async (path, { method = 'GET', body } = {}) => {
  const send = () => fetch(`${API_URL}${path}`, {
    method,
    headers: { ...jsonHeaders, Authorization: `Bearer ${getToken()}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let response = await send();
  if (response.status === 401) {
    try {
      await refreshAccessToken();
    } catch (err) {
      if (!err.status && getRefreshToken()) throw err;
      endSession('expired');
      return new Promise(() => {});
    }
    response = await send();
  }
  return handleResponse(response);
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

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ token: refreshToken }),
      });
    } catch {
    }
  },

};

// ── Vault ─────────────────────────────────────────────────

export const vaultService = {

  getVault: async () => {
    const data = await authFetch('/vault');
    return {
      ...data,
      folder: (data.folder ?? []).map(normalizeFolder),
      passwords: (data.passwords ?? []).map(p => ({ ...p, id: p.ID })),
    };
  },

};

// ── folder ───────────────────────────────────────────────

const normalizeFolder = (folder) => {
  if (!folder) return null;
  const { children: _children, ...f } = folder;
  return { ...f, id: f.ID };
};

export const folderService = {

  createFolder: async ({ name, parent_id }) => {
    const data = await authFetch('/folder', { method: 'POST', body: { name, parent_id } });
    return normalizeFolder(data);
  },

  updateFolder: async (id, { name, parent_id }) => {
    const data = await authFetch(`/folder/${id}`, { method: 'PUT', body: { name, parent_id } });
    return normalizeFolder(data);
  },

  deleteFolder: async (id) => {
    return authFetch(`/folder/${id}`, { method: 'DELETE' });
  },

};

// ── Items ─────────────────────────────────────────────────

export const itemService = {

  createItem: async ({ type, title, folder_id, data }) => {
    return authFetch('/item', { method: 'POST', body: { type, title, folder_id, data } });
  },

  getItem: async (id) => {
    return authFetch(`/item/${id}`);
  },

  updateItem: async (id, { type, title, folder_id, data }) => {
    return authFetch(`/item/${id}`, { method: 'PUT', body: { type, title, folder_id, data } });
  },

  deleteItem: async (id) => {
    return authFetch(`/item/${id}`, { method: 'DELETE' });
  },

};