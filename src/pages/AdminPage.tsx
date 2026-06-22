import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  getAdminReservations,
  approveReservation,
  rejectReservation,
  getAdminStats,
  getPmStats,
} from '@/api/client'
import { ZONES } from '@/data/offices'
import type { Reservation, PmStats } from '@/types'

type Tab = 'pending' | 'all' | 'stats' | 'abuse'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('pending')

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">관리자 대시보드</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(
          [
            ['pending', '승인 대기'],
            ['all', '전체 예약'],
            ['stats', '이용 현황'],
            ['abuse', '어뷰징 모니터링'],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'pending' && <PendingTab />}
      {tab === 'all' && <AllTab />}
      {tab === 'stats' && <StatsTab />}
      {tab === 'abuse' && <AbuseTab />}
    </div>
  )
}

// ── 승인 대기 ──────────────────────────────────────────────────

function PendingTab() {
  const qc = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminReservations', 'pending'],
    queryFn: () => getAdminReservations('pending'),
  })

  const { data: pmStats = [] } = useQuery({
    queryKey: ['pmStats'],
    queryFn: getPmStats,
  })

  const approveMut = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      approveReservation(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReservations'] }),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      rejectReservation(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReservations'] }),
  })

  if (isLoading) return <Loading />
  if (data.length === 0)
    return <Empty>대기 중인 예약 신청이 없습니다</Empty>

  const pmStatsMap = new Map(pmStats.map((p) => [p.pmId, p]))

  return (
    <div className="flex flex-col gap-4">
      {data.map((r) => {
        const pmStat = pmStatsMap.get(r.pmId)
        return (
          <AdminCard
            key={r.id}
            reservation={r}
            pmStat={pmStat}
            onApprove={(comment) => approveMut.mutate({ id: r.id, comment })}
            onReject={(comment) => rejectMut.mutate({ id: r.id, comment })}
          />
        )
      })}
    </div>
  )
}

// ── 전체 예약 ──────────────────────────────────────────────────

