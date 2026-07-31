import { motion } from 'framer-motion';

const cards = [
  {
    id: 'make-in-india',
    title: 'Make in India',
    description:
      'Fully researched, tested, and manufactured locally to eliminate import delays and ensure quality. Every board ships from our facility with complete traceability.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* Location pin */}
        <path
          d="M16 2C10.48 2 6 6.48 6 12c0 7 10 18 10 18s10-11 10-18c0-5.52-4.48-10-10-10z"
          stroke="url(#pin-grad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small flag inside */}
        <rect x="14" y="10" width="7" height="5" rx="0.5" fill="url(#pin-grad)" opacity="0.9" />
        <line x1="14" y1="10" x2="14" y2="20" stroke="url(#pin-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="pin-grad" x1="6" y1="2" x2="26" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--color-accent-hover)" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'transparent-engineering',
    title: 'Transparent Engineering',
    description:
      'Free schematics, data sheets, and example code with every single product. No paywalls. No restrictions. Complete open-source commitment.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M10 8L4 16l6 8M22 8l6 8-6 8"
          stroke="url(#code-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="18"
          y1="6"
          x2="14"
          y2="26"
          stroke="url(#code-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="code-grad" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--color-accent-hover)" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'industrial-reliability',
    title: 'Industrial Reliability',
    description:
      'From 16-Cell BMS to high-speed FPGAs, our boards are tested for rigorous real-world applications. Designed for the lab and the factory floor.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 0.5L4 6.5V14.5C4 22.23 9.12 29.45 16 31.5C22.88 29.45 28 22.23 28 14.5V6.5L16 0.5Z"
          stroke="url(#shield-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 13.5L14.5 17L21 10.5"
          stroke="url(#shield-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient id="shield-grad" x1="4" y1="3" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--color-accent-hover)" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

export default function WhyDigicomp() {
  return (
    <section id="why-digicomp" className="section-padding relative overflow-hidden">
      <div className="section-container">
        {/* ── Section Header ── */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span
            id="why-digicomp-label"
            className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]"
          >
            Why Choose Us
          </span>
          <h2
            id="why-digicomp-title"
            className="mt-3 text-4xl font-bold tracking-tight text-[var(--text)]"
          >
            Built Different. Built Better.
          </h2>
          <p
            id="why-digicomp-subtitle"
            className="mt-4 text-[var(--text-secondary)]"
          >
            We combine domestic manufacturing precision with open-source
            transparency to deliver hardware that engineers can truly trust and
            build upon.
          </p>
        </motion.div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              id={`why-card-${card.id}`}
              className="glass-card relative overflow-hidden p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Orange accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-4 border-t-[3px] border-transparent hover:border-transparent [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--accent),var(--color-accent-hover))_border-box]" style={{ borderRadius: '18px 18px 1px 1px' }} />

              {/* Icon container */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--elevated)]">
                {card.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-[var(--text)]">
                {card.title}
              </h3>
              <p className="leading-relaxed text-[var(--text-secondary)]">
                {card.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
