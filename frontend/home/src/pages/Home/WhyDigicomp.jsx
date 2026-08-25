import { useState } from 'react';
import { AnimateIn } from '../../components';
import ParticleShape from './ParticleShape';

const India = () => <svg preserveAspectRatio="xMidYMid meet" className="max-h-full ml-4" fill="none" viewBox="0 0 371 400"><path fill="url(#radialSuffron)" d="M367 119q0-1 0 0zl-1-1v-2l-1-1-1-1-1 1h-2l-1-1h-4l-1 1-1-1 1-1 2-2v-3l-1-1-1-1-3 1v1-2l1-1q0-3-3-4l-6 3-1 2-1 1h-3q-3 0-6-2v-1l-3 2q-4 2-5 6-3 3-7 2l-2 1h-1v3l-2 3-1 1h-2v3h-1q-2 2-5 2h-1l-1 1h-4l-1 3 2 2h4v3l-1 1 2 2v1q-4 2-8 1h-1l-1 1h-10l-2-1q-2 3-5 3-4-2-8-1-4-1-5-5h-1l-1-1 1-2v-1q1-5-1-8l-4 1-3 1h-1v3q-3 4-1 7v3l2 4-1 2v2h-5l-1 1h-6v-1l-1-1v-1l-3 1-1 1q-5-2-11-1l-1-3-2-1-2 1-2 1-3-2-2-1-2-1h-1v-4h-2l-5-2h-1l-3 1-5-1h-1v2h-1v-1h-1l-3-1h-2v-3h-5l-2-1-2-1h-1q-1 1-3-1h-1q-5-2-5-6h-3l-1-2-4-2h-1v1l-2-1-3-2v-1l1-3h1v-3l1-2 1-2v-1h1v-1h1l2-2 1-1 1-3q-2-4-8-5v-2l-2-2-2-1h-4l-4-5-1-1v-1l-3 2h-1v-3l1-1-1-2v-4l-1-1v-1h-1l-1-3v-1l-1-1 2-2h2v2l1 1h1l2 1h1v-1l1-1 1-1 1 1h1l1-1v-1h1v-2l-1-2-1-1v-1l1-2-1-1-1-1h-2l-2-1v-2l1-1-1-3v-2l1-1 2 1h2v-1l1-2h1v-3l2-1q0-2 3-3l1-2 3-9-2-2-1-2h-1l-1-1h-2q-3 0-4-3l-2-1-6 3-5 3h-1l-1 1h-2l-1 1-5 1 1-2q-1-3-4-2l-2-1-2-1 1-1v-1l-2-2-2-1q0-2-3-2l-1-1-2-1q-2-1-2-3l-2-2-2-3V0l-3 1-2 1h-1l-2-2h-2v1l-4 1h-7l1 1 1 1h-2l-5-1h-2v3l-1 1h-2q0 3-2 2l-1 1h-1v4l-1 1 1 1 2 1 1-1h3q2 5 7 6v3l4 2-1 2q0 3-3 2l-1 3h-3v2h-1v2q3 2 2 6v11l1 1 2 1 2 1 4 2 3 4h1l3 1 4 2-1 1-1 1-9 4-1 1 1 2v5l-1 1 1 1h1l-3 2-4 4q-3 3-3 5v3h-6v1l-1 2v2l-3 3-3 4v1l-3 1-3 2q-2 2-2 3l-1 2h-1l-1 1-1 1-1 2-1 2-6 1-6 1q-2 0-2-3h-1l-1-1h-2l-5 5-1 1-5 4v1l-1 2v4q3 2 8 3l-1 6v2l1 2 1 1 2 1h1l1 1v3q3 1 2 3l1 5 1 2-1 1 1 2-1 1h-2l-2 1-1-1v-2h-2l-3 1-3 2h-3q-2-2-5-2l-3-1H9v1l-1 2v1H6l-3 1H2l-1 1-1 1v3h2l1-2h1v1l-1 1q0 4 5 9l4 2v1h2l4 1 2-1h2l3-1h1l-1 3-1 1h-1l-2 1-2 1-2 1h-5v-2H9l-1 1v2l4 5 1 1 1 1 3 4q5 8 12 11 5 2 10-1h1l1-1 3-1 4-1 1-3 2-2-1-4h-2q1-2 3-2v-1h1l-1-2v-1h1l3 1v-1l1 1-2 1v7h3q-3 1-2 6l4 4 1 1-1 2-1 1-1 1-1 1v4h-1v8l1 4v3l1 1v2l-2 2v1l1 1v1l-1 1 2 6v4q3 5 2 11l1 7v3l2 4 1 1 1 1q-1 3 1 5l2 2v3l1 1 1 2 2 2h1v3l1 3v1l1 2 1 3v7l1 2 1 3 1 3v1q2 6 6 11l1 3 1 1 8 20 1 6q-1 5 2 8l2 4 1 2 4 5 2 2q2 3 5 3h1l2-1 6-3 1-4v-1l1-2 2-2 7-2 1-1h2v-1l-1-2v-3l4-4v-3l2-1h7v-10l-1-9 1-5 4-6 1-1q2-4 1-8l1-1v-6l-1-1 1-3h-1v-5l-1-5q-2-6 2-12v-2h1l2-2h4v1l1 1h1l4-5 1-3 1-1h2l5-1 6-3 1-2-1-2v-2l2-1 2-1q2-2 5-3l4-2 2-3 3-4 3-1 4-3 2-2 7-9 2-2 4-3h1v-2l-1-1v-1l1-1h2v2h4l3-1 4-2 1-2 1-1h1l1-1 1-2 2-3 1-1q0-2-1-4-1-3 1-6h1l2-1 3-1 2-1q3 0 5-3l1-1q1-2-2-4h1l1 1v1l1 6h4q3-3 2-5v-1l1 3v3h5v-9l-1-1-1-3v-4l-1-2v-1l1-2h-2l-1-1v-3q-2 0-2-4h1v-1h1l-1-2v-4h-3l-2-1q-4-3-2-6h2l2-3v-1h6v-2l-1-1-1-1v-1h-3l-2-2-2-1-2-1q-1-3 1-5l3-2-2-3v-1h1q1 3 4 3l1 1v1h1v-2h2l1 1 2 4h4q0-3 2-3l1 1 3 4-1 4-1 4 3 1 2 1h6l5-1h15l1 1 1 1 1 1h-2l-1 1-1 5-1 1-2 2-2 1-1 1h-1q-1 0-3 2h-1v7l1 3 1 1v1h2v1l1 1h1l2-2v-4l2-1v-3h2l1-1v1l1 2 1 4q0 3 2 5v1l1 5 1 3v1h1q2-1 3 1h2v-1l2-2q1-3-1-5v-6h3v-13h2l2-1v1h5l2-5q1-4 3-7v-1h1v-2l-1-2-1-2v-1l1-2 4-3v-1l1-2 1-3v-2l-1-1v-4q3-1 5-3l2-2 2-2 3-3h1l3-1q3-1 6 2h2v-1l-3-4q0-3 2-5l2-1zM56 229l-1-2h1zm124 53z" /><defs><radialGradient id="radialSuffron" cx="0" cy="0" r="1" gradientTransform="rotate(77 -60 192)scale(197.6 183)" gradientUnits="userSpaceOnUse"><stop stopColor="#fa882a" stopOpacity=".3" /><stop offset="1" stopColor="#fa882a" /></radialGradient></defs></svg>

