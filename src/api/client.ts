/**
 * API 클라이언트
 *
 * 백엔드 연동 시 VITE_API_BASE_URL 환경변수 설정.
 * 미설정 시 목 데이터를 반환하는 mock 모드로 동작.
 *
 * ── 백엔드 API 스펙 ──────────────────────────────────────────
 * GET    /api/me                          → User
 * GET    /api/zones                       → Zone[]
 * GET    /api/reservations?zoneId=&date=  → SeatReservationInfo[] (날짜 기준)
 * GET    /api/reservations/mine           → Reservation[]
 * GET    /api/reservations/:id            → Reservation
 * POST   /api/reservations                → Reservation  (요청)
 * PUT    /api/reservations/:id/cancel     → Reservation
 * GET    /api/admin/reservations?status=  → Reservation[]
 * PUT    /api/admin/reservations/:id/approve  body:{comment?}  → Reservation
 * PUT    /api/admin/reservations/:id/reject   body:{comment}   → Reservation
 * PUT    /api/admin/reservations/:id/usage    body:{actualEndDate,actualHeadcount} → Reservation
 * GET    /api/admin/stats                 → AdminStats
 * GET    /api/admin/pm-stats              → PmStats[]
 * ─────────────────────────────────────────────────────────────
 */

import axios from 'axios'
import type {
  User,
  Reservation,
  ReservationRequest,
  SeatReservationInfo,
  AdminStats,
  PmStats,
} from '@/types'
import { mockApi } from './mock'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // SSO 쿠키 전달
})

// Attach JWT from localStorage (for non-SSO fallback)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ───────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  if (USE_MOCK) return mockApi.getMe()
  const r = await http.get<User>('/me')
  return r.data
}

// SSO 로그인: 내부망에서는 AD SSO 리다이렉트 처리
export function redirectToSso() {
  const ssoUrl = import.meta.env.VITE_SSO_URL
  if (ssoUrl) {
    window.location.href = `${ssoUrl}?redirect=${encodeURIComponent(window.location.href)}`
  }
}

// ── Seat availability ──────────────────────────────────────────

export async function getSeatStatus(
  zoneId: string,
  startDate: string,
  endDate: string,
): Promise<SeatReservationInfo[]> {
  if (USE_MOCK) return mockApi.getSeatStatus(zoneId, startDate, endDate)
  const r = await http.get<SeatReservationInfo[]>('/reservations/seats', {
    params: { zoneId, startDate, endDate },
  })
  return r.data
}

// ── Reservations ───────────────────────────────────────────────

export async function getMyReservations(): Promise<Reservation[]> {
  if (USE_MOCK) return mockApi.getMyReservations()
  const r = await http.get<Reservation[]>('/reservations/mine')
  return r.data
}

export async function createReservation(req: ReservationRequest): Promise<Reservation> {
  if (USE_MOCK) return mockApi.createReservation(req)
  const r = await http.post<Reservation>('/reservations', req)
  return r.data
}

export async function cancelReservation(id: string): Promise<Reservation> {
  if (USE_MOCK) return mockApi.cancelReservation(id)
  const r = await http.put<Reservation>(`/reservations/${id}/cancel`)
  return r.data
}

export async function updateActualUsage(
  id: string,
  actualEndDate: string,
  actualHeadcount: number,
): Promise<Reservation> {
  if (USE_MOCK) return mockApi.updateActualUsage(id, actualEndDate, actualHeadcount)
  const r = await http.put<Reservation>(`/reservations/${id}/usage`, {
    actualEndDate,
    actualHeadcount,
  })
  return r.data
}

// ── Admin ──────────────────────────────────────────────────────

export async function getAdminReservations(
  status?: string,
): Promise<Reservation[]> {
  if (USE_MOCK) return mockApi.getAdminReservations(status)
  const r = await http.get<Reservation[]>('/admin/reservations', {
    params: status ? { status } : {},
  })
  return r.data
}

export async function approveReservation(
  id: string,
  comment?: string,
): Promise<Reservation> {
  if (USE_MOCK) return mockApi.approveReservation(id, comment)
  const r = await http.put<Reservation>(`/admin/reservations/${id}/approve`, { comment })
  return r.data
}

export async function rejectReservation(
  id: string,
  comment: string,
): Promise<Reservation> {
  if (USE_MOCK) return mockApi.rejectReservation(id, comment)
  const r = await http.put<Reservation>(`/admin/reservations/${id}/reject`, { comment })
  return r.data
}

export async function getAdminStats(): Promise<AdminStats> {
  if (USE_MOCK) return mockApi.getAdminStats()
  const r = await http.get<AdminStats>('/admin/stats')
  return r.data
}

export async function getPmStats(): Promise<PmStats[]> {
  if (USE_MOCK) return mockApi.getPmStats()
  const r = await http.get<PmStats[]>('/admin/pm-stats')
  return r.data
}
