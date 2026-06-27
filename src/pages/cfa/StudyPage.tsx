import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QUESTIONS, TOPIC_CONFIG } from '../../data/questions'
import { useCFAStore } from '../../store/useCFAStore'
import type { Question, Topic } from '../../types/cfa'
import { QuestionCard } from '../../components/cfa/QuestionCard'

export function StudyPage() {
  const { topic } = useParams<{ topic?: string }>()
  const navigate = useNavigate()
  const { records } = useCFAStore()

  const questions: Question[] = topic
    ? QUESTIONS.filter(q => q.topic === topic)
    : QUESTIONS

  // Find first unanswered or start from 0
  const firstUnanswered = questions.findIndex(q => !records[q.id] || records[q.id].status === 'unanswered')
  const [currentIndex, setCurrentIndex] = useState(firstUnanswered >= 0 ? firstUnanswered : 0)

  useEffect(() => {
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
  }, [topic]) // eslint-disable-line

  const current = questions[currentIndex]
  const done = questions.filter(q => records[q.id] && records[q.id].status !== 'unanswered').length
  const pct = questions.length > 0 ? (done / questions.length) * 100 : 0

  const cfg = topic ? TOPIC_CONFIG[topic as Topic] : null
  const label = cfg ? cfg.label : '전체 문제'

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1)
  }
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">문제가 없습니다.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-blue-600 underline">홈으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors">
            ← 홈
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <span className="text-xs text-slate-400">{currentIndex + 1} / {questions.length}</span>
            </div>
            <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-slate-500 min-w-[36px] text-right">{pct.toFixed(0)}%</span>
        </div>
      </header>

      {/* Topic selector row */}
      {!topic && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
            {(Object.keys(TOPIC_CONFIG) as Topic[]).map(t => {
              const cfg = TOPIC_CONFIG[t]
              const qs = QUESTIONS.filter(q => q.topic === t)
              const d = qs.filter(q => records[q.id] && records[q.id].status !== 'unanswered').length
              return (
                <button
                  key={t}
                  onClick={() => navigate(`/study/${t}`)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.border} ${cfg.bgLight} ${cfg.textColor}`}
                >
                  {cfg.label.split(' ')[0]} {d}/{qs.length}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {current && (
          <QuestionCard
            question={current}
            showResult={!!records[current.id] && records[current.id].status !== 'unanswered'}
            savedRecord={records[current.id]}
            onNext={goNext}
            onPrev={goPrev}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
          />
        )}
      </div>
    </div>
  )
}
