import Hero from '../blocks/Hero'
import FeaturedProducts from '../blocks/FeaturedProducts'
import WhyDigicomp from '../blocks/WhyDigicomp'
import ProductEcosystem from '../blocks/ProductEcosystem'
import InnovationPipeline from '../blocks/InnovationPipeline'
import KnowledgeHub from '../blocks/KnowledgeHub'
import MissionVision from '../blocks/MissionVision'
import Testimonials from '../blocks/Testimonials'
import NewsBlog from '../blocks/NewsBlog'
import { useLocation } from '@typeroute/router'
import { usePageData } from '../stores/PageStore'

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
