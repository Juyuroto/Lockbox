import { useState } from 'react';
import { icons } from '../assets/icons/icons';
import LogoIcon from '../assets/logo/lockbox-icon.svg?react';

const STORAGE_KEY = 'lockbox_sidebar_collapsed';

function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function Sidebar({ view, onSelectVault, onSelectTrash, onSelectSettings, onLogout, passwordCount }) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  const IconGrid = icons.grid;
  const IconDeleted = icons.deleteOutline;
  const IconSettings = icons.settings;
  const IconLogout = icons.logout;
  const IconChevron = icons.downFill;

  const toggle = () => {
    setCollapsed(c => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!c));
      } catch {
      }
      return !c;
    });
  };

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
          className={`sidebar-item ${view === 'vault' ? 'active' : ''}`}
          onClick={onSelectVault}
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
