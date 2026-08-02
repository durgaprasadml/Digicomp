import { AnimateIn } from '../../components';
import { useState, useRef } from 'react';
import { Link } from '@typeroute/router';

import { shop } from '../../routes';
import { CartStore } from '../../stores/CartStore';
import { usePageData } from '../../stores/PageStore';
import ProductGrid from '../../blocks/ProductGrid';

export default function FeaturedProducts() {
  const { featured: products = [] } = usePageData('/')
  return (
    <section id="products" className="py-28 relative">
      <div className="section-container">
        {/* Section header */}
        <AnimateIn
          className="mb-14 text-center"
        >
          <span className="uppercase tracking-widest text-sm gradient-text font-semibold">
            OUR PRODUCTS
          </span>
          <h2 className="mt-4 text-4xl font-bold">
            Shop Development Boards
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Production-ready boards with open-source documentation, tested for industrial reliability. Every purchase includes free schematics and example code.
          </p>
        </AnimateIn>

        {/* Product grid */}
        <ProductGrid products={ products } />

        {/* View all link */}
        <AnimateIn delay={300.0}
          className="mt-12 text-center"
        >
          <Link
            id="view-all-products"
            to={ shop }
            preload="intent"
            className="button button--primary button--xl"
          >
            View Full Catalog
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </AnimateIn>
      </div>
    </section>
  );
}
