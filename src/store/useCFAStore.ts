import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnswerStatus, QuestionRecord, Topic } from '../types/cfa'

interface CFAStore {
  records: Record<string, QuestionRecord>
  setRecord: (questionId: string, status: AnswerStatus, selectedOption?: number) => void
  resetTopic: (topic: Topic) => void
  resetAll: () => void
  getRecord: (questionId: string) => QuestionRecord | undefined
  getWrongIds: () => string[]
  getCorrectIds: () => string[]
  getAnsweredIds: () => string[]
}

export const useCFAStore = create<CFAStore>()(
  persist(
    (set, get) => ({
      records: {},

      setRecord: (questionId, status, selectedOption) => {
        set(state => ({
          records: {
            ...state.records,
            [questionId]: {
              questionId,
              status,
              selectedOption,
              timestamp: Date.now(),
            },
          },
        }))
      },

      resetTopic: (topic) => {
        // Need question IDs for the topic — imported in components
        set(state => {
          const next = { ...state.records }
          Object.keys(next).forEach(id => {
            if (id.startsWith(topicPrefix(topic))) delete next[id]
          })
          return { records: next }
        })
      },

      resetAll: () => set({ records: {} }),

      getRecord: (questionId) => get().records[questionId],

      getWrongIds: () =>
        Object.values(get().records)
          .filter(r => r.status === 'wrong')
          .map(r => r.questionId),

      getCorrectIds: () =>
        Object.values(get().records)
          .filter(r => r.status === 'correct')
          .map(r => r.questionId),

      getAnsweredIds: () =>
        Object.values(get().records)
          .filter(r => r.status !== 'unanswered')
          .map(r => r.questionId),
    }),
    { name: 'cfa-study-store' }
  )
)

function topicPrefix(topic: Topic): string {
  const map: Record<Topic, string> = {
    ethics: 'eth-',
    derivatives: 'der-',
    performance: 'perf-',
    portfolio: 'port-',
    private_markets: 'priv-',
    asset_allocation: 'aa-',
  }
  return map[topic]
}
