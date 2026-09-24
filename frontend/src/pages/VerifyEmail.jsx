import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import '../assets/css/VerifyEmail.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await authService.completeRegistration(token, password);
      navigate('/login', { state: { message: 'Compte activé avec succès ! Connectez-vous.' } });
    } catch (err) {
      if (err.status === 401) {
        setInvalidToken(true);
      } else {
        setError(err.message || 'Erreur lors de l\'activation du compte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <AuthLayout variant="register">
        <div className="verify-card">
          <div className="verify-header">
            <h1 className="verify-title">Lien invalide ou expiré</h1>
            <p className="verify-subtitle">
              Ce lien de vérification n'est plus valide. Recommencez votre inscription pour recevoir un nouveau lien.
            </p>
          </div>

          <Button type="button" onClick={() => navigate('/signup')}>
            Recommencer l'inscription
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="register">
      <div className="verify-card">
        <div className="verify-header">
          <h1 className="verify-title">Choisissez votre mot de passe</h1>
          <p className="verify-subtitle">Dernière étape pour activer votre coffre-fort</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="verify-form">
          <Input
            label="Mot de passe maître"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" isLoading={isLoading}>
            Activer mon compte
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
