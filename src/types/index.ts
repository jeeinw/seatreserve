export type SeatStatus = 'available' | 'reserved' | 'pending' | 'mine' | 'selected'

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type UserRole = 'pm' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  employeeId: string
}

// A cell in the seat grid layout: seat code, null (empty), or LABEL:text
export type GridCell = string | null

export interface Zone {
  id: string
  name: string
  building: string
  floor: string
  capacity: number
  // 2D layout grid. Each cell: seat code like "A-01", null for gap, "LABEL:회의실" for room label
  rows: GridCell[][]
}

export interface Building {
  id: string
  name: string
  zones: string[] // zone ids
}

export interface Seat {
  zoneId: string
  code: string  // e.g. "A-01"
  uid: string   // globally unique: "{zoneId}::{code}"
}

export interface SeatReservationInfo {
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

export interface Reservation {
  id: string
  zoneId: string
  seatUids: string[]
  seatCodes: string[]
  projectName: string
  projectCode?: string
  pmId: string
  pmName: string
  pmDept: string
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  headcount: number
  reason: string
  status: ReservationStatus
  adminComment?: string
  createdAt: string
  updatedAt: string
  // actual usage (filled in after project ends)
  actualEndDate?: string
  actualHeadcount?: number
}

export interface ReservationRequest {
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

export interface PmStats {
  pmId: string
  pmName: string
  totalReservations: number
  approvedCount: number
  rejectedCount: number
  cancelledCount: number
  // reliability: ratio of actual usage vs requested
  avgDurationAccuracy: number  // 0-1, how accurate duration estimates are
  avgHeadcountAccuracy: number // 0-1, how accurate headcount estimates are
  reliabilityScore: number     // composite score 0-100
  flagged: boolean             // flagged for abuse
}

export interface AdminStats {
  totalSeats: number
  occupiedSeats: number
  pendingRequests: number
  activeReservations: number
  utilizationRate: number
  byZone: {
    zoneId: string
    zoneName: string
    total: number
    occupied: number
  }[]
}

export interface DateRange {
  start: string  // YYYY-MM-DD
  end: string
}
