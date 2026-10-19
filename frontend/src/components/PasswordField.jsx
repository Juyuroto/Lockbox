import { useState, useRef, useLayoutEffect } from 'react';
import { icons } from '../assets/icons/icons';
import ColoredPassword from './ColoredPassword';
import MaskedPassword from './MaskedPassword';
import PasswordGeneratorModal from './PasswordGeneratorModal';

// Champ mot de passe des modales : masqué par défaut, œil pour afficher, bouton qui ouvre le générateur.
// Le texte de l'input est toujours transparent : une copie placée juste derrière affiche soit le mot
// de passe coloré, soit les mêmes points que le détail d'un item (MaskedPassword).
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
        <div className={`password-input ${showPassword ? '' : 'is-masked'}`}>
          <div className="modal-input password-input-mirror" ref={mirrorRef} aria-hidden="true">
            {showPassword ? <ColoredPassword value={value} /> : <MaskedPassword value={value} />}
          </div>
          <input
            ref={inputRef}
            className="modal-input"
            type="text"
            placeholder="password"
            value={value}
            onChange={e => onChange(e.target.value)}
            onScroll={syncScroll}
            onSelect={syncScroll}
            onKeyUp={syncScroll}
            // type="text" permettrait de copier le mot de passe masqué
            onCopy={e => !showPassword && e.preventDefault()}
            onCut={e => !showPassword && e.preventDefault()}
            spellCheck={false}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="button" className="detail-eye" disabled={!value} onClick={() => setShowPassword(v => !v)}>
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
