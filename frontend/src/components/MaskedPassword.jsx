// Mot de passe masqué : un astérisque par caractère, dans la même police monospace que
// ColoredPassword, donc même largeur et même nombre de caractères que le mot de passe affiché.
export default function MaskedPassword({ value, className = '' }) {
  const length = Array.from(value ?? '').length;
  return (
    <span className={`masked-password ${className}`} aria-label={`Mot de passe masqué, ${length} caractères`}>
      {'*'.repeat(length)}
    </span>
  );
}
