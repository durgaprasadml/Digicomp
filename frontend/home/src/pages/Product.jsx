import { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from '@typeroute/router'
import { Button, NumberField, Breadcrumbs, Chip, Avatar, Card, Table, Spinner, toast } from "@heroui/react"

import { home, shop } from '../routes'
import { usePageData } from '../stores/PageStore'
import { CartStore } from '../stores/CartStore'
import { UserStore } from '../stores/UserStore'
import { WishlistStore } from '../stores/WishlistStore'
import { getCleanPath } from '../utils/helper'
import { animateFlyToTarget } from '../utils/animate'
import { AddToCart, Container, CustomButton, FlexRow, Grid, ProductCard, Rating, Section, Slider, Stack } from '../components'

// Helper icons
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

export default function Product() {
  const { path } = useLocation()
  const product = usePageData(path) || {}
  const [qty, setQty] = useState(1)
  const [is3DLoaded, setIs3DLoaded] = useState(false)
  const isImporting = useRef(false)
  const { wishlists, wishlistRef } = WishlistStore.use()
  const imgRef = useRef(null)
  const imgRefs = useRef([])

  if (!product.id) return <div className="p-8 text-center text-muted min-h-[50vh] flex items-center justify-center">Loading product data...</div>

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

  // Breadcrumbs
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

    // If already wishlisted and NO specific list requested, remove from all containing lists (default toggle behavior)
    if (wishlisted && !targetListId) {
      for (const wl of containingLists) {
        await WishlistStore.removeFromWishlist(wl.id, product.id)
      }
      toast.success('Removed from wishlist')
      return
    }

    // Add to specific list, or default to first list
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
      // Avoid adding again if already in this specific list
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
    <Container className="relative max-w-7xl py-4">
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

      {/* R3: Description */}
      {product.description && (
        <Section>
          <div className="surface surface--default rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h2 className="title-section">
              <span className="w-1 h-1 bg-accent rounded-full"></span>
              Overview
            </h2>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </Section>
      )}

      {/* R4: Specifications */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <Section>
          <h2 className="title-section">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            Technical Specifications
          </h2>
          <Table className="w-full" shadow="none">
            <Table.ScrollContainer>
              <Table.Content aria-label="Technical Specifications">
                <Table.Header>
                  <Table.Column isRowHeader>Feature</Table.Column>
                  <Table.Column>Specification</Table.Column>
                </Table.Header>
                <Table.Body>
                  {Object.entries(product.attributes).map(([key, values]) => (
                    <Table.Row key={key}>
                      <Table.Cell className="font-semibold w-1/3">{key}</Table.Cell>
                      <Table.Cell className="text-muted w-2/3">{values.join(', ')}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Section>
      )}

      {/* R5: Files */}
      {product.acf && (product.acf.datasheet || product.acf.schematic) && (
        <Section>
          <Stack className="gap-8">
          {product.acf.datasheet && (
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <h2 className="title-section">
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  Datasheet
                </h2>
                <CustomButton variant="tertiary">
                  <a href={product.acf.datasheet.url} download>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </a>
                </CustomButton>
              </div>
              {product.acf.datasheet.mime === 'application/pdf' ? (
                <iframe src={product.acf.datasheet.url} className="w-full h-96 md:h-200 border border-border rounded-3xl bg-white shadow-sm" title="Datasheet" />
              ) : (
                <div className="p-12 text-center text-muted border border-dashed border-border rounded-3xl bg-surface">Preview not available</div>
              )}
            </div>
          )}
          {product.acf.schematic && (
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <h2 className="title-section">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Schematic
                </h2>
                <CustomButton variant="tertiary">
                  <a href={product.acf.schematic.url} download>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </a>
                </CustomButton>
              </div>
              {product.acf.schematic.mime === 'application/pdf' ? (
                <iframe src={product.acf.schematic.url} className="w-full h-96 md:h-200 border border-border rounded-3xl bg-white shadow-sm" title="Schematic" />
              ) : (
                <Card className="items-center">
                  <img src={product.acf.schematic.url} alt="Schematic" className="max-w-full max-h-full object-contain" />
                </Card>
              )}
            </div>
          )}
          </Stack>
        </Section>
      )}

      {/* R7: Designers */}
      {product.acf && product.acf.designers && product.acf.designers.length > 0 && (
        <Section>
          <h2 className="title-section">
            <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
            Hardware Designers
          </h2>
          <Grid cols={3} className="gap-8">
            {product.acf.designers.map(designer => (
              <Card className="md:flex-row items-center sm:items-start text-center sm:text-left p-6 py-4 gap-4">
                <Avatar>
                  <Avatar.Image src={designer.avatar} alt="review.author" />
                </Avatar>
                {/* <div className="rounded-full overflow-hidden" dangerouslySetInnerHTML={{ __html: designer.avatar }}></div> */}
                <div className="flex-1">
                  <h3 className="text-lg mb-1">{designer.name}</h3>
                  <div className="text-sm text-muted mb-4">{ designer.designation || 'Engineer' } at Digicomp Technologies</div>
                  {/* <Card.Description className="mb-4">{designer.bio || 'Core Hardware Engineer at Digicomp Technologies.'}</Card.Description> */}

                  <div className="flex gap-4 justify-center sm:justify-start">
                    {designer.github && (
                      <a href={designer.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors" aria-label="GitHub">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </a>
                    )}
                    {designer.linkedin && (
                      <a href={designer.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors" aria-label="LinkedIn">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                    )}
                    {designer.twitter && (
                      <a href={designer.twitter} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors" aria-label="X (Twitter)">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                      </a>
                    )}
                    {designer.instagram && (
                      <a href={designer.instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors" aria-label="Instagram">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                    )}
                    {designer.public_mail && (
                      <a href={`mailto:${designer.public_mail}`} className="text-muted hover:text-accent transition-colors" aria-label="Email">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      )}

      {/* R8: Reviews */}
      <Section id="reviews">
        <div className="flex justify-between items-start">
          <h2 className="title-section">
            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
            Customer Reviews
            <Chip variant="soft" size="md">
              {product.reviewCount || 0}
            </Chip>
          </h2>
          <Button>Write a Review</Button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <Stack>
            {product.reviews.map(review => (
              <Card key={review.id}>
                <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 py-0 gap-4">
                  <div className="flex gap-3 items-center">
                    <Avatar>
                      <Avatar.Image src={review.avatar} alt="review.author" />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold">{review.author}</span>
                      <span className="text-xs text-muted mt-0.5">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <Rating rating={review.rating} isReadOnly={true} size="sm" />
                </Card.Header>
                <Card.Content className="p-4">
                  <div className="text-muted text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: review.content }} />
                </Card.Content>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="text-center">
            <div className="w-16 h-16 bg-default rounded-full flex items-center justify-center mx-auto text-muted">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold">No reviews yet</h3>
            <p className="text-muted max-w-sm mx-auto">Have you used this product? Be the first to share your experience with other engineers.</p>
          </Card>
        )}
      </Section>

      {/* R9: Related Products */}
      {product.related && product.related.length > 0 && (
        <Section>
          <div>
            <h2 className="title-section">
              <span className="w-1 h-1 bg-danger rounded-full"></span>
              You May Also Like
            </h2>
          </div>
          <Grid cols={5}>
            {product.related.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </Grid>
        </Section>
      )}
    </Container>
  )
}
