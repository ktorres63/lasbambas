import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** id del elemento que titula el modal (para aria-labelledby) */
  labelledBy?: string
  children: React.ReactNode
}

/**
 * Modal genérico accesible:
 * - role="dialog" + aria-modal + aria-labelledby
 * - cierre con Escape y clic en el overlay
 * - bloquea el scroll del body mientras está abierto
 * - devuelve el foco al elemento que lo abrió
 */
export default function Modal({ open, onClose, labelledBy, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      restoreFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/60 p-4 animate-fade-in motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative max-h-[85vh] w-full max-w-[680px] overflow-y-auto bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center bg-[#f2f2f2] text-brand-ink transition-colors duration-200 hover:bg-brand-red hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
