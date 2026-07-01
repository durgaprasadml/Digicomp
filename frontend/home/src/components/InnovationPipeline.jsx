import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const upcomingProducts = [
  {
    id: 'pipeline-sbc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* CPU / processor icon */}
        <rect x="9" y="9" width="14" height="14" rx="2" stroke="var(--color-accent-start)" strokeWidth="1.5" fill="none" />
        <rect x="12" y="12" width="8" height="8" rx="1" fill="var(--color-accent-start)" opacity="0.2" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" fill="var(--color-accent-start)" opacity="0.5" />
        {/* Pins */}
        <line x1="11" y1="5" x2="11" y2="9" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="5" x2="16" y2="9" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="5" x2="21" y2="9" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11" y1="23" x2="11" y2="27" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="23" x2="16" y2="27" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="23" x2="21" y2="27" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="11" x2="9" y2="11" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="16" x2="9" y2="16" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="21" x2="9" y2="21" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="11" x2="27" y2="11" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="16" x2="27" y2="16" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="21" x2="27" y2="21" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'High-Performance Single-Board Computers',
    description:
      'Rockchip-powered SBCs for edge AI, media processing, and industrial IoT applications.',
    status: 'In Development'
  },
  {
    id: 'pipeline-wireless',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Radio waves / antenna */}
        <line x1="16" y1="28" x2="16" y2="16" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="28" x2="20" y2="28" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="14" r="2" fill="var(--color-accent-start)" opacity="0.6" />
        <path d="M10 10a8.5 8.5 0 0 1 12 0" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M7 7a13 13 0 0 1 18 0" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M4 4a17.5 17.5 0 0 1 24 0" stroke="var(--color-accent-start)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </svg>
    ),
    title: 'Sub-1GHz & 2.4GHz Wireless Modules',
    description:
      'LoRa, GNSS, and custom RF modules for long-range IoT and precision positioning.',
    status: 'Beta Test'
  },
  {
    id: 'pipeline-power',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Lightning bolt / power */}
        <path
          d="M18 3L8 18h7l-3 11 12-16h-7l5-10h-4z"
          stroke="var(--color-accent-start)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="var(--color-accent-start)"
          fillOpacity="0.15"
        />
      </svg>
    ),
    title: 'Industrial Power Electronics',
    description:
      'Buck/Boost converters, Solid State Relays, and next-gen GaN-based power modules.',
    status: 'In Development'
  },
];

export default function InnovationPipeline() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const orbY1 = useTransform(scrollYProgress, [0, 1], ['-10%', '20%']);
  const orbY2 = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);
  const orbY3 = useTransform(scrollYProgress, [0, 1], ['-5%', '10%']);

  return (
    <section
      id="innovation-pipeline"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background gradient orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-start)]/10 blur-3xl pointer-events-none"
        style={{ y: orbY1 }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
        style={{ y: orbY2 }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
        style={{ y: orbY3 }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <span className="uppercase tracking-widest text-sm text-[var(--color-accent-start)] font-semibold">
            COMING SOON
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-[var(--text)]">
            Beyond the Horizon: What&rsquo;s Next
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            We are actively expanding our ecosystem to bring advanced computing and RF technology to
            your workbench.
          </p>
        </motion.div>

        {/* Upcoming product cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {upcomingProducts.map((product) => (
            <motion.article
              key={product.id}
              id={product.id}
              variants={cardItem}
              className="glass-card p-6 border-l-2 border-l-[var(--color-accent-start)] flex flex-col"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--elevated)] border border-[var(--border)] mb-5">
                {product.icon}
              </div>

              <h3 className="text-lg font-bold mb-2 text-[var(--text)]">{product.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5 flex-1">
                {product.description}
              </p>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10 rounded-full px-3 py-1 w-fit">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <circle cx="4" cy="4" r="3" fill="var(--color-accent-start)" opacity="0.6" />
                  <circle cx="4" cy="4" r="1.5" fill="var(--color-accent-start)" />
                </svg>
                {product.status}
              </span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
