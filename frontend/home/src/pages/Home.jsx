import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import WhyDigicomp from '../components/WhyDigicomp'
import ProductEcosystem from '../components/ProductEcosystem'
import InnovationPipeline from '../components/InnovationPipeline'
import KnowledgeHub from '../components/KnowledgeHub'
import MissionVision from '../components/MissionVision'
import Testimonials from '../components/Testimonials'
import NewsBlog from '../components/NewsBlog'
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
