import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Search, X } from 'lucide-react'
import { mainNav, topBar } from '../../data/navigation'

function TopBar() {
  return (
    <nav className="hidden lg:block">
      <ul className="flex justify-end text-[14px] text-brand-ink">
        {topBar.map((item, i) => (
          <li key={item.label} className={i === topBar.length - 1 ? 'pr-0' : ''}>
            <Link
              to={item.href}
              className="inline-block px-6 py-2.5 hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SearchBox({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-[-10px] top-[calc(100%+15px)] z-30 h-[41px] w-[418px] max-w-[418px] bg-[#dddddd] px-2.5 pr-11">
      <form action="/buscar" method="get" className="flex h-full items-center">
        <input
          type="text"
          name="q"
          placeholder="Buscar"
          autoFocus
          className="h-full w-full bg-transparent pl-1 text-[14px] text-brand-ink outline-none placeholder:text-brand-ink"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar buscador"
          className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        >
          <img src="/assets/img/btn-close-blue.svg" alt="" className="h-full w-full" />
        </button>
      </form>
    </div>
  )
}

function DesktopNav() {
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center justify-end text-right">
        {mainNav.map((section) => (
          <li
            key={section.id}
            className="group relative cursor-pointer"
          >
            <Link
              to={section.href}
              className="block h-11 px-5 pb-2 pt-1.5 text-[14px] leading-5 text-brand-ink transition-none group-hover:text-brand-red"
            >
              {section.title}{' '}
              {section.titleStrong && <strong className="font-black">{section.titleStrong}</strong>}
            </Link>

            {/* flecha triangular inferior */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[calc(100%-8px)] -translate-x-1/2 border-x-[9px] border-b-[9px] border-x-transparent border-b-brand-red opacity-0 transition-opacity duration-100 group-hover:opacity-100"
            />

            {/* submenú */}
            <div className="absolute left-0 top-full z-20 h-0 w-[400px] overflow-hidden bg-brand-red text-left transition-[height] duration-100 group-hover:h-auto">
              <div className="px-10 pb-10 pt-9">
                <div className="mb-0 text-[22px] font-light text-white">
                  {section.title}{' '}
                  {section.titleStrong && <strong className="font-black">{section.titleStrong}</strong>}
                </div>
                <ul className="mt-0">
                  {section.children.map((child) => (
                    <li
                      key={child.href}
                      className="relative text-[14px] text-white before:absolute before:left-0 before:top-[9px] before:h-0 before:w-0 before:border-y-4 before:border-l-4 before:border-y-transparent before:border-l-white"
                    >
                      <Link
                        to={child.href}
                        className="block py-1 pl-3 text-[12px] leading-5 text-white transition-[padding] duration-500 hover:pl-4 hover:underline"
                      >
                        {child.label} {child.strong && <strong className="font-black">{child.strong}</strong>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-brand-red text-white lg:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Link to="/" onClick={onClose}>
          <img src="/assets/img/logo-white.svg" alt="Las Bambas" className="h-9 w-auto" />
        </Link>
        <button onClick={onClose} aria-label="Cerrar menú" className="p-2">
          <X className="h-7 w-7" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 pb-10">
        {mainNav.map((section) => (
          <details key={section.id} className="border-b border-white/30 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[18px]">
              <span>
                {section.title} {section.titleStrong && <strong className="font-black">{section.titleStrong}</strong>}
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <ul className="mt-3 space-y-2 pl-2 text-[15px]">
              {section.children.map((child) => (
                <li key={child.href}>
                  <Link to={child.href} onClick={onClose} className="block py-1">
                    {child.label} {child.strong && <strong className="font-black">{child.strong}</strong>}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </nav>

      <div className="px-5 pb-8">
        <div className="mb-3 flex flex-wrap gap-4 text-[14px]">
          {topBar.map((item) => (
            <Link key={item.label} to={item.href} onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </div>
        <Link to="/en" onClick={onClose} className="text-[14px] underline">
          EN
        </Link>
      </div>
    </div>
  )
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="absolute top-0 z-[8000] w-full bg-white">
      <div className="relative mx-auto hidden h-[118px] max-w-[1300px] px-[15px] text-right lg:block">
        {/* Logo */}
        <Link to="/" className="absolute left-[15px] top-7 z-[444444] inline-block w-[182px]">
          <img src="/assets/img/logo.svg" alt="Las Bambas" />
        </Link>

        {/* Barra superior de accesos */}
        <div className="absolute right-0 top-0 z-[4] hidden max-w-[640px] w-full lg:block">
          <TopBar />
        </div>

        {/* Navegación + herramientas */}
        <div className="absolute right-0 top-[74px] z-[3] hidden w-[calc(100%-182px)] items-start justify-end lg:flex">
          <div className="w-[calc(100%-120px)]">
            <DesktopNav />
          </div>

          <div className="relative my-[3px] ml-5 mr-5 cursor-pointer">
            <Search
              className="h-[23px] w-[23px] text-brand-ink transition-transform duration-100 hover:scale-110"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
            />
            {searchOpen && <SearchBox onClose={() => setSearchOpen(false)} />}
          </div>

          <Link
            to="/en"
            className="my-[3px] block h-[23px] w-8 border border-brand-ink pt-0 text-center text-[15px] uppercase leading-[21px] text-brand-ink hover:text-[#666666]"
          >
            en
          </Link>
        </div>
      </div>

      {/* Menú móvil */}
      <div className="flex items-center justify-between bg-white px-5 py-3 lg:hidden">
        <Link to="/" className="inline-block w-[150px]">
          <img src="/assets/img/logo.svg" alt="Las Bambas" />
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="flex flex-col gap-[5px] p-2"
        >
          <span className="block h-[2px] w-6 bg-brand-ink" />
          <span className="block h-[2px] w-6 bg-brand-ink" />
          <span className="block h-[2px] w-6 bg-brand-ink" />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
