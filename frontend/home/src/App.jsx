import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from "@typeroute/router"
import Header from './blocks/Header'
import Footer from './blocks/Footer'
import ScrollToTop from './blocks/ScrollToTop'
import { UserStore } from './stores/UserStore'
import { Toast, Spinner } from '@heroui/react'
import { FloatingAIButton } from './components'

function App() {
  const { path = '' } = useLocation()
  const isAiPage = path === '/ai' || path.startsWith('/ai')

  useEffect( () => {
    UserStore.ensureData()
  }, [] )

  return (
    <div className={`flex flex-col transition-colors duration-300 ${
      isAiPage
        ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pb-16 lg:pb-0'
        : 'min-h-screen pb-16 lg:pb-0'
    }`}>
      <Toast.Provider placement="bottom end" />
      <Header />
      <main className={`flex-1 flex flex-col ${isAiPage ? 'min-h-0 overflow-hidden' : ''}`}>
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
      {!isAiPage && <ScrollToTop />}
    </div>
  )
}

export default App