const Mag = () => <svg preserveAspectRatio="xMidYMid meet" className="max-h-full" fill="none" viewBox="0 0 397 407"><g transform="translate(39.7 40.7) scale(0.8)"><path fill="url(#radialBlue)" stroke="#0072dc" strokeWidth="8" d="M162 4a158 158 0 1 1 0 317 158 158 0 0 1 0-317Z"/><circle cx="147.9" cy="85.2" r="50.6" fill="#fff"/><path stroke="#0072dc" strokeLinecap="round" strokeWidth="16" d="M6-6h163" transform="rotate(225 281 118)"/><defs><radialGradient id="radialBlue" cx="162" cy="162" r="162" gradientUnits="userSpaceOnUse"><stop stopColor="#d1edff" stopOpacity=".1"/><stop offset="1" stopColor="#d1edff"/></radialGradient></defs></g></svg>

const Shield = () => <svg preserveAspectRatio="xMidYMid meet" className="max-h-full ml-2" fill="none" viewBox="0 0 320 400"><path fill="url(#gradGreen)" d="M320 220c-12 102-70 150-153 179h-14C70 370 15 322 0 220V80a20 20 0 0 1 20-20c40 0 90-24 125-54a23 23 0 0 1 30 0c35 30 85 54 125 54a20 20 0 0 1 20 20z" /><path fill="url(#gradHalf)" d="M167 399c83-29 141-77 153-179V80a20 20 0 0 0-20-20c-40 0-90-24-125-54q-6-6-15-6v400z" /><defs><linearGradient id="gradGreen" x1="319.9" x2="0" y1="200" y2="200" gradientUnits="userSpaceOnUse"><stop stop-color="#0bbf44" stop-opacity=".1" /><stop offset="1" stop-color="#0bbf44" /></linearGradient><linearGradient id="gradHalf" x1="394.8" x2="-175.4" y1="271.3" y2="85" gradientUnits="userSpaceOnUse"><stop stop-color="#0bbf44" stop-opacity=".4" /><stop offset="1" stop-color="#0bbf44" /></linearGradient></defs></svg>

