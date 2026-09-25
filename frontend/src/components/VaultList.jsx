import ItemAvatar from './ItemAvatar';
import { icons } from '../assets/icons/icons';
import { getAncestors, getFolderPath } from '../utils/folders';

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// Liste du coffre-fort, navigable comme un explorateur de fichiers :
// fil d'Ariane en haut, puis les sous-dossiers du dossier courant, puis ses éléments.
// En recherche, on affiche tout ce qui correspond dans le dossier courant et ses sous-dossiers.
export default function VaultList({
  folders, allItems, currentFolder, subfolders, items, isSearching,
  selectedItem, onSelect, onOpenFolder, onEditFolder, onContextMenu, contextTarget,
}) {
  const IconFolder = icons.folder;
  const IconChevron = icons.downFill;
  const IconEdit = icons.edit;

  const ancestors = getAncestors(folders, currentFolder);
  const current = ancestors[ancestors.length - 1];
  const parentId = ancestors.length > 1 ? ancestors[ancestors.length - 2].id : null;

  const describeFolder = (folder) => {
    if (isSearching) return getFolderPath(folders, folder.parent_id) || 'Coffre-fort';
    const nbFolders = folders.filter(f => f.parent_id === folder.id).length;
    const nbItems = allItems.filter(i => i.folder_id === folder.id).length;
    const parts = [];
    if (nbFolders) parts.push(plural(nbFolders, 'dossier'));
    if (nbItems) parts.push(plural(nbItems, 'élément'));
    return parts.length ? parts.join(' · ') : 'Vide';
  };

  const isEmpty = subfolders.length === 0 && items.length === 0;

  // Clic droit : target = { type: 'folder', folder } | { type: 'item', item } | { type: 'background' }
  const openMenu = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.({ x: e.clientX, y: e.clientY, target });
  };

  const isTarget = (type, id) => contextTarget?.type === type && contextTarget[type]?.id === id;

  return (
    <div className="vault-panel" onContextMenu={e => openMenu(e, { type: 'background' })}>
      <div className="vault-header">
        {current && (
          <button
            className="vault-header-btn"
            onClick={() => onOpenFolder(parentId)}
            title="Dossier parent"
            aria-label="Revenir au dossier parent"
          >
            <IconChevron className="vault-back-icon" />
          </button>
        )}

        <nav className="vault-breadcrumb" aria-label="Emplacement">
          <button
            className={`vault-crumb ${current ? '' : 'current'}`}
            onClick={() => onOpenFolder(null)}
            aria-current={current ? undefined : 'page'}
          >
            Coffre-fort
          </button>
          {ancestors.map(f => (
            <span key={f.id} className="vault-crumb-group">
              <span className="vault-crumb-sep" aria-hidden="true">/</span>
              <button
                className={`vault-crumb ${f.id === currentFolder ? 'current' : ''}`}
                onClick={() => onOpenFolder(f.id)}
                aria-current={f.id === currentFolder ? 'page' : undefined}
                title={f.name}
              >
                {f.name}
              </button>
            </span>
          ))}
        </nav>

        {current && (
          <button
            className="vault-header-btn"
            onClick={() => onEditFolder(current)}
            title="Modifier le dossier"
            aria-label={`Modifier le dossier ${current.name}`}
          >
            <IconEdit className="icon-btn" />
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="vault-empty vault-empty-panel">
          <p className="vault-empty-title">{isSearching ? 'Aucun résultat' : current ? 'Dossier vide' : 'Coffre-fort vide'}</p>
          <p className="vault-empty-sub">
            {isSearching ? 'Essayez un autre mot-clé.' : 'Ajoutez un élément ou un dossier avec le bouton +'}
          </p>
        </div>
      ) : (
        <ul className="vault-list">
          {subfolders.length > 0 && (
            <li className="vault-section-title" aria-hidden="true">Dossiers</li>
          )}
          {subfolders.map(folder => (
            <li
              key={`folder-${folder.id}`}
              className={`vault-item vault-folder ${isTarget('folder', folder.id) ? 'context-target' : ''}`}
              onClick={() => onOpenFolder(folder.id)}
              onContextMenu={e => openMenu(e, { type: 'folder', folder })}
            >
              <span className="vault-avatar vault-folder-avatar">
                <IconFolder className="vault-folder-icon" />
              </span>
              <div className="vault-item-info">
                <span className="vault-item-title">{folder.name}</span>
                <span className="vault-item-login">{describeFolder(folder)}</span>
              </div>
              <button
                className="vault-folder-edit"
                onClick={e => {
                  e.stopPropagation();
                  onEditFolder(folder);
                }}
                title="Modifier le dossier"
                aria-label={`Modifier le dossier ${folder.name}`}
              >
                <IconEdit className="icon-sm" />
              </button>
              <IconChevron className="vault-folder-chevron" aria-hidden="true" />
            </li>
          ))}

          {subfolders.length > 0 && items.length > 0 && (
            <li className="vault-section-title" aria-hidden="true">Éléments</li>
          )}
          {items.map(item => {
            // Hors recherche, tous les éléments affichés sont dans le dossier courant : pas besoin du badge
            const path = isSearching && item.folder_id !== currentFolder ? getFolderPath(folders, item.folder_id) : '';
            return (
              <li
                key={item.id}
                className={`vault-item ${selectedItem?.id === item.id ? 'active' : ''} ${isTarget('item', item.id) ? 'context-target' : ''}`}
                onClick={() => onSelect(item)}
                onContextMenu={e => openMenu(e, { type: 'item', item })}
              >
                <ItemAvatar item={item} />
                <div className="vault-item-info">
                  <span className="vault-item-title">{item.title}</span>
                  <span className="vault-item-login">{item.type === 'contact' ? 'Contact' : 'Mot de passe'}</span>
                </div>
                {path && <span className="vault-item-folder" title={path}>{path}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
