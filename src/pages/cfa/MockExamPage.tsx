import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS, MOCK_EXAMS } from '../../data/questions'
import { useCFAStore } from '../../store/useCFAStore'
import { QuestionCard } from '../../components/cfa/QuestionCard'

type Phase = 'select' | 'exam' | 'result'

// Shuffle deterministically per year
function shuffleForYear(arr: string[], year: number): string[] {
  const a = [...arr]
  let seed = year
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(seed) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MockExamPage() {
  const navigate = useNavigate()
  const { records, setRecord } = useCFAStore()
  const [phase, setPhase] = useState<Phase>('select')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionRecords, setSessionRecords] = useState<Record<string, { selected: number; correct: boolean }>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // 3 min per question for mock
  const SECONDS_PER_Q = 180

  const startExam = (year: number) => {
    const qs = QUESTIONS.filter(q => q.year === year)
    const ids = shuffleForYear(qs.map(q => q.id), year)
    setSelectedYear(year)
    setQuestionIds(ids)
    setCurrentIndex(0)
    setSessionRecords({})
    setTimeLeft(ids.length * SECONDS_PER_Q)
    setTimerActive(true)
    setPhase('exam')
  }

  const endExam = useCallback(() => {
    setTimerActive(false)
    setPhase('result')
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timerActive && timeLeft <= 0) endExam()
      return
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [timerActive, timeLeft, endExam])

  const handleAnswer = (qId: string, selected: number, correct: boolean) => {
    setSessionRecords(prev => ({ ...prev, [qId]: { selected, correct } }))
    setRecord(qId, correct ? 'correct' : 'wrong', selected)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // ─── SELECT PHASE ─────────────────────────────────────────────────────────
  if (phase === 'select') {
    const years = [...new Set(MOCK_EXAMS.map(e => e.year))].sort()
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600">← 홈</button>
            <h1 className="text-lg font-bold text-slate-800">모의고사</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <p className="text-sm text-slate-500">
            연도를 선택하면 해당 연도 문제로 타임드 모의고사를 시작합니다.<br/>
            문제당 3분 (전체 진행 시간 표시).
          </p>
          <div className="grid grid-cols-2 gap-3">
            {years.map(year => {
              const count = QUESTIONS.filter(q => q.year === year).length
              const done = QUESTIONS.filter(q => q.year === year && records[q.id]?.status !== 'unanswered' && records[q.id]).length
              const isCompleted = count > 0 && done === count
              return (
                <button
                  key={year}
                  onClick={() => startExam(year)}
                  disabled={count === 0}
                  className={`bg-white border rounded-xl p-4 text-left transition-all hover:shadow-md hover:border-slate-300 ${count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{year}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{count > 0 ? `${count}문제 샘플` : '준비 중'}</p>
                    </div>
                    {isCompleted && <span className="text-green-500 text-lg">✓</span>}
                    {done > 0 && !isCompleted && (
                      <span className="text-xs text-slate-400">{done}/{count}</span>
                    )}
                  </div>
                  {year >= 2026 && (
                    <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      2026년 5월
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">📌 실제 문제 수 (노트 기준)</p>
            <p className="text-xs leading-5">
              · 2020~2025: 10개 모의고사<br/>
              · 2026년 5월: 4개 모의고사 (A·B·C·D)<br/>
              · 총 14개 모의고사
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── EXAM PHASE ───────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const current = QUESTIONS.find(q => q.id === questionIds[currentIndex])
    const timeWarning = timeLeft < 300
    const answered = questionIds.filter(id => sessionRecords[id]).length
    const pct = (answered / questionIds.length) * 100

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">{selectedYear} 모의고사</span>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-bold ${timeWarning ? 'text-rose-500' : 'text-slate-600'}`}>
                  ⏱ {formatTime(timeLeft)}
                </span>
                <button
                  onClick={endExam}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  제출
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-400">{currentIndex + 1}/{questionIds.length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {current && (
            <QuestionCard
              question={current}
              showResult={!!sessionRecords[current.id]}
              savedRecord={sessionRecords[current.id] ? {
                questionId: current.id,
                status: sessionRecords[current.id].correct ? 'correct' : 'wrong',
                selectedOption: sessionRecords[current.id].selected,
              } : undefined}
              onNext={() => setCurrentIndex(i => Math.min(i + 1, questionIds.length - 1))}
              onPrev={() => setCurrentIndex(i => Math.max(i - 1, 0))}
              onAnswer={handleAnswer}
              isFirst={currentIndex === 0}
              isLast={currentIndex === questionIds.length - 1}
              isMock
            />
          )}
        </div>
      </div>
    )
  }

  // ─── RESULT PHASE ─────────────────────────────────────────────────────────
  const total = questionIds.length
  const answered2 = Object.keys(sessionRecords).length
  const correctCount = Object.values(sessionRecords).filter(r => r.correct).length
  const score = answered2 > 0 ? (correctCount / answered2) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-12 text-center space-y-6">
        <div className="text-5xl">{score >= 70 ? '🎯' : score >= 50 ? '📊' : '📖'}</div>
        <h1 className="text-2xl font-bold text-slate-800">{selectedYear} 모의고사 완료</h1>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="text-5xl font-bold text-slate-800">{score.toFixed(0)}%</div>
          <p className="text-slate-500 text-sm">
            {correctCount} / {answered2} 정답 ({total - answered2}문제 미응답)
          </p>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          {score >= 70 ? (
            <p className="text-emerald-600 text-sm font-medium">Pass 기준 초과! 잘하고 있어요.</p>
          ) : (
            <p className="text-rose-500 text-sm font-medium">오답 복습 후 재시도를 권장합니다.</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/review')}
            className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-rose-600 transition-colors"
          >
            오답 복습
          </button>
          <button
            onClick={() => setPhase('select')}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            다른 연도
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}