const cards = [
  {
    id: 'make-in-india',
    title: 'Make in India',
    shape: 'india',
    bg: India,
    description:
      'Fully researched, tested, and manufactured locally to eliminate import delays and ensure quality. Every board ships from our facility with complete traceability.',
    classes: 'group-hover:translate-x-5 group-hover:-translate-y-6',
    hoverColor: '#fa882a',
  },
  {
    id: 'transparent-engineering',
    title: 'Transparent Engineering',
    shape: 'magnifier',
    bg: Mag,
    description:
      'Free schematics, data sheets, and example code with every single product. No paywalls. No restrictions. Complete open-source commitment.',
    classes: 'group-hover:translate-x-2 group-hover:-translate-y-4',
  },
  {
    id: 'industrial-reliability',
    title: 'Industrial Reliability',
    shape: 'shield',
    bg: Shield,
    description:
      'From 16-Cell BMS to high-speed FPGAs, our boards are tested for rigorous real-world applications. Designed for the lab and the factory floor.',
    classes: 'group-hover:translate-x-2 group-hover:-translate-y-6',
    hoverColor: '#0bbf44',
  },
];

function CardItem({ card, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimateIn as="article" delay={index * 150.0}
      id={`why-card-${card.id}`}
      className="relative overflow-visible group flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Particle Canvas Container */}
      <div className="w-full h-80 pointer-events-none flex items-center justify-center ease-[cubic-bezier(0.25,1,0.5,1)] translate-y-8">
        <div className="absolute top-18 left-1/2 -translate-x-1/2 w-32 h-32 flex justify-center transition-all duration-700 scale-50 group-hover:opacity-10 group-hover:scale-135">
          <card.bg />
        </div>
        <ParticleShape shape={card.shape} isHovered={isHovered} className={ `transition-transform ${ card.classes }` } hoverColor={ card?.hoverColor } />
      </div>

      {/* Text Content */}
      <div className="transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] text-center flex flex-col items-center justify-center pointer-events-none">
        <h3 className="mb-3 text-xl md:text-2xl font-bold transition-colors duration-700">
          {card.title}
        </h3>
        <p className="leading-relaxed text-muted text-sm">
          {card.description}
        </p>
      </div>
    </AnimateIn>
  );
}

export default function WhyDigicomp() {
  return (
    <section id="why-digicomp" className="py-28 relative overflow-hidden">
      <div className="section-container">
        {/* ── Section Header ── */}
        <AnimateIn
          className="mx-auto mb-16 max-w-2xl text-center"
          >
          <span
            id="why-digicomp-label"
            className="text-sm font-semibold uppercase tracking-widest text-accent"
          >
            Why Choose Us
          </span>
          <h2
            id="why-digicomp-title"
            className="mt-3 text-4xl font-bold tracking-tight"
          >
            Built Different. Built Better.
          </h2>
          <p
            id="why-digicomp-subtitle"
            className="mt-4 text-muted"
          >
            We combine domestic manufacturing precision with open-source
            transparency to deliver hardware that engineers can truly trust and
            build upon.
          </p>
        </AnimateIn>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {cards.map((card, index) => (
            <CardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
