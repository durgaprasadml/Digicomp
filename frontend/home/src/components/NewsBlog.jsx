import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const articles = window.dcSSD?.posts || []

function CardImage({ article }) {
  if ( article.img ) {
    return (
      <div className="relative h-48 overflow-hidden bg-[var(--elevated)]">
        <img
          src={article.img}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--surface) 0%, transparent 60%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-48 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--color-accent-start), #9C27B0)',
      }}
    >
      {/* Circuit pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <line x1="20" y1="40" x2="180" y2="40" stroke="white" strokeWidth="1" />
        <line x1="20" y1="80" x2="120" y2="80" stroke="white" strokeWidth="1" />
        <line x1="60" y1="120" x2="180" y2="120" stroke="white" strokeWidth="1" />
        <line x1="40" y1="160" x2="160" y2="160" stroke="white" strokeWidth="1" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="1" />
        <line x1="60" y1="40" x2="60" y2="120" stroke="white" strokeWidth="1" />
        <line x1="140" y1="80" x2="140" y2="160" stroke="white" strokeWidth="1" />
        <circle cx="60" cy="40" r="4" fill="white" />
        <circle cx="100" cy="80" r="4" fill="white" />
        <circle cx="140" cy="120" r="4" fill="white" />
        <circle cx="60" cy="120" r="4" fill="white" />
        <circle cx="140" cy="160" r="4" fill="white" />
        <circle cx="100" cy="40" r="3" fill="white" />
        <circle cx="100" cy="160" r="3" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
    </div>
  );

  // Alternative
  return (
    <div
      className="relative h-48 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end), #FF8A65)',
      }}
    >
      {/* Abstract pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <rect x="30" y="30" width="40" height="40" rx="4" stroke="white" fill="none" strokeWidth="1.5" />
        <rect x="90" y="50" width="30" height="30" rx="4" stroke="white" fill="none" strokeWidth="1.5" />
        <rect x="130" y="90" width="50" height="50" rx="4" stroke="white" fill="none" strokeWidth="1.5" />
        <rect x="40" y="100" width="35" height="35" rx="4" stroke="white" fill="none" strokeWidth="1.5" />
        <line x1="70" y1="50" x2="90" y2="65" stroke="white" strokeWidth="1" />
        <line x1="120" y1="65" x2="130" y2="105" stroke="white" strokeWidth="1" />
        <line x1="75" y1="115" x2="130" y2="115" stroke="white" strokeWidth="1" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <polyline points="2 10 12 16 22 10" />
          <line x1="7" y1="2" x2="7" y2="7" />
          <line x1="12" y1="2" x2="12" y2="7" />
          <line x1="17" y1="2" x2="17" y2="7" />
        </svg>
      </div>
    </div>
  );
}

function NewsBlog() {
  return (
    <section id="news-blog" className="section-padding bg-[var(--bg)]">
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block uppercase tracking-widest text-sm text-[var(--color-accent-start)] font-semibold mb-4">
            INSIGHTS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            From the Engineering Desk
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Deep dives, tutorials, and updates from our hardware team.
          </p>
        </motion.div>

        {/* Article Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {articles.map((article) => (
            <motion.article
              key={article.id}
              id={article.id}
              variants={item}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card overflow-hidden rounded-2xl cursor-pointer group flex flex-col"
            >
              {/* Card Image */}
              <CardImage article={article} />

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Tags */}
                <div className="flex gap-4">
                { article.tags.map( (tag) => (
                  <span
                    key={ tag }
                    className={`inline-block self-start text-xs font-semibold px-3 py-1 rounded-full mb-3 bg-blue-500/15 text-blue-400`}
                  >
                    {tag}
                  </span>
                ) ) }
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[var(--text)] mb-3 group-hover:text-[var(--color-accent-start)] transition-colors duration-300">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 flex-1">
                  {article.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon />
                      {article.readTime}
                    </span>
                  </div>
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--color-accent-start)] transition-colors duration-300">
                    <ArrowIcon />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default NewsBlog;
