import { useCallback } from 'react'
import type { Zone, SeatStatus, SeatReservationInfo } from '@/types'
import { seatUid } from '@/data/offices'
import { useStore } from '@/store'
import { SeatCell, LabelCell } from './SeatCell'

interface Props {
  zone: Zone
  reservationMap: Map<string, SeatReservationInfo>
  onSeatInfo: (info: SeatReservationInfo | null, uid: string) => void
}

export function SeatGrid({ zone, reservationMap, onSeatInfo }: Props) {
  const { user, selectedSeatUids, toggleSeatSelection } = useStore()

  const getStatus = useCallback(
    (uid: string): SeatStatus => {
      if (selectedSeatUids.includes(uid)) return 'selected'
      const info = reservationMap.get(uid)
      if (!info) return 'available'
      if (info.status === 'pending') return 'pending'
      if (info.pmName === user?.name) return 'mine'
      return 'reserved'
    },
    [reservationMap, selectedSeatUids, user?.name],
  )

  const handleClick = useCallback(
    (uid: string) => {
      const info = reservationMap.get(uid)
      if (info && info.status !== 'pending') {
        // Show info panel for reserved seats
        onSeatInfo(info, uid)
      } else if (info?.status === 'pending') {
        onSeatInfo(info, uid)
      } else {
        // Toggle selection for available seats
        toggleSeatSelection(uid)
        onSeatInfo(null, uid)
      }
    },
    [reservationMap, toggleSeatSelection, onSeatInfo],
  )

  return (
    <div className="overflow-auto">
      <div className="inline-block p-4 bg-gray-50 rounded-xl border border-gray-200 min-w-max">
        <div className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span>{zone.name}</span>
          <span className="text-gray-400 font-normal">— {zone.capacity}석</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {zone.rows.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-0.5 items-center">
              {row.map((cell, cIdx) => {
                if (cell === null || cell === 'null') {
                  return <div key={cIdx} className="w-12 h-9" />
                }
                if (cell.startsWith('LABEL:')) {
                  return <LabelCell key={cIdx} text={cell.slice(6)} />
                }
                const uid = seatUid(zone.id, cell)
                const status = getStatus(uid)
                const info = reservationMap.get(uid)
                return (
                  <SeatCell
                    key={cIdx}
                    code={cell}
                    status={status}
                    onClick={() => handleClick(uid)}
                    onHover={() => info ? onSeatInfo(info, uid) : onSeatInfo(null, uid)}
                    onLeave={() => {}}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-3 text-xs text-gray-600">
          <LegendItem color="bg-white border-green-400" label="사용가능" />
          <LegendItem color="bg-blue-500 border-blue-700" label="선택됨" />
          <LegendItem color="bg-blue-100 border-blue-500" label="내 예약" />
          <LegendItem color="bg-yellow-100 border-yellow-400" label="승인대기" />
          <LegendItem color="bg-red-100 border-red-400" label="예약중" />
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-5 h-4 rounded border ${color} inline-block`} />
      {label}
    </span>
  )
}
