import AuthCarousel from './AuthCarousel';
import { LOGIN_SLIDES, REGISTER_SLIDES } from './authSlides';

export default function AuthLayout({ children, variant = 'login' }) {
  return (
    <div className="auth-layout">
      <div className="auth-carousel">
        <AuthCarousel slides={variant === 'register' ? REGISTER_SLIDES : LOGIN_SLIDES} />
      </div>
      <div className="auth-form-side">
        {children}
      </div>
    </div>
  );
}
