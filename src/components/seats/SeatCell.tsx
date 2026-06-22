import clsx from 'clsx'
import type { SeatStatus } from '@/types'

interface Props {
  code: string
  status: SeatStatus
  onClick: () => void
  onHover: () => void
  onLeave: () => void
}

const statusStyle: Record<SeatStatus, string> = {
  available:
    'bg-white border-green-400 hover:bg-green-50 hover:border-green-600 cursor-pointer',
  reserved:
    'bg-red-100 border-red-400 cursor-pointer hover:bg-red-200',
  pending:
    'bg-yellow-100 border-yellow-400 cursor-pointer hover:bg-yellow-200',
  mine:
    'bg-blue-100 border-blue-500 cursor-pointer hover:bg-blue-200',
  selected:
    'bg-blue-500 border-blue-700 text-white cursor-pointer shadow-md scale-105',
}

export function SeatCell({ code, status, onClick, onHover, onLeave }: Props) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={clsx(
        'w-12 h-9 rounded border text-xs font-mono font-medium transition-all duration-100 select-none',
        statusStyle[status],
      )}
      title={code}
    >
      {code}
    </button>
  )
}

export function LabelCell({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center w-20 h-9 text-xs text-gray-400 font-medium border border-dashed border-gray-300 rounded bg-gray-50">
      {text}
    </div>
  )
}
