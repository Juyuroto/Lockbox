import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { startSession, END_REASONS } from '../services/session';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import '../assets/css/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  // Motif de la déconnexion automatique (?reason=inactive|expired)
  const endReason = END_REASONS[new URLSearchParams(location.search).get('reason')];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      startSession(response.token, response.refresh_token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Bon retour</h1>
          <p className="login-subtitle">Accédez à votre coffre-fort</p>
        </div>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {endReason && !error && <div className="alert alert-info">{endReason}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" isLoading={isLoading}>
            Se connecter
          </Button>
        </form>

        <p className="login-footer">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="auth-link">Créer un compte</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
