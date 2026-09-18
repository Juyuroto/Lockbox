import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VaultList from '../components/VaultList';
import VaultDetail from '../components/VaultDetail';
import VaultModal from '../components/VaultModal';
import { icons } from '../assets/icons/icons';
import { vaultService } from '../services/api';
import '../assets/css/Dashboard.css';

export default function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [passwords, setPasswords] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const filtered = passwords.filter(p => {
    const matchFolder = selectedFolder ? p.folder_id === selectedFolder : true;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.login.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem('lockbox_token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <Sidebar
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
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
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <IconAdd className="icon-btn" />
            Ajouter
          </button>
        </div>

        <div className="dashboard-content">
          <VaultList
            items={filtered}
            selectedItem={selectedItem}
            onSelect={setSelectedItem}
            folders={folders}
          />
          {selectedItem && (
            <VaultDetail
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              folders={folders}
            />
          )}
        </div>
      </div>

      {showModal && (
        <VaultModal
          folders={folders}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}