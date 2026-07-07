import { Suspense, useEffect } from 'react'
import { RouterRoot } from "@typeroute/router"
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { UserStore } from './stores/UserStore'

function App({ routerProps }) {
  useEffect( () => {
    UserStore.fetchData()
  }, [] )

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <Header />
      <main>
        <Suspense fallback={
          <div className="pt-6 min-h-screen flex items-center justify-center">
            <div class="w-28 h-5 rounded-4xl border-2 relative overflow-hidden text-[var(--text-secondary)]">
              <div className="loadbus absolute m-0.5 w-3 inset-y-0 -left-5 bg-[var(--color-accent-start)]"></div>
            </div>
          </div>
        }>
          <RouterRoot {...routerProps} />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default App
