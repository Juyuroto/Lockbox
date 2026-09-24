import { useState, useRef } from 'react';
import { LOGIN_SLIDES } from './authSlides';
import LogoIcon from '../assets/logo/lockbox-icon.svg?react';

const INTERVAL_MS = 8000;
const SWIPE_THRESHOLD = 50;

const pad = (n) => String(n).padStart(2, '0');

export default function AuthCarousel({ slides = LOGIN_SLIDES }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState('next');
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const goTo = (index, dir) => {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;
    setDirection(dir ?? (next > current ? 'next' : 'prev'));
    setCurrent(next);
  };

  const goNext = () => goTo(current + 1, 'next');
  const goPrev = () => goTo(current - 1, 'prev');

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -SWIPE_THRESHOLD) goNext();
    if (delta > SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
  };

  return (
    <section
      className={`carousel-content ${paused ? 'paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="Découvrir Lockbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ '--carousel-interval': `${INTERVAL_MS}ms` }}
    >
      <div className="carousel-header">
        <span className="carousel-logo">
          <LogoIcon className="carousel-logo-icon" aria-hidden="true" />
          Lockbox
        </span>
        <span className="carousel-counter" aria-hidden="true">
          <span className="carousel-counter-current">{pad(current + 1)}</span>
          {' / '}
          {pad(slides.length)}
        </span>
      </div>

      <div className="carousel-slides" aria-live={paused ? 'polite' : 'off'}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`carousel-slide ${i === current ? `active ${direction}` : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} sur ${slides.length}`}
            aria-hidden={i !== current}
          >
            <div className="carousel-illustration">
              <img
                src={slide.image}
                alt={slide.title}
                className="carousel-image"
                draggable={false}
              />
            </div>
            <h2 className="carousel-title">{slide.title}</h2>
            <p className="carousel-desc">{slide.description}</p>
          </div>
        ))}
      </div>

      <div className="carousel-controls">
        <button className="carousel-arrow" onClick={goPrev} aria-label="Slide précédente">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="carousel-dots">
          {slides.map((slide, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Aller à la slide ${i + 1} : ${slide.title}`}
              aria-current={i === current}
            >
              {i === current && (
                <span
                  key={current}
                  className="carousel-dot-progress"
                  onAnimationEnd={goNext}
                />
              )}
            </button>
          ))}
        </div>

        <button className="carousel-arrow" onClick={goNext} aria-label="Slide suivante">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
