import ProductGrid from '../components/ProductGrid'
import { useLocation } from '@typeroute/router'
import { usePageData } from '../stores/PageStore'

export default function Shop() {
  const { path } = useLocation()
  const { products = [] } = usePageData(path) || {}

  return (
    <div className="section-container">
      <ProductGrid products={ products } />
    </div>
  )
}
