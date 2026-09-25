import { useState } from 'react';
import { icons } from '../assets/icons/icons';

// Fenêtre de confirmation d'une action destructive.
// onConfirm est asynchrone : s'il échoue, le message d'erreur s'affiche et la fenêtre reste ouverte.
export default function ConfirmDialog({ title, message, confirmLabel = 'Supprimer', onConfirm, onClose }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const IconClose = icons.close;
  const IconTrash = icons.trash;

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-confirm" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="vault-detail-close" onClick={onClose} title="Fermer" aria-label="Fermer">
            <IconClose className="icon-btn" />
          </button>
        </div>

        <p className="modal-confirm-message">{message}</p>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-edit" onClick={onClose} disabled={isLoading} autoFocus>
            Annuler
          </button>
          <button type="button" className="btn-delete btn-delete-confirm" onClick={handleConfirm} disabled={isLoading}>
            <IconTrash className="icon-btn" />
            {isLoading ? 'Suppression...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
