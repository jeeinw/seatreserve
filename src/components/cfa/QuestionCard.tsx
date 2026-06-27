import { useState } from 'react'
import type { Question, QuestionRecord } from '../../types/cfa'
import { useCFAStore } from '../../store/useCFAStore'

interface Props {
  question: Question
  showResult: boolean
  savedRecord: QuestionRecord | undefined
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
  onAnswer?: (qId: string, selected: number, correct: boolean) => void
  isMock?: boolean
  isReview?: boolean
}

export function QuestionCard({ question, showResult, savedRecord, onNext, onPrev, isFirst, isLast, onAnswer, isMock, isReview }: Props) {
  const { setRecord } = useCFAStore()
  const [selected, setSelected] = useState<number | undefined>(savedRecord?.selectedOption)
  const [revealed, setRevealed] = useState(showResult)

  // Reset when question changes
  const [prevId, setPrevId] = useState(question.id)
  if (question.id !== prevId) {
    setPrevId(question.id)
    setSelected(savedRecord?.selectedOption)
    setRevealed(showResult)
  }

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelected(idx)
  }

  const handleSubmit = () => {
    if (selected === undefined) return
    const correct = selected === question.answer
    const status = correct ? 'correct' : 'wrong'
    if (!isMock) {
      setRecord(question.id, status, selected)
    }
    if (onAnswer) {
      onAnswer(question.id, selected, correct)
    }
    setRevealed(true)
  }

  const isCorrect = revealed && selected === question.answer
  const isWrong = revealed && selected !== undefined && selected !== question.answer

  return (
    <div className="space-y-4">
      {/* Year + Topic badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          {question.year}
        </span>
        {isReview && (
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
            오답 복습
          </span>
        )}
        {isMock && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            모의고사
          </span>
        )}
      </div>

      {/* Vignette */}
      {question.vignette && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Vignette</p>
          <p className="text-sm text-slate-700 leading-relaxed">{question.vignette}</p>
        </div>
      )}

      {/* Question */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-800 leading-relaxed">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          let style = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          if (selected === idx && !revealed) {
            style = 'border-blue-500 bg-blue-50 text-blue-800'
          }
          if (revealed) {
            if (idx === question.answer) {
              style = 'border-emerald-500 bg-emerald-50 text-emerald-800'
            } else if (selected === idx && idx !== question.answer) {
              style = 'border-rose-400 bg-rose-50 text-rose-700'
            } else {
              style = 'border-slate-100 bg-slate-50 text-slate-400'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition-all flex items-start gap-3 ${style} ${!revealed ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                {revealed && idx === question.answer ? '✓' : revealed && selected === idx ? '✗' : String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Submit */}
      {!revealed && (
        <button
          onClick={handleSubmit}
          disabled={selected === undefined}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
        >
          제출
        </button>
      )}

      {/* Result & Explanation */}
      {revealed && (
        <div className={`border rounded-xl p-4 space-y-2 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
            <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isCorrect ? '정답!' : `오답 — 정답: ${String.fromCharCode(65 + question.answer)}`}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="flex-1 py-2.5 bg-slate-800 rounded-xl text-sm text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
        >
          다음 →
        </button>
      </div>
    </div>
  )
}
