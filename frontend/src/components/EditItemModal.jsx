import { useState } from 'react';
import { icons } from '../assets/icons/icons';
import { itemService } from '../services/api';
import PasswordField from './PasswordField';
import ItemAvatar from './ItemAvatar';

const EMPTY_DATA = {
  password: { login: '', password: '', note: '' },
  contact: { first_name: '', last_name: '', email: '', phone: '' },
};

const ITEM_TYPES = [
  { value: 'password', label: 'Mot de passe' },
  { value: 'contact', label: 'Contact' },
];

// item = infos de la liste (title, type, folder_id), data = champs déchiffrés
export default function EditItemModal({ item, data: initialData, folders, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item.title,
    type: item.type,
    folder_id: item.folder_id ? String(item.folder_id) : '',
  });
  const [data, setData] = useState({ ...EMPTY_DATA[item.type], ...initialData });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const IconClose = icons.close;

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setField = (key, value) => setData(d => ({ ...d, [key]: value }));

  // Revenir au type d'origine restaure les données d'origine, sinon on part de champs vides
  const handleTypeChange = (type) => {
    set('type', type);
    setData(type === item.type ? { ...EMPTY_DATA[type], ...initialData } : EMPTY_DATA[type]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.type === 'contact' && !data.first_name.trim() && !data.last_name.trim()) {
      setError('Renseignez au moins un prénom ou un nom.');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await itemService.updateItem(item.id, {
        type: form.type,
        title: form.title.trim(),
        folder_id: form.folder_id ? Number(form.folder_id) : null,
        data,
      });
      onSaved?.(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-edit" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="vault-detail-heading">
            <ItemAvatar item={{ ...item, type: form.type, title: form.title || item.title }} size="lg" />
            <div>
              <h2 className="modal-title">Modifier l'élément</h2>
              <span className="modal-subtitle">
                {ITEM_TYPES.find(t => t.value === form.type).label}
              </span>
            </div>
          </div>
          <button className="vault-detail-close" onClick={onClose} title="Fermer" aria-label="Fermer">
            <IconClose className="icon-btn" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="modal-section-title">Général</p>

          <div className="detail-field">
            <label className="detail-label">Titre *</label>
            <input
              className="modal-input"
              placeholder="ex: GitHub"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={255}
              required
              autoFocus
            />
          </div>

          <div className="modal-row">
            <div className="detail-field">
              <label className="detail-label">Type *</label>
              <select
                className="modal-input"
                value={form.type}
                onChange={e => handleTypeChange(e.target.value)}
              >
                {ITEM_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="detail-field">
              <label className="detail-label">Emplacement</label>
              <select
                className="modal-input"
                value={form.folder_id}
                onChange={e => set('folder_id', e.target.value)}
              >
                <option value="">Coffre-fort</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {form.type === 'password' && (
            <>
              <p className="modal-section-title">Identifiants</p>

              <div className="detail-field">
                <label className="detail-label">Identifiant *</label>
                <input
                  className="modal-input"
                  placeholder="email ou nom d'utilisateur"
                  value={data.login}
                  onChange={e => setField('login', e.target.value)}
                  required
                />
              </div>

              <PasswordField value={data.password} onChange={value => setField('password', value)} />

              <div className="detail-field">
                <label className="detail-label">Note</label>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Note optionnelle..."
                  value={data.note}
                  onChange={e => setField('note', e.target.value)}
                />
              </div>
            </>
          )}

          {form.type === 'contact' && (
            <>
              <p className="modal-section-title">Coordonnées</p>

              <div className="modal-row">
                <div className="detail-field">
                  <label className="detail-label">Prénom</label>
                  <input
                    className="modal-input"
                    placeholder="Jean"
                    value={data.first_name}
                    onChange={e => setField('first_name', e.target.value)}
                  />
                </div>

                <div className="detail-field">
                  <label className="detail-label">Nom</label>
                  <input
                    className="modal-input"
                    placeholder="Dupont"
                    value={data.last_name}
                    onChange={e => setField('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-row">
                <div className="detail-field">
                  <label className="detail-label">Email</label>
                  <input
                    className="modal-input"
                    type="email"
                    placeholder="jean.dupont@mail.com"
                    value={data.email}
                    onChange={e => setField('email', e.target.value)}
                  />
                </div>

                <div className="detail-field">
                  <label className="detail-label">Téléphone</label>
                  <input
                    className="modal-input"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={data.phone}
                    onChange={e => setField('phone', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {form.type !== item.type && (
            <p className="modal-warning">
              Changer le type remplace les données actuelles de l'élément.
            </p>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-delete" onClick={onClose} disabled={isLoading}>
              Annuler
            </button>
            <button type="submit" className="btn-edit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
