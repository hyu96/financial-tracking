import type { ReactNode } from 'react'

interface Props {
  title: string
  onAdd?: () => void
  addLabel?: string
  addColor?: string
  showForm?: boolean
  children: ReactNode
  headerExtra?: ReactNode
}

export function SectionCard({ title, onAdd, addLabel, addColor, showForm, children, headerExtra }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
        <div className="flex items-center gap-2">
          {headerExtra}
          {onAdd && !showForm && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white transition-opacity duration-150 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: addColor }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {addLabel}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
