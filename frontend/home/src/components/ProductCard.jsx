import { useState, useRef } from 'react';
import { Card, toast } from "@heroui/react";
import { Link } from '@typeroute/router';

import { CartStore } from '../stores/CartStore';
import { PageStore } from '../stores/PageStore';
import { UserStore } from '../stores/UserStore';
import { WishlistStore } from '../stores/WishlistStore';
import { animateFlyToTarget } from '../utils/animate'
import { AddToCart, CustomButton } from '.'
import { product as productRoute } from '../routes'

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'var(--danger)' : 'none'} stroke={filled ? 'var(--danger)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function ProductCard({ product }) {
  const imgRef = useRef( null );
  const { cartRef } = CartStore.use()
  const { currency = '₹' } = PageStore.use() || {}
  const { user } = UserStore.use()
  const { wishlists, wishlistRef } = WishlistStore.use()

  const containingLists = (wishlists || []).filter(wl => wl.items && wl.items.includes(product.id));
  const isWishlisted = containingLists.length > 0;

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user?.is_logged_in) {
      toast.danger('Please login to use wishlists');
      return;
    }
    if (isWishlisted) {
      for (const wl of containingLists) {
        await WishlistStore.removeFromWishlist(wl.id, product.id);
      }
      toast.success('Removed from wishlist');
    } else {
      let targetList = wishlists?.[0];
      if (!targetList) {
        const res = await WishlistStore.createList('My Wishlist');
        if (res && res.success) {
          targetList = { id: res.id, name: 'My Wishlist', items: [] };
        }
      }
      if (targetList) {
        animateFlyToTarget(imgRef, wishlistRef);
        await WishlistStore.addToWishlist(targetList.id, product.id);
        toast.success(`Added to ${targetList.name}`);
      }
    }
  }

  const handleAddToCart = async () => {
    await CartStore.addToCart( product.id )
  };

  return (
    <Card
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden transition-all duration-200 hover:shadow-sm p-0"
    >
      <Link to={ productRoute } params={{ slug: product.slug || product.id }} preload="intent" className="absolute rounded-2xl inset-0 z-0" />

      {/* Image area */}
      <div className="relative flex items-center justify-center h-44 bg-[var(--elevated)]/30 z-10 pointer-events-none">
        {/* Tag */}
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ badgeColor( product.badge ) }`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          id={`wishlist-${product.id}`}
          onClick={handleWishlist}
          className="absolute top-2 right-3 p-1.5 rounded-full bg-[var(--bg)]/60 backdrop-blur-sm text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors pointer-events-auto cursor-pointer"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {/* Product image */}
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className="h-36 w-auto max-w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col px-5 pt-2 pb-5 z-10 pointer-events-none">
        <h3 className="text-sm mb-0 line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-1">
          {product.excerpt}
        </p>

        <div className="mt-auto pt-3">
          {/* Price row */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text)]">{ `${ currency }${ product.price || product.regPrice }` }</span>
            { product.regPrice && ( '' !== product.price ) && (
              <span className="text-xs text-[var(--text-muted)] line-through">
                { `${ currency }${ product.regPrice }` }
              </span>
            )}
          </div>

          {/* Add to cart */}
          <AddToCart
            variant='outline'
            handleAdd={handleAddToCart}
            inStock={product.stock === 'instock'}
            imgRef={imgRef}
            className='flex-1'
          />
        </div>
      </div>
    </Card>
  );
}
