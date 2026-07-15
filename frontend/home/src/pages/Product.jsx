import { useState } from 'react'
import { useLocation } from '@typeroute/router'
import { usePageData } from '../stores/PageStore'
import { CartStore } from '../stores/CartStore'
import { Link } from '@typeroute/router'
import { home, shop } from '../routes'
import { Button, NumberField, Breadcrumbs, Chip, Avatar, Card, Separator, Table } from "@heroui/react"

import Breadcrumb from '../blocks/Breadcrumb'
import Slider from '../components/Slider'
import ProductCard from '../components/ProductCard'
import Rating from '../components/Rating'
import CustomButton from '../components/CustomButton'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'
import Grid from '../components/layout/Grid'
import Stack from '../components/layout/Stack'
import FlexRow from '../components/layout/FlexRow'
import { getCleanPath } from '../utils/helper'

// Helper icons
function HeartIcon({ filled }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [wishlisted, setWishlisted] = useState(false)

  if (!product.id) return <div className="p-8 text-center text-[var(--text-muted)] min-h-[50vh] flex items-center justify-center">Loading product data...</div>

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

  return (
    <Container className="relative max-w-7xl py-4">
      {/* R1: Breadcrumbs */}
      <Section className="py-0">
        <Breadcrumbs>
          {breadcrumbItems.map((item, index) => (
            ! item.route ? <Breadcrumbs.Item className="pointer-events-none">{item.label}</Breadcrumbs.Item> :
            <Breadcrumbs.Item render={ (props) => (
              <Link {...props} to={item.route} params={ item.params || undefined }></Link>
            ) }>
              {item.label}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Section>

      {/* R2: Product Top (Slider + Info) */}
      <Section>
        <Grid cols={2} className="gap-8">
          {/* R2 C1: Image Slider */}
          <div className="relative">
          {product.gallery && product.gallery.length > 0 ? (
            <Slider
              className="w-full"
              slideClassName="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden h-[400px] md:h-[600px]"
              showDots={false}
              thumbnails={product.gallery}
            >
              {product.gallery.map(img => (
                <div key={img.id} className="w-full h-full flex items-center justify-center p-8 md:p-12 relative">
                  <img src={img.url} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" draggable="false" />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden h-[400px] md:h-[600px] w-full flex items-center justify-center text-[var(--text-muted)]">
              No Image Available
            </div>
          )}
          { product.acf?.badge && (
            <Chip color="accent" variant="soft" className="absolute top-4 left-4 uppercase font-bold tracking-wider z-10" size="sm">
              {product.acf.badge}
            </Chip>
          ) }
          </div>

        {/* R2 C2: Product Info */}
        <Stack>
          <div>
            <h1 className="mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <Rating rating={ product.averageRating || 0 } isReadOnly size="sm" />
              <a href="#reviews" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {product.reviewCount || 0} customer review{ 1 !== product?.reviewCount && 's' }
              </a>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-(--color-accent-hover)">
              ₹{product.price || product.regPrice}
            </span>
            {product.regPrice && product.price !== product.regPrice && (
              <span className="text-xl text-[var(--text-muted)] line-through">₹{product.regPrice}</span>
            )}
          </div>

          <div className="text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />

          <Chip color={ product.stockStatus === 'instock' ? 'success' : 'warning' } size="lg" variant="secondary">
            <div className={`w-2 h-2 mr-1 rounded-full shadow-md ${product.stockStatus === 'instock' ? 'bg-(--success)' : 'bg-(--warning)'}`}></div>
            { product.stockStatus === 'instock' ? (
              <Chip.Label>{product.stockQuantity ? `${product.stockQuantity} items in stock` : 'In Stock - Ready to ship'}</Chip.Label>
            ) : (
              <Chip.Label>Out of Stock</Chip.Label>
            ) }
          </Chip>

          {/* Actions */}
          <FlexRow className="flex-wrap items-stretch mt-2">
            <NumberField
              value={qty}
              onChange={setQty}
              maxValue={product.stockQuantity || undefined}
              minValue={1}
              aria-label="Quantity"
              size="lg"
              className="w-32"
            >
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            <div className="flex flex-1 gap-3">
              <Button
                size="lg"
                onPress={handleAddToCart}
                isDisabled={product.stockStatus !== 'instock'}
                className="flex-1 font-semibold"
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                isDisabled={product.stockStatus !== 'instock'}
                className="flex-1 font-semibold"
              >
                Buy Now
              </Button>
            </div>
          </FlexRow>
          <FlexRow className="flex-wrap items-stretch">
            <Button
              variant="ghost"
              color={wishlisted ? "danger" : "default"}
              onPress={() => setWishlisted(!wishlisted)}
              aria-label="Wishlist"
            >
              <HeartIcon filled={wishlisted} /> { wishlisted ? 'In Wishlist' : 'Add to Wishlist' }
            </Button>
            <Button
              variant="ghost"
              color="default"
              aria-label="Share"
            >
              <ShareIcon />Share
            </Button>
          </FlexRow>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-[var(--border)]">
            {product.sku && (
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)]">SKU</span>
                <span className="font-semibold text-[var(--text)]">{product.sku}</span>
              </div>
            )}
            {product.categories?.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)]">Category</span>
                <span className="font-semibold text-[var(--text)]">{product.categories.join(', ')}</span>
              </div>
            )}
            {product.brands?.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-muted)]">Brand</span>
                <span className="font-semibold text-[var(--text)]">{product.brands.join(', ')}</span>
              </div>
            )}
            {product.tags?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[var(--text-muted)]">Tags</span>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h2 className="title-section">
              <span className="w-1 h-1 bg-[var(--color-accent-start)] rounded-full"></span>
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
          <Table aria-label="Technical Specifications" className="w-full" shadow="none">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header>
                  <Table.Column>Feature</Table.Column>
                  <Table.Column>Specification</Table.Column>
                </Table.Header>
                <Table.Body>
                  {Object.entries(product.attributes).map(([key, values]) => (
                    <Table.Row key={key}>
                      <Table.Cell className="font-semibold text-[var(--text)] w-1/3">{key}</Table.Cell>
                      <Table.Cell className="text-[var(--text-secondary)] w-2/3">{values.join(', ')}</Table.Cell>
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
              <FlexRow className="justify-between items-start">
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
              </FlexRow>
              {product.acf.datasheet.mime === 'application/pdf' ? (
                <iframe src={product.acf.datasheet.url} className="w-full h-[800px] border border-[var(--border)] rounded-3xl bg-white shadow-sm" title="Datasheet" />
              ) : (
                <div className="p-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)]">Preview not available</div>
              )}
            </div>
          )}
          {product.acf.schematic && (
            <div className="flex flex-col">
              <FlexRow className="justify-between items-start">
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
              </FlexRow>
              {product.acf.schematic.mime === 'application/pdf' ? (
                <iframe src={product.acf.schematic.url} className="w-full h-[800px] border border-[var(--border)] rounded-3xl bg-white shadow-sm" title="Schematic" />
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
          <Grid cols={3}>
            {product.acf.designers.map(designer => (
              <Card className="md:flex-row items-center sm:items-start text-center sm:text-left p-6 py-4 gap-4">
                <Avatar>
                  <Avatar.Image src={designer.avatar} alt="review.author" />
                </Avatar>
                {/* <div className="rounded-full overflow-hidden" dangerouslySetInnerHTML={{ __html: designer.avatar }}></div> */}
                <div className="flex-1">
                  <h3 className="text-lg mb-2">{designer.name}</h3>
                  <Card.Description>{designer.bio || 'Core Hardware Engineer at Digicomp Technologies.'}</Card.Description>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      )}

      {/* R8: Reviews */}
      <Section id="reviews">
        <FlexRow className="justify-between items-start">
          <h2 className="title-section">
            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
            Customer Reviews
            <Chip variant="soft" size="md">
              {product.reviewCount || 0}
            </Chip>
          </h2>
          <Button>Write a Review</Button>
        </FlexRow>

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
                      <span className="text-xs text-(--text-muted) mt-0.5">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <Rating rating={review.rating} isReadOnly={true} size="sm" />
                </Card.Header>
                <Card.Content className="p-4">
                  <div className="text-(--text-secondary) text-sm leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: review.content }} />
                </Card.Content>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="text-center">
            <div className="w-16 h-16 bg-(--default) rounded-full flex items-center justify-center mx-auto text-(--text-muted)">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-lg font-bold">No reviews yet</h3>
            <p className="text-(--text-muted) max-w-sm mx-auto">Have you used this product? Be the first to share your experience with other engineers.</p>
          </Card>
        )}
      </Section>

      {/* R9: Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <Section>
          <div>
            <h2 className="title-section">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              You May Also Like
            </h2>
          </div>
          <Grid cols={5}>
            {product.relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </Grid>
        </Section>
      )}
    </Container>
  )
}
