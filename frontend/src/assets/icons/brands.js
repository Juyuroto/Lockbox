// Icônes de marques : déposer un fichier .svg dans ./brands/ et il est chargé automatiquement.
// Le nom du fichier sert de mot-clé : github.svg -> "github", google-drive.svg -> "google drive".
const files = import.meta.glob('./brands/*.svg', { eager: true, query: '?url', import: 'default' });

// Mots-clés supplémentaires qui affichent le logo d'une marque (clé = nom du fichier sans .svg)
const ALIASES = {
  'amazon': ['amazon prime', 'prime video', 'kindle', 'audible'],
  'android': ['google play', 'play store', 'playstore'],
  'apple': ['icloud', 'itunes', 'app store', 'appstore', 'apple id', 'iphone', 'ipad', 'macbook', 'macos', 'ios'],
  'aws': ['amazon web services'],
  'battle-net-badge': ['battle net', 'battlenet', 'blizzard', 'warcraft', 'overwatch', 'diablo', 'hearthstone'],
  'canva': [],
  'chrome': ['google chrome'],
  'claude': ['anthropic'],
  'cloudflare': [],
  'corsair': ['icue'],
  'darty': [],
  'discord': [],
  'docker': ['dockerhub'],
  'ea': ['electronic arts', 'ea app', 'origin', 'ea sports', 'fifa'],
  'ebay': [],
  'epic-games': ['epic', 'epicgames', 'fortnite', 'unreal'],
  'figma': [],
  'firefox': ['mozilla'],
  'github': ['gh'],
  'githubcopilot': ['copilot', 'github copilot'],
  'hp': ['hewlett packard'],
  'ile-de-france-mobilites': ['idf mobilites', 'navigo', 'ratp', 'transilien'],
  'jellyfin': [],
  'jenkins': [],
  'klarna': [],
  'linux': ['ubuntu', 'debian', 'fedora', 'archlinux'],
  'logitech-badge': ['logitech', 'logi'],
  'mcdonalds': ['mcdo', 'mc do', 'mcdonald', 'mc donald', 'mc donalds'],
  'meta': ['facebook', 'fb', 'instagram', 'insta', 'whatsapp', 'messenger', 'oculus'],
  'microsoft': ['outlook', 'hotmail', 'xbox', 'office', 'office365', 'office 365', 'teams', 'onedrive', 'azure', 'skype', 'bing', 'windows', 'msn'],
  'netflix': [],
  'nintendo': ['switch', 'nintendo switch', 'eshop'],
  'notion': [],
  'openai': ['chatgpt', 'gpt', 'dall e', 'sora'],
  'oracle': ['java', 'mysql'],
  'ovh-badge': ['ovh', 'ovhcloud', 'kimsufi', 'soyoustart'],
  'razer': ['synapse'],
  'riot-games': ['riot', 'league of legends', 'lol', 'valorant', 'teamfight tactics', 'tft'],
  'safari': [],
  'sncf': ['sncf connect', 'ouigo', 'tgv'],
  'spotify': [],
  'steam': ['valve', 'steamworks'],
  'steelseries': ['steel series', 'steelseries gg'],
  'stripe': [],
  'ubisoft': ['ubisoft connect', 'uplay'],
  'visual-studio-code': ['vscode', 'vs code', 'visual studio code'],
};

// "Mot de passe GitHub.com" -> ["mot", "de", "passe", "github", "com"]
const tokenize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const brands = Object.entries(files)
  .flatMap(([path, url]) => {
    const name = path.split('/').pop().replace('.svg', '');
    return [name, ...(ALIASES[name] ?? [])].map(keyword => ({ name, url, tokens: tokenize(keyword) }));
  })
  // Les mots-clés les plus longs d'abord : "google-drive" passe avant "google"
  .sort((a, b) => b.tokens.length - a.tokens.length);

const containsSequence = (words, seq) =>
  words.some((_, i) => seq.every((t, j) => words[i + j] === t));

export function getBrandIcon(title) {
  if (!title) return null;
  const words = tokenize(title);
  return brands.find(b => containsSequence(words, b.tokens)) ?? null;
}
