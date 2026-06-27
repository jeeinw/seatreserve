import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../../data/questions'
import { useCFAStore } from '../../store/useCFAStore'
import { QuestionCard } from '../../components/cfa/QuestionCard'

export function ReviewPage() {
  const navigate = useNavigate()
  const { records } = useCFAStore()

  const wrongQuestions = QUESTIONS.filter(q => records[q.id]?.status === 'wrong')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-slate-800">오답이 없습니다!</h2>
          <p className="text-slate-500 text-sm">1회독을 먼저 완료하세요.</p>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 underline">홈으로</button>
        </div>
      </div>
    )
  }

  const current = wrongQuestions[currentIndex]
  const pct = ((currentIndex + 1) / wrongQuestions.length) * 100

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600">
            ← 홈
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-rose-700">오답 복습</span>
              <span className="text-xs text-slate-400">{currentIndex + 1} / {wrongQuestions.length}</span>
            </div>
            <div className="mt-1.5 h-1 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-rose-400 font-medium">{wrongQuestions.length}개 오답</span>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {current && (
          <QuestionCard
            question={current}
            showResult={false}
            savedRecord={undefined}
            onNext={() => setCurrentIndex(i => Math.min(i + 1, wrongQuestions.length - 1))}
            onPrev={() => setCurrentIndex(i => Math.max(i - 1, 0))}
            isFirst={currentIndex === 0}
            isLast={currentIndex === wrongQuestions.length - 1}
            isReview
          />
        )}
      </div>
    </div>
  )
}
