import { useState, useEffect, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { CartStore } from '../stores/CartStore';
import { PageStore } from '../stores/PageStore';

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

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const imgRef = useRef( null );
  const { cartRef } = CartStore.use()
  const { currency } = PageStore.use()

  const animate = () => {
    if (!imgRef.current || !cartRef?.current) return;
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
    await CartStore.addToCart( product.id )
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box] shadow-sm hover:shadow-xl"
    >
      <a href={`#product-link-${product.id}`} className="absolute rounded-2xl inset-0 z-0"></a>
      
      {/* Image area */}
      <div className="relative flex items-center justify-center px-4 pt-6 pb-2 h-52 bg-[var(--elevated)]/30 z-10 pointer-events-none">
        {/* Tag */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ badgeColor( product.badge ) }`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          id={`wishlist-${product.id}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted) }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--bg)]/60 backdrop-blur-sm text-[var(--text-muted)] hover:text-[var(--color-accent-start)] transition-colors pointer-events-auto cursor-pointer"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Product image */}
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className="h-36 w-auto max-w-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5 z-10 pointer-events-none">
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-1">
          {product.subtitle}
        </p>

        {/* Price row */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--text)]">{ `${ currency }${ product.price || product.regPrice }` }</span>
          { product.regPrice && ( '' !== product.price ) && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              { `${ currency }${ product.regPrice }` }
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          id={`add-to-cart-${product.id}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
          className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 pointer-events-auto cursor-pointer ${
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
      <div className="absolute bottom-0 left-0 right-0 h-4 border-b-[3px] border-transparent hover:border-transparent group-hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box] pointer-events-none" style={{ borderRadius: '1px 1px 18px 18px' }} />
    </div>
  );
}

export default function VirtualizedProductGrid({ products }) {
  const listRef = useRef(null)
  
  // Responsive Columns
  const [cols, setCols] = useState(4)
  useEffect(() => {
    const calcCols = () => {
      if (window.innerWidth >= 1024) return 4
      if (window.innerWidth >= 640) return 2
      return 1
    }
    const onResize = () => setCols(calcCols())
    onResize() // Init
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Create Virtual Rows
  const rows = []
  for (let i = 0; i < products.length; i += cols) {
    rows.push(products.slice(i, i + cols))
  }

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 400, // Card height + gap
    overscan: 4,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    initialRect: { width: 1920, height: 1080 }
  })

  return (
    <div ref={listRef} style={{ width: '100%', position: 'relative' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowProducts = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.index}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '20px', // Matches the gap-5 visual spacing
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {rowProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
