import type { SeatReservationInfo } from '@/types'

const statusLabel: Record<string, { text: string; cls: string }> = {
  approved: { text: '승인됨', cls: 'bg-green-100 text-green-700' },
  pending: { text: '승인대기', cls: 'bg-yellow-100 text-yellow-700' },
  rejected: { text: '반려', cls: 'bg-red-100 text-red-700' },
  cancelled: { text: '취소', cls: 'bg-gray-100 text-gray-600' },
}

interface Props {
  info: SeatReservationInfo | null
  seatCode: string | null
  onClose: () => void
}

export function SeatInfoPanel({ info, seatCode, onClose }: Props) {
  if (!seatCode) return null

  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm p-4 self-start">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">
          좌석 {seatCode}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
          ×
        </button>
      </div>

      {!info ? (
        <div className="text-sm text-green-600 font-medium">사용 가능한 좌석입니다</div>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <Row label="상태">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusLabel[info.status]?.cls}`}>
              {statusLabel[info.status]?.text}
            </span>
          </Row>
          <Row label="프로젝트">{info.projectName}</Row>
          <Row label="PM">{info.pmName}</Row>
          <Row label="부서">{info.pmDept}</Row>
          <Row label="기간">
            {info.startDate} ~ {info.endDate}
          </Row>
          <Row label="예약 인원">{info.headcount}명</Row>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  )
}
