import { useState, useEffect } from 'react';
import { icons } from '../assets/icons/icons';
import { itemService } from '../services/api';
import ItemAvatar from './ItemAvatar';
import ColoredPassword from './ColoredPassword';
import MaskedPassword from './MaskedPassword';
import { getFolderPath } from '../utils/folders';

const formatDate = (value) => new Date(value).toLocaleDateString('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export default function VaultDetail({ item, onClose, onEdit, onDeleted, folders }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const IconClose = icons.close;
  const IconFolder = icons.folder;
  const IconCopy = icons.copy;
  const IconEye = icons.eye;
  const IconEyeOff = icons.eyeOff;
  const IconEdit = icons.edit;
  const IconTrash = icons.trash;

  const folder = folders.find(f => f.id === item.folder_id);

  useEffect(() => {
    let cancelled = false;
    itemService.getItem(item.id)
      .then(res => { if (!cancelled) setData(res); })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [item.id]);

  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);
    try {
      await itemService.deleteItem(item.id);
      onDeleted?.(item.id);
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const copyButton = (value, key, label) => (
    <button
      className={`detail-action ${copied === key ? 'copied' : ''}`}
      onClick={() => copy(value, key)}
      title={copied === key ? 'Copié' : 'Copier'}
      aria-label={`Copier ${label.toLowerCase()}`}
    >
      <IconCopy className="icon-sm" />
    </button>
  );

  const renderField = (label, key, value) => {
    if (!value) return null;
    return (
      <div className="detail-row">
        <div className="detail-row-content">
          <span className="detail-row-label">{label}</span>
          <span className="detail-row-value">{value}</span>
        </div>
        {copyButton(value, key, label)}
      </div>
    );
  };

  const renderPassword = () => (
    <>
      <div className="detail-card">
        {renderField('Identifiant', 'login', data.login)}

        <div className="detail-row">
          <div className="detail-row-content">
            <span className="detail-row-label">Mot de passe</span>
            <span className="detail-row-value detail-password">
              {showPassword ? <ColoredPassword value={data.password} /> : <MaskedPassword value={data.password} />}
            </span>
          </div>
          <button
            className="detail-action"
            onClick={() => setShowPassword(v => !v)}
            title={showPassword ? 'Masquer' : 'Afficher'}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
          </button>
          {copyButton(data.password, 'password', 'le mot de passe')}
        </div>
      </div>

      {data.note && (
        <div className="detail-section">
          <span className="detail-section-title">Note</span>
          <p className="detail-card detail-note">{data.note}</p>
        </div>
      )}
    </>
  );

  const renderContact = () => (
    <div className="detail-card">
      {renderField('Prénom', 'first_name', data.first_name)}
      {renderField('Nom', 'last_name', data.last_name)}
      {renderField('Email', 'email', data.email)}
      {renderField('Téléphone', 'phone', data.phone)}
    </div>
  );

  return (
    <div className="vault-detail">
      <div className="vault-detail-inner">
        <div className="vault-detail-header">
          <ItemAvatar item={item} size="lg" />
          <div className="vault-detail-titles">
            <h2 className="vault-detail-title" title={item.title}>{item.title}</h2>
            <div className="vault-detail-meta">
              <span>{item.type === 'contact' ? 'Contact' : 'Mot de passe'}</span>
              {folder && (
                <span className="detail-badge" title={getFolderPath(folders, folder.id)}>
                  <IconFolder className="icon-xs" />
                  {getFolderPath(folders, folder.id)}
                </span>
              )}
            </div>
          </div>

          <div className="vault-detail-toolbar">
            <button
              className="detail-tool"
              onClick={() => onEdit?.(data)}
              disabled={!data}
              title="Modifier"
              aria-label="Modifier"
            >
              <IconEdit className="icon-btn" />
            </button>
            <button
              className="detail-tool detail-tool-danger"
              onClick={() => setConfirmDelete(true)}
              title="Supprimer"
              aria-label="Supprimer"
            >
              <IconTrash className="icon-btn" />
            </button>
            <span className="detail-tool-sep" aria-hidden="true" />
            <button className="detail-tool" onClick={onClose} title="Fermer" aria-label="Fermer">
              <IconClose className="icon-btn" />
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div className="detail-confirm-banner">
            <span>Supprimer « {item.title} » ?</span>
            <div className="detail-confirm-actions">
              <button className="detail-confirm-cancel" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
                Annuler
              </button>
              <button className="detail-confirm-delete" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        )}

        <div className="detail-body">
          {error && <p className="modal-error">{error}</p>}
          {!data && !error && <p className="detail-loading">Chargement...</p>}
          {data && item.type === 'password' && renderPassword()}
          {data && item.type === 'contact' && renderContact()}
        </div>

        {(item.CreatedAt || item.UpdatedAt) && (
          <div className="detail-dates">
            {item.UpdatedAt && <span>Modifié le {formatDate(item.UpdatedAt)}</span>}
            {item.CreatedAt && <span>Créé le {formatDate(item.CreatedAt)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
