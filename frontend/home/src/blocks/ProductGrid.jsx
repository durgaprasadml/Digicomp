import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

import { CartStore } from '../stores/CartStore';
import { PageStore } from '../stores/PageStore';


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
    transition: { duration: 0.3, ease: 'easeOut' },
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
  const imgRef = useRef( null );
  const { cartRef } = CartStore.use()
  const { currency } = PageStore.use()

  const animate = () => {
    const imgRect = imgRef.current.getBoundingClientRect();
    const cartRect = cartRef.current.getBoundingClientRect();
    const flyingImg = imgRef.current.cloneNode(true);

    Object.assign(flyingImg.style, {
      position: "fixed",
      left: `${imgRect.left}px`,
      top: `${imgRect.top}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
      zIndex: 9999,
      pointerEvents: "none",
      opacity: 0.8,
      transition: "transform 500ms ease-in-out, opacity 500ms",
      transform: "translate(0,0) scale(0.9)",
    });

    document.body.appendChild(flyingImg);

    requestAnimationFrame(() => {
      const dx = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
      const dy = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

      flyingImg.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
      flyingImg.style.opacity = "0.1";
    });

    flyingImg.addEventListener( 'transitionend', () => {
        flyingImg.remove();
      }, { once: true }
    );
  };

  const handleAddToCart = async () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
    animate();
    const d = await CartStore.addToCart( product.id )
    // console.log( d )
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-colors duration-300 hover:border-transparent hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box]"
    >
      <a href={`#product-link-${product.id}`} className="absolute rounded-2xl inset-0"></a>
      {/* Image area */}
      <div className="flex items-center justify-center px-4 pt-6 pb-2 h-52 bg-[var(--elevated)]/30">
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
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className="h-36 w-auto max-w-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-1">
          {product.excerpt}
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
          onClick={ handleAddToCart }
          className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${
            addedToCart
              ? 'bg-green-500/20 text-green-600 border border-green-500/30'
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
      <div className="absolute bottom-0 left-0 right-0 h-4 border-b-[3px] border-transparent hover:border-transparent group-hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box]" style={{ borderRadius: '1px 1px 18px 18px' }} />
    </motion.div>
  );
}

export default function ProductGrid( { products } ) {
  return (
    <div className="product-list">
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
    </div>
  );
}
