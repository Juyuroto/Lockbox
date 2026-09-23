import { charKind } from '../utils/generatePassword';

// Affiche un mot de passe avec une couleur par type de caractère :
// lettres sans couleur, chiffres en bleu, caractères spéciaux en rouge
export default function ColoredPassword({ value, className = '' }) {
  return (
    <span className={`colored-password ${className}`}>
      {Array.from(value).map((c, i) => (
        <span key={i} className={`pw-${charKind(c)}`}>{c}</span>
      ))}
    </span>
  );
}
