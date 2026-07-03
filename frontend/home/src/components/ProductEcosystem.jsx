import { motion } from 'framer-motion';

import { getEcoSystem } from '../services/api';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const mcuChips = ['ESP32-S3', 'RP2040', 'CH32V003', 'STM32F030', 'TI MSPM0'];

const { mcus, fpga } = getEcoSystem();

const bmsSpecs = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 2h8v1h2v10H2V3h2V2zm1 1v1h6V3H5zm-2 3h10v6H3V6z" fill="currentColor" opacity="0.7" />
        <rect x="4" y="7" width="2" height="4" rx="0.5" fill="#4ade80" />
        <rect x="7" y="8" width="2" height="3" rx="0.5" fill="#facc15" />
        <rect x="10" y="9" width="2" height="2" rx="0.5" fill="var(--color-accent-start)" />
      </svg>
    ),
    label: '2S to 16S Scalable',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1l1.5 3H14l-3 2.5L12.5 10 8 7.5 3.5 10 5 6.5 2 4h4.5L8 1z" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    label: 'Over-voltage Protection',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4h10v8H3V4zm2 2v4h6V6H5zm1 1h1v2H6V7zm2 0h1v2H8V7zm2 0h1v2h-1V7z" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    label: 'Cell Balancing',
  },
];

function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const spotlight = e.currentTarget.querySelector('.spotlight-effect');
  if (spotlight) {
    spotlight.style.left = x + 'px';
    spotlight.style.top = y + 'px';
  }
}

function BentoCard({ children, className = '', id }) {
  return (
    <motion.div
      id={id}
      variants={item}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`spotlight-card bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      <div className="spotlight-effect" />
      {children}
    </motion.div>
  );
}

function BatteryIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {/* Battery outline */}
      <rect x="8" y="14" width="44" height="36" rx="4" stroke="var(--color-accent-start)" strokeWidth="2" fill="none" />
      <rect x="52" y="24" width="6" height="16" rx="2" stroke="var(--color-accent-start)" strokeWidth="2" fill="none" />
      {/* Charge segments */}
      <rect x="13" y="19" width="8" height="26" rx="2" fill="#4ade80" opacity="0.9" />
      <rect x="23" y="19" width="8" height="26" rx="2" fill="#4ade80" opacity="0.7" />
      <rect x="33" y="19" width="8" height="26" rx="2" fill="#facc15" opacity="0.5" />
      <rect x="43" y="19" width="4" height="26" rx="2" fill="var(--color-accent-start)" opacity="0.3" />
      {/* Lightning bolt */}
      <path d="M30 22l-6 12h6l-2 10 8-14h-6l4-8h-4z" fill="white" opacity="0.3" />
    </svg>
  );
}

export default function ProductEcosystem() {
  return (
    <section id="product-ecosystem" className="section-padding relative">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-widest text-sm gradient-text font-semibold">
            PRODUCT ECOSYSTEM
          </span>
          <h2 className="text-4xl font-bold mt-4 mb-4 text-[var(--text)]">
            Hardware That Powers Ideas
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            From rapid prototyping to production deployment — a complete ecosystem of development
            platforms.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card 1: Next-Gen Microcontrollers — spans 2 cols */}
          <BentoCard
            id="bento-card-microcontrollers"
            className="md:col-span-2 p-8 md:p-10"
          >
            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,87,34,0.05) 0%, transparent 50%, rgba(255,167,38,0.03) 100%)',
              }}
            />

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--text)]">
                Next-Gen Microcontrollers
              </h3>
              <p className="text-[var(--text-secondary)] max-w-2xl mb-8 text-base leading-relaxed">
                Industry-leading development boards featuring ESP32-S3, RP2040, CH32V003, STM32F030,
                and TI MSPM0 — each with complete documentation and example code.
              </p>

              {/* Floating product images */}
              <div className="flex items-center justify-evenly gap-4 mb-8 py-4">
                {mcus.map((img, i) => (
                  <motion.img
                    key={img}
                    src={img}
                    alt={img.split('.')[0]}
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain drop-shadow-2xl"
                    style={{
                      marginLeft: i > 0 ? '-16px' : '0',
                      zIndex: mcus.length - i,
                    }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: (i+1) * 0.8,
                    }}
                  />
                ))}
              </div>

              {/* Chip tags */}
              <div className="flex flex-wrap gap-2">
                {mcuChips.map((chip) => (
                  <span
                    key={chip}
                    className="bg-[var(--elevated)] border border-[var(--border)] rounded-full px-3 py-1 text-xs text-[var(--text-secondary)] font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Battery Management */}
          <BentoCard id="bento-card-bms" className="p-8">
            <div className="relative z-10">
              <div className="flex items-start gap-5 mb-6">
                <BatteryIcon />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                    Advanced Battery Management
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    Scalable from 2S up to 16S BMS solutions. Industrial-grade protection with
                    precision monitoring.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mt-4">
                {bmsSpecs.map((spec) => (
                  <li
                    key={spec.label}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--elevated)] border border-[var(--border)] text-[var(--color-accent-start)]">
                      {spec.icon}
                    </span>
                    {spec.label}
                  </li>
                ))}
              </ul>
            </div>
          </BentoCard>

          {/* Card 3: FPGA Platforms */}
          <BentoCard id="bento-card-fpga" className="p-8">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">FPGA Platforms</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                Xilinx Artix-7 based development board for complex digital logic, signal processing,
                and hardware acceleration.
              </p>

              <div className="flex justify-center mb-5">
                <motion.img
                  src={ fpga }
                  alt="FPGA Development Board"
                  className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              <span className="bg-[var(--elevated)] border border-[var(--border)] rounded-full px-3 py-1 text-xs text-[var(--text-secondary)] font-medium">
                Xilinx Artix-7
              </span>
            </div>
          </BentoCard>
        </motion.div>
      </div>
    </section>
  );
}
