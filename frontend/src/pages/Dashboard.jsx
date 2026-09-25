import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import VaultList from '../components/VaultList';
import VaultDetail from '../components/VaultDetail';
import VaultModal from '../components/VaultModal';
import EditItemModal from '../components/EditItemModal';
import FolderModal from '../components/FolderModal';
import FilterMenu from '../components/FilterMenu';
import AddMenu from '../components/AddMenu';
import ContextMenu from '../components/ContextMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { DEFAULT_FILTERS, applyFilters } from '../utils/filters';
import { getChildren, getDescendantIds, folderDeleteErrorMessage } from '../utils/folders';
import { icons } from '../assets/icons/icons';
import { vaultService, authService, itemService, folderService } from '../services/api';
import { endSession } from '../services/session';
import '../assets/css/Dashboard.css';

export default function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [passwords, setPasswords] = useState([]);
  // Dossier ouvert dans le coffre-fort (null = racine)
  const [currentFolder, setCurrentFolder] = useState(null);
  // Vue affichée : 'vault' (éléments), 'trash' (supprimés, à venir) ou 'settings' (à venir)
  const [view, setView] = useState('vault');
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Modal de création d'élément ouvert : { folder } = dossier proposé par défaut
  const [itemModal, setItemModal] = useState(null);
  // Item en cours de modification : { item, data } (data = champs déchiffrés)
  const [editing, setEditing] = useState(null);
  // Modal dossier ouvert : { folder } pour modifier, { parent } pour créer
  const [folderModal, setFolderModal] = useState(null);
  // Incrémenté après une modification pour que VaultDetail recharge les données déchiffrées
  const [detailVersion, setDetailVersion] = useState(0);
  // Menu du clic droit : { x, y, target }
  const [contextMenu, setContextMenu] = useState(null);
  // Suppression à confirmer : { title, message, onConfirm }
  const [confirm, setConfirm] = useState(null);
  // Petit message temporaire en bas de l'écran : { text, error }
  const [notice, setNotice] = useState(null);

  const IconSearch = icons.search;

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const showNotice = (text, error = false) => setNotice({ text, error });

  // Chaque nouveau message relance le délai avant disparition
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const data = await vaultService.getVault();
        setFolders(data.folders ?? []);
        setPasswords(data.passwords ?? []);
      } catch (err) {
        console.error('Erreur lors du chargement du vault :', err.message);
      }
    };
    fetchVault();
  }, []);

  const query = search.trim().toLowerCase();
  const isSearching = query !== '';
  const folderExists = id => folders.some(f => f.id === id);

  let visibleFolders;
  let visibleItems;
  if (isSearching) {
    // Recherche dans le dossier courant et tous ses sous-dossiers
    const scope = currentFolder ? getDescendantIds(folders, currentFolder) : null;
    const inScope = id => (scope ? scope.has(id) : true);
    visibleFolders = folders
      .filter(f => f.id !== currentFolder && inScope(f.id) && f.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    visibleItems = passwords.filter(p => inScope(p.folder_id) && p.title.toLowerCase().includes(query));
  } else {
    // Contenu direct du dossier courant (un élément dont le dossier est introuvable reste visible à la racine)
    visibleFolders = getChildren(folders, currentFolder);
    visibleItems = passwords.filter(p => (currentFolder
      ? p.folder_id === currentFolder
      : p.folder_id == null || !folderExists(p.folder_id)));
  }
  visibleItems = applyFilters(visibleItems, filters);

  const removeItem = (id) => {
    setPasswords(p => p.filter(i => i.id !== id));
    setSelectedItem(s => (s?.id === id ? null : s));
  };

  const removeFolder = (id) => {
    // Si on était dans le dossier supprimé, on remonte à son parent
    if (currentFolder === id) {
      setCurrentFolder(folders.find(x => x.id === id)?.parent_id ?? null);
    }
    setFolders(f => f.filter(x => x.id !== id));
  };

  // La modification a besoin des données déchiffrées de l'élément
  const editItem = async (item) => {
    try {
      const data = await itemService.getItem(item.id);
      setEditing({ item, data });
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const copyField = async (item, key, label) => {
    try {
      const data = await itemService.getItem(item.id);
      await navigator.clipboard.writeText(data[key] ?? '');
      showNotice(`${label} copié`);
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const askDeleteItem = (item) => setConfirm({
    title: 'Supprimer l\'élément',
    message: `« ${item.title} » sera supprimé définitivement.`,
    onConfirm: async () => {
      await itemService.deleteItem(item.id);
      removeItem(item.id);
    },
  });

  const askDeleteFolder = (folder) => setConfirm({
    title: 'Supprimer le dossier',
    message: `Le dossier « ${folder.name} » sera supprimé. Il doit être vide.`,
    onConfirm: async () => {
      try {
        await folderService.deleteFolder(folder.id);
      } catch (err) {
        throw new Error(folderDeleteErrorMessage(err));
      }
      removeFolder(folder.id);
    },
  });

  const openFolder = (id) => {
    setCurrentFolder(id);
    setSearch('');
  };

  const menuEntries = ({ type, item, folder }) => {
    if (type === 'item') {
      return [
        { label: 'Afficher', icon: icons.eye, onClick: () => setSelectedItem(item) },
        ...(item.type === 'password' ? [
          { label: 'Copier l\'identifiant', icon: icons.copy, onClick: () => copyField(item, 'login', 'Identifiant') },
          { label: 'Copier le mot de passe', icon: icons.copy, onClick: () => copyField(item, 'password', 'Mot de passe') },
        ] : []),
        'separator',
        { label: 'Modifier', icon: icons.edit, onClick: () => editItem(item) },
        { label: 'Supprimer', icon: icons.trash, danger: true, onClick: () => askDeleteItem(item) },
      ];
    }
    if (type === 'folder') {
      return [
        { label: 'Ouvrir', icon: icons.folder, onClick: () => openFolder(folder.id) },
        'separator',
        { label: 'Nouvel élément ici', icon: icons.grid, onClick: () => setItemModal({ folder: folder.id }) },
        { label: 'Nouveau sous-dossier', icon: icons.add, onClick: () => setFolderModal({ parent: folder.id }) },
        'separator',
        { label: 'Modifier', icon: icons.edit, onClick: () => setFolderModal({ folder }) },
        { label: 'Supprimer', icon: icons.trash, danger: true, onClick: () => askDeleteFolder(folder) },
      ];
    }
    // Fond de la liste : actions sur le dossier courant
    const current = folders.find(f => f.id === currentFolder);
    return [
      { label: 'Nouvel élément', icon: icons.grid, onClick: () => setItemModal({ folder: currentFolder }) },
      { label: current ? 'Nouveau sous-dossier' : 'Nouveau dossier', icon: icons.add, onClick: () => setFolderModal({ parent: currentFolder }) },
      ...(current ? [
        'separator',
        { label: 'Modifier ce dossier', icon: icons.edit, onClick: () => setFolderModal({ folder: current }) },
        { label: 'Supprimer ce dossier', icon: icons.trash, danger: true, onClick: () => askDeleteFolder(current) },
      ] : []),
    ];
  };

  const handleLogout = async () => {
    await authService.logout();
    endSession();
  };

  return (
    <div className="dashboard">
      <Sidebar
        view={view}
        onSelectVault={() => {
          setView('vault');
          setCurrentFolder(null);
        }}
        onSelectTrash={() => {
          setView('trash');
          setSelectedItem(null);
        }}
        onSelectSettings={() => {
          setView('settings');
          setSelectedItem(null);
        }}
        onLogout={handleLogout}
        passwordCount={passwords.length}
      />

      <div className="dashboard-main">
        <div className="dashboard-toolbar">
          <div className="search-wrapper">
            <IconSearch className="search-icon-svg" />
            <input
              className="search-input"
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <FilterMenu filters={filters} onChange={setFilters} />
          <AddMenu
            onAddItem={() => setItemModal({ folder: currentFolder })}
            onAddFolder={() => setFolderModal({ parent: currentFolder })}
          />
        </div>

        <div className="dashboard-content">
          {view === 'trash' && (
            <div className="vault-empty">
              <p className="vault-empty-title">Éléments supprimés</p>
              <p className="vault-empty-sub">
                L'historique des suppressions et la récupération seront bientôt disponibles.
              </p>
            </div>
          )}
          {view === 'settings' && (
            <div className="vault-empty">
              <p className="vault-empty-title">Paramètres</p>
              <p className="vault-empty-sub">
                Les paramètres du compte seront bientôt disponibles.
              </p>
            </div>
          )}
          {view === 'vault' && (
            <VaultList
              folders={folders}
              allItems={passwords}
              currentFolder={currentFolder}
              subfolders={visibleFolders}
              items={visibleItems}
              isSearching={isSearching}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onOpenFolder={openFolder}
              onEditFolder={folder => setFolderModal({ folder })}
              onContextMenu={setContextMenu}
              contextTarget={contextMenu?.target}
            />
          )}
          {view === 'vault' && selectedItem && (
            <VaultDetail
              key={`${selectedItem.id}-${detailVersion}`}
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onEdit={data => setEditing({ item: selectedItem, data })}
              onDeleted={removeItem}
              folders={folders}
            />
          )}
        </div>
      </div>

      {itemModal && (
        <VaultModal
          folders={folders}
          defaultFolder={itemModal.folder}
          onClose={() => setItemModal(null)}
          onCreated={item => {
            // La réponse de création n'a pas de dates : on les met pour que le tri par date marche
            const now = new Date().toISOString();
            setPasswords(p => [...p, { ...item, CreatedAt: now, UpdatedAt: now }]);
          }}
        />
      )}

      {folderModal && (
        <FolderModal
          folder={folderModal.folder}
          defaultParent={folderModal.parent}
          folders={folders}
          onClose={() => setFolderModal(null)}
          onSaved={saved => {
            setFolders(f => (f.some(x => x.id === saved.id)
              ? f.map(x => (x.id === saved.id ? saved : x))
              : [...f, saved]));
          }}
          onDeleted={removeFolder}
        />
      )}

      {editing && (
        <EditItemModal
          item={editing.item}
          data={editing.data}
          folders={folders}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            const { message: _message, ...fields } = updated;
            const merged = { ...editing.item, ...fields, UpdatedAt: new Date().toISOString() };
            setPasswords(p => p.map(i => (i.id === merged.id ? merged : i)));
            setSelectedItem(merged);
            setDetailVersion(v => v + 1);
          }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entries={menuEntries(contextMenu.target)}
          onClose={closeContextMenu}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      {notice && (
        <div className={`toast ${notice.error ? 'toast-error' : ''}`} role="status">
          {notice.text}
        </div>
      )}
    </div>
  );
}