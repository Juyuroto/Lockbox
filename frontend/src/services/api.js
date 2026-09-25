import { getToken, getRefreshToken, saveTokens, endSession } from './session';

const API_URL = import.meta.env.VITE_API_URL;

// ── Helpers ──────────────────────────────────────────────

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Une erreur est survenue');
    error.status = response.status;
    throw error;
  }
  return data;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

// Un seul rafraîchissement à la fois : les requêtes qui reçoivent un 401 en même temps attendent le même
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
        // Si le backend fait tourner le refresh token, on garde le nouveau
        saveTokens(data.token, data.refresh_token);
      } catch (err) {
        // Un autre onglet a renouvelé le refresh token pendant ce temps : ses tokens sont déjà enregistrés
        if (getRefreshToken() && getRefreshToken() !== refreshToken) return;
        throw err;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Rafraîchissement préventif, appelé pendant que l'utilisateur est actif
export const refreshSession = refreshAccessToken;

// Requête authentifiée : sur un 401, on rafraîchit le token puis on rejoue la requête une fois.
// Si le rafraîchissement échoue, la session est terminée et on renvoie vers la connexion.
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
      // Serveur injoignable : on ne déconnecte pas, l'appelant affiche l'erreur
      if (!err.status && getRefreshToken()) throw err;
      endSession('expired');
      // La page est en train d'être remplacée : on ne résout jamais pour ne pas afficher d'erreur entre-temps
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

  // Révoque le refresh token côté serveur. Sans bloquer la déconnexion si le serveur ne répond pas.
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
      // le token expirera de lui-même
    }
  },

};

// ── Vault ─────────────────────────────────────────────────

export const vaultService = {

  getVault: async () => {
    const data = await authFetch('/vault');
    // gorm.Model renvoie "ID" en majuscules, on normalise en "id"
    return {
      ...data,
      folders: (data.folders ?? []).map(normalizeFolder),
      passwords: (data.passwords ?? []).map(p => ({ ...p, id: p.ID })),
    };
  },

};

// ── Folders ───────────────────────────────────────────────

// Les sous-dossiers sont reconstruits côté front avec parent_id, on ne garde pas "children"
const normalizeFolder = (folder) => {
  const { children: _children, ...f } = folder;
  return { ...f, id: f.ID };
};

export const folderService = {

  // parent_id: null = à la racine du coffre-fort
  createFolder: async ({ name, parent_id }) => {
    const data = await authFetch('/folders', { method: 'POST', body: { name, parent_id } });
    return normalizeFolder(data);
  },

  updateFolder: async (id, { name, parent_id }) => {
    const data = await authFetch(`/folders/${id}`, { method: 'PUT', body: { name, parent_id } });
    return normalizeFolder(data);
  },

  // Refusé (409) si le dossier contient des sous-dossiers ou des éléments
  deleteFolder: async (id) => {
    return authFetch(`/folders/${id}`, { method: 'DELETE' });
  },

};

// ── Items ─────────────────────────────────────────────────

export const itemService = {

  // type: 'password' | 'contact'
  // data: { login, password, note } ou { first_name, last_name, email, phone }
  createItem: async ({ type, title, folder_id, data }) => {
    return authFetch('/item', { method: 'POST', body: { type, title, folder_id, data } });
  },

  // Renvoie uniquement les données déchiffrées de l'item
  // password: { login, password, note } / contact: { first_name, last_name, email, phone }
  getItem: async (id) => {
    return authFetch(`/item/${id}`);
  },

  // Remplacement complet : type, title, folder_id (null = coffre-fort) et data
  updateItem: async (id, { type, title, folder_id, data }) => {
    return authFetch(`/item/${id}`, { method: 'PUT', body: { type, title, folder_id, data } });
  },

  deleteItem: async (id) => {
    return authFetch(`/item/${id}`, { method: 'DELETE' });
  },

};