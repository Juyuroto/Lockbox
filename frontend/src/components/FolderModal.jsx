import { useState } from 'react';
import { icons } from '../assets/icons/icons';
import { folderService } from '../services/api';
import { flattenFolders, getDescendantIds, folderDeleteErrorMessage } from '../utils/folders';

// Le backend renvoie ses erreurs en anglais : on traduit celles que l'utilisateur peut rencontrer
const saveErrorMessage = (err) => {
  if (err.status === 409) return 'Un dossier ne peut pas être déplacé dans lui-même ou dans un de ses sous-dossiers.';
  if (err.status === 404) return 'Le dossier parent est introuvable. Rechargez la page.';
  return err.message;
};

// folder absent = création, sinon modification (nom, dossier parent) et suppression
export default function FolderModal({ folder, folders, defaultParent, onClose, onSaved, onDeleted }) {
  const isEdit = Boolean(folder);
  const [form, setForm] = useState({
    name: folder?.name ?? '',
    parent_id: String((isEdit ? folder.parent_id : defaultParent) ?? ''),
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const IconClose = icons.close;
  const IconTrash = icons.trash;

  // Un dossier ne peut pas être déplacé dans lui-même ni dans un de ses sous-dossiers
  const parentOptions = flattenFolders(folders, isEdit ? getDescendantIds(folders, folder.id) : new Set());

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    if (!name) {
      setError('Le nom du dossier est requis.');
      return;
    }

    const body = { name, parent_id: form.parent_id ? Number(form.parent_id) : null };

    setIsLoading(true);
    try {
      const saved = isEdit
        ? await folderService.updateFolder(folder.id, body)
        : await folderService.createFolder(body);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(saveErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setIsLoading(true);
    try {
      await folderService.deleteFolder(folder.id);
      onDeleted?.(folder.id);
      onClose();
    } catch (err) {
      setError(folderDeleteErrorMessage(err));
      setIsLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-folder" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Modifier le dossier' : 'Nouveau dossier'}</h2>
          <button className="vault-detail-close" onClick={onClose} title="Fermer" aria-label="Fermer">
            <IconClose className="icon-btn" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="detail-field">
            <label className="detail-label">Nom *</label>
            <input
              className="modal-input"
              placeholder="ex: Réseaux sociaux"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              maxLength={255}
              required
              autoFocus
            />
          </div>

          <div className="detail-field">
            <label className="detail-label">Dossier parent</label>
            <select
              className="modal-input"
              value={form.parent_id}
              onChange={e => set('parent_id', e.target.value)}
            >
              <option value="">Aucun (racine du coffre-fort)</option>
              {parentOptions.map(f => (
                <option key={f.id} value={f.id}>
                  {'  '.repeat(f.depth)}{f.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="modal-error">{error}</p>}

          {confirmDelete ? (
            <div className="modal-actions">
              <button type="button" className="btn-edit" onClick={() => setConfirmDelete(false)} disabled={isLoading}>
                Annuler
              </button>
              <button type="button" className="btn-delete btn-delete-confirm" onClick={handleDelete} disabled={isLoading}>
                <IconTrash className="icon-btn" />
                {isLoading ? 'Suppression...' : 'Supprimer le dossier'}
              </button>
            </div>
          ) : (
            <div className="modal-actions">
              {isEdit && (
                <button
                  type="button"
                  className="btn-delete btn-icon modal-actions-start"
                  onClick={() => { setError(''); setConfirmDelete(true); }}
                  disabled={isLoading}
                  title="Supprimer le dossier"
                  aria-label="Supprimer le dossier"
                >
                  <IconTrash className="icon-btn" />
                </button>
              )}
              <button type="button" className="btn-delete" onClick={onClose} disabled={isLoading}>
                Annuler
              </button>
              <button type="submit" className="btn-edit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
