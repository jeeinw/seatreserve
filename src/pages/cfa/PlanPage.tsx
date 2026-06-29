import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '../../store/usePlanStore'

// ── Study plan generation ────────────────────────────────────────────────────

interface DayPlan {
  date: string       // ISO
  phase: number
  tasks: TaskItem[]
}

interface TaskItem {
  type: 'first_pass' | 'les_odam1' | 'les_odam2' | 'schweser1' | 'schweser2' | 'mock_odam1' | 'mock_odam2' | 'rest'
  label: string
  count?: number
  color: string
  bg: string
}

const TASK_STYLE: Record<TaskItem['type'], { color: string; bg: string }> = {
  first_pass: { color: 'text-slate-700', bg: 'bg-slate-200' },
  les_odam1:  { color: 'text-blue-700',  bg: 'bg-blue-100' },
  les_odam2:  { color: 'text-blue-700',  bg: 'bg-blue-200' },
  schweser1:  { color: 'text-violet-700', bg: 'bg-violet-100' },
  schweser2:  { color: 'text-violet-700', bg: 'bg-violet-200' },
  mock_odam1: { color: 'text-rose-700',   bg: 'bg-rose-100' },
  mock_odam2: { color: 'text-rose-700',   bg: 'bg-rose-200' },
  rest:       { color: 'text-slate-400',  bg: 'bg-slate-100' },
}

function buildPlan(startDate: string, examDate: string): DayPlan[] {
  const start = new Date(startDate)
  const exam  = new Date(examDate)
  const totalDays = Math.max(0, Math.round((exam.getTime() - start.getTime()) / 86400000))

  // Problem counts
  const REMAINING_FIRST_PASS = 478   // from notes
  const LES_ODAM = Math.round(1176 * 0.35)  // ~411
  const MOCK_ODAM = 14 * 30                  // ~420

  // Phase boundaries (as day offsets from start)
  const p1End = Math.round(totalDays * 0.25)  // 1회독
  const p2End = Math.round(totalDays * 0.50)  // LES오답1 + Schweser1
  const p3End = Math.round(totalDays * 0.70)  // LES오답2 + Schweser2
  const p4End = Math.round(totalDays * 0.85)  // Mock 오답1
  // rest: Mock 오답2 until exam

  const p1Days = Math.max(1, p1End)
  const p2Days = Math.max(1, p2End - p1End)
  const p3Days = Math.max(1, p3End - p2End)
  const p4Days = Math.max(1, p4End - p3End)
  const p5Days = Math.max(1, totalDays - p4End)

  const plans: DayPlan[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const dow = d.getDay()   // 0=Sun
    const isWeekend = dow === 0 || dow === 6

    let phase = 1
    const tasks: TaskItem[] = []

    if (i < p1End) {
      // Phase 1: 1회독
      phase = 1
      const daily = Math.ceil(REMAINING_FIRST_PASS / p1Days)
      tasks.push({
        type: 'first_pass',
        label: '1회독',
        count: daily,
        ...TASK_STYLE.first_pass,
      })
    } else if (i < p2End) {
      // Phase 2: LES오답1 + Schweser1
      phase = 2
      const daily = Math.ceil(LES_ODAM / p2Days)
      tasks.push({ type: 'les_odam1',  label: 'LES 오답 1회독', count: daily,  ...TASK_STYLE.les_odam1 })
      tasks.push({ type: 'schweser1',  label: '슈웨이져 1회독',              ...TASK_STYLE.schweser1 })
    } else if (i < p3End) {
      // Phase 3: LES오답2 + Schweser2
      phase = 3
      const daily = Math.ceil(LES_ODAM / p3Days)
      tasks.push({ type: 'les_odam2',  label: 'LES 오답 2회독', count: daily,  ...TASK_STYLE.les_odam2 })
      tasks.push({ type: 'schweser2',  label: '슈웨이져 2회독',              ...TASK_STYLE.schweser2 })
    } else if (i < p4End) {
      // Phase 4: Mock 오답1
      phase = 4
      const daily = Math.ceil(MOCK_ODAM / p4Days)
      tasks.push({ type: 'mock_odam1', label: 'Mock 오답 1회독', count: daily, ...TASK_STYLE.mock_odam1 })
      if (isWeekend) {
        tasks.push({ type: 'mock_odam1', label: '+ Mock 풀기', ...TASK_STYLE.mock_odam1 })
      }
    } else {
      // Phase 5: Mock 오답2 + final
      phase = 5
      const daily = Math.ceil(MOCK_ODAM / p5Days)
      tasks.push({ type: 'mock_odam2', label: 'Mock 오답 2회독', count: daily, ...TASK_STYLE.mock_odam2 })
      if (isWeekend) {
        tasks.push({ type: 'rest', label: '최종 정리', ...TASK_STYLE.rest })
      }
    }

    plans.push({ date: dateStr, phase, tasks })
  }

  return plans
}

