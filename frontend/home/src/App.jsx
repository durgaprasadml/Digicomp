import Header from './components/Header'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import WhyDigicomp from './components/WhyDigicomp'
import ProductEcosystem from './components/ProductEcosystem'
import InnovationPipeline from './components/InnovationPipeline'
import KnowledgeHub from './components/KnowledgeHub'
import MissionVision from './components/MissionVision'
import Testimonials from './components/Testimonials'
import NewsBlog from './components/NewsBlog'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <Header />
      <main>
        <Hero />
        <ProductGrid />
        <WhyDigicomp />
        <ProductEcosystem />
        <InnovationPipeline />
        <KnowledgeHub />
        <MissionVision />
        <Testimonials />
        <NewsBlog />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default App
