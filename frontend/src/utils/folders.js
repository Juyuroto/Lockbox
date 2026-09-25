// Les dossiers arrivent à plat depuis /vault : la hiérarchie se reconstruit avec parent_id

// Enfants directs d'un dossier (parentId null = racine), triés par nom.
// Un dossier dont le parent est introuvable est affiché à la racine.
export const getChildren = (folders, parentId) => folders
  .filter(f => (parentId === null
    ? f.parent_id == null || !folders.some(p => p.id === f.parent_id)
    : f.parent_id === parentId))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

// Ids du dossier et de tous ses sous-dossiers
export const getDescendantIds = (folders, id) => {
  const ids = new Set([id]);
  const stack = [id];
  while (stack.length) {
    const current = stack.pop();
    folders.forEach(f => {
      if (f.parent_id === current && !ids.has(f.id)) {
        ids.add(f.id);
        stack.push(f.id);
      }
    });
  }
  return ids;
};

// Dossiers de la racine jusqu'au dossier id inclus (pour le fil d'Ariane)
export const getAncestors = (folders, id) => {
  const chain = [];
  const seen = new Set();
  let folder = folders.find(f => f.id === id);
  while (folder && !seen.has(folder.id)) {
    seen.add(folder.id);
    chain.unshift(folder);
    folder = folders.find(f => f.id === folder.parent_id);
  }
  return chain;
};

// Chemin lisible : "Parent / Enfant"
export const getFolderPath = (folders, id) => getAncestors(folders, id).map(f => f.name).join(' / ');

// Liste à plat dans l'ordre de l'arbre, avec la profondeur (pour les <select>)
// exclude : ids à ne pas proposer (ex: le dossier lui-même et ses sous-dossiers)
export const flattenFolders = (folders, exclude = new Set()) => {
  const result = [];
  const walk = (parentId, depth) => {
    getChildren(folders, parentId).forEach(f => {
      if (exclude.has(f.id)) return;
      result.push({ ...f, depth });
      walk(f.id, depth + 1);
    });
  };
  walk(null, 0);
  return result;
};

// Le backend renvoie ses erreurs en anglais : message en français pour un refus de suppression (409)
export const folderDeleteErrorMessage = (err) => {
  if (err.status !== 409) return err.message;
  return err.message.includes('subfolders')
    ? 'Ce dossier contient des sous-dossiers : supprimez-les ou déplacez-les d\'abord.'
    : 'Ce dossier contient des éléments : supprimez-les ou déplacez-les d\'abord.';
};
