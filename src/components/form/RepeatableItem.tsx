import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { removeButtonClass } from './styles'

interface RepeatableItemProps {
  title: string
  removeLabel: string
  onRemove: () => void
  children: ReactNode
}

/** Contenedor de un registro dinámico con su acción de eliminación. */
export default function RepeatableItem({
  title,
  removeLabel,
  onRemove,
  children,
}: RepeatableItemProps) {
  return (
    <div className="border border-[#e0e0e0] bg-[#fafafa] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-[13px] font-black uppercase tracking-[1px] text-brand-ink">{title}</h4>
        <button type="button" onClick={onRemove} className={removeButtonClass}>
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {removeLabel}
        </button>
      </div>
      {children}
    </div>
  )
}
