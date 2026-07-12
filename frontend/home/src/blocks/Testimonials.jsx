import { motion } from 'framer-motion';
import Slider from '../components/Slider';

const testimonials = [
  {
    id: 1,
    quote:
      'The 16-Cell BMS exceeded our expectations. The documentation alone saved us weeks of development time. Finally, a local manufacturer who understands industrial needs.',
    author: 'Rajesh Kumar',
    role: 'Lead Engineer',
    company: 'EV Dynamics',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'We switched our entire prototyping lab to Digicomp boards. The open schematics and local support make all the difference when deadlines are tight.',
    author: 'Priya Sharma',
    role: 'CTO',
    company: 'IoT Solutions India',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'The Artix-7 FPGA board is incredible value. We\'re using it for real-time signal processing in our research lab, and the documentation is top-notch.',
    author: 'Dr. Anil Mehta',
    role: 'Professor',
    company: 'IIT Delhi',
    rating: 5,
  },
  {
    id: 4,
    quote:
      'Complete transparency in engineering — that\'s what sets Digicomp apart. Every schematic, every datasheet, freely available. This is how hardware should be.',
    author: 'Sneha Patel',
    role: 'Embedded Systems Architect',
    company: 'TechNova',
    rating: 5,
  },
];

const StarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="var(--color-accent-start)"
    aria-hidden="true"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const QuoteIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-[var(--color-accent-start)] opacity-20"
    aria-hidden="true"
  >
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C7.44 7.593 6.5 9.36 6.333 10.98H10v6.34H4.583zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378C17.44 7.593 16.5 9.36 16.333 10.98H20v6.34h-5.417z" />
  </svg>
);

function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-[var(--bg)] overflow-hidden">
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
            TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">
            Trusted by Engineers
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto">
          <Slider 
            autoPlayInterval={5000} 
            className="min-h-[320px] md:min-h-[280px]"
            slideClassName="px-2 md:px-4"
          >
            {testimonials.map((current) => (
              <div key={current.id} className="glass-card p-8 md:p-12 text-center h-full flex flex-col justify-center">
                {/* Decorative Quote */}
                <div className="flex justify-center mb-4">
                  <QuoteIcon />
                </div>

                {/* Quote Text */}
                <p className="text-lg md:text-xl italic text-[var(--text-secondary)] leading-relaxed mb-8">
                  &ldquo;{current.quote}&rdquo;
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4" aria-label={`${current.rating} out of 5 stars`}>
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>

                {/* Author */}
                <div>
                  <p className="font-semibold text-[var(--text)]">
                    {current.author}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {current.role}, {current.company}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
