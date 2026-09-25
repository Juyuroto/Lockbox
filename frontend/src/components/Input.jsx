import { useState } from 'react';
import { icons } from '../assets/icons/icons';

const Input = ({ label, type = 'text', value, onChange, placeholder, required }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const IconEye = icons.eye;
  const IconEyeOff = icons.eyeOff;

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className={isPassword ? 'input-password' : undefined}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          className="input-field"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          spellCheck={isPassword ? false : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="input-eye"
            onClick={() => setShowPassword(v => !v)}
            title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
