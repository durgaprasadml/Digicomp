import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import WhyDigicomp from '../components/WhyDigicomp'
import ProductEcosystem from '../components/ProductEcosystem'
import InnovationPipeline from '../components/InnovationPipeline'
import KnowledgeHub from '../components/KnowledgeHub'
import MissionVision from '../components/MissionVision'
import Testimonials from '../components/Testimonials'
import NewsBlog from '../components/NewsBlog'

export default function Home() {
  return (
    <>
      <Hero />
      <ProductGrid />
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
