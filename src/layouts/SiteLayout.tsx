import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingWhatsApp from '../components/ui/FloatingWhatsApp'
// import CookieConsent from '../components/CookieConsent'

/** Vuelve al inicio de la página al cambiar de ruta */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      {/* <CookieConsent /> */}
    </div>
  )
}
