import { useNavigate } from 'react-router-dom'
import { QUESTIONS, TOPIC_CONFIG } from '../../data/questions'
import { useCFAStore } from '../../store/useCFAStore'
import { usePlanStore } from '../../store/usePlanStore'
import type { Topic } from '../../types/cfa'

const TOPICS = Object.keys(TOPIC_CONFIG) as Topic[]

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(dateStr)
  exam.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((exam.getTime() - today.getTime()) / 86400000))
}

export function HomePage() {
  const navigate = useNavigate()
  const { records } = useCFAStore()
  const { examDate, topics, setTopicFlag, mocks, setMockFlag, lesOdam1Done, lesOdam2Done, schweser1Done, schweser2Done, setFlag } = usePlanStore()

  const days = daysUntil(examDate)
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7

  const wrong = Object.values(records).filter(r => r.status === 'wrong').length
  const answered = Object.values(records).filter(r => r.status !== 'unanswered').length
  const totalQ = QUESTIONS.length

  // Topic remaining counts from notes
  const IMAGE_TOTALS: Record<Topic, number> = {
    ethics: 167,
    derivatives: 68,
    performance: 33,
    portfolio: 49,
    private_markets: 112,
    asset_allocation: 49,
  }
  const totalRemaining = Object.values(IMAGE_TOTALS).reduce((a, b) => a + b, 0)
  const topicsDone = TOPICS.filter(t => topics[t].firstPassDone).length

  const mocksDone = mocks.filter(m => m.firstPassDone).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">CFA Level 3</p>
              <h1 className="text-2xl font-bold">Study Tracker</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">{days}</p>
              <p className="text-slate-400 text-xs">days left</p>
              <p className="text-slate-500 text-xs mt-0.5">{weeks}주 {remainingDays}일</p>
            </div>
          </div>
          {/* Quick nav */}
          <div className="flex gap-2 mt-4">
            {[
              { label: '📖 1회독', path: '/study' },
              { label: '🔁 오답복습', path: '/review' },
              { label: '📝 모의고사', path: '/mock' },
              { label: '📅 플래너', path: '/plan' },
            ].map(btn => (
              <button
                key={btn.path}
                onClick={() => navigate(btn.path)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-lg transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── 남은 문제 현황 ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">남은 문제 · {totalRemaining}개</h2>
            <span className="text-xs text-slate-400">{topicsDone}/{TOPICS.length} 토픽 완료</span>
          </div>
          <div className="space-y-2">
            {TOPICS.map(topic => {
              const cfg = TOPIC_CONFIG[topic]
              const total = IMAGE_TOTALS[topic]
              const entry = topics[topic]
              return (
                <div key={topic} className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 ${entry.firstPassDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${entry.firstPassDone ? 'text-emerald-700 line-through opacity-60' : 'text-slate-800'}`}>
                      {cfg.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {Object.entries(cfg.counts).map(([y, c]) => `${y}: ${c}`).join(' · ')} = <span className="font-semibold text-slate-600">{total}문제</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CheckBox
                      checked={entry.firstPassDone}
                      onChange={v => setTopicFlag(topic, 'firstPassDone', v)}
                      label="1회독"
                    />
                    <CheckBox
                      checked={entry.wrongReviewDone}
                      onChange={v => setTopicFlag(topic, 'wrongReviewDone', v)}
                      label="오답"
                      color="rose"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── LES & Schweser ────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">LES & 슈웨이져</h2>
          <div className="grid grid-cols-2 gap-2">
            <TaskCard
              title="LES 오답"
              subtitle="~1,176문제 오답"
              items={[
                { label: '1회독', done: lesOdam1Done, onChange: v => setFlag('lesOdam1Done', v) },
                { label: '2회독', done: lesOdam2Done, onChange: v => setFlag('lesOdam2Done', v) },
              ]}
              color="blue"
            />
            <TaskCard
              title="슈웨이져"
              subtitle="전 과목 통독"
              items={[
                { label: '1회독', done: schweser1Done, onChange: v => setFlag('schweser1Done', v) },
                { label: '2회독', done: schweser2Done, onChange: v => setFlag('schweser2Done', v) },
              ]}
              color="violet"
            />
          </div>
        </section>

        {/* ── Mock Exams ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Mock Exams · 14개</h2>
            <span className="text-xs text-slate-400">{mocksDone}/14 1회독 완료</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {mocks.map((m, i) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 px-4 py-2.5 ${i < mocks.length - 1 ? 'border-b border-slate-100' : ''} ${m.firstPassDone ? 'bg-slate-50' : ''}`}
              >
                <span className={`text-xs font-medium min-w-[80px] ${m.year === 2026 ? 'text-blue-600' : 'text-slate-600'}`}>
                  {m.label}
                </span>
                <div className="flex-1" />
                <CheckBox checked={m.firstPassDone} onChange={v => setMockFlag(m.id, 'firstPassDone', v)} label="풀기" />
                <CheckBox checked={m.wrongReview1Done} onChange={v => setMockFlag(m.id, 'wrongReview1Done', v)} label="오답1" color="rose" />
                <CheckBox checked={m.wrongReview2Done} onChange={v => setMockFlag(m.id, 'wrongReview2Done', v)} label="오답2" color="rose" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Practice progress ─────────────────────────── */}
        {answered > 0 && (
          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-700 mb-3">앱 풀이 진행도</h2>
            <div className="flex gap-4 text-center mb-3">
              <div><p className="text-xl font-bold text-slate-800">{answered}</p><p className="text-xs text-slate-400">완료/{totalQ}</p></div>
              <div><p className="text-xl font-bold text-emerald-600">{answered - wrong}</p><p className="text-xs text-slate-400">정답</p></div>
              <div><p className="text-xl font-bold text-rose-500">{wrong}</p><p className="text-xs text-slate-400">오답</p></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full" style={{ width: `${(answered / totalQ) * 100}%` }} />
            </div>
          </section>
        )}

        {/* ── 플래너로 이동 ─────────────────────────────── */}
        <button
          onClick={() => navigate('/plan')}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          📅 달력 플래너 보기 — D-{days}
        </button>
      </div>
    </div>
  )
}

function CheckBox({ checked, onChange, label, color = 'emerald' }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; color?: 'emerald' | 'rose'
}) {
  const active = color === 'rose'
    ? 'bg-rose-500 border-rose-500 text-white'
    : 'bg-emerald-500 border-emerald-500 text-white'
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all ${checked ? active : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
    >
      {checked ? '✓' : '○'} {label}
    </button>
  )
}

function TaskCard({ title, subtitle, items, color }: {
  title: string
  subtitle: string
  items: { label: string; done: boolean; onChange: (v: boolean) => void }[]
  color: 'blue' | 'violet'
}) {
  const allDone = items.every(i => i.done)
  const colorMap = {
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
  }
  return (
    <div className={`bg-white border rounded-xl p-3 ${allDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${colorMap[color]}`} />
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>
      <p className="text-xs text-slate-400 mb-3">{subtitle}</p>
      <div className="flex gap-2">
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => item.onChange(!item.done)}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {item.done ? '✓' : '○'} {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
