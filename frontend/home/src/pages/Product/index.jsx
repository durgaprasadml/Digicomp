import { useLocation } from '@typeroute/router'

import { usePageData } from '../../stores/PageStore'
import { Container } from '../../components'

import Header from './Header'
import Content from './Content'
import Designers from './Designers'
import Reviews from './Reviews'
import Related from './Related'

export default function Product() {
  const { path } = useLocation()
  const product = usePageData(path) || {}

  if (!product.id) return <div className="p-8 text-center text-muted min-h-[50vh] flex items-center justify-center">Loading product data...</div>

  return (
    <Container className="relative max-w-7xl py-4">
      <Header product={product} />
      <Content product={product} />
      <Designers product={product} />
      <Reviews product={product} />
      <Related product={product} />
    </Container>
  )
}
