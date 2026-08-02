import { AnimateIn } from '../../components';

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
    className="text-accent opacity-20 mb-2"
    aria-hidden="true"
  >
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C7.44 7.593 6.5 9.36 6.333 10.98H10v6.34H4.583zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C17.44 7.593 16.5 9.36 16.333 10.98H20v6.34h-5.417z" />
  </svg>
);

function MissionVision() {
  return (
    <section
      id="mission-vision"
      className="py-28 relative overflow-hidden bg-surface"
    >
      <div className="section-container">
        <AnimateIn
          className="max-w-4xl mx-auto text-center"
          >
          {/* Section Label */}
          <AnimateIn as="span"
            className="inline-block uppercase tracking-widest text-sm text-accent font-semibold mb-4"
          >
            OUR PURPOSE
          </AnimateIn>

          {/* Section Title */}
          <AnimateIn as="h2"
            className="text-4xl md:text-5xl font-bold mb-16"
          >
            Driven by Purpose
          </AnimateIn>

          {/* Vision Block */}
          <AnimateIn className="mb-12">
            <div className="text-left">
              <QuoteMark />
              <blockquote className="border-l-4 border-accent pl-6">
                <span className="font-semibold text-lg gradient-text block mb-3">
                  Vision
                </span>
                <p className="text-lg md:text-xl text-muted leading-relaxed">
                  Build a deeply integrated, self-reliant hardware ecosystem in
                  India by engineering world-class electronic products to
                  eliminate import dependency.
                </p>
              </blockquote>
            </div>
          </AnimateIn>

          {/* Mission Block */}
          <AnimateIn >
            <div className="text-left">
              <QuoteMark />
              <blockquote className="border-l-4 border-accent pl-6">
                <span className="font-semibold text-lg gradient-text block mb-3">
                  Mission
                </span>
                <p className="text-lg md:text-xl text-muted leading-relaxed">
                  To empower engineers, researchers, and innovators with
                  accessible, rigorously tested hardware solutions. We commit to
                  radical transparency by providing open-source schematics,
                  unrestricted documentation, and production-ready code with
                  every product we manufacture.
                </p>
              </blockquote>
            </div>
          </AnimateIn>
        </AnimateIn>
      </div>
    </section>
  );
}

export default MissionVision;
