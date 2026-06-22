/**
 * 개발/데모용 Mock API
 * 백엔드 연결 전 프론트엔드 단독 구동에 사용
 */

import type {
  User,
  Reservation,
  ReservationRequest,
  SeatReservationInfo,
  AdminStats,
  PmStats,
} from '@/types'
import { seatUid, ZONES } from '@/data/offices'

// ── 고정 목 사용자 ────────────────────────────────────────────

const MOCK_ME: User = {
  id: 'u001',
  name: '홍길동',
  email: 'hong@company.com',
  role: 'pm',
  department: 'Tech기획팀',
  employeeId: 'EMP0042',
}

// ── 목 예약 저장소 (in-memory) ────────────────────────────────

let mockReservations: Reservation[] = [
  {
    id: 'r001',
    zoneId: 'baejae-10f-a2',
    seatUids: ['baejae-10f-a2::A-44', 'baejae-10f-a2::A-45', 'baejae-10f-a2::A-46'],
    seatCodes: ['A-44', 'A-45', 'A-46'],
    projectName: '차세대 뱅킹앱 고도화',
    projectCode: 'PRJ-2024-088',
    pmId: 'u001',
    pmName: '홍길동',
    pmDept: 'Tech기획팀',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    headcount: 3,
    reason: '외부 협력사 PA 합류로 분리 공간 필요',
    status: 'approved',
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-05-21T14:00:00Z',
  },
  {
    id: 'r002',
    zoneId: 'bonsa-6f-a',
    seatUids: ['bonsa-6f-a::A-01', 'bonsa-6f-a::A-02'],
    seatCodes: ['A-01', 'A-02'],
    projectName: '모바일 UX 개선 TF',
    pmId: 'u002',
    pmName: '김철수',
    pmDept: '서비스기획팀',
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    headcount: 2,
    reason: '단기 TF 운영',
    status: 'pending',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'r003',
    zoneId: 'baejae-9f-n',
    seatUids: ['baejae-9f-n::N-01', 'baejae-9f-n::N-02', 'baejae-9f-n::N-03', 'baejae-9f-n::N-04', 'baejae-9f-n::N-05'],
    seatCodes: ['N-01', 'N-02', 'N-03', 'N-04', 'N-05'],
    projectName: '코어뱅킹 전환 프로젝트',
    projectCode: 'PRJ-2024-099',
    pmId: 'u003',
    pmName: '이영희',
    pmDept: 'IT기획팀',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    headcount: 8,
    reason: '장기 프로젝트 상주 인력',
    status: 'approved',
    adminComment: '기간·인원 승인. 6개월 후 연장 재신청 필요.',
    createdAt: '2026-04-20T09:00:00Z',
    updatedAt: '2026-04-22T16:00:00Z',
  },
  {
    id: 'r004',
    zoneId: 'westgate-7f-f',
    seatUids: ['westgate-7f-f::F-01', 'westgate-7f-f::F-02'],
    seatCodes: ['F-01', 'F-02'],
    projectName: '디지털 마케팅 분석',
    pmId: 'u004',
    pmName: '박민수',
    pmDept: '마케팅팀',
    startDate: '2026-06-22',
    endDate: '2026-07-22',
    headcount: 2,
    reason: '대외 협력 분석 업무',
    status: 'rejected',
    adminComment: '해당 기간 F존 전체 다른 프로젝트 선점. 다른 존 신청 요망.',
    createdAt: '2026-06-18T11:00:00Z',
    updatedAt: '2026-06-19T09:00:00Z',
  },
]

let nextId = 10

function nowIso() {
  return new Date().toISOString()
}

// ── Mock API 구현 ─────────────────────────────────────────────

