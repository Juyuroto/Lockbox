import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Menu du clic droit, affiché à la position de la souris.
// entries : [{ label, icon, onClick, danger }] ou 'separator'
export default function ContextMenu({ x, y, entries, onClose }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // On garde le menu dans l'écran : s'il dépasse à droite ou en bas, il s'ouvre de l'autre côté
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    const margin = 8;
    setPosition({
      left: x + width + margin > window.innerWidth ? Math.max(margin, x - width) : x,
      top: y + height + margin > window.innerHeight ? Math.max(margin, y - height) : y,
    });
    menu.querySelector('button')?.focus();
  }, [x, y]);

  useEffect(() => {
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const buttons = [...ref.current.querySelectorAll('button')];
        const index = buttons.indexOf(document.activeElement);
        const next = e.key === 'ArrowDown' ? index + 1 : index - 1;
        buttons[(next + buttons.length) % buttons.length]?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onClose);
    window.addEventListener('blur', onClose);
    // Le défilement déplacerait le contenu sous le menu : on le ferme
    document.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('blur', onClose);
      document.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="context-menu"
      role="menu"
      style={{ left: position.left, top: position.top }}
      onContextMenu={e => e.preventDefault()}
    >
      {entries.map((entry, i) => {
        if (entry === 'separator') {
          return <div key={`sep-${i}`} className="context-menu-sep" role="separator" />;
        }
        const EntryIcon = entry.icon;
        return (
          <button
            key={entry.label}
            className={`context-menu-item ${entry.danger ? 'danger' : ''}`}
            role="menuitem"
            onClick={() => {
              onClose();
              entry.onClick();
            }}
          >
            {EntryIcon ? <EntryIcon className="context-menu-icon" /> : <span className="context-menu-icon" />}
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
