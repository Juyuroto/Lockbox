import { pictures } from '../assets/pictures/pictures';

// Connexion : on montre à quoi ressemble l'app une fois connecté
export const LOGIN_SLIDES = [
  {
    title: "Tout votre coffre-fort, d'un coup d'œil",
    description: 'Mots de passe, contacts et dossiers réunis dans une seule interface claire.',
    image: pictures.loginDashboard,
  },
  {
    title: 'Retrouvez un accès en une seconde',
    description: 'Tapez quelques lettres, filtrez par type ou triez : le bon élément apparaît aussitôt.',
    image: pictures.loginSearch,
  },
  {
    title: 'Affichez ou copiez en un clic',
    description: "Vos mots de passe restent masqués jusqu'à ce que vous en ayez besoin. Un clic, et c'est copié.",
    image: pictures.loginCopy,
  },
  {
    title: 'Un générateur toujours sous la main',
    description: 'Créez des mots de passe uniques et solides au moment où vous en avez besoin.',
    image: pictures.loginGenerator,
  },
];

// Inscription : le parcours de la création du compte jusqu'au premier élément
export const REGISTER_SLIDES = [
  {
    title: 'Un coffre-fort pour tous vos secrets',
    description: 'Mots de passe, contacts, accès : tout ce qui compte, rangé au même endroit.',
    image: pictures.vault,
  },
  {
    title: 'Inscrivez-vous avec votre email',
    description: 'Un lien de confirmation arrive dans votre boîte mail en quelques secondes.',
    image: pictures.registerEmail,
  },
  {
    title: 'Choisissez votre mot de passe maître',
    description: "C'est la clé de votre coffre-fort. Chaque élément est ensuite chiffré en AES avant d'être enregistré.",
    image: pictures.registerMaster,
  },
  {
    title: 'Ajoutez votre premier élément',
    description: 'Votre coffre-fort est créé automatiquement. Un clic sur + et c’est parti.',
    image: pictures.registerFirstItem,
  },
  {
    title: 'Organisez par dossiers',
    description: 'Travail, perso, finance — classez vos identifiants comme vous le souhaitez.',
    image: pictures.folders,
  },
];