export const mockApi = {
  getMe(): Promise<User> {
    return Promise.resolve({ ...MOCK_ME })
  },

  getSeatStatus(
    zoneId: string,
    startDate: string,
    endDate: string,
  ): Promise<SeatReservationInfo[]> {
    const infos: SeatReservationInfo[] = []
    const active = mockReservations.filter(
      (r) =>
        r.zoneId === zoneId &&
        r.status !== 'rejected' &&
        r.status !== 'cancelled' &&
        r.startDate <= endDate &&
        r.endDate >= startDate,
    )
    for (const res of active) {
      for (const uid of res.seatUids) {
        infos.push({
          seatUid: uid,
          reservationId: res.id,
          projectName: res.projectName,
          pmName: res.pmName,
          pmDept: res.pmDept,
          startDate: res.startDate,
          endDate: res.endDate,
          status: res.status,
          headcount: res.headcount,
        })
      }
    }
    return Promise.resolve(infos)
  },

  getMyReservations(): Promise<Reservation[]> {
    const mine = mockReservations.filter((r) => r.pmId === MOCK_ME.id)
    return Promise.resolve([...mine])
  },

  createReservation(req: ReservationRequest): Promise<Reservation> {
    const res: Reservation = {
      id: `r${String(nextId++).padStart(3, '0')}`,
      zoneId: req.zoneId,
      seatUids: req.seatUids,
      seatCodes: req.seatCodes,
      projectName: req.projectName,
      projectCode: req.projectCode,
      pmId: MOCK_ME.id,
      pmName: MOCK_ME.name,
      pmDept: MOCK_ME.department,
      startDate: req.startDate,
      endDate: req.endDate,
      headcount: req.headcount,
      reason: req.reason,
      status: 'pending',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    mockReservations.push(res)
    return Promise.resolve(res)
  },

  cancelReservation(id: string): Promise<Reservation> {
    const r = mockReservations.find((x) => x.id === id)
    if (!r) return Promise.reject(new Error('Not found'))
    r.status = 'cancelled'
    r.updatedAt = nowIso()
    return Promise.resolve({ ...r })
  },

  updateActualUsage(
    id: string,
    actualEndDate: string,
    actualHeadcount: number,
  ): Promise<Reservation> {
    const r = mockReservations.find((x) => x.id === id)
    if (!r) return Promise.reject(new Error('Not found'))
    r.actualEndDate = actualEndDate
    r.actualHeadcount = actualHeadcount
    r.updatedAt = nowIso()
    return Promise.resolve({ ...r })
  },

  getAdminReservations(status?: string): Promise<Reservation[]> {
    const list = status
      ? mockReservations.filter((r) => r.status === status)
      : mockReservations
    return Promise.resolve([...list].reverse())
  },

  approveReservation(id: string, comment?: string): Promise<Reservation> {
    const r = mockReservations.find((x) => x.id === id)
    if (!r) return Promise.reject(new Error('Not found'))
    r.status = 'approved'
    r.adminComment = comment
    r.updatedAt = nowIso()
    return Promise.resolve({ ...r })
  },

  rejectReservation(id: string, comment: string): Promise<Reservation> {
    const r = mockReservations.find((x) => x.id === id)
    if (!r) return Promise.reject(new Error('Not found'))
    r.status = 'rejected'
    r.adminComment = comment
    r.updatedAt = nowIso()
    return Promise.resolve({ ...r })
  },

  getAdminStats(): Promise<AdminStats> {
    const totalSeats = Object.values(ZONES).reduce((s, z) => s + z.capacity, 0)
    const today = new Date().toISOString().slice(0, 10)
    const activeRes = mockReservations.filter(
      (r) =>
        r.status === 'approved' &&
        r.startDate <= today &&
        r.endDate >= today,
    )
    const occupiedSeatUids = new Set(activeRes.flatMap((r) => r.seatUids))

    const byZone = Object.values(ZONES).map((z) => {
      const occupied = activeRes
        .filter((r) => r.zoneId === z.id)
        .reduce((s, r) => s + r.seatUids.length, 0)
      return {
        zoneId: z.id,
        zoneName: z.name,
        total: z.capacity,
        occupied,
      }
    })

    return Promise.resolve({
      totalSeats,
      occupiedSeats: occupiedSeatUids.size,
      pendingRequests: mockReservations.filter((r) => r.status === 'pending').length,
      activeReservations: activeRes.length,
      utilizationRate: Math.round((occupiedSeatUids.size / totalSeats) * 100),
      byZone,
    })
  },

  getPmStats(): Promise<PmStats[]> {
    const pmMap: Record<string, { name: string; res: Reservation[] }> = {}
    for (const r of mockReservations) {
      if (!pmMap[r.pmId]) pmMap[r.pmId] = { name: r.pmName, res: [] }
      pmMap[r.pmId].res.push(r)
    }

    return Promise.resolve(
      Object.entries(pmMap).map(([pmId, { name, res }]) => {
        const approved = res.filter((r) => r.status === 'approved').length
        const rejected = res.filter((r) => r.status === 'rejected').length
        const cancelled = res.filter((r) => r.status === 'cancelled').length

        // duration accuracy: how close actualEndDate is to endDate
        const withActual = res.filter((r) => r.actualEndDate)
        let avgDurAcc = 1
        if (withActual.length > 0) {
          const scores = withActual.map((r) => {
            const planned =
              (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) /
              86400000
            const actual =
              (new Date(r.actualEndDate!).getTime() - new Date(r.startDate).getTime()) /
              86400000
            return Math.min(actual, planned) / Math.max(actual, planned)
          })
          avgDurAcc = scores.reduce((a, b) => a + b, 0) / scores.length
        }

        // headcount accuracy
        const withActualHc = res.filter((r) => r.actualHeadcount != null)
        let avgHcAcc = 1
        if (withActualHc.length > 0) {
          const scores = withActualHc.map((r) => {
            const ratio = r.actualHeadcount! / r.headcount
            return Math.min(ratio, 1)
          })
          avgHcAcc = scores.reduce((a, b) => a + b, 0) / scores.length
        }

        const reliabilityScore = Math.round(
          ((approved / Math.max(res.length, 1)) * 30 +
            avgDurAcc * 35 +
            avgHcAcc * 35) *
            100,
        ) / 100

        return {
          pmId,
          pmName: name,
          totalReservations: res.length,
          approvedCount: approved,
          rejectedCount: rejected,
          cancelledCount: cancelled,
          avgDurationAccuracy: Math.round(avgDurAcc * 100),
          avgHeadcountAccuracy: Math.round(avgHcAcc * 100),
          reliabilityScore: Math.round(reliabilityScore * 100),
          flagged: reliabilityScore < 60,
        }
      }),
    )
  },
}

// suppress unused warning
void seatUid
