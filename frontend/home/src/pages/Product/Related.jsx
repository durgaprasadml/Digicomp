import { Section, Grid, ProductCard } from '../../components'

export default function Related({ product }) {
  return (
    <>
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
    </>
  )
}
