import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useStore } from '@/store'
import { ZONES } from '@/data/offices'
import { getSeatStatus } from '@/api/client'
import { ZoneSelector } from '@/components/seats/ZoneSelector'
import { SeatGrid } from '@/components/seats/SeatGrid'
import { SeatInfoPanel } from '@/components/reservations/SeatInfoPanel'
import { ReservationModal } from '@/components/reservations/ReservationModal'
import type { SeatReservationInfo } from '@/types'
import { parseSeatUid } from '@/data/offices'

export function MapPage() {
  const {
    selectedZoneId,
    viewStartDate,
    viewEndDate,
    setViewDates,
    selectedSeatUids,
    clearSelectedSeats,
    reservationModalOpen,
    openReservationModal,
  } = useStore()

  const [focusedInfo, setFocusedInfo] = useState<SeatReservationInfo | null>(null)
  const [focusedCode, setFocusedCode] = useState<string | null>(null)

  const zone = ZONES[selectedZoneId]

  const { data: seatInfos = [], isFetching } = useQuery({
    queryKey: ['seatStatus', selectedZoneId, viewStartDate, viewEndDate],
    queryFn: () => getSeatStatus(selectedZoneId, viewStartDate, viewEndDate),
    enabled: !!selectedZoneId,
  })

  const reservationMap = useMemo(() => {
    const m = new Map<string, SeatReservationInfo>()
    for (const info of seatInfos) {
      m.set(info.seatUid, info)
    }
    return m
  }, [seatInfos])

  const handleSeatInfo = (info: SeatReservationInfo | null, uid: string) => {
    setFocusedInfo(info)
    setFocusedCode(parseSeatUid(uid).code)
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Zone selector */}
      <aside className="w-56 flex-shrink-0 bg-white border-r overflow-y-auto p-3">
        <div className="text-xs text-gray-400 uppercase font-semibold mb-2 px-1">공간 선택</div>
        <ZoneSelector />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="bg-white border-b px-4 py-2 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500">기간 조회</label>
            <input
              type="date"
              value={viewStartDate}
              max={viewEndDate || undefined}
              onChange={(e) => setViewDates(e.target.value, viewEndDate)}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={viewEndDate}
              min={viewStartDate}
              onChange={(e) => setViewDates(viewStartDate, e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => setViewDates(today, today)}
              className="text-xs text-blue-600 hover:underline"
            >
              오늘
            </button>
          </div>

          {isFetching && (
            <span className="text-xs text-gray-400 animate-pulse">불러오는 중...</span>
          )}

          {selectedSeatUids.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-blue-700 font-medium">
                {selectedSeatUids.length}석 선택됨
              </span>
              <button
                onClick={clearSelectedSeats}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                취소
              </button>
              <button
                onClick={openReservationModal}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
              >
                예약 신청
              </button>
            </div>
          )}
        </div>

        {/* Grid area */}
        <div className="flex-1 flex overflow-auto p-4 gap-4">
          {zone ? (
            <>
              <div className="flex-1 overflow-auto">
                <SeatGrid
                  zone={zone}
                  reservationMap={reservationMap}
                  onSeatInfo={handleSeatInfo}
                />
              </div>
              <SeatInfoPanel
                info={focusedInfo}
                seatCode={focusedCode}
                onClose={() => { setFocusedInfo(null); setFocusedCode(null) }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              좌석을 선택해주세요
            </div>
          )}
        </div>
      </main>

      {reservationModalOpen && <ReservationModal />}
    </div>
  )
}