// ── Calendar grid ────────────────────────────────────────────────────────────

function getMonthDays(year: number, month: number) {
  const days: (string | null)[] = []
  const firstDay = new Date(year, month - 1, 1).getDay()
  const totalDays = new Date(year, month, 0).getDate()
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= totalDays; d++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
}

const PHASE_LABELS = ['', '1회독', 'LES오답1+슈웨1', 'LES오답2+슈웨2', 'Mock 오답1', 'Mock 오답2']
const PHASE_COLORS = ['', 'bg-slate-200', 'bg-blue-100', 'bg-blue-200', 'bg-rose-100', 'bg-rose-200']
const PHASE_TEXT   = ['', 'text-slate-700', 'text-blue-700', 'text-blue-800', 'text-rose-700', 'text-rose-800']

// ── Component ────────────────────────────────────────────────────────────────

export function PlanPage() {
  const navigate = useNavigate()
  const { examDate, setExamDate, completedDays, toggleDayComplete } = usePlanStore()

  const today = new Date().toISOString().slice(0, 10)
  const plan = buildPlan(today, examDate)
  const planMap: Record<string, DayPlan> = {}
  plan.forEach(p => { planMap[p.date] = p })

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingExam, setEditingExam] = useState(false)
  const [tempExam, setTempExam] = useState(examDate)

  const daysLeft = plan.length

  // Months to show: current + next 2
  const todayDate = new Date()
  const months: { year: number; month: number }[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(todayDate.getFullYear(), todayDate.getMonth() + i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  const selectedPlan = selectedDay ? planMap[selectedDay] : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors">
            ← 홈
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Study Planner</h1>
          </div>
          <div className="text-right">
            {editingExam ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempExam}
                  onChange={e => setTempExam(e.target.value)}
                  className="text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
                />
                <button
                  onClick={() => { setExamDate(tempExam); setEditingExam(false) }}
                  className="text-xs bg-amber-500 px-2 py-1 rounded"
                >
                  저장
                </button>
              </div>
            ) : (
              <button onClick={() => { setTempExam(examDate); setEditingExam(true) }} className="text-right">
                <p className="text-amber-400 font-bold text-lg">D-{daysLeft}</p>
                <p className="text-slate-500 text-xs">시험일 {examDate} ✏️</p>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Phase legend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">학습 플랜 (D-{daysLeft}일)</h2>
          <div className="space-y-2">
            {[1,2,3,4,5].map(p => {
              const phaseCount = plan.filter(d => d.phase === p).length
              const doneDays = plan.filter(d => d.phase === p && completedDays.includes(d.date)).length
              return (
                <div key={p} className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PHASE_COLORS[p]} ${PHASE_TEXT[p]}`}>
                    Phase {p}
                  </span>
                  <span className="text-xs text-slate-600 flex-1">{PHASE_LABELS[p]}</span>
                  <span className="text-xs text-slate-400">{phaseCount}일</span>
                  <span className="text-xs font-medium text-emerald-600">{doneDays}✓</span>
                </div>
              )
            })}
          </div>

          {/* Daily target summary */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-bold text-slate-700">{Math.ceil(478 / Math.max(1, plan.filter(d => d.phase === 1).length))}</p>
              <p className="text-xs text-slate-400">문제/일 (1회독)</p>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-700">{Math.ceil(411 / Math.max(1, plan.filter(d => d.phase === 2).length))}</p>
              <p className="text-xs text-slate-400">문제/일 (LES)</p>
            </div>
            <div>
              <p className="text-sm font-bold text-rose-600">{Math.ceil(420 / Math.max(1, plan.filter(d => d.phase === 4).length))}</p>
              <p className="text-xs text-slate-400">문제/일 (Mock)</p>
            </div>
          </div>
        </div>

        {/* Calendar months */}
        {months.map(({ year, month }) => {
          const days = getMonthDays(year, month)
          const monthName = new Date(year, month - 1, 1).toLocaleString('ko-KR', { month: 'long', year: 'numeric' })
          return (
            <div key={`${year}-${month}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">{monthName}</h3>
              </div>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['일','월','화','수','목','금','토'].map(d => (
                  <div key={d} className="text-center text-xs text-slate-400 py-1.5">{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {days.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={`empty-${idx}`} className="aspect-square border-b border-r border-slate-50" />
                  }
                  const dp = planMap[dateStr]
                  const isToday = dateStr === today
                  const isExam = dateStr === examDate
                  const isDone = completedDays.includes(dateStr)
                  const isPast = dateStr < today
                  const isSelected = selectedDay === dateStr
                  const phase = dp?.phase ?? 0

                  const bgColor = isExam
                    ? 'bg-amber-400'
                    : isDone
                    ? 'bg-emerald-100'
                    : dp
                    ? PHASE_COLORS[phase]
                    : isPast ? 'bg-slate-50' : ''

                  const textColor = isExam
                    ? 'text-white font-bold'
                    : isPast && !isDone
                    ? 'text-slate-300'
                    : PHASE_TEXT[phase] || 'text-slate-400'

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className={`aspect-square border-b border-r border-white/50 flex flex-col items-center justify-start pt-1 relative text-center transition-all hover:brightness-95 ${bgColor} ${isSelected ? 'ring-2 ring-slate-700 ring-inset' : ''}`}
                    >
                      <span className={`text-xs font-medium leading-none ${textColor} ${isToday ? 'bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]' : ''}`}>
                        {isExam ? '🎯' : parseInt(dateStr.slice(-2))}
                      </span>
                      {isDone && (
                        <span className="text-[8px] text-emerald-600 mt-0.5">✓</span>
                      )}
                      {dp && !isDone && !isExam && (
                        <span className={`text-[8px] mt-0.5 leading-none ${PHASE_TEXT[phase]}`}>
                          P{phase}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Selected day detail */}
        {selectedDay && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sticky bottom-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">{selectedDay}</h3>
              <button
                onClick={() => toggleDayComplete(selectedDay)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${completedDays.includes(selectedDay) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {completedDays.includes(selectedDay) ? '✓ 완료' : '완료 체크'}
              </button>
            </div>
            {selectedPlan ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-2">Phase {selectedPlan.phase} — {PHASE_LABELS[selectedPlan.phase]}</p>
                {selectedPlan.tasks.map((task, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${task.bg}`}>
                    <span className={`text-sm font-medium ${task.color}`}>{task.label}</span>
                    {task.count && (
                      <span className={`text-xs font-bold ${task.color}`}>{task.count}문제</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {selectedDay < today ? '이미 지난 날짜입니다.' : selectedDay === examDate ? '🎯 시험일!' : '플랜 범위 밖입니다.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
