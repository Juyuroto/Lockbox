export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// Caractères faciles à confondre à l'écrit : 0/O, 1/l/I, |
const AMBIGUOUS = '0O1lI|';

export const DEFAULT_OPTIONS = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  special: true,
  avoidAmbiguous: false,
  exclude: '',
};

const STORAGE_KEY = 'lockbox_generator_options';

// Les derniers réglages sont gardés dans le navigateur pour la prochaine génération
export function loadGeneratorOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...DEFAULT_OPTIONS, ...saved } : DEFAULT_OPTIONS;
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export function saveGeneratorOptions(options) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch {
    // stockage indisponible (navigation privée...) : on ignore
  }
}

// Jeux de caractères actifs, sans les caractères exclus (les jeux vides sont retirés)
export function getPools(options) {
  const removed = new Set([...(options.exclude ?? ''), ...(options.avoidAmbiguous ? AMBIGUOUS : '')]);
  return Object.keys(CHARSETS)
    .filter(key => options[key])
    .map(key => [...CHARSETS[key]].filter(c => !removed.has(c)).join(''))
    .filter(Boolean);
}

// Index aléatoire sans biais (rejet des valeurs qui fausseraient le modulo)
function randomIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

// Au moins un caractère de chaque jeu actif, le reste tiré dans l'ensemble, puis mélangé
export function generatePassword(options = DEFAULT_OPTIONS) {
  const pools = getPools(options);
  if (pools.length === 0) return '';

  const all = pools.join('');
  const length = Math.max(options.length, pools.length);
  const chars = pools.map(pool => pool[randomIndex(pool.length)]);
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Entropie en bits -> niveau affiché dans le générateur
export function passwordStrength(options) {
  const size = getPools(options).join('').length;
  if (size === 0) return { level: 0, label: 'Aucun caractère disponible' };
  const bits = options.length * Math.log2(size);
  if (bits < 50) return { level: 1, label: 'Faible' };
  if (bits < 80) return { level: 2, label: 'Moyen' };
  if (bits < 110) return { level: 3, label: 'Fort' };
  return { level: 4, label: 'Très fort' };
}

// Caractère aléatoire uniquement pour l'animation (pas utilisé dans le mot de passe final)
export function randomChar(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// 'letter' | 'digit' | 'special' : sert à colorer chaque caractère
export function charKind(c) {
  if (/[0-9]/.test(c)) return 'digit';
  if (/[a-zA-Z]/.test(c)) return 'letter';
  return 'special';
}
