import React from 'react';

/* ──────────────────────────────────────────────────
   HeroBackground — Premium automotive image hero
   with cinematic overlay, ambient glow, and vignette
   ────────────────────────────────────────────────── */
const HeroBackground = () => {
  return (
    <div className="hero-bg-container" aria-hidden="true">
      {/* Background car image */}
      <div className="hero-bg-image">
        <img
          src="/hero-car.png"
          alt=""
          className="hero-bg-img"
          loading="eager"
        />
      </div>

      {/* Dark overlay gradient — content readability */}
      <div className="hero-bg-overlay" />

      {/* Green ambient glow — bottom accent */}
      <div className="hero-bg-glow" />

      {/* Subtle noise texture */}
      <div className="hero-bg-noise" />
    </div>
  );
};

export default HeroBackground;
