import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';
import { getToken, isInactive, endSession } from '../services/session';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

function ActiveSession({ children }) {
  useInactivityLogout();
  return children;
}

// Retour sur l'app après plus de 20 minutes sans activité (onglet fermé, veille...)
function ExpiredSession() {
  useEffect(() => {
    authService.logout().finally(() => endSession('inactive'));
  }, []);
  return null;
}

const ProtectedRoute = ({ children }) => {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  if (isInactive()) {
    return <ExpiredSession />;
  }

  return <ActiveSession>{children}</ActiveSession>;
};

export default ProtectedRoute;
