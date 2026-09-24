import { useState } from 'react';
import { icons } from '../assets/icons/icons';
import LogoIcon from '../assets/logo/lockbox-icon.svg?react';

const STORAGE_KEY = 'lockbox_sidebar_collapsed';

// L'état réduit/agrandi est gardé dans le navigateur
function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function Sidebar({ folders, selectedFolder, onSelectFolder, view, onSelectTrash, onSelectSettings, onLogout, passwordCount }) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  const IconGrid = icons.grid;
  const IconFolder = icons.folder;
  const IconDeleted = icons.deleteOutline;
  const IconSettings = icons.settings;
  const IconLogout = icons.logout;
  const IconChevron = icons.downFill;

  const toggle = () => {
    setCollapsed(c => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!c));
      } catch {
        // stockage indisponible : l'état reste valable pour la session
      }
      return !c;
    });
  };

  // En mode réduit, le texte est masqué : la bulle au survol donne le nom
  const tooltip = (label) => (collapsed ? label : undefined);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-brand">
          <LogoIcon className="sidebar-logo" aria-hidden="true" />
          <span className="sidebar-title">Lockbox</span>
        </span>
        <button
          className="sidebar-toggle"
          onClick={toggle}
          title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          aria-label={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          aria-expanded={!collapsed}
        >
          <IconChevron className="sidebar-toggle-icon" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${view === 'vault' && selectedFolder === null ? 'active' : ''}`}
          onClick={() => onSelectFolder(null)}
          title={tooltip(`Coffre-fort (${passwordCount})`)}
        >
          <IconGrid className="sidebar-item-icon" />
          <span className="sidebar-item-label">Coffre-fort</span>
          <span className="sidebar-count">{passwordCount}</span>
        </button>

        <button
          className={`sidebar-item ${view === 'trash' ? 'active' : ''}`}
          onClick={onSelectTrash}
          title={tooltip('Éléments supprimés')}
        >
          <IconDeleted className="sidebar-item-icon" />
          <span className="sidebar-item-label">Éléments supprimés</span>
        </button>

        <div className="sidebar-separator" role="separator" />

        <button
          className={`sidebar-item ${view === 'settings' ? 'active' : ''}`}
          onClick={onSelectSettings}
          title={tooltip('Paramètres')}
        >
          <IconSettings className="sidebar-item-icon sidebar-settings-icon" />
          <span className="sidebar-item-label">Paramètres</span>
        </button>

        {folders.length > 0 && <div className="sidebar-separator" role="separator" />}

        {folders.map(folder => (
          <button
            key={folder.id}
            className={`sidebar-item ${view === 'vault' && selectedFolder === folder.id ? 'active' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
            title={tooltip(folder.name)}
          >
            <IconFolder className="sidebar-item-icon" />
            <span className="sidebar-item-label">{folder.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-item sidebar-logout"
          onClick={onLogout}
          title={tooltip('Se déconnecter')}
        >
          <IconLogout className="sidebar-item-icon" />
          <span className="sidebar-item-label">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
