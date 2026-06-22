# 좌석 예약 시스템 — 백엔드 API 스펙

## 인증

- 모든 API는 AD/SSO 세션 쿠키 또는 `Authorization: Bearer <JWT>` 헤더 필요
- SSO 로그인 후 JWT 발급, 이후 요청에 첨부

---

## 공통 타입

```typescript
type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
type UserRole = 'pm' | 'admin'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  employeeId: string
}

interface Reservation {
  id: string
  zoneId: string           // 공간 ID (예: "baejae-10f-a2")
  seatUids: string[]       // 전역 고유 좌석 ID (예: ["baejae-10f-a2::A-44"])
  seatCodes: string[]      // 표시용 코드 (예: ["A-44"])
  projectName: string
  projectCode?: string
  pmId: string
  pmName: string
  pmDept: string
  startDate: string        // YYYY-MM-DD
  endDate: string
  headcount: number        // 실 사용 예정 인원
  reason: string
  status: ReservationStatus
  adminComment?: string
  createdAt: string        // ISO 8601
  updatedAt: string
  actualEndDate?: string   // 실제 종료일 (사후 입력)
  actualHeadcount?: number // 실제 사용 인원 (사후 입력)
}
```

---

## API 엔드포인트

### 인증

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/me` | 현재 로그인 사용자 정보 |

---

### 좌석 현황

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/reservations/seats` | 특정 공간의 좌석 예약 현황 |

**Query params:**
- `zoneId`: 공간 ID
- `startDate`: 조회 시작일 (YYYY-MM-DD)
- `endDate`: 조회 종료일 (YYYY-MM-DD)

**Response:** `SeatReservationInfo[]`
```typescript
interface SeatReservationInfo {
  seatUid: string
  reservationId: string
  projectName: string
  pmName: string
  pmDept: string
  startDate: string
  endDate: string
  status: ReservationStatus
  headcount: number
}
```

---

### 예약 (PM)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/reservations/mine` | 내 예약 목록 |
| POST | `/api/reservations` | 예약 신청 (status: pending) |
| PUT | `/api/reservations/:id/cancel` | 예약 취소 |
| PUT | `/api/reservations/:id/usage` | 실사용 내역 업데이트 |

**POST /api/reservations body:**
```typescript
interface ReservationRequest {
  zoneId: string
  seatUids: string[]
  seatCodes: string[]
  projectName: string
  projectCode?: string
  startDate: string
  endDate: string
  headcount: number
  reason: string
}
```

**PUT /api/reservations/:id/usage body:**
```json
{ "actualEndDate": "YYYY-MM-DD", "actualHeadcount": 3 }
```

---

### 관리자 (Admin)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/reservations` | 전체 예약 목록 (status 필터 가능) |
| PUT | `/api/admin/reservations/:id/approve` | 예약 승인 |
| PUT | `/api/admin/reservations/:id/reject` | 예약 반려 |
| GET | `/api/admin/stats` | 전체 이용 현황 통계 |
| GET | `/api/admin/pm-stats` | PM별 어뷰징 통계 |

**PUT approve body (optional):** `{ "comment": "승인합니다" }`
**PUT reject body (required):** `{ "comment": "반려 사유" }`

**GET /api/admin/stats response:**
```typescript
interface AdminStats {
  totalSeats: number
  occupiedSeats: number
  pendingRequests: number
  activeReservations: number
  utilizationRate: number  // 0-100
  byZone: {
    zoneId: string
    zoneName: string
    total: number
    occupied: number
  }[]
}
```

**GET /api/admin/pm-stats response:**
```typescript
interface PmStats {
  pmId: string
  pmName: string
  totalReservations: number
  approvedCount: number
  rejectedCount: number
  cancelledCount: number
  avgDurationAccuracy: number   // 0-100 (기간 정확도)
  avgHeadcountAccuracy: number  // 0-100 (인원 정확도)
  reliabilityScore: number      // 0-100 (종합 신뢰도)
  flagged: boolean              // 60점 미만 시 true
}
```

---

## 어뷰징 방지 로직 (백엔드 구현 권장)

1. **중복 예약 차단**: 같은 좌석이 겹치는 기간에 approved/pending 상태로 2개 이상 존재하면 거부
2. **최대 기간 제한**: 단일 예약 최대 6개월 (180일) 초과 시 400 에러
3. **신뢰도 점수 자동 계산**:
   - `avgDurationAccuracy = mean(actualEndDate - startDate) / (endDate - startDate)` (1.0이 최대)
   - `avgHeadcountAccuracy = mean(actualHeadcount / headcount)` (1.0이 최대)
   - `reliabilityScore = approvalRate * 30 + durationAcc * 35 + headcountAcc * 35`
4. **자동 플래그**: reliabilityScore < 60인 PM의 신청에 어뷰징 경고 태그 추가

---

## 좌석 UID 체계

`{zoneId}::{seatCode}` 형식으로 전역 고유성 보장

예시:
- `bonsa-6f-a::A-01` → 본사 6층 A존 A-01번 좌석
- `baejae-10f-a2::A-44` → 배재 10층 A-2존 A-44번 좌석
- `semicolon-12f::C-01` → 세미콜론 12층 C-01번 좌석

---

## 전체 공간 목록 (12개 존)

| zoneId | 공간명 | 좌석수 |
|--------|--------|--------|
| `bonsa-6f-a` | 본사 6층 A존 | 30 |
| `baejae-mgmt-6f-e` | 배재관리동 6층 E존 | 42 |
| `baejae-9f-c` | 배재 9층 C존 | 20 |
| `baejae-9f-d` | 배재 9층 D존 | 21 |
| `baejae-9f-n` | 배재 9층 N존 | 64 |
| `baejae-10f-a1` | 배재 10층 A-1존 | 33 |
| `baejae-10f-a2` | 배재 10층 A-2존 | 30 |
| `baejae-10f-b` | 배재 10층 B존 | 48 |
| `semicolon-12f` | 세미콜론 12층 (Tech&BAU) | 161 |
| `westgate-7f-f` | 웨스트게이트 7층 F존 | 61 |
| `westgate-7f-g` | 웨스트게이트 7층 G존 | 62 |
| `westgate-7f-n` | 웨스트게이트 7층 N존 | 32 |
