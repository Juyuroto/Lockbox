import { useState, useEffect, useRef } from 'react';
import { icons } from '../assets/icons/icons';

// Bouton + de la barre d'outils : choix entre un nouvel élément et un nouveau dossier
export default function AddMenu({ onAddItem, onAddFolder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const IconAdd = icons.add;
  const IconGrid = icons.grid;
  const IconFolder = icons.folder;

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const options = [
    { key: 'item', Icon: IconGrid, label: 'Élément', sub: 'Mot de passe ou contact', action: onAddItem },
    { key: 'folder', Icon: IconFolder, label: 'Dossier', sub: 'Pour ranger vos éléments', action: onAddFolder },
  ];

  return (
    <div className="add-menu" ref={ref}>
      <button
        className={`btn-add btn-add-icon ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Ajouter"
        aria-label="Ajouter"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <IconAdd className="icon-btn" />
      </button>

      {open && (
        <div className="add-popover" role="menu">
          {options.map(option => {
            const OptionIcon = option.Icon;
            return (
              <button
                key={option.key}
                className="add-option"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  option.action();
                }}
              >
                <span className={`add-option-icon add-option-${option.key}`}>
                  <OptionIcon className="icon-btn" />
                </span>
                <span className="add-option-text">
                  <span className="add-option-label">{option.label}</span>
                  <span className="add-option-sub">{option.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
