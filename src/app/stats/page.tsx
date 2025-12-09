"use client"
import * as React from "react"
import { BackButton } from "@/components/ui/back-button"
import { SectionHeader } from "@/components/ui/section-header"

type HistoryEntry = {
  id: number
  ritual: { id: number; name: string; type: string; duration?: number }
  energy: number
  doneAt: string
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }

export default function StatsPage() {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([])
  const [filter, setFilter] = React.useState<string>("все")
  const [period, setPeriod] = React.useState<"week"|"month">("week")

  React.useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("history") || "[]") as HistoryEntry[]
      setEntries(data)
    } catch { setEntries([]) }
  }, [])

  const filtered = React.useMemo(() => {
    return filter === "все" ? entries : entries.filter(e => e.ritual.type === filter)
  }, [entries, filter])

  const count = filtered.length
  const avgEnergy = filtered.length ? Math.round((filtered.reduce((s,e)=>s+e.energy,0)/filtered.length)*10)/10 : 0

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const leadingNulls = Array.from({ length: (start.getDay() === 0 ? 6 : start.getDay() - 1) }).map(() => null)
  const monthDays = Array.from({ length: end.getDate() }, (_, i) => i + 1)
  const marks = new Set(
    filtered.map(e => startOfDay(new Date(e.doneAt)).getTime())
  )

  const chartDays = React.useMemo(() => {
    const days = period === "week" ? 7 : 30
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
      const key = startOfDay(d).getTime()
      const dayEntries = filtered.filter(e => startOfDay(new Date(e.doneAt)).getTime() === key)
      const avg = dayEntries.length ? dayEntries.reduce((s,e)=>s+e.energy,0)/dayEntries.length : 0
      return { label: `${d.getDate()}.${(d.getMonth()+1).toString().padStart(2,'0')}`, value: avg }
    })
  }, [filtered, period])

  const maxValue = Math.max(5, ...chartDays.map(c=>c.value))

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
          <div className="flex gap-2">
            <select className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={filter} onChange={(e)=>setFilter(e.target.value)} aria-label="Фильтр по типу">
              {['все','медитация','дыхание','аффирмация','очищение','энергетика'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg黑/70" value={period} onChange={(e)=>setPeriod(e.target.value as any)} aria-label="Период графика">
              <option value="week">неделя</option>
              <option value="month">месяц</option>
            </select>
          </div>
        </div>
        <SectionHeader title="История / Статистика" subtitle="Прогресс практик и энергия" className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Календарь</div>
            <div className="grid grid-cols-7 gap-2">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => (
                <div key={d} className="text-center text-xs sm:text-sm opacity-70">{d}</div>
              ))}
              {leadingNulls.map((_,i)=>(<div key={`n-${i}`} className="h-10 sm:h-12" />))}
              {monthDays.map((d) => {
                const dt = new Date(year, month, d)
                const key = startOfDay(dt).getTime()
                const active = marks.has(key)
                return (
                  <div key={d} className={`h-10 sm:h-12 rounded-xl border border-black/10 dark:border-white/20 flex items-center justify-center ${active?"bg-gradient-to-r from-amber-500 to-pink-500 text-white":"bg-white/90 dark:bg-black/60"}`}>
                    <span>{d}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Энергия за {period === 'week' ? 'неделю' : 'месяц'}</div>
            <svg className="w-full h-40 sm:h-48" viewBox={`0 0 ${chartDays.length*24} ${maxValue*10}`}>
              {chartDays.map((c, i) => {
                const h = (c.value/ maxValue) * (maxValue*10)
                const x = i*24 + 6
                const y = (maxValue*10) - h
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={12} height={h} rx={4} className="fill-[url(#grad)]" />
                    <text x={x+6} y={maxValue*10 - 2} textAnchor="middle" className="fill-current opacity-60 text-[8px]">{c.label}</text>
                  </g>
                )
              })}
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-3 text-sm opacity-80">Средняя энергия: {avgEnergy} • Выполнено: {count}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5 mt-6">
          <div className="text-lg font-semibold mb-3">Список выполненных ритуалов</div>
          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 ? (
              <div className="opacity-70">Записей пока нет</div>
            ) : (
              filtered.map(e => (
                <div key={e.id} className="rounded-xl border border-black/10 dark:border-white/20 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.ritual.name}</div>
                    <div className="text-sm opacity-75">
                      {new Date(e.doneAt).toLocaleString('ru-RU')} • {e.ritual.type} {e.ritual.duration?`• ${e.ritual.duration} мин`:''}
                    </div>
                  </div>
                  <div className="text-base font-semibold">{e.energy}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
