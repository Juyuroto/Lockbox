import ItemAvatar from './ItemAvatar';

export default function VaultList({ items, selectedItem, onSelect, folders }) {
  if (items.length === 0) {
    return (
      <div className="vault-empty">
        <p className="vault-empty-title">Aucun résultat</p>
        <p className="vault-empty-sub">Ajoutez votre premier mot de passe avec le bouton +</p>
      </div>
    );
  }

  return (
    <ul className="vault-list">
      {items.map(item => {
        const folder = folders.find(f => f.id === item.folder_id);
        return (
          <li
            key={item.id}
            className={`vault-item ${selectedItem?.id === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item)}
          >
            <ItemAvatar item={item} />
            <div className="vault-item-info">
              <span className="vault-item-title">{item.title}</span>
              <span className="vault-item-login">{item.type === 'contact' ? 'Contact' : 'Mot de passe'}</span>
            </div>
            {folder && (
              <span className="vault-item-folder">{folder.name}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
