import { Suspense, useEffect } from 'react'
import { Outlet } from "@typeroute/router"
import Header from './blocks/Header'
import Footer from './blocks/Footer'
import ScrollToTop from './blocks/ScrollToTop'
import { UserStore } from './stores/UserStore'
import { Toast, Spinner } from '@heroui/react'
import { FloatingAIButton } from './components'

function App() {
  useEffect( () => {
    UserStore.ensureData()
  }, [] )

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0 transition-colors duration-300">
      <Toast.Provider placement="bottom end" />
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="pt-6 flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingAIButton />
      <ScrollToTop />
    </div>
  )
}

export default App
