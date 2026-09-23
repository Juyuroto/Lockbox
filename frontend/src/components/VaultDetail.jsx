import { useState, useEffect } from 'react';
import { icons } from '../assets/icons/icons';
import { itemService } from '../services/api';
import ItemAvatar from './ItemAvatar';
import ColoredPassword from './ColoredPassword';

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

  // Le composant est remonté à chaque changement d'item (key={item.id}),
  // donc on ne charge qu'une fois les données déchiffrées
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

  const renderField = (label, key, value) => {
    if (!value) return null;
    return (
      <div className="detail-field">
        <label className="detail-label">{label}</label>
        <div className="detail-value-row">
          <span className="detail-value">{value}</span>
          <button
            className={`detail-copy btn-copy-icon ${copied === key ? 'copied' : ''}`}
            onClick={() => copy(value, key)}
            title={copied === key ? 'Copié' : 'Copier'}
            aria-label={`Copier ${label.toLowerCase()}`}
          >
            <IconCopy className="icon-sm" />
          </button>
        </div>
      </div>
    );
  };

  const renderPassword = () => (
    <>
      {renderField('Identifiant', 'login', data.login)}

      <div className="detail-field">
        <label className="detail-label">Mot de passe</label>
        <div className="detail-value-row">
          <span className="detail-value detail-password">
            {showPassword ? <ColoredPassword value={data.password} /> : '••••••••••••'}
          </span>
          <button className="detail-eye" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
          </button>
          <button
            className={`detail-copy btn-copy-icon ${copied === 'password' ? 'copied' : ''}`}
            onClick={() => copy(data.password, 'password')}
            title={copied === 'password' ? 'Copié' : 'Copier'}
            aria-label="Copier le mot de passe"
          >
            <IconCopy className="icon-sm" />
          </button>
        </div>
      </div>

      {data.note && (
        <div className="detail-field">
          <label className="detail-label">Note</label>
          <p className="detail-note">{data.note}</p>
        </div>
      )}
    </>
  );

  const renderContact = () => (
    <>
      {renderField('Prénom', 'first_name', data.first_name)}
      {renderField('Nom', 'last_name', data.last_name)}
      {renderField('Email', 'email', data.email)}
      {renderField('Téléphone', 'phone', data.phone)}
    </>
  );

  return (
    <div className="vault-detail">
      <div className="vault-detail-header">
        <div className="vault-detail-heading">
          <ItemAvatar item={item} size="lg" />
          <h2 className="vault-detail-title">{item.title}</h2>
        </div>
        <button className="vault-detail-close" onClick={onClose} title="Fermer" aria-label="Fermer">
          <IconClose className="icon-btn" />
        </button>
      </div>

      {folder && (
        <div className="detail-badge">
          <IconFolder className="icon-xs" />
          {folder.name}
        </div>
      )}

      <div className="detail-fields">
        {error && <p className="modal-error">{error}</p>}
        {!data && !error && <p className="detail-note">Chargement...</p>}
        {data && item.type === 'password' && renderPassword()}
        {data && item.type === 'contact' && renderContact()}
      </div>

      {confirmDelete ? (
        <div className="detail-actions detail-confirm">
          <button className="btn-edit" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
            Annuler
          </button>
          <button className="btn-delete btn-delete-confirm" onClick={handleDelete} disabled={isDeleting}>
            <IconTrash className="icon-btn" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      ) : (
        <div className="detail-actions">
          <button
            className="btn-edit btn-icon"
            onClick={() => onEdit?.(data)}
            disabled={!data}
            title="Modifier"
            aria-label="Modifier"
          >
            <IconEdit className="icon-btn" />
          </button>
          <button
            className="btn-delete btn-icon"
            onClick={() => setConfirmDelete(true)}
            title="Supprimer"
            aria-label="Supprimer"
          >
            <IconTrash className="icon-btn" />
          </button>
        </div>
      )}
    </div>
  );
}
