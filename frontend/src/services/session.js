// Gestion de la session : tokens, suivi d'activité et fin de session.
// Tout passe par localStorage pour que les onglets ouverts restent synchronisés.

export const INACTIVITY_LIMIT_MS = 20 * 60 * 1000;

const TOKEN_KEY = 'lockbox_token';
const REFRESH_KEY = 'lockbox_refresh_token';
const ACTIVITY_KEY = 'lockbox_last_activity';
const REFRESHED_KEY = 'lockbox_last_refresh';

// Motifs de fin de session, affichés sur la page de connexion
export const END_REASONS = {
  inactive: 'Vous avez été déconnecté après 20 minutes d’inactivité.',
  expired: 'Votre session a expiré, reconnectez-vous.',
};

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // stockage indisponible : la session ne survivra pas au rechargement
  }
};

export const getToken = () => read(TOKEN_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

// refreshToken est optionnel : au rafraîchissement, le backend peut ne renvoyer que le token d'accès
export const saveTokens = (token, refreshToken) => {
  write(TOKEN_KEY, token);
  if (refreshToken) write(REFRESH_KEY, refreshToken);
  markRefreshed();
};

// Date du dernier rafraîchissement, partagée entre onglets pour qu'un seul onglet rafraîchisse
export const markRefreshed = () => write(REFRESHED_KEY, String(Date.now()));
export const getLastRefresh = () => Number(read(REFRESHED_KEY)) || 0;

export const startSession = (token, refreshToken) => {
  saveTokens(token, refreshToken);
  markActivity(true);
};

export const clearSession = () => {
  write(TOKEN_KEY, null);
  write(REFRESH_KEY, null);
  write(ACTIVITY_KEY, null);
  write(REFRESHED_KEY, null);
};

// ── Activité ─────────────────────────────────────────────

let lastWrite = 0;
const WRITE_THROTTLE_MS = 5000;

// Enregistre la dernière activité (limité à une écriture toutes les 5 s)
export const markActivity = (force = false) => {
  const now = Date.now();
  if (!force && now - lastWrite < WRITE_THROTTLE_MS) return;
  lastWrite = now;
  write(ACTIVITY_KEY, String(now));
};

export const getLastActivity = () => Number(read(ACTIVITY_KEY)) || 0;

export const isInactive = () => {
  const last = getLastActivity();
  return last > 0 && Date.now() - last > INACTIVITY_LIMIT_MS;
};

export const hasSession = () => Boolean(getToken()) && !isInactive();

// ── Fin de session ───────────────────────────────────────

// Recharge complètement la page de connexion : l'état React (données déchiffrées comprises) est effacé
export const endSession = (reason) => {
  clearSession();
  const query = reason ? `?reason=${reason}` : '';
  window.location.replace(`/login${query}`);
};

export { TOKEN_KEY };
