import { create } from 'zustand'
import type { User } from '@/types'
import { format } from 'date-fns'

interface AppStore {
  // Auth
  user: User | null
  setUser: (u: User | null) => void

  // Zone/map view
  selectedBuildingId: string
  setSelectedBuildingId: (id: string) => void
  selectedZoneId: string
  setSelectedZoneId: (id: string) => void

  // Date range filter for availability
  viewStartDate: string
  viewEndDate: string
  setViewDates: (start: string, end: string) => void

  // Selected seats (for new reservation)
  selectedSeatUids: string[]
  toggleSeatSelection: (uid: string) => void
  clearSelectedSeats: () => void

  // Reservation modal
  reservationModalOpen: boolean
  openReservationModal: () => void
  closeReservationModal: () => void

  // Info panel: which seat to show details for
  focusedSeatUid: string | null
  setFocusedSeatUid: (uid: string | null) => void
}

const today = format(new Date(), 'yyyy-MM-dd')

export const useStore = create<AppStore>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),

  selectedBuildingId: 'bonsa',
  setSelectedBuildingId: (id) => set({ selectedBuildingId: id, selectedZoneId: '', selectedSeatUids: [], focusedSeatUid: null }),

  selectedZoneId: 'bonsa-6f-a',
  setSelectedZoneId: (id) => set({ selectedZoneId: id, selectedSeatUids: [], focusedSeatUid: null }),

  viewStartDate: today,
  viewEndDate: today,
  setViewDates: (start, end) => set({ viewStartDate: start, viewEndDate: end }),

  selectedSeatUids: [],
  toggleSeatSelection: (uid) =>
    set((state) => ({
      selectedSeatUids: state.selectedSeatUids.includes(uid)
        ? state.selectedSeatUids.filter((x) => x !== uid)
        : [...state.selectedSeatUids, uid],
      focusedSeatUid: null,
    })),
  clearSelectedSeats: () => set({ selectedSeatUids: [] }),

  reservationModalOpen: false,
  openReservationModal: () => set({ reservationModalOpen: true }),
  closeReservationModal: () => set({ reservationModalOpen: false }),

  focusedSeatUid: null,
  setFocusedSeatUid: (uid) => set({ focusedSeatUid: uid, selectedSeatUids: [] }),
}))
