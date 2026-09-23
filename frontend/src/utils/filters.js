export const DEFAULT_FILTERS = { type: 'all', sort: 'name-asc' };

const time = (date) => (date ? new Date(date).getTime() : 0);

// Applique le filtre de type et le tri (tout se fait côté client avec les infos du vault)
export function applyFilters(items, filters) {
  const result = filters.type === 'all' ? [...items] : items.filter(i => i.type === filters.type);
  const byName = (a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });

  switch (filters.sort) {
    case 'name-desc': return result.sort((a, b) => byName(b, a));
    case 'created-desc': return result.sort((a, b) => time(b.CreatedAt) - time(a.CreatedAt));
    case 'created-asc': return result.sort((a, b) => time(a.CreatedAt) - time(b.CreatedAt));
    case 'updated-desc': return result.sort((a, b) => time(b.UpdatedAt) - time(a.UpdatedAt));
    default: return result.sort(byName);
  }
}
