import { getBrandIcon } from '../assets/icons/brands';

function getInitials(title) {
  return title.slice(0, 2).toUpperCase();
}

function getColor(title) {
  const colors = [
    '#313944', '#454F5F', '#586679',
    '#64748B', '#1E2329', '#8694A7'
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ItemAvatar({ item, size = 'md' }) {
  const brand = item.type === 'password' ? getBrandIcon(item.title) : null;

  if (brand) {
    return (
      <div className={`vault-avatar vault-avatar-${size} vault-avatar-brand`}>
        <img src={brand.url} alt={brand.name} />
      </div>
    );
  }

  return (
    <div className={`vault-avatar vault-avatar-${size}`} style={{ background: getColor(item.title) }}>
      {getInitials(item.title)}
    </div>
  );
}
