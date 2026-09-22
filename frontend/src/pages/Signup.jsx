import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import '../assets/css/Signup.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authService.register(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Vérifie ta boîte mail</h1>
            <p className="signup-subtitle">
              Un email de confirmation a été envoyé à <strong>{email}</strong>. Clique sur le lien qu'il contient pour activer ton compte.
            </p>
          </div>

          <p className="signup-footer">
            Pas reçu l'email ?{' '}
            <Link to="/signup" className="auth-link" onClick={() => setSent(false)}>Réessayer</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Créer un compte</h1>
          <p className="signup-subtitle">Votre coffre-fort sécurisé vous attend</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
            required
          />
          <Button type="submit" isLoading={isLoading}>
            Continuer
          </Button>
        </form>

        <p className="signup-footer">
          Déjà un compte ?{' '}
          <Link to="/login" className="auth-link">Se connecter</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
