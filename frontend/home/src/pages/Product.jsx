import { useState } from 'react'
import { useLocation } from '@typeroute/router'
import { usePageData } from '../stores/PageStore'
import { CartStore } from '../stores/CartStore'
import { home, shop } from '../routes'

import Breadcrumb from '../blocks/Breadcrumb'
import Slider from '../components/Slider'
import QuantityInput from '../components/QuantityInput'
import ProductCard from '../components/ProductCard'

// Helper icons
function HeartIcon({ filled }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function Product() {
  const { path } = useLocation()
  const product = usePageData(path) || {}

  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  if (!product.id) return <div className="p-8 text-center text-[var(--text-muted)] min-h-[50vh] flex items-center justify-center">Loading product data...</div>

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Home', route: home },
    { label: 'Shop', route: shop }
  ]
  if (product.categories && product.categories.length > 0) {
    breadcrumbItems.push({ label: product.categories[0] }) // We could make this a link in the future
  }
  breadcrumbItems.push({ label: product.name })

  const handleAddToCart = async () => {
    await CartStore.addToCart(product.id, qty)
  }

  return (
    <div className="page-container relative max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 flex flex-col gap-12">
      {/* R1: Breadcrumb */}
      <div>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* R2: Product Top (Slider + Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* R2 C1: Image Slider */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] h-[400px] md:h-[600px] flex items-center justify-center">
          {product.gallery && product.gallery.length > 0 ? (
            <Slider className="w-full h-full" showDots={true}>
              {product.gallery.map(img => (
                <div key={img.id} className="w-full h-full flex items-center justify-center p-8 md:p-12">
                  <img src={img.url} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              No Image Available
            </div>
          )}
        </div>

        {/* R2 C2: Product Info */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div>
            {product.badge && (
              <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-500">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mb-3 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10 px-2 py-1 rounded-md">
                <span className="font-bold mr-1">{product.averageRating || '0.0'}</span>
                ★
              </div>
              <a href="#reviews" className="text-[var(--text-muted)] hover:text-[var(--color-accent-start)] transition-colors">
                {product.reviewCount || 0} customer reviews
              </a>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-black text-[var(--text)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)]">
              ₹{product.price || product.regPrice}
            </span>
            {product.regPrice && product.price !== product.regPrice && (
              <span className="text-xl text-[var(--text-muted)] line-through decoration-[var(--border)] decoration-2">₹{product.regPrice}</span>
            )}
          </div>

          <div className="text-[var(--text-secondary)] text-lg leading-relaxed prose prose-invert" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />

          <div className="flex items-center gap-2 text-sm font-semibold p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-fit">
            <div className={`w-2 h-2 rounded-full ${product.stockStatus === 'instock' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
            {product.stockStatus === 'instock' ? (
              <span className="text-[var(--text)]">{product.stockQuantity ? `${product.stockQuantity} items in stock` : 'In Stock - Ready to ship'}</span>
            ) : (
              <span className="text-[var(--text)]">Out of Stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-4 mt-2">
            <QuantityInput value={qty} onChange={setQty} max={product.stockQuantity || null} />

            <div className="flex-1 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus !== 'instock'}
                className="flex-1 bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--color-accent-start)] text-[var(--text)] hover:text-[var(--color-accent-start)] font-bold py-3 px-6 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                disabled={product.stockStatus !== 'instock'}
                className="flex-1 bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] hover:opacity-90 text-[var(--bg)] font-bold py-3 px-6 rounded-xl transition-opacity cursor-pointer shadow-[0_4px_14px_0_rgba(var(--color-accent-start-rgb),0.39)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`p-3 rounded-xl border-2 transition-colors cursor-pointer flex items-center justify-center w-12 sm:w-auto ${wishlisted ? 'border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10 text-[var(--color-accent-start)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]'}`}
              aria-label="Wishlist"
            >
              <HeartIcon filled={wishlisted} />
            </button>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-4 pt-8 border-t border-[var(--border)]">
            {product.sku && (
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] mb-1">SKU</span>
                <span className="font-semibold text-[var(--text)]">{product.sku}</span>
              </div>
            )}
            {product.categories?.length > 0 && (
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] mb-1">Category</span>
                <span className="font-semibold text-[var(--text)]">{product.categories.join(', ')}</span>
              </div>
            )}
            {product.brands?.length > 0 && (
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] mb-1">Brand</span>
                <span className="font-semibold text-[var(--text)]">{product.brands.join(', ')}</span>
              </div>
            )}
            {product.tags?.length > 0 && (
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)] mb-1">Tags</span>
                <span className="font-semibold text-[var(--text)]">{product.tags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-4"></div>

      {/* R3: Description */}
      {product.description && (
        <div className="glass-card p-8 lg:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent-start)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] mb-8 flex items-center gap-4">
            <span className="w-8 h-1 bg-[var(--color-accent-start)] rounded-full"></span>
            Overview
          </h2>
          <div className="prose prose-invert prose-lg max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      {/* R4: Specifications */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="glass-card p-8 lg:p-12 rounded-3xl relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] mb-8 flex items-center gap-4">
            <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {Object.entries(product.attributes).map(([key, values], index) => (
              <div key={key} className={`flex py-4 ${index % 2 === 0 ? 'border-b border-[var(--border)]/30' : 'border-b border-[var(--border)]/30 md:border-transparent'}`}>
                <span className="w-1/3 font-semibold text-[var(--text)]">{key}</span>
                <span className="w-2/3 text-[var(--text-secondary)]">{values.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* R5: Files */}
      {product.acf && (product.acf.datasheet || product.acf.schematic) && (
        // <div className="flex flex-col gap-12">
        <>
          <div className="glass-card p-8 lg:p-12 rounded-3xl">
          {product.acf.datasheet && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end pb-4 border-b border-[var(--border)]">
                <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
                  <span className="w-6 h-1 bg-purple-500 rounded-full"></span>
                  Datasheet
                </h3>
                <a href={product.acf.datasheet.url} download className="bg-[var(--surface)] hover:bg-[var(--elevated)] border border-[var(--border)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 text-[var(--text)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </a>
              </div>
              {product.acf.datasheet.mime === 'application/pdf' ? (
                <iframe src={product.acf.datasheet.url} className="w-full h-[800px] border border-[var(--border)] rounded-3xl bg-white shadow-sm" title="Datasheet" />
              ) : (
                <div className="p-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)]">Preview not available</div>
              )}
            </div>
          )}
          </div>
          <div className="glass-card p-8 lg:p-12 rounded-3xl">
          {product.acf.schematic && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end pb-4 border-b border-[var(--border)]">
                <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
                  <span className="w-6 h-1 bg-green-500 rounded-full"></span>
                  Schematic
                </h3>
                <a href={product.acf.schematic.url} download className="bg-[var(--surface)] hover:bg-[var(--elevated)] border border-[var(--border)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 text-[var(--text)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </a>
              </div>
              {product.acf.schematic.mime === 'application/pdf' ? (
                <iframe src={product.acf.schematic.url} className="w-full h-[800px] border border-[var(--border)] rounded-3xl bg-white shadow-sm" title="Schematic" />
              ) : (
                <div className="h-[800px] w-full bg-[var(--surface)] rounded-3xl overflow-hidden border border-[var(--border)] p-8 flex items-center justify-center shadow-sm">
                  <img src={product.acf.schematic.url} alt="Schematic" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
          )}
          </div>
        </>
      )}

      {/* R7: Designers */}
      {product.acf && product.acf.designers && product.acf.designers.length > 0 && (
        <div className="glass-card p-8 lg:p-12 rounded-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] mb-8 flex items-center gap-4">
            <span className="w-8 h-1 bg-yellow-500 rounded-full"></span>
            Hardware Designers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {product.acf.designers.map(designer => (
              <div key={designer.id} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-6 border border-[var(--border)]/50 rounded-2xl bg-gradient-to-br from-[var(--bg)] to-[var(--surface)] shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full overflow-hidden" dangerouslySetInnerHTML={{ __html: designer.avatar }}></div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text)]">{designer.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{designer.bio || 'Core Hardware Engineer at Digicomp Technologies.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* R8: Reviews */}
      <div id="reviews" className="glass-card p-8 lg:p-12 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-[var(--border)]">
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] flex items-center gap-4">
            <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
            Customer Reviews
            <span className="bg-[var(--surface)] text-sm font-normal px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">{product.reviewCount || 0}</span>
          </h2>
          <button className="w-full sm:w-auto bg-[var(--surface)] hover:bg-[var(--elevated)] border border-[var(--border)] text-[var(--text)] font-bold py-3 px-6 rounded-xl transition-colors shadow-sm">
            Write a Review
          </button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="flex flex-col gap-6">
            {product.reviews.map(review => (
              <div key={review.id} className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--bg)] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full border border-[var(--border)]" />
                  <div>
                    <div className="font-bold text-[var(--text)]">{review.author}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="ml-auto flex text-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10 px-2.5 py-1 rounded-lg">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < review.rating ? 'opacity-100' : 'opacity-20'}`}>★</span>
                    ))}
                  </div>
                </div>
                <div className="text-[var(--text-secondary)] text-sm leading-relaxed prose prose-invert" dangerouslySetInnerHTML={{ __html: review.content }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">No reviews yet</h3>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto">Have you used this product? Be the first to share your experience with other engineers.</p>
          </div>
        )}
      </div>

      {/* R9: Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-8 mb-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text)] flex items-center gap-4">
              <span className="w-8 h-1 bg-red-500 rounded-full"></span>
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
