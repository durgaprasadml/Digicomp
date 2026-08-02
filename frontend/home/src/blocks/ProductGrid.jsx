import { AnimateIn } from '../components';
import { ProductCard } from '../components';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

export default function ProductGrid( { products } ) {
  return (
    <div className="product-list">
      <AnimateIn
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </AnimateIn>
    </div>
  );
}
