// Mot de passe masqué : un point par caractère, chacun de la largeur d'un caractère
// de la police monospace, pour que la longueur corresponde au mot de passe affiché.
export default function MaskedPassword({ value, className = '' }) {
  const length = Array.from(value ?? '').length;
  return (
    <span className={`masked-password ${className}`} aria-label={`Mot de passe masqué, ${length} caractères`}>
      {Array.from({ length }, (_, i) => (
        <span key={i} className="masked-dot" aria-hidden="true" />
      ))}
    </span>
  );
}
