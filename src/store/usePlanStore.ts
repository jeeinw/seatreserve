import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Topic } from '../types/cfa'

export type MockYear = 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026

export interface MockEntry {
  id: string   // e.g. '2020-1', '2026-A'
  year: MockYear
  label: string
  firstPassDone: boolean
  wrongReview1Done: boolean
  wrongReview2Done: boolean
}

export interface TopicEntry {
  topic: Topic
  firstPassDone: boolean
  wrongReviewDone: boolean
}

interface PlanStore {
  examDate: string  // ISO date string
  setExamDate: (d: string) => void

  topics: Record<Topic, TopicEntry>
  setTopicFlag: (topic: Topic, flag: keyof Omit<TopicEntry, 'topic'>, value: boolean) => void

  mocks: MockEntry[]
  setMockFlag: (id: string, flag: keyof Omit<MockEntry, 'id' | 'year' | 'label'>, value: boolean) => void

  // LES & Schweser manual trackers
  lesOdam1Done: boolean
  lesOdam2Done: boolean
  schweser1Done: boolean
  schweser2Done: boolean
  setFlag: (key: 'lesOdam1Done' | 'lesOdam2Done' | 'schweser1Done' | 'schweser2Done', value: boolean) => void

  completedDays: string[]  // ISO date strings of fully-checked days
  toggleDayComplete: (date: string) => void
}

const DEFAULT_TOPICS: Record<Topic, TopicEntry> = {
  ethics: { topic: 'ethics', firstPassDone: false, wrongReviewDone: false },
  derivatives: { topic: 'derivatives', firstPassDone: false, wrongReviewDone: false },
  performance: { topic: 'performance', firstPassDone: false, wrongReviewDone: false },
  portfolio: { topic: 'portfolio', firstPassDone: false, wrongReviewDone: false },
  private_markets: { topic: 'private_markets', firstPassDone: false, wrongReviewDone: false },
  asset_allocation: { topic: 'asset_allocation', firstPassDone: false, wrongReviewDone: false },
}

const DEFAULT_MOCKS: MockEntry[] = [
  { id: '2020-1', year: 2020, label: '2020 Mock', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2021-1', year: 2021, label: '2021 Mock #1', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2021-2', year: 2021, label: '2021 Mock #2', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2022-1', year: 2022, label: '2022 Mock #1', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2022-2', year: 2022, label: '2022 Mock #2', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2023-1', year: 2023, label: '2023 Mock #1', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2023-2', year: 2023, label: '2023 Mock #2', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2024-1', year: 2024, label: '2024 Mock #1', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2024-2', year: 2024, label: '2024 Mock #2', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2025-1', year: 2025, label: '2025 Mock', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2026-A', year: 2026, label: '2026년 5월 Mock A', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2026-B', year: 2026, label: '2026년 5월 Mock B', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2026-C', year: 2026, label: '2026년 5월 Mock C', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
  { id: '2026-D', year: 2026, label: '2026년 5월 Mock D', firstPassDone: false, wrongReview1Done: false, wrongReview2Done: false },
]

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      examDate: '2026-08-25',
      setExamDate: (d) => set({ examDate: d }),

      topics: DEFAULT_TOPICS,
      setTopicFlag: (topic, flag, value) =>
        set(s => ({ topics: { ...s.topics, [topic]: { ...s.topics[topic], [flag]: value } } })),

      mocks: DEFAULT_MOCKS,
      setMockFlag: (id, flag, value) =>
        set(s => ({
          mocks: s.mocks.map(m => m.id === id ? { ...m, [flag]: value } : m),
        })),

      lesOdam1Done: false,
      lesOdam2Done: false,
      schweser1Done: false,
      schweser2Done: false,
      setFlag: (key, value) => set({ [key]: value }),

      completedDays: [],
      toggleDayComplete: (date) =>
        set(s => ({
          completedDays: s.completedDays.includes(date)
            ? s.completedDays.filter(d => d !== date)
            : [...s.completedDays, date],
        })),
    }),
    { name: 'cfa-plan-store' }
  )
)
