import { useLocation } from '@typeroute/router'

import { usePageData } from '../../stores/PageStore'
import Hero from './Hero'
import FeaturedProducts from './FeaturedProducts'
import WhyDigicomp from './WhyDigicomp'
import ProductEcosystem from './ProductEcosystem'
import InnovationPipeline from './InnovationPipeline'
import KnowledgeHub from './KnowledgeHub'
import MissionVision from './MissionVision'
import Testimonials from './Testimonials'
import NewsBlog from './NewsBlog'

export default function Home() {
  const { path } = useLocation()
  usePageData(path)

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <WhyDigicomp />
      <ProductEcosystem />
      <InnovationPipeline />
      <KnowledgeHub />
      <MissionVision />
      <Testimonials />
      <NewsBlog />
    </>
  )
}
