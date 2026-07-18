import { Suspense, useEffect } from 'react'
import { Outlet } from "@typeroute/router"
import Header from './blocks/Header'
import Footer from './blocks/Footer'
import ScrollToTop from './blocks/ScrollToTop'
import { UserStore } from './stores/UserStore'

function App() {
  useEffect( () => {
    UserStore.fetchData()
  }, [] )

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0 transition-colors duration-300">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="pt-6 flex-1 flex items-center justify-center">
            <div class="w-28 h-5 rounded-4xl border-2 relative overflow-hidden text-[var(--text-secondary)]">
              <div className="loadbus absolute m-0.5 w-3 inset-y-0 -left-5 bg-[var(--color-accent-start)]"></div>
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default App
