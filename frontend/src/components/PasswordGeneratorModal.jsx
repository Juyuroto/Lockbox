import { useState } from 'react';
import { createPortal } from 'react-dom';
import { icons } from '../assets/icons/icons';
import { generatePassword, passwordStrength, loadGeneratorOptions, saveGeneratorOptions } from '../utils/generatePassword';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import ColoredPassword from './ColoredPassword';

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;

const CHARSET_OPTIONS = [
  { key: 'lower', label: 'Minuscules', hint: 'a-z' },
  { key: 'upper', label: 'Majuscules', hint: 'A-Z' },
  { key: 'digits', label: 'Chiffres', hint: '0-9' },
  { key: 'special', label: 'Caractères spéciaux', hint: '!@#$%&*' },
];

export default function PasswordGeneratorModal({ onClose, onUse }) {
  const [options, setOptions] = useState(loadGeneratorOptions);
  const [password, setPassword] = useState(() => generatePassword(loadGeneratorOptions()));
  // Masqué par défaut : seul l'œil affiche le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const { generate, isGenerating } = usePasswordGenerator(setPassword);

  const IconClose = icons.close;
  const IconGenerate = icons.generate;
  const IconEye = icons.eye;
  const IconEyeOff = icons.eyeOff;

  const strength = passwordStrength(options);
  const enabledCount = CHARSET_OPTIONS.filter(o => options[o.key]).length;

  const update = (key, value) => {
    const next = { ...options, [key]: value };
    setOptions(next);
    saveGeneratorOptions(next);
    generate(next);
  };

  return createPortal(
    <div className="modal-overlay modal-overlay-top" onClick={onClose}>
      <div className="modal generator" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Générateur de mot de passe</h2>
          <button type="button" className="vault-detail-close" onClick={onClose} title="Fermer" aria-label="Fermer">
            <IconClose className="icon-btn" />
          </button>
        </div>

        <div className={`password-preview generator-preview ${isGenerating ? 'is-generating' : ''}`}>
          {!password && <span className="generator-empty">Aucun caractère disponible</span>}
          {password && showPassword && <ColoredPassword value={password} />}
          {password && !showPassword && (
            <span className="colored-password password-masked">{'•'.repeat(password.length)}</span>
          )}
          <button
            type="button"
            className="generator-refresh"
            onClick={() => setShowPassword(v => !v)}
            title={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
          </button>
          <button
            type="button"
            className="generator-refresh"
            onClick={() => generate(options)}
            disabled={isGenerating}
            title="Régénérer"
          >
            <IconGenerate className={`icon-sm ${isGenerating ? 'icon-spin' : ''}`} />
          </button>
        </div>

        <div className="generator-strength">
          <div className="generator-strength-bar">
            {[1, 2, 3, 4].map(n => (
              <span key={n} className={n <= strength.level ? `is-on level-${strength.level}` : ''} />
            ))}
          </div>
          <span className="generator-strength-label">{strength.label}</span>
        </div>

        <div className="modal-form">
          <div className="detail-field">
            <div className="generator-length-header">
              <label className="detail-label" htmlFor="generator-length">Longueur</label>
              <span className="generator-length-value">{options.length}</span>
            </div>
            <input
              id="generator-length"
              className="generator-range"
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={options.length}
              onChange={e => update('length', Number(e.target.value))}
            />
          </div>

          <div className="detail-field">
            <span className="detail-label">Caractères</span>
            <div className="generator-options">
              {CHARSET_OPTIONS.map(o => (
                <label key={o.key} className="generator-option">
                  <input
                    type="checkbox"
                    checked={options[o.key]}
                    // Au moins un jeu de caractères doit rester coché
                    disabled={options[o.key] && enabledCount === 1}
                    onChange={e => update(o.key, e.target.checked)}
                  />
                  <span>{o.label}</span>
                  <span className="generator-option-hint">{o.hint}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="generator-option">
            <input
              type="checkbox"
              checked={options.avoidAmbiguous}
              onChange={e => update('avoidAmbiguous', e.target.checked)}
            />
            <span>Éviter les caractères ambigus</span>
            <span className="generator-option-hint">0 O 1 l I |</span>
          </label>

          <div className="detail-field">
            <label className="detail-label" htmlFor="generator-exclude">Caractères à exclure</label>
            <input
              id="generator-exclude"
              className="modal-input"
              placeholder="ex : , ; &quot; '"
              value={options.exclude}
              onChange={e => update('exclude', e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-delete" onClick={onClose}>Annuler</button>
            <button
              type="button"
              className="btn-edit"
              onClick={() => onUse(password)}
              disabled={!password || isGenerating}
            >
              Utiliser ce mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
