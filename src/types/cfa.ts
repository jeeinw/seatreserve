export type Topic =
  | 'ethics'
  | 'derivatives'
  | 'performance'
  | 'portfolio'
  | 'private_markets'
  | 'asset_allocation'

export type StudyMode = 'first_pass' | 'review' | 'mock'

export type AnswerStatus = 'correct' | 'wrong' | 'unanswered'

export interface Question {
  id: string
  topic: Topic
  year: number
  vignette?: string
  question: string
  options: string[]
  answer: number // 0-indexed
  explanation: string
}

export interface QuestionRecord {
  questionId: string
  status: AnswerStatus
  selectedOption?: number
  timestamp?: number
}

export interface TopicProgress {
  topic: Topic
  total: number
  answered: number
  correct: number
  wrong: number
}

export interface StudySession {
  mode: StudyMode
  topic?: Topic
  questionIds: string[]
  currentIndex: number
  startTime: number
}
