import { useEffect } from 'react';
import { authService, refreshSession } from '../services/api';
import {
  markActivity, isInactive, endSession, getLastActivity, getLastRefresh, markRefreshed, TOKEN_KEY,
} from '../services/session';

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'];
const CHECK_INTERVAL_MS = 15 * 1000;
// Le token d'accès dure 15 min et le refresh token 30 min (renouvelé à chaque rafraîchissement) :
// on rafraîchit toutes les 10 min tant que l'utilisateur agit, pour qu'une session active ne soit jamais coupée
const REFRESH_EVERY_MS = 10 * 60 * 1000;

let ending = false;

// Déconnexion après 20 minutes sans activité. Tant que l'utilisateur agit, la session continue.
// L'activité est partagée entre onglets : agir dans un onglet garde les autres connectés.
export function useInactivityLogout() {
  useEffect(() => {
    const logoutInactive = () => {
      if (ending) return;
      ending = true;
      // On révoque le refresh token, sans attendre plus que nécessaire
      authService.logout().finally(() => endSession('inactive'));
    };

    // Au réveil d'un ordinateur en veille, le premier mouvement ne doit pas relancer une session déjà expirée :
    // on vérifie avant d'enregistrer l'activité
    const onActivity = () => {
      if (isInactive()) logoutInactive();
      else markActivity();
    };

    const keepAlive = () => {
      const lastRefresh = getLastRefresh();
      const activeSinceRefresh = getLastActivity() > lastRefresh;
      if (!activeSinceRefresh || Date.now() - lastRefresh < REFRESH_EVERY_MS) return;
      // Marqué avant l'appel : les autres onglets voient qu'un rafraîchissement est en cours et ne le doublent pas
      markRefreshed();
      refreshSession().catch(err => {
        // Refresh token refusé (révoqué, expiré) ; une simple coupure réseau sera retentée au prochain tour
        if (err.status) endSession('expired');
      });
    };

    const check = () => {
      if (isInactive()) logoutInactive();
      else keepAlive();
    };

    // Déconnexion depuis un autre onglet
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) window.location.replace('/login');
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    markActivity(true);

    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true, capture: true }));
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    const timer = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, onActivity, { capture: true }));
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(timer);
    };
  }, []);
}
