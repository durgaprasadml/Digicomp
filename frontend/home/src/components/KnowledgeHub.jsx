import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const checkItems = [
  'Complete schematics for every product',
  'Production-ready firmware examples',
  'Step-by-step video tutorials',
  'Active GitHub repositories',
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0 mt-0.5"
    >
      <circle cx="10" cy="10" r="10" fill="var(--color-accent-start)" opacity="0.15" />
      <path
        d="M6.5 10.5L9 13l5-6"
        stroke="var(--color-accent-start)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeEditorMockup() {
  return (
    <div className="code-editor shadow-2xl">
      <div className="code-editor-header">
        <div className="code-editor-dot" style={{ background: '#FF5F57' }} />
        <div className="code-editor-dot" style={{ background: '#FEBC2E' }} />
        <div className="code-editor-dot" style={{ background: '#28C840' }} />
        <span className="ml-3 text-xs text-[var(--text-muted)] font-mono">bms_config.c</span>
      </div>
      <div className="code-editor-body">
        <pre className="text-sm leading-relaxed">
          <code>
            <span className="text-purple-400">#include</span>{' '}
            <span className="text-green-400">&quot;digicomp_bms.h&quot;</span>
            {'\n\n'}
            <span className="text-purple-400">void</span>{' '}
            <span className="text-blue-400">bms_init</span>
            {'('}
            <span className="text-purple-400">bms_config_t</span>
            {' *cfg) {\n'}
            {'    cfg->cell_count = '}
            <span className="text-orange-400">16</span>
            {';\n'}
            {'    cfg->ovp_threshold = '}
            <span className="text-orange-400">4.25f</span>
            {';\n'}
            {'    cfg->uvp_threshold = '}
            <span className="text-orange-400">2.80f</span>
            {';\n'}
            {'    cfg->balance_enable = '}
            <span className="text-purple-400">true</span>
            {';\n\n'}
            {'    '}
            <span className="text-blue-400">dc_bms_configure</span>
            {'(cfg);\n'}
            {'    '}
            <span className="text-blue-400">dc_bms_start_monitoring</span>
            {'();\n'}
            {'}'}
          </code>
        </pre>
      </div>
    </div>
  );
}

function SchematicMockup() {
  return (
    <div className="bg-[var(--elevated)] border border-[var(--border)] rounded-xl overflow-hidden opacity-80">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--text-muted)" strokeWidth="1" fill="none" />
          <line x1="4" y1="5" x2="10" y2="5" stroke="var(--text-muted)" strokeWidth="0.75" />
          <line x1="4" y1="7" x2="8" y2="7" stroke="var(--text-muted)" strokeWidth="0.75" />
          <line x1="4" y1="9" x2="10" y2="9" stroke="var(--text-muted)" strokeWidth="0.75" />
        </svg>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          ESP32-S3_Schematic_v2.1.pdf
        </span>
      </div>

      {/* Schematic body */}
      <div className="p-4 h-32 relative">
        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {/* Vertical grid */}
          {[...Array(12)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i + 1) * 8}%`}
              y1="0"
              x2={`${(i + 1) * 8}%`}
              y2="100%"
              stroke="var(--border)"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}
          {/* Horizontal grid */}
          {[...Array(5)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${(i + 1) * 18}%`}
              x2="100%"
              y2={`${(i + 1) * 18}%`}
              stroke="var(--border)"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}

          {/* Schematic-like elements */}
          {/* IC / chip block */}
          <rect x="15%" y="20%" width="18%" height="55%" rx="2" stroke="var(--text-muted)" strokeWidth="1" fill="none" opacity="0.5" />
          <text x="24%" y="52%" textAnchor="middle" fill="var(--text-muted)" fontSize="7" opacity="0.6">
            U1
          </text>
          {/* Pins from IC */}
          <line x1="15%" y1="35%" x2="8%" y2="35%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="15%" y1="55%" x2="8%" y2="55%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="33%" y1="35%" x2="42%" y2="35%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="33%" y1="55%" x2="42%" y2="55%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />

          {/* Capacitor symbol */}
          <line x1="50%" y1="25%" x2="50%" y2="40%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="46%" y1="40%" x2="54%" y2="40%" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
          <line x1="46%" y1="45%" x2="54%" y2="45%" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
          <line x1="50%" y1="45%" x2="50%" y2="60%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <text x="56%" y="44%" fill="var(--text-muted)" fontSize="6" opacity="0.5">
            C1
          </text>

          {/* Resistor symbol */}
          <line x1="70%" y1="25%" x2="70%" y2="32%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <rect x="67%" y="32%" width="6%" height="20%" stroke="var(--text-muted)" strokeWidth="0.75" fill="none" opacity="0.5" />
          <line x1="70%" y1="52%" x2="70%" y2="60%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <text x="76%" y="44%" fill="var(--text-muted)" fontSize="6" opacity="0.5">
            R1
          </text>

          {/* Connecting traces */}
          <line x1="42%" y1="35%" x2="50%" y2="25%" stroke="var(--color-accent-start)" strokeWidth="0.75" opacity="0.3" />
          <line x1="50%" y1="60%" x2="70%" y2="60%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.4" />

          {/* Ground symbol */}
          <line x1="85%" y1="55%" x2="85%" y2="65%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="82%" y1="65%" x2="88%" y2="65%" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
          <line x1="83.5%" y1="69%" x2="86.5%" y2="69%" stroke="var(--text-muted)" strokeWidth="0.75" opacity="0.5" />
          <line x1="84.5%" y1="73%" x2="85.5%" y2="73%" stroke="var(--text-muted)" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export default function KnowledgeHub() {
  return (
    <section id="knowledge-hub" className="section-padding">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column: text */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="flex-1 lg:max-w-lg"
          >
            <motion.span
              variants={item}
              className="uppercase tracking-widest text-sm text-[var(--color-accent-start)] font-semibold"
            >
              OPEN SOURCE
            </motion.span>

            <motion.h2
              variants={item}
              className="text-4xl font-bold mt-4 mb-5 text-[var(--text)]"
            >
              Hardware is only half the product.
            </motion.h2>

            <motion.p
              variants={item}
              className="text-[var(--text-secondary)] text-base leading-relaxed mb-8"
            >
              We don&rsquo;t just ship PCBs; we ship solutions. Dive into our comprehensive library
              of tutorials, open schematics, and production-ready C/C++ and TypeScript examples.
            </motion.p>

            <motion.ul variants={item} className="space-y-4 mb-8">
              {checkItems.map((text) => (
                <li key={text} className="flex items-start gap-3 text-[var(--text)] text-sm">
                  <CheckIcon />
                  {text}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={item}>
              <a id="browse-docs-cta" href="#docs" className="btn-primary">
                Browse the Documentation
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10m0 0L9 4m4 4L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </motion.div>
          </motion.div>

          {/* Right column: layered mockup */}
          <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
            {/* Schematic card — behind, offset */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative z-0 translate-x-4 translate-y-4 lg:translate-x-6 lg:translate-y-6"
            >
              <SchematicMockup />
            </motion.div>

            {/* Code editor — on top, overlapping */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="relative z-10 -mt-28 lg:-mt-36"
            >
              <CodeEditorMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
