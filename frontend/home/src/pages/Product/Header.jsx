import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@typeroute/router'
import { Button, NumberField, Breadcrumbs, Chip, Spinner, toast } from "@heroui/react"
import { Sparkles } from 'lucide-react'

import { home, shop, ai as aiRoute, login as loginRoute } from '../../routes'
import { CartStore } from '../../stores/CartStore'
import { UserStore } from '../../stores/UserStore'
import { WishlistStore } from '../../stores/WishlistStore'
import { getCleanPath } from '../../utils/helper'
import { animateFlyToTarget } from '../../utils/animate'
import { AddToCart, CustomButton, FlexRow, Grid, Rating, Section, Slider, Stack } from '../../components'

function HeartIcon({ filled, width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );
}

export default function Header({ product }) {
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [is3DLoaded, setIs3DLoaded] = useState(false)
  const isImporting = useRef(false)
  const { user } = UserStore.use()
  const { wishlists, wishlistRef } = WishlistStore.use()
  const imgRef = useRef(null)
  const imgRefs = useRef([])

  const handleAskAIAboutProduct = () => {
    const productSlug = product.slug || product.sku || (product.id ? String(product.id) : '');
    const productContext = {
      id: product.id,
      name: product.name,
      slug: product.slug || productSlug,
      sku: product.sku || '',
      category: product.categories?.[0] || 'Hardware',
      categories: product.categories || [],
      brand: product.brands?.[0] || 'DigiComp',
      brands: product.brands || [],
      price: product.price || product.regPrice || 0,
      regPrice: product.regPrice || product.price || 0,
      salePrice: product.salePrice || null,
      stock: product.stock || 'instock',
      stockQty: product.stockQty || 0,
      description: product.description || product.excerpt || '',
      excerpt: product.excerpt || '',
      attributes: product.attributes || {},
      product_url: product.url || `/product/${productSlug}`,
      image_url: product.gallery?.[0]?.url || product.image || '',
    };

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(`digicomp_product_context_${productSlug}`, JSON.stringify(productContext));
      } catch (e) {
        console.warn('Could not cache product context in sessionStorage', e);
      }
    }

    const aiDestination = `/ai?product=${encodeURIComponent(productSlug)}`;
    if (!user?.is_logged_in) {
      navigate({ to: loginRoute, state: { from: aiDestination } });
    } else {
      navigate({ to: aiRoute, search: { product: productSlug } });
    }
  };

  const slides = [];
  const thumbnails = [];

  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach(img => {
      slides.push({ type: 'image', ...img });
      thumbnails.push(img);
    });
  }

  const has3D = !!product?.acf?.['3d']?.url;
  if (has3D) {
    slides.push({ type: '3d', url: product.acf['3d'].url });
    thumbnails.push({ thumb: thumbnails.length > 0 ? thumbnails[0].thumb : '', type: '3d' });
  }

  useEffect(() => {
    if (slides.length === 1 && has3D && !is3DLoaded && !isImporting.current) {
      if (typeof window !== 'undefined') {
        isImporting.current = true;
        import('@google/model-viewer')
          .then(() => setIs3DLoaded(true))
          .catch((err) => {
            console.error("Failed to load 3D viewer:", err);
            isImporting.current = false;
          });
      }
    }
  }, [slides.length, has3D, is3DLoaded]);

  const containingLists = (wishlists || []).filter(wl => wl.items && wl.items.includes(product.id))
  const wishlisted = containingLists.length > 0

  const breadcrumbItems = [
    { label: 'Home', route: home },
    { label: 'Shop', route: shop }
  ]
  if (product.categories && product.categories.length > 0) {
    breadcrumbItems.push({ label: product.categories[0], route: `/product-category/:cat`, params: { cat: getCleanPath(product.categories[0]) } })
  }
  breadcrumbItems.push({ label: product.name })

  const handleAddToCart = async () => {
    await CartStore.addToCart(product.id, qty)
  }

  const handleWishlist = async (targetListId = null) => {
    const ud = UserStore.get()
    if (!ud?.user?.is_logged_in) {
      toast.danger('Login required to add to wishlist')
      return
    }

    const { wishlists } = WishlistStore.get()

    if (wishlisted && !targetListId) {
      for (const wl of containingLists) {
        await WishlistStore.removeFromWishlist(wl.id, product.id)
      }
      toast.success('Removed from wishlist')
      return
    }

    let targetList = null;
    if (targetListId) {
      targetList = (wishlists || []).find(wl => wl.id === targetListId);
    } else {
      targetList = wishlists?.[0]
    }

    if (!targetList) {
      const res = await WishlistStore.createList('My Wishlist')
      if (res && res.success) {
        targetList = { id: res.id, name: 'My Wishlist', items: [] }
      }
    }

    if (targetList) {
      if (targetList.items && targetList.items.includes(product.id)) {
        toast.success(`Already in ${targetList.name}`);
        return;
      }

      animateFlyToTarget(imgRef, wishlistRef)
      await WishlistStore.addToWishlist(targetList.id, product.id)
      toast.success(`Added to ${targetList.name}`)
    } else {
      toast.danger('Failed to add to wishlist')
    }
  }

  return (
    <>
      {/* R1: Breadcrumbs */}
      <Section className="py-0">
        <Breadcrumbs>
          { breadcrumbItems.map(( item, index ) => (
            ! item.route ? <Breadcrumbs.Item className="pointer-events-none">{ item.label }</Breadcrumbs.Item> :
            <Breadcrumbs.Item render={ ( props ) => (
              <Link {...props} to={ item.route } params={ item.params || undefined } preload="intent"></Link>
            ) }>
              { item.label }
            </Breadcrumbs.Item>
          ) ) }
        </Breadcrumbs>
      </Section>

      {/* R2: Product Top (Slider + Info) */}
      <Section>
        <Grid cols={2} className="gap-8">
          {/* R2 C1: Image Slider */}
          <div className="relative">
          {slides && slides.length > 0 ? (
            <Slider
              className="w-full"
              wrapClassName="w-full bg-surface border border-border rounded-3xl overflow-hidden"
              slideClassName="flex items-center justify-center h-[400px] md:h-[600px]"
              showDots={false}
              showArrows={true}
              thumbnails={thumbnails}
              onSlideChange={i => {
                if (slides[i]?.type === 'image') {
                  imgRef.current = imgRefs.current[i];
                }

                // Lazy load 3D engine only when navigated to a 3D slide
                if (slides[i]?.type === '3d' && !is3DLoaded && !isImporting.current) {
                  if (typeof window !== 'undefined') {
                    isImporting.current = true;
                    import('@google/model-viewer')
                      .then(() => setIs3DLoaded(true))
                      .catch((err) => {
                        console.error("Failed to load 3D viewer:", err);
                        isImporting.current = false;
                      });
                  }
                }
              }}
            >
              {slides.map((slide, k) => {
                if (slide.type === '3d') {
                  return (
                    <div key={k} className="w-full h-full flex items-center justify-center relative">
                      {is3DLoaded ? (
                        <model-viewer
                          src={slide.url}
                          auto-rotate
                          camera-controls
                          shadow-intensity="1"
                          style={{ width: '100%', height: '100%', outline: 'none' }}
                        />
                      ) : (
                        <div className="text-muted flex flex-col items-center">
                          <Spinner />
                          Loading 3D Engine...
                        </div>
                      )}
                    </div>
                  );
                }

                // Default image slide
                return (
                  <img
                    key={k}
                    src={slide.url}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    draggable="false"
                    ref={el => {
                      if (k === 0) imgRef.current = el; // default to first image
                      imgRefs.current[k] = el;
                    }}
                  />
                );
              })}
            </Slider>
          ) : (
            <div className="bg-surface border border-border rounded-3xl overflow-hidden h-100 md:h-150 w-full flex items-center justify-center text-muted">
              No Image Available
            </div>
          )}
          { product?.badge && (
            <Chip color="accent" variant="soft" className="absolute top-4 left-4 uppercase font-bold tracking-wider z-10" size="sm">
              {product.badge}
            </Chip>
          ) }
          </div>

        {/* R2 C2: Product Info */}
        <Stack className='gap-6 lg:gap-4'>
          <div>
            <h1 className="mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <Rating rating={ product.avgRating || 0 } isReadOnly size="sm" />
              <a href="#reviews" className="text-muted hover:text-accent transition-colors">
                {product.reviewCount || 0} customer review{ 1 !== product?.reviewCount && 's' }
              </a>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-(--color-accent-hover)">
              ₹{product.price || product.regPrice}
            </span>
            {product.regPrice && product.price !== product.regPrice && (
              <span className="text-xl text-muted line-through">₹{product.regPrice}</span>
            )}
          </div>

          <div className="text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: product.excerpt }} />

          <Chip color={ product.stock === 'instock' ? 'success' : 'warning' } size="lg" variant="secondary">
            <div className={`w-2 h-2 mr-1 rounded-full shadow-md ${product.stock === 'instock' ? 'bg-success' : 'bg-warning'}`}></div>
            { product.stock === 'instock' ? (
              <Chip.Label>{product.stockQty ? `${product.stockQty} items in stock` : 'In Stock - Ready to ship'}</Chip.Label>
            ) : (
              <Chip.Label>Out of Stock</Chip.Label>
            ) }
          </Chip>

          {/* Actions */}
          <FlexRow className="flex-wrap flex-row items-center mt-2">
            <NumberField
              value={qty}
              onChange={setQty}
              maxValue={product.stockQty || undefined}
              minValue={1}
              aria-label="Quantity"
              size="lg"
              className="w-28 lg:w-32"
            >
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            <AddToCart
              variant='primary'
              size='lg'
              handleAdd={ handleAddToCart }
              inStock={ product.stock === 'instock' }
              imgRef={ imgRef }
              className='flex-1'
              qty={ qty }
            />
            <Button
              size="lg"
              variant="secondary"
              isDisabled={product.stock !== 'instock'}
              className="flex-1 font-semibold"
            >
              Buy Now
            </Button>
          </FlexRow>

          {/* Dedicated Product AI Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-full font-semibold border-border hover:border-accent/60 hover:bg-accent/5 text-foreground hover:text-accent transition-all flex items-center justify-center gap-2.5 py-3 rounded-2xl cursor-pointer shadow-2xs group"
            onClick={handleAskAIAboutProduct}
            id="product-ask-ai-button"
            aria-label={`Ask AI About ${product.name}`}
          >
            <Sparkles className="w-4 h-4 text-accent transition-transform group-hover:scale-110 group-hover:rotate-12 duration-200" />
            <span className="text-sm font-semibold tracking-wide">Ask AI About This Product</span>
          </Button>

          <FlexRow className="flex-wrap flex-row">
            <div className="flex">
              <CustomButton
                variant="ghost"
                color={wishlisted ? "danger" : "default"}
                className={wishlists && wishlists.length > 0 ? "pr-4 rounded-r-none" : ""}
              >
                <button onClick={() => handleWishlist()} aria-label="Wishlist" className="flex items-center gap-2">
                  <HeartIcon filled={wishlisted} /> { wishlisted ? 'In Wishlist' : 'Add to Wishlist' }
                </button>
              </CustomButton>
              <div className="flex popover-wrap relative">
                {wishlists && wishlists.length > 0 && (
                  <>
                    <CustomButton
                      variant="ghost"
                      color={wishlisted ? "danger" : "default"}
                      className="px-2 min-w-0 rounded-l-none border-l border-default-200/50"
                      isIconOnly
                    >
                      <button aria-label="Select Wishlist">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </CustomButton>
                    <div className="popover shadow-xl right-0">
                      <ul className="space-y-1 max-h-48 overflow-x-hidden overflow-y-auto scrollbar-thin">
                        {wishlists.map(wl => {
                          const inThisList = wl.items && wl.items.includes(product.id);
                          return (
                            <li key={wl.id}>
                              <Button
                                variant="ghost"
                                className='w-full'
                                aria-label={wl.name}
                                onClick={() => handleWishlist(wl.id)}
                              >
                                {wl.name}
                                {inThisList && <HeartIcon filled={true} width={14} height={14} />}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              color="default"
              aria-label="Share"
            >
              <ShareIcon />Share
            </Button>
          </FlexRow>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
            {product.sku && (
              <div className="flex flex-col gap-1">
                <span className="text-muted">SKU</span>
                <span className="font-semibold">{product.sku}</span>
              </div>
            )}
            {product.categories?.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted">Category</span>
                <span className="font-semibold">{product.categories.join(', ')}</span>
              </div>
            )}
            {product.brands?.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted">Brand</span>
                <span className="font-semibold">{product.brands.join(', ')}</span>
              </div>
            )}
            {product.tags?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-muted">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {product.tags.map(tag => <Chip key={tag} size="sm">{tag}</Chip>)}
                </div>
              </div>
            )}
          </div>
        </Stack>
      </Grid>
      </Section>
    </>
  )
}
