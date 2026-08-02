import { AnimateIn } from '../../components';

import { usePageData } from '../../stores/PageStore';

const mcuChips = ['ESP32-S3', 'RP2040', 'CH32V003', 'STM32F030', 'TI MSPM0'];

const bmsSpecs = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 2h8v1h2v10H2V3h2V2zm1 1v1h6V3H5zm-2 3h10v6H3V6z" fill="currentColor" opacity="0.7" />
        <rect x="4" y="7" width="2" height="4" rx="0.5" fill="#4ade80" />
        <rect x="7" y="8" width="2" height="3" rx="0.5" fill="#facc15" />
        <rect x="10" y="9" width="2" height="2" rx="0.5" fill="var(--accent)" />
      </svg>
    ),
    label: '2S to 16S Scalable',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" opacity="0.7" />
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
    <AnimateIn
      id={id}
      className={`spotlight-card bg-surface border border-border rounded-2xl overflow-hidden relative hover:scale-[1.01] duration-300 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <div className="spotlight-effect" />
      {children}
    </AnimateIn>
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
      className="shrink-0"
    >
      {/* Battery outline */}
      <rect x="8" y="14" width="44" height="36" rx="4" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <rect x="52" y="24" width="6" height="16" rx="2" stroke="var(--accent)" strokeWidth="2" fill="none" />
      {/* Charge segments */}
      <rect x="13" y="19" width="8" height="26" rx="2" fill="#4ade80" opacity="0.9" />
      <rect x="23" y="19" width="8" height="26" rx="2" fill="#4ade80" opacity="0.7" />
      <rect x="33" y="19" width="8" height="26" rx="2" fill="#facc15" opacity="0.5" />
      <rect x="43" y="19" width="4" height="26" rx="2" fill="var(--accent)" opacity="0.3" />
    </svg>
  );
}

export default function ProductEcosystem() {
  const { ecosystem = {} } = usePageData('/');
  const { mcus = [], fpga = undefined } = ecosystem;
  return (
    <section id="product-ecosystem" className="py-28 relative">
      <div className="section-container">
        {/* Section Header */}
        <AnimateIn
          className="text-center mb-16"
        >
          <span className="uppercase tracking-widest text-sm gradient-text font-semibold">
            PRODUCT ECOSYSTEM
          </span>
          <h2 className="text-4xl font-bold mt-4 mb-4">
            Hardware That Powers Ideas
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            From rapid prototyping to production deployment — a complete ecosystem of development
            platforms.
          </p>
        </AnimateIn>

        {/* Bento Grid */}
        <AnimateIn
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
                  'linear-gradient(135deg, rgba(34,98,255,0.05) 0%, transparent 50%, rgba(38,98,255,0.03) 100%)',
              }}
            />

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Next-Gen Microcontrollers
              </h3>
              <p className="text-muted max-w-2xl mb-8 text-base leading-relaxed">
                Industry-leading development boards featuring ESP32-S3, RP2040, CH32V003, STM32F030,
                and TI MSPM0 — each with complete documentation and example code.
              </p>

              {/* Floating product images */}
              <div className="flex items-center justify-evenly gap-4 mb-8 py-4">
                {mcus.map((img, i) => (
                  <AnimateIn as="img"
                    key={img}
                    src={img}
                    alt={img.split('.')[0]}
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain drop-shadow-2xl"
                    style={{
                      marginLeft: i > 0 ? '-16px' : '0',
                      zIndex: mcus.length - i,
                    }}
                    />
                ))}
              </div>

              {/* Chip tags */}
              <div className="flex flex-wrap gap-2">
                {mcuChips.map((chip) => (
                  <span
                    key={chip}
                    className="bg-default border border-border rounded-full px-3 py-1 text-xs text-muted font-medium"
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
                  <h3 className="text-xl font-bold mb-2">
                    Advanced Battery Management
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    Scalable from 2S up to 16S BMS solutions. Industrial-grade protection with
                    precision monitoring.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mt-4">
                {bmsSpecs.map((spec) => (
                  <li
                    key={spec.label}
                    className="flex items-center gap-3 text-sm text-muted"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-default border border-border text-accent">
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
              <h3 className="text-xl font-bold mb-2">FPGA Platforms</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Xilinx Artix-7 based development board for complex digital logic, signal processing,
                and hardware acceleration.
              </p>

              <div className="flex justify-center mb-5">
                <AnimateIn as="img"
                  src={ fpga }
                  alt="FPGA Development Board"
                  className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl"
                  />
              </div>

              <span className="bg-default border border-border rounded-full px-3 py-1 text-xs text-muted font-medium">
                Xilinx Artix-7
              </span>
            </div>
          </BentoCard>
        </AnimateIn>
      </div>
    </section>
  );
}
