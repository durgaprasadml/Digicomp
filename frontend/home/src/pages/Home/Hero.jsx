import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DotGrid from './DotGrid';

import { usePageData } from '../../stores/PageStore';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const avatars = [
  { id: 1, bg: '#FF5722' },
  { id: 2, bg: '#FFA726' },
  { id: 3, bg: '#FF6D33' },
  { id: 4, bg: '#E64A19' },
  { id: 5, bg: '#FFB74D' },
];

export default function Hero() {
  const [is3DLoaded, setIs3DLoaded] = useState( false )
  const isImporting = useRef( false )

  const { hero: heroData = {} } = usePageData('/')
  const has3D = !!heroData?.glb

  const handleInteraction = () => {
    if (!has3D || is3DLoaded || isImporting.current) return;

    if (typeof window !== 'undefined') {
      isImporting.current = true;
      import('@google/model-viewer')
        .then(() => {
          setIs3DLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load 3D viewer:", err);
          isImporting.current = false;
        });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Animated neon background */}
      {/* <NeonBackground /> */}
      <DotGrid
        dotSize={1}
        gap={40}
        baseColor="var(--dot-grid-base)"
        activeColor="var(--dot-grid-active)"
        proximity={300}
        shockRadius={200}
        shockStrength={0.5}
        resistance={1}
        returnDuration={1} />

      <div
        className="section-container relative z-10 flex w-full flex-col-reverse items-center gap-12 py-20 lg:flex-row lg:gap-16"
        onMouseEnter={handleInteraction}
        onClick={handleInteraction} >
        {/* ── Left Side (Text) ── */}
        <motion.div
          className="flex w-full flex-col items-center text-center lg:w-[55%] lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants}>
            <span
              id="hero-badge"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--elevated)] px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)]"
            >
              🇮🇳 Designed &amp; Manufactured in India
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-headline"
            className="mt-6 text-5xl font-bold tracking-tight text-[var(--text)] md:text-6xl lg:text-7xl"
            variants={itemVariants}
          >
            Engineered for{' '}
            <span className="gradient-text">Innovators.</span>
            <br />
            Manufactured in India.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            id="hero-subheadline"
            className="mt-6 max-w-xl text-lg text-[var(--text-secondary)]"
            variants={itemVariants}
          >
            Research-grade development boards, BMS, and FPGA modules designed
            and built domestically. Experience uncompromising quality paired with
            complete open-source documentation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            variants={itemVariants}
          >
            <a id="hero-cta-primary" href="#products" className="btn-primary">
              Explore the Hardware
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a id="hero-cta-secondary" href="#mission-vision" className="btn-secondary">
              Read Our Mission
            </a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            id="hero-trust-strip"
            className="mt-10 flex items-center gap-3"
            variants={itemVariants}
          >
            {/* Overlapping avatars */}
            <div className="flex -space-x-2">
              {avatars.map((a) => (
                <div
                  key={a.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg)] text-[11px] font-bold text-white"
                  style={{ backgroundColor: a.bg }}
                >
                  {String.fromCharCode(64 + a.id)}
                </div>
              ))}
            </div>
            <span className="text-sm text-[var(--text-muted)]">
              Trusted by <span className="font-semibold text-[var(--text-secondary)]">500+</span> engineers across India
            </span>
          </motion.div>
        </motion.div>

        {/* ── Right Side (Product Image) ── */}
        <motion.div
          className="relative flex w-full self-stretch items-center justify-center lg:w-[45%]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Radial glow behind image */}
          <div
            className="pointer-events-none absolute h-[120%] w-[120%] rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-soft-hover) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {is3DLoaded ? (
            <div className="w-full h-full overflow-hidden">
              <model-viewer
                src={ heroData.glb }
                poster={ heroData.img }
                alt="ESP32-S3 Development Board by Digicomp Technologies"
                camera-controls="true"
                camera-orbit="45deg 45deg 10m"
                // auto-rotate="true"
                rotation-per-second="30deg"
                // interaction-prompt="hover-after-interaction"
                style={{ width: '100%', height: 'calc(100% + 6px)', '--poster-color': 'transparent', position: 'relative', zIndex: 10, marginTop: '-6px' }}
              ></model-viewer>
            </div>
          ) : (
            <motion.img
              id="hero-product-image"
              src={ heroData.img }
              alt="ESP32-S3 Development Board by Digicomp Technologies"
              className={`relative z-10 w-full max-w-md drop-shadow-2xl lg:max-w-lg ${has3D ? 'cursor-pointer' : ''}`}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
