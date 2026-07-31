import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const QuoteMark = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-[var(--accent)] opacity-20 mb-2"
    aria-hidden="true"
  >
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C7.44 7.593 6.5 9.36 6.333 10.98H10v6.34H4.583zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C17.44 7.593 16.5 9.36 16.333 10.98H20v6.34h-5.417z" />
  </svg>
);

function MissionVision() {
  return (
    <section
      id="mission-vision"
      className="section-padding relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, var(--bg), var(--surface))',
      }}
    >
      <div className="section-container">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Section Label */}
          <motion.span
            variants={item}
            className="inline-block uppercase tracking-widest text-sm text-[var(--accent)] font-semibold mb-4"
          >
            OUR PURPOSE
          </motion.span>

          {/* Section Title */}
          <motion.h2
            variants={item}
            className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-16"
          >
            Driven by Purpose
          </motion.h2>

          {/* Vision Block */}
          <motion.div variants={item} className="mb-12">
            <div className="text-left">
              <QuoteMark />
              <blockquote className="border-l-4 border-[var(--accent)] pl-6">
                <span className="font-semibold text-lg gradient-text block mb-3">
                  Vision
                </span>
                <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
                  Build a deeply integrated, self-reliant hardware ecosystem in
                  India by engineering world-class electronic products to
                  eliminate import dependency.
                </p>
              </blockquote>
            </div>
          </motion.div>

          {/* Mission Block */}
          <motion.div variants={item}>
            <div className="text-left">
              <QuoteMark />
              <blockquote className="border-l-4 border-[var(--accent)] pl-6">
                <span className="font-semibold text-lg gradient-text block mb-3">
                  Mission
                </span>
                <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
                  To empower engineers, researchers, and innovators with
                  accessible, rigorously tested hardware solutions. We commit to
                  radical transparency by providing open-source schematics,
                  unrestricted documentation, and production-ready code with
                  every product we manufacture.
                </p>
              </blockquote>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default MissionVision;
