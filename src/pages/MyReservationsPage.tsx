import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { getMyReservations, cancelReservation, updateActualUsage } from '@/api/client'
import { ZONES } from '@/data/offices'
import type { Reservation } from '@/types'

const STATUS_LABELS: Record<string, { text: string; cls: string }> = {
  pending: { text: '승인대기', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { text: '승인됨', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { text: '반려됨', cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { text: '취소', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function MyReservationsPage() {
  const qc = useQueryClient()
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: getMyReservations,
  })

  const cancelMut = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myReservations'] }),
  })

  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')

  const today = format(new Date(), 'yyyy-MM-dd')
  const active = reservations.filter(
    (r) => r.status !== 'cancelled' && r.status !== 'rejected' && r.endDate >= today,
  )
  const past = reservations.filter(
    (r) => r.status === 'cancelled' || r.status === 'rejected' || r.endDate < today,
  )

  const shown = activeTab === 'active' ? active : past

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">내 예약 현황</h1>

      {/* Tab */}
      <div className="flex gap-1 mb-4 border-b">
        {(['active', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'active' ? `진행중 (${active.length})` : `종료/취소 (${past.length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : shown.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {activeTab === 'active' ? '진행 중인 예약이 없습니다' : '종료된 예약이 없습니다'}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onCancel={() => {
                if (confirm('예약을 취소하시겠습니까?')) cancelMut.mutate(r.id)
              }}
              onUpdateUsage={(_id, end, hc) => {
                qc.invalidateQueries({ queryKey: ['myReservations'] })
                updateActualUsage(_id, end, hc).then(() => {
                  qc.invalidateQueries({ queryKey: ['myReservations'] })
                })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReservationCard({
  reservation: r,
  onCancel,
  onUpdateUsage,
}: {
  reservation: Reservation
  onCancel: () => void
  onUpdateUsage: (id: string, end: string, hc: number) => void
}) {
  const [showUsage, setShowUsage] = useState(false)
  const [actualEnd, setActualEnd] = useState(r.actualEndDate || r.endDate)
  const [actualHc, setActualHc] = useState(r.actualHeadcount ?? r.headcount)
  const zone = ZONES[r.zoneId]
  const today = format(new Date(), 'yyyy-MM-dd')
  const isEnded = r.endDate < today || r.status === 'cancelled' || r.status === 'rejected'

  const sl = STATUS_LABELS[r.status]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-800">{r.projectName}</h3>
            {r.projectCode && (
              <span className="text-xs text-gray-400 font-mono">{r.projectCode}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">{zone?.name}</div>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${sl.cls}`}>
          {sl.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
        <Info label="좌석">
          <div className="flex flex-wrap gap-1">
            {r.seatCodes.map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                {c}
              </span>
            ))}
          </div>
        </Info>
        <Info label="기간">
          {r.startDate} ~ {r.endDate}
        </Info>
        <Info label="예약 인원">{r.headcount}명</Info>
        <Info label="신청일">{format(parseISO(r.createdAt), 'yyyy-MM-dd')}</Info>
        {r.actualEndDate && (
          <Info label="실제 종료일">{r.actualEndDate}</Info>
        )}
        {r.actualHeadcount != null && (
          <Info label="실제 인원">{r.actualHeadcount}명</Info>
        )}
      </div>

      {r.reason && (
        <p className="text-xs text-gray-400 mb-2 italic">"{r.reason}"</p>
      )}

      {r.adminComment && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 mb-3">
          <span className="font-semibold">관리자 코멘트:</span> {r.adminComment}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {r.status === 'pending' && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            신청 취소
          </button>
        )}
        {r.status === 'approved' && !isEnded && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            예약 반납
          </button>
        )}
        {(isEnded || r.status === 'approved') && !r.actualEndDate && (
          <button
            onClick={() => setShowUsage(!showUsage)}
            className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            실사용 입력
          </button>
        )}
      </div>

      {showUsage && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg flex flex-wrap gap-3 items-end text-sm">
          <div>
            <label className="text-xs text-gray-500 block mb-1">실제 종료일</label>
            <input
              type="date"
              value={actualEnd}
              max={r.endDate}
              min={r.startDate}
              onChange={(e) => setActualEnd(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">실제 사용 인원</label>
            <input
              type="number"
              min={1}
              value={actualHc}
              onChange={(e) => setActualHc(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm w-20"
            />
          </div>
          <button
            onClick={() => {
              onUpdateUsage(r.id, actualEnd, actualHc)
              setShowUsage(false)
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
          >
            저장
          </button>
          <p className="w-full text-xs text-gray-500">
            실사용 내역 입력 시 신뢰도 점수가 향상되어 향후 승인이 빨라집니다.
          </p>
        </div>
      )}
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-700">{children}</span>
    </div>
  )
}