function AllTab() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminReservations', statusFilter],
    queryFn: () => getAdminReservations(statusFilter || undefined),
  })

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {['', 'pending', 'approved', 'rejected', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === '' ? '전체' : s === 'pending' ? '대기' : s === 'approved' ? '승인' : s === 'rejected' ? '반려' : '취소'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : data.length === 0 ? (
        <Empty>해당하는 예약이 없습니다</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {['신청일', '신청자', '부서', '프로젝트', '공간', '좌석', '기간', '인원', '상태'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500 text-xs">
                    {format(parseISO(r.createdAt), 'MM-dd')}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.pmName}</td>
                  <td className="px-3 py-2 text-gray-500">{r.pmDept}</td>
                  <td className="px-3 py-2 max-w-xs truncate">{r.projectName}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{ZONES[r.zoneId]?.name}</td>
                  <td className="px-3 py-2 text-xs font-mono text-gray-600">
                    {r.seatCodes.join(', ')}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                    {r.startDate}~{r.endDate}
                  </td>
                  <td className="px-3 py-2 text-center">{r.headcount}명</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── 이용 현황 ──────────────────────────────────────────────────

function StatsTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  })

  if (isLoading) return <Loading />
  if (!stats) return null

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="전체 좌석" value={stats.totalSeats.toString()} unit="석" color="blue" />
        <StatCard label="현재 사용중" value={stats.occupiedSeats.toString()} unit="석" color="green" />
        <StatCard label="승인 대기" value={stats.pendingRequests.toString()} unit="건" color="yellow" />
        <StatCard label="가동률" value={stats.utilizationRate.toString()} unit="%" color="purple" />
      </div>

      {/* By zone */}
      <h3 className="font-semibold text-gray-700 mb-3">공간별 현황</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {['공간', '총 좌석', '사용중', '여유', '가동률'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.byZone.map((z) => {
              const utilRate = Math.round((z.occupied / z.total) * 100)
              return (
                <tr key={z.zoneId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{z.zoneName}</td>
                  <td className="px-4 py-2 text-gray-500">{z.total}석</td>
                  <td className="px-4 py-2 text-blue-600">{z.occupied}석</td>
                  <td className="px-4 py-2 text-green-600">{z.total - z.occupied}석</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-24">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${utilRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{utilRate}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── 어뷰징 모니터링 ────────────────────────────────────────────

function AbuseTab() {
  const { data: pmStats = [], isLoading } = useQuery({
    queryKey: ['pmStats'],
    queryFn: getPmStats,
  })

  if (isLoading) return <Loading />
  if (pmStats.length === 0) return <Empty>PM 통계가 없습니다</Empty>

  const sorted = [...pmStats].sort((a, b) => a.reliabilityScore - b.reliabilityScore)

  return (
    <div>
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <b>어뷰징 감지 기준:</b> 신뢰도 점수 60점 미만인 PM은 플래그 처리됩니다.
        신뢰도 점수는 승인율(30%), 기간 정확도(35%), 인원 정확도(35%)로 산정됩니다.
        실사용 내역 입력 시 점수가 향상됩니다.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {['PM', '부서', '총 신청', '승인', '반려', '기간정확도', '인원정확도', '신뢰도', '상태'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr
                key={p.pmId}
                className={`border-b ${p.flagged ? 'bg-red-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-3 py-2 font-medium">{p.pmName}</td>
                <td className="px-3 py-2 text-gray-500">—</td>
                <td className="px-3 py-2 text-center">{p.totalReservations}</td>
                <td className="px-3 py-2 text-center text-green-600">{p.approvedCount}</td>
                <td className="px-3 py-2 text-center text-red-500">{p.rejectedCount}</td>
                <td className="px-3 py-2 text-center">
                  <ScoreBar value={p.avgDurationAccuracy} />
                </td>
                <td className="px-3 py-2 text-center">
                  <ScoreBar value={p.avgHeadcountAccuracy} />
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`font-bold text-sm ${
                      p.reliabilityScore >= 80
                        ? 'text-green-600'
                        : p.reliabilityScore >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {p.reliabilityScore}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {p.flagged ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                      주의
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      정상
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────

function AdminCard({
  reservation: r,
  pmStat,
  onApprove,
  onReject,
}: {
  reservation: Reservation
  pmStat?: PmStats
  onApprove: (comment?: string) => void
  onReject: (comment: string) => void
}) {
  const [comment, setComment] = useState('')
  const [showReject, setShowReject] = useState(false)
  const zone = ZONES[r.zoneId]
  const days = differenceInDays(parseISO(r.endDate), parseISO(r.startDate)) + 1
  const months = (days / 30).toFixed(1)

  const flags: string[] = []
  if (days > 90) flags.push(`장기 예약 (${months}개월)`)
  if (r.seatCodes.length >= 5) flags.push(`대량 좌석 (${r.seatCodes.length}석)`)
  if (pmStat?.flagged) flags.push(`PM 신뢰도 낮음 (${pmStat.reliabilityScore}점)`)
  if (pmStat && r.headcount < r.seatCodes.length * 0.7)
    flags.push(`인원 대비 좌석 과다 (${r.seatCodes.length}석/${r.headcount}명)`)

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${flags.length > 0 ? 'border-orange-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-800">{r.projectName}</h3>
            {r.projectCode && (
              <span className="text-xs text-gray-400 font-mono">{r.projectCode}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {r.pmName} · {r.pmDept}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {format(parseISO(r.createdAt), 'yyyy-MM-dd HH:mm')} 신청
        </span>
      </div>

      {flags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {flags.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full"
            >
              ⚠ {f}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-4">
        <Info label="공간">{zone?.name}</Info>
        <Info label="좌석">
          <div className="flex flex-wrap gap-1">
            {r.seatCodes.map((c) => (
              <span key={c} className="px-1.5 bg-gray-100 rounded text-xs font-mono">
                {c}
              </span>
            ))}
          </div>
        </Info>
        <Info label="기간">
          {r.startDate} ~ {r.endDate} ({days}일)
        </Info>
        <Info label="인원">{r.headcount}명 / {r.seatCodes.length}좌석</Info>
        {pmStat && (
          <Info label="PM 신뢰도">
            <span className={pmStat.flagged ? 'text-red-600 font-bold' : 'text-green-600'}>
              {pmStat.reliabilityScore}점
            </span>
          </Info>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mb-4 italic">
        "{r.reason}"
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">코멘트 (선택)</label>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="승인/반려 사유를 입력하세요"
            className="w-full border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={() => onApprove(comment || undefined)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
        >
          승인
        </button>
        <button
          onClick={() => setShowReject(!showReject)}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 font-medium"
        >
          반려
        </button>
      </div>

      {showReject && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <label className="text-xs text-red-700 block mb-1 font-semibold">반려 사유 (필수)</label>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="반려 사유를 입력해주세요"
            className="w-full border border-red-200 rounded px-3 py-1.5 text-sm mb-2"
          />
          <button
            onClick={() => {
              if (!comment.trim()) { alert('반려 사유를 입력해주세요'); return }
              onReject(comment)
            }}
            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            반려 확정
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  }
  const valColorMap: Record<string, string> = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    purple: 'text-purple-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${valColorMap[color]}`}>
        {value}
        <span className="text-base ml-1">{unit}</span>
      </div>
    </div>
  )
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{value}%</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = {
    pending: '대기',
    approved: '승인',
    rejected: '반려',
    cancelled: '취소',
  }
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-gray-700">{children}</span>
    </div>
  )
}

function Loading() {
  return <div className="text-center py-12 text-gray-400">불러오는 중...</div>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-center py-12 text-gray-400">{children}</div>
}
