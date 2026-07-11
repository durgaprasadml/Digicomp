import { useState, useMemo } from 'react'
import { useLocation } from '@typeroute/router'
import { usePageData } from '../stores/PageStore'
import { home, shop } from '../routes'

import VirtualizedProductGrid from '../components/VirtualizedProductGrid'
import ShopFilters from '../components/ShopFilters'
import Breadcrumb from '../components/Breadcrumb'

export default function Shop() {
  const { path } = useLocation()
  const { products = [], filters = {}, priceMin = 0, priceMax = 99999, heading = 'Shop' } = usePageData(path) || {}

  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    tags: [],
    brands: [],
    attributes: {},
    acf: {},
    price: [priceMin, priceMax],
    inStockOnly: true
  })
  const [sortOrder, setSortOrder] = useState('newest') // newest, priceAsc, priceDesc, nameAsc
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const disabledFilters = { categories: [], tags: [], brands: [] }
  const breadcrumbItems = [
    { label: 'Home', route: home }
  ]

  if (path.startsWith('/product-category/')) {
    const termName = heading.replace('Category: ', '')
    disabledFilters.categories.push(termName)
    breadcrumbItems.push({ label: 'Shop', route: shop })
    breadcrumbItems.push({ label: termName })
  } else if (path.startsWith('/product-tag/')) {
    const termName = heading.replace('Tag: ', '')
    disabledFilters.tags.push(termName)
    breadcrumbItems.push({ label: 'Shop', route: shop })
    breadcrumbItems.push({ label: termName })
  } else if (path.startsWith('/brand/')) {
    const termName = heading.replace('Brand: ', '')
    disabledFilters.brands.push(termName)
    breadcrumbItems.push({ label: 'Shop', route: shop })
    breadcrumbItems.push({ label: termName })
  } else {
    breadcrumbItems.push({ label: 'Shop' })
  }

  // Memoized Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Stock
      if (activeFilters.inStockOnly && p.stock !== 'instock') return false

      // Price
      const price = parseFloat(p.price || 0)
      if (price < activeFilters.price[0] || price > activeFilters.price[1]) return false

      // Categories
      if (activeFilters.categories.length > 0 && !activeFilters.categories.some(c => p.categories?.includes(c))) return false

      // Brands
      if (activeFilters.brands.length > 0 && !activeFilters.brands.some(b => p.brands?.includes(b))) return false

      // Tags
      if (activeFilters.tags.length > 0 && !activeFilters.tags.some(t => p.tags?.includes(t))) return false

      // Attributes
      if (activeFilters.attributes) {
        for (const [attrName, selectedValues] of Object.entries(activeFilters.attributes)) {
          if (selectedValues.length > 0) {
            const productAttrValues = p.attributes?.[attrName] || []
            if (!selectedValues.some(v => productAttrValues.includes(v))) return false
          }
        }
      }

      // ACF Fields
      if (activeFilters.acf) {
        for (const [acfName, selectedValues] of Object.entries(activeFilters.acf)) {
          if (selectedValues.length > 0) {
            const productAcfValues = p.acf?.[acfName] || []
            if (!selectedValues.some(v => productAcfValues.includes(v))) return false
          }
        }
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'priceAsc') return parseFloat(a.price || 0) - parseFloat(b.price || 0)
      if (sortOrder === 'priceDesc') return parseFloat(b.price || 0) - parseFloat(a.price || 0)
      if (sortOrder === 'nameAsc') return a.name.localeCompare(b.name)
      // default: newest
      return (b.date || 0) - (a.date || 0)
    })

    return result
  }, [products, activeFilters, sortOrder])

  return (
    <div className="page-container relative max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

      {/* Top Bar */}
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex gap-2 items-baseline">
          <h1 className="text-2xl font-bold text-[var(--text)]">{heading}</h1>
          <p className="text-[var(--text-muted)] text-sm px-2 border border-[var(--border)] rounded">{filteredProducts.length} results</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text)] hover:border-[var(--color-accent-start)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filters
          </button>

          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--color-accent-start)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
          <ShopFilters
            filtersData={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            minPrice={priceMin}
            maxPrice={priceMax}
            disabledFilters={disabledFilters}
          />
        </aside>

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />

            {/* Drawer */}
            <div className="relative w-full max-w-xs h-full bg-[var(--bg)] border-r border-[var(--border)] shadow-2xl flex flex-col pointer-events-auto transform transition-transform animate-slide-in-right">
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-bold text-[var(--text)]">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text)]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <ShopFilters
                  filtersData={filters}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  minPrice={priceMin}
                  maxPrice={priceMax}
                  disabledFilters={disabledFilters}
                />
              </div>
              <div className="p-4 border-t border-[var(--border)]">
                <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full bg-[var(--color-accent-start)] text-[var(--bg)] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="flex-1 w-full min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">No products found</h3>
              <p className="text-[var(--text-muted)] max-w-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button
                onClick={() => setActiveFilters({ categories: [], tags: [], brands: [], attributes: {}, acf: {}, price: [priceMin, priceMax], inStockOnly: true })}
                className="mt-6 text-sm font-semibold text-[var(--color-accent-start)] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <VirtualizedProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  )
}
