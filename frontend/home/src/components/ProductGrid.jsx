import { motion } from 'framer-motion';
import { useState } from 'react';

const products = window.dcSSD?.featured || []
const currency = window.dcSSD?.currency || []

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function badgeColor( badge ) {
  let color = 'bg-orange-500/20 text-orange-500'
  if ( badge == 'Pro' ) {
    color = 'bg-purple-500/20 text-purple-500'
  } else if ( badge == 'Value' ) {
    color = 'bg-yellow-500/20 text-yellow-500'
  } else if ( badge == 'Popular' ) {
    color = 'bg-blue-500/20 text-blue-500'
  } else if ( badge == 'Bestseller' ) {
    color = 'bg-green-500/20 text-green-600'
  }
  return color
}

/* ---------- Icons ---------- */
function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'var(--color-accent-start)' : 'none'} stroke={filled ? 'var(--color-accent-start)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="12" y1="10" x2="12" y2="18" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

function ProductCard({ product, index }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-colors duration-300 hover:border-[var(--color-accent-start)]/40"
    >
      {/* Image area */}
      <div className="relative flex items-center justify-center px-4 pt-6 pb-2 h-52 bg-[var(--elevated)]/30">
        {/* Tag */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ badgeColor( product.badge ) }`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          id={`wishlist-${product.id}`}
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--bg)]/60 backdrop-blur-sm text-[var(--text-muted)] hover:text-[var(--color-accent-start)] transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Product image */}
        <motion.img
          src={product.image}
          alt={product.name}
          className="h-36 w-auto max-w-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-1">
          {product.subtitle}
        </p>

        {/* Price row */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--text)]">{ `${ currency }${ product.price }` }</span>
          { product.regPrice && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              { `${ currency }${ product.regPrice }` }
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          id={`add-to-cart-${product.id}`}
          onClick={handleAddToCart}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
            addedToCart
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-[var(--elevated)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--color-accent-start)] hover:text-[var(--text)] hover:bg-[var(--color-accent-glow)]'
          }`}
        >
          {addedToCart ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </>
          ) : (
            <>
              <CartPlusIcon />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Subtle bottom accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}

export default function ProductGrid() {
  return (
    <section id="products" className="section-padding relative">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="uppercase tracking-widest text-sm gradient-text font-semibold">
            OUR PRODUCTS
          </span>
          <h2 className="mt-4 text-4xl font-bold text-[var(--text)]">
            Shop Development Boards
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Production-ready boards with open-source documentation, tested for industrial reliability. Every purchase includes free schematics and example code.
          </p>
        </motion.div>

        {/* Product grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            id="view-all-products"
            href="/shop"
            className="btn-secondary inline-flex items-center gap-2"
          >
            View Full Catalog
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
