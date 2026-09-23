import { useState, useRef, useLayoutEffect } from 'react';
import { icons } from '../assets/icons/icons';
import ColoredPassword from './ColoredPassword';
import PasswordGeneratorModal from './PasswordGeneratorModal';

// Champ mot de passe des modales : masqué par défaut, œil pour afficher, bouton qui ouvre le générateur.
// Quand il est affiché, le texte de l'input est transparent et une copie colorée est placée juste
// derrière : les couleurs apparaissent directement dans le champ.
export default function PasswordField({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const inputRef = useRef(null);
  const mirrorRef = useRef(null);

  const IconEye = icons.eye;
  const IconEyeOff = icons.eyeOff;
  const IconGenerate = icons.generate;

  // Garde la copie colorée alignée quand le texte défile horizontalement dans l'input
  const syncScroll = () => {
    if (mirrorRef.current && inputRef.current) {
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  useLayoutEffect(syncScroll, [value, showPassword]);

  return (
    <div className="detail-field">
      <label className="detail-label">Mot de passe *</label>
      <div className="modal-password-row">
        <div className={`password-input ${showPassword ? 'is-revealed' : ''}`}>
          {showPassword && (
            <div className="modal-input password-input-mirror" ref={mirrorRef} aria-hidden="true">
              <ColoredPassword value={value} />
            </div>
          )}
          <input
            ref={inputRef}
            className="modal-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={value}
            onChange={e => onChange(e.target.value)}
            onScroll={syncScroll}
            onSelect={syncScroll}
            onKeyUp={syncScroll}
            spellCheck={false}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="button" className="detail-eye" onClick={() => setShowPassword(v => !v)}>
          {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
        </button>
        <button
          type="button"
          className="btn-generate btn-generate-icon"
          onClick={() => setShowGenerator(true)}
          title="Générer un mot de passe"
          aria-label="Générer un mot de passe"
        >
          <IconGenerate className="icon-sm" />
        </button>
      </div>

      {showGenerator && (
        <PasswordGeneratorModal
          onClose={() => setShowGenerator(false)}
          onUse={password => {
            onChange(password);
            setShowGenerator(false);
          }}
        />
      )}
    </div>
  );
}
