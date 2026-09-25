import { charKind } from '../utils/generatePassword';

export default function ColoredPassword({ value, className = '' }) {
  return (
    <span className={`colored-password ${className}`}>
      {Array.from(value).map((c, i) => (
        <span key={i} className={`pw-${charKind(c)}`}>{c}</span>
      ))}
    </span>
  );
}
