import { useState } from 'react';
import { icons } from '../assets/icons/icons';
import { itemService } from '../services/api';

function generatePassword() {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = lower + upper + digits + special;
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => all[b % all.length]).join('');
}

const ITEM_TYPES = [
  { value: 'password', label: 'Mot de passe' },
  { value: 'contact', label: 'Contact' },
];

const EMPTY_DATA = {
  password: { login: '', password: '', note: '' },
  contact: { first_name: '', last_name: '', email: '', phone: '' },
};

export default function VaultModal({ folders, defaultFolder, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    type: 'password',
    folder_id: defaultFolder ? String(defaultFolder) : '',
  });
  const [data, setData] = useState(EMPTY_DATA.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const IconClose = icons.close;
  const IconEye = icons.eye;
  const IconEyeOff = icons.eyeOff;
  const IconGenerate = icons.generate;

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setField = (key, value) => setData(d => ({ ...d, [key]: value }));

  const handleTypeChange = (type) => {
    set('type', type);
    setData(EMPTY_DATA[type]);
    setShowPassword(false);
  };

  const handleGenerate = () => {
    setField('password', generatePassword());
    setShowPassword(true);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    setStep(2);
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
      const created = await itemService.createItem({
        type: form.type,
        title: form.title.trim(),
        folder_id: form.folder_id ? Number(form.folder_id) : null,
        data,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabel = ITEM_TYPES.find(t => t.value === form.type).label;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 ? 'Nouvel élément' : `${typeLabel} · ${form.title}`}
          </h2>
          <button className="vault-detail-close" onClick={onClose}>
            <IconClose className="icon-btn" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleNext} className="modal-form">
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

            <div className="modal-actions">
              <button type="button" className="btn-delete" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-edit">Suivant</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="modal-form">
            {form.type === 'password' && (
              <>
                <div className="detail-field">
                  <label className="detail-label">Identifiant *</label>
                  <input
                    className="modal-input"
                    placeholder="email ou nom d'utilisateur"
                    value={data.login}
                    onChange={e => setField('login', e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="detail-field">
                  <label className="detail-label">Mot de passe *</label>
                  <div className="modal-password-row">
                    <input
                      className="modal-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={data.password}
                      onChange={e => setField('password', e.target.value)}
                      required
                    />
                    <button type="button" className="detail-eye" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
                    </button>
                    <button type="button" className="btn-generate" onClick={handleGenerate}>
                      <IconGenerate className="icon-sm" />
                      Générer
                    </button>
                  </div>
                </div>

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
                <div className="detail-field">
                  <label className="detail-label">Prénom</label>
                  <input
                    className="modal-input"
                    placeholder="Jean"
                    value={data.first_name}
                    onChange={e => setField('first_name', e.target.value)}
                    autoFocus
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
              </>
            )}

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-delete" onClick={() => setStep(1)} disabled={isLoading}>
                Retour
              </button>
              <button type="submit" className="btn-edit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
