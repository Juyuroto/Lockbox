import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VaultList from '../components/VaultList';
import VaultDetail from '../components/VaultDetail';
import VaultModal from '../components/VaultModal';
import EditItemModal from '../components/EditItemModal';
import FilterMenu from '../components/FilterMenu';
import { DEFAULT_FILTERS, applyFilters } from '../utils/filters';
import { icons } from '../assets/icons/icons';
import { vaultService } from '../services/api';
import '../assets/css/Dashboard.css';

export default function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [passwords, setPasswords] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  // Vue « Éléments supprimés » (historique et récupération à venir)
  const [showTrash, setShowTrash] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showModal, setShowModal] = useState(false);
  // Item en cours de modification : { item, data } (data = champs déchiffrés)
  const [editing, setEditing] = useState(null);
  // Incrémenté après une modification pour que VaultDetail recharge les données déchiffrées
  const [detailVersion, setDetailVersion] = useState(0);

  const IconSearch = icons.search;
  const IconAdd = icons.add;

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

  const filtered = applyFilters(passwords.filter(p => {
    const matchFolder = selectedFolder ? p.folder_id === selectedFolder : true;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  }), filters);

  const handleLogout = () => {
    localStorage.removeItem('lockbox_token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <Sidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={id => {
          setSelectedFolder(id);
          setShowTrash(false);
        }}
        trashActive={showTrash}
        onSelectTrash={() => {
          setShowTrash(true);
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
          <button
            className="btn-add btn-add-icon"
            onClick={() => setShowModal(true)}
            title="Ajouter un élément"
            aria-label="Ajouter un élément"
          >
            <IconAdd className="icon-btn" />
          </button>
        </div>

        <div className="dashboard-content">
          {showTrash ? (
            <div className="vault-empty">
              <p className="vault-empty-title">Éléments supprimés</p>
              <p className="vault-empty-sub">
                L'historique des suppressions et la récupération seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <VaultList
              items={filtered}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              folders={folders}
            />
          )}
          {!showTrash && selectedItem && (
            <VaultDetail
              key={`${selectedItem.id}-${detailVersion}`}
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onEdit={data => setEditing({ item: selectedItem, data })}
              onDeleted={id => {
                setPasswords(p => p.filter(i => i.id !== id));
                setSelectedItem(null);
              }}
              folders={folders}
            />
          )}
        </div>
      </div>

      {showModal && (
        <VaultModal
          folders={folders}
          defaultFolder={selectedFolder}
          onClose={() => setShowModal(false)}
          onCreated={item => {
            // La réponse de création n'a pas de dates : on les met pour que le tri par date marche
            const now = new Date().toISOString();
            setPasswords(p => [...p, { ...item, CreatedAt: now, UpdatedAt: now }]);
          }}
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
    </div>
  );
}