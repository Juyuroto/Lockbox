import { useState, useEffect, useRef } from 'react';
import { icons } from '../assets/icons/icons';
import { DEFAULT_FILTERS } from '../utils/filters';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'password', label: 'Mots de passe' },
  { value: 'contact', label: 'Contacts' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nom (A → Z)' },
  { value: 'name-desc', label: 'Nom (Z → A)' },
  { value: 'created-desc', label: 'Plus récents' },
  { value: 'created-asc', label: 'Plus anciens' },
  { value: 'updated-desc', label: 'Modifiés récemment' },
];

export default function FilterMenu({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const IconFilter = icons.filter;
  const isActive = filters.type !== DEFAULT_FILTERS.type || filters.sort !== DEFAULT_FILTERS.sort;

  // Ferme le menu au clic à l'extérieur ou avec Échap
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

  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="filter-menu" ref={ref}>
      <button
        className={`btn-filter ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Filtrer et trier"
        aria-label="Filtrer et trier"
        aria-expanded={open}
      >
        <IconFilter className="icon-btn" />
        {isActive && <span className="btn-filter-dot" />}
      </button>

      {open && (
        <div className="filter-popover">
          <div className="filter-section">
            <span className="detail-label">Type</span>
            <div className="filter-segmented">
              {TYPE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={filters.type === o.value ? 'active' : ''}
                  onClick={() => set('type', o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <span className="detail-label">Trier par</span>
            <div className="filter-list">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={filters.sort === o.value ? 'active' : ''}
                  onClick={() => set('sort', o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="filter-reset"
            onClick={() => onChange(DEFAULT_FILTERS)}
            disabled={!isActive}
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
