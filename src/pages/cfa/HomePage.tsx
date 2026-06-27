import { useNavigate } from 'react-router-dom'
import { QUESTIONS, TOPIC_CONFIG } from '../../data/questions'
import { useCFAStore } from '../../store/useCFAStore'
import type { Topic } from '../../types/cfa'

const TOPICS = Object.keys(TOPIC_CONFIG) as Topic[]

export function HomePage() {
  const navigate = useNavigate()
  const { records, resetAll } = useCFAStore()

  const totalQuestions = QUESTIONS.length
  const answered = Object.values(records).filter(r => r.status !== 'unanswered').length
  const correct = Object.values(records).filter(r => r.status === 'correct').length
  const wrong = Object.values(records).filter(r => r.status === 'wrong').length

  const overallProgress = totalQuestions > 0 ? (answered / totalQuestions) * 100 : 0
  const accuracy = answered > 0 ? (correct / answered) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">CFA Level 3 Practice</h1>
            <p className="text-xs text-slate-500 mt-0.5">2020–2026 Mock Exams · 14 Exams</p>
          </div>
          <button
            onClick={() => navigate('/mock')}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Mock Exam
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">전체 진행도</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Stat label="완료" value={answered} total={totalQuestions} color="text-slate-800" />
            <Stat label="정답" value={correct} total={answered} color="text-emerald-600" />
            <Stat label="오답" value={wrong} total={answered} color="text-rose-500" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>1회독 진행도</span>
              <span>{overallProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          {answered > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              정답률: <span className={accuracy >= 70 ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>{accuracy.toFixed(0)}%</span>
              {accuracy >= 70 ? ' 👍 Good pace!' : ' — keep going!'}
            </p>
          )}
        </div>

        {/* Study Modes */}
        <div className="grid grid-cols-3 gap-3">
          <ModeCard
            title="1회독"
            subtitle="First Pass"
            description="전체 문제 순서대로"
            icon="📖"
            onClick={() => navigate('/study')}
            color="bg-slate-800"
          />
          <ModeCard
            title="오답 복습"
            subtitle="Review"
            description={`오답 ${wrong}개 집중 복습`}
            icon="🔁"
            onClick={() => navigate('/review')}
            color="bg-rose-500"
            disabled={wrong === 0}
          />
          <ModeCard
            title="모의고사"
            subtitle="Mock Exam"
            description="연도별 풀기"
            icon="📝"
            onClick={() => navigate('/mock')}
            color="bg-blue-600"
          />
        </div>

        {/* Topics */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">토픽별 진행도</h2>
          <div className="space-y-2">
            {TOPICS.map(topic => {
              const cfg = TOPIC_CONFIG[topic]
              const qs = QUESTIONS.filter(q => q.topic === topic)
              const done = qs.filter(q => records[q.id]?.status !== 'unanswered' && records[q.id]).length
              const correct_t = qs.filter(q => records[q.id]?.status === 'correct').length
              const wrong_t = qs.filter(q => records[q.id]?.status === 'wrong').length
              const pct = qs.length > 0 ? (done / qs.length) * 100 : 0

              // Total from image counts
              const imageCounts = cfg.counts
              const imageTotal = Object.values(imageCounts).reduce((a, b) => a + b, 0)

              return (
                <button
                  key={topic}
                  onClick={() => navigate(`/study/${topic}`)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                      <span className="text-sm font-medium text-slate-800">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {wrong_t > 0 && (
                        <span className="text-rose-500 font-medium">오답 {wrong_t}</span>
                      )}
                      <span className="font-medium text-slate-700">
                        실제 {imageTotal}문제
                      </span>
                      <span className="text-slate-400">샘플 {qs.length}Q</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                    <span>{Object.entries(imageCounts).map(([y, c]) => `${y}: ${c}문제`).join(' · ')}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reset */}
        {answered > 0 && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                if (confirm('모든 진행 상황을 초기화할까요?')) resetAll()
              }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              전체 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label} / {total}</p>
    </div>
  )
}

function ModeCard({
  title, subtitle, description, icon, onClick, color, disabled,
}: {
  title: string; subtitle: string; description: string; icon: string
  onClick: () => void; color: string; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-md'} ${color} text-white rounded-2xl p-4 text-left transition-all`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 font-bold text-base">{title}</p>
      <p className="text-xs opacity-80">{subtitle}</p>
      <p className="text-xs opacity-70 mt-1">{description}</p>
    </button>
  )
}
